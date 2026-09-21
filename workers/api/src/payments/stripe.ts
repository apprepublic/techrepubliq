import type { Env } from "../index";
import { verifyStripeSignature } from "./signing";
import type {
  ChargeResult,
  IntentInput,
  NormalizedEvent,
  PaymentProvider,
  SavedMethod,
  StartResult,
} from "./types";

const API = "https://api.stripe.com/v1";

function headers(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/** Stripe takes form-encoded bodies, so flat params need flattening. */
function form(params: Record<string, string | number | undefined>): string {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) body.append(key, String(value));
  }
  return body.toString();
}

/**
 * Stripe — the default USD/international rail.
 *
 * One-time is a hosted Checkout Session — the browser just follows `url`. The session
 * creates a PaymentIntent underneath, and `setup_future_usage=off_session` arms it so the
 * method can be reused for installments and renewals without a second authorisation (§11).
 */
export const stripe: PaymentProvider = {
  id: "stripe",
  currencies: ["USD", "GBP", "EUR"],

  async startIntent(input: IntentInput, env: Env): Promise<StartResult> {
    // A hosted Checkout Session, not a raw PaymentIntent: it gives us a redirect URL with
    // no client SDK, and `payment_intent_data.setup_future_usage` still arms the underlying
    // PaymentIntent for off-session installment charges later (§11).
    const body = form({
      mode: "payment",
      customer_email: input.email,
      client_reference_id: input.intentId,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": input.presentment.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": input.presentment.amountMinor,
      "line_items[0][price_data][product_data][name]":
        input.metadata.description ?? "TechRepubliQ project",
      "payment_intent_data[setup_future_usage]": "off_session",
      "payment_intent_data[metadata][intent_id]": input.intentId,
      "metadata[intent_id]": input.intentId,
      success_url: `${input.metadata.returnUrl ?? "https://techrepubliq.com/checkout/confirmation"}?reference=${input.intentId}`,
      cancel_url: input.metadata.cancelUrl ?? "https://techrepubliq.com/checkout",
    });

    const res = await fetch(`${API}/checkout/sessions`, {
      method: "POST",
      headers: headers(env),
      body,
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data?.error) {
      throw new Error(data?.error?.message ?? `Stripe create session failed (${res.status})`);
    }

    return {
      provider: "stripe",
      reference: data.id,
      payload: {
        kind: "stripe",
        publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? "",
        url: data.url ?? "",
        amountCents: input.presentment.amountMinor,
        currency: input.presentment.currency,
      },
    };
  },

  async saveMethod(input: { email: string; method: SavedMethod; env: Env }): Promise<SavedMethod | null> {
    // The payment method is already reusable thanks to setup_future_usage; attach it to a
    // customer so it survives the session.
    const res = await fetch(`${API}/customers`, {
      method: "POST",
      headers: headers(input.env),
      body: form({ email: input.email, "metadata[provider_token]": input.method.token }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data?.error) return null;

    if (input.method.token) {
      await fetch(`${API}/payment_methods/${input.method.token}/attach`, {
        method: "POST",
        headers: headers(input.env),
        body: form({ customer: data.id }),
      }).catch(() => undefined);
    }
    return { ...input.method, token: input.method.token };
  },

  async chargeSaved(
    method: SavedMethod,
    money: { email: string; amountMinor: number; currency: string; reference: string },
    env: Env
  ): Promise<ChargeResult> {
    const res = await fetch(`${API}/payment_intents`, {
      method: "POST",
      headers: headers(env),
      body: form({
        amount: money.amountMinor,
        currency: money.currency.toLowerCase(),
        payment_method: method.token,
        // Off-session: the customer isn't here, and there's no 3DS challenge to answer.
        off_session: "true",
        confirm: "true",
        receipt_email: money.email,
        "metadata[installment_reference]": money.reference,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data?.error) {
      return {
        ok: false,
        reference: money.reference,
        failureCode: data?.error?.decline_code ?? data?.error?.code,
        failureMessage: data?.error?.message ?? "Off-session charge failed",
        raw: data,
      };
    }
    return { ok: true, reference: data.id, raw: data };
  },

  async parseWebhook(request: Request, env: Env): Promise<NormalizedEvent> {
    const raw = await request.text();
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    await verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret);

    const event = JSON.parse(raw) as any;
    const object = event?.data?.object ?? {};
    const provider = "stripe" as const;

    const base = {
      provider,
      eventId: `${provider}:${event?.id ?? crypto.randomUUID()}`,
      reference: object?.id,
      amountMinor: typeof object?.amount === "number" ? object.amount : undefined,
      currency: (object?.currency ?? "usd").toUpperCase(),
      email: object?.receipt_email ?? object?.billing_details?.email,
      raw: event,
    };

    switch (event?.type) {
      case "payment_intent.succeeded":
        return { ...base, type: "payment.succeeded", paymentMethod: object?.payment_method };
      case "payment_intent.payment_failed":
        return { ...base, type: "payment.failed" };
      case "setup_intent.succeeded":
        return { ...base, type: "method.saved", paymentMethod: object?.payment_method };
      default:
        return { ...base, type: "unknown" };
    }
  },
};
