import { error, json, getAuthToken, verifyToken, generateId } from "../utils";
import { sendInvoiceEmail } from "../email";
import type { Env } from "../index";

export const payments = {
  createIntent: async (request: Request, env: Env) => {
    const { quoteRef, amountCents, currency, discountCode } = await request.json() as any;
    if (!quoteRef || !amountCents) return error(400, "Missing required fields");

    // Validate discount code if provided
    let discountAmountCents = 0;
    if (discountCode) {
      const code = await env.DB.prepare(
        "SELECT * FROM discount_codes WHERE code = ? AND (expires_at IS NULL OR expires_at > datetime('now')) AND (max_uses IS NULL OR used_count < max_uses)"
      ).bind(discountCode).first<any>();

      if (!code) {
        return json({ valid: false, error: "Code not recognized" }, 400);
      }

      discountAmountCents = code.is_percentage
        ? Math.round(amountCents * (code.amount_cents / 10000))
        : code.amount_cents;

      // Increment usage
      await env.DB.prepare(
        "UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?"
      ).bind(discountCode).run();
    }

    const finalCents = Math.max(0, amountCents - discountAmountCents);
    const orderId = `ORD-${generateId()}`;
    const geo = request.cf?.country ?? "US";
    const isNG = geo === "NG";

    // Return provider-specific response based on geo
    const paymentIntent = {
      orderId,
      amountCents: finalCents,
      currency: isNG ? "NGN" : currency ?? "USD",
      provider: isNG ? "paystack" : "stripe",
      discountApplied: discountAmountCents > 0,
      discountAmountCents,
    };

    return json({ intent: paymentIntent });
  },

  paystackWebhook: async (request: Request, env: Env) => {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify signature (in production: use crypto to verify HMAC-SHA512)
    // Then process the event

    const event = JSON.parse(body);
    if (event.event === "charge.success") {
      const { reference, amount, customer } = event.data;
      // Create order in database
      await env.DB.prepare(
        `INSERT INTO orders (id, customer_id, quote_reference, service_slug, service_title, description, price_cents, currency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Paid')`
      ).bind(
        `ORD-${reference.slice(-6)}`,
        customer.email, // Simplified — in production, match by customer email
        reference,
        "web-development",
        "Web Development",
        "Payment completed via Paystack",
        amount,
        "NGN"
      ).run();

      // Send invoice email
      env.ctx.waitUntil(sendInvoiceEmail(env, customer.email, {
        referenceId: reference,
        serviceTitle: "Web Development",
        amount: amount / 100,
        currency: "NGN",
      }));
    }

    return json({ received: true });
  },

  stripeWebhook: async (request: Request, env: Env) => {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    // In production: verify Stripe signature via stripe SDK

    const event = JSON.parse(body);
    if (event.type === "payment_intent.succeeded") {
      const { id, amount, currency, receipt_email } = event.data.object;
      await env.DB.prepare(
        `INSERT INTO orders (id, customer_id, quote_reference, service_slug, service_title, description, price_cents, currency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Paid')`
      ).bind(
        `ORD-${id.slice(-6)}`,
        receipt_email,
        id,
        "web-development",
        "Web Development",
        "Payment completed via Stripe",
        amount,
        currency.toUpperCase()
      ).run();

      // Send invoice email
      if (receipt_email) {
        env.ctx.waitUntil(sendInvoiceEmail(env, receipt_email, {
          referenceId: id,
          serviceTitle: "Web Development",
          amount: amount / 100,
          currency: currency.toUpperCase(),
        }));
      }
    }

    return json({ received: true });
  },
};