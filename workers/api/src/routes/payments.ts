import { error, json, generateId } from "../utils";
import { sendInvoiceEmail } from "../email";
import type { Env } from "../index";
import { CATEGORIES, computePrice, type ComplexityId, type TierId } from "../lib/pricing";
import { getRate, isStale, toPresentment, type FxRate } from "../lib/fx";
import { createPlanForPayment, installmentSchedule } from "../lib/installments";
import { createProjectForOrder } from "./projects";
import {
  getProvider,
  presentmentCurrency,
  PROVIDER_CURRENCIES,
  resolveProvider,
} from "../payments";
import type { NormalizedEvent, ProviderId } from "../payments/types";

/** Sanity ceilings — the same clamps the quote route applies. */
const MAX_PAGES = 500;
const MAX_COMPONENTS = 500;

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function clampInt(value: unknown, fallback: number, max: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

function pickComplexity(value: unknown): ComplexityId {
  return value === "standard" || value === "elevated" || value === "complex" ? value : "standard";
}

/**
 * The server is the only thing that computes money.
 *
 * The client sends a quote reference and the toggles the customer picked — never an
 * amount. Every figure is recomputed here from the stored scope with the same mirrored
 * model the quote route used, so a tampered payload cannot change a price.
 */
function recomputeFromQuote(quote: any, cadence: string, devFeeMode: "once" | "installments") {
  const breakdown = parseJson<Record<string, unknown>>(quote.breakdown, {});

  return computePrice({
    category: quote.service_slug,
    tierId: (quote.tier_id ?? "startup") as TierId,
    pages: clampInt(breakdown.pages, 12, MAX_PAGES),
    components: clampInt(breakdown.components, 8, MAX_COMPONENTS),
    complexity: pickComplexity(breakdown.complexity),
    addons: parseJson<string[]>(quote.addons, []),
    oneTimeServices: parseJson<string[]>(quote.one_time_services, []),
    cadence: cadence === "monthly" ? "monthly" : "annual",
    devFeeMode,
  });
}

async function recordEvent(env: Env, event: NormalizedEvent): Promise<boolean> {
  // Primary key collision means we have already handled this event.
  const result = await env.DB.prepare(
    `INSERT OR IGNORE INTO payment_events (provider, event_id, intent_id, type, amount_minor, currency)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      event.provider,
      event.eventId,
      event.reference ?? null,
      event.type,
      event.amountMinor ?? null,
      event.currency ?? null
    )
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

async function findIntent(env: Env, event: NormalizedEvent): Promise<any | null> {
  const byProviderRef = await env.DB.prepare(
    "SELECT * FROM payment_intents WHERE provider_reference = ? OR id = ?"
  )
    .bind(event.reference ?? "", event.reference ?? "")
    .first<any>();
  return byProviderRef ?? null;
}

async function saveMethodFor(env: Env, event: NormalizedEvent, email: string): Promise<void> {
  const token = event.authorizationCode ?? event.paymentMethod ?? event.billingAgreementId;
  if (!token || !email) return;

  await env.DB.prepare(
    `INSERT OR IGNORE INTO saved_methods (id, email, provider, token, brand, last4)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(`SM-${generateId()}`, email, event.provider, token, null, null)
    .run();
}

/**
 * Every paying customer needs a row — `orders.customer_id` is a foreign key, and D1
 * enforces it. Guest checkout is the norm here, so one is created on first payment with
 * an unusable password hash (`!`): login is by OTP, and this can never match a compare.
 */
async function ensureCustomer(env: Env, email: string): Promise<string | null> {
  if (!email) return null;

  const existing = await env.DB.prepare("SELECT id FROM customers WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();
  if (existing) return existing.id;

  const id = `CUS-${generateId()}`;
  await env.DB.prepare(
    "INSERT OR IGNORE INTO customers (id, email, name, password_hash) VALUES (?, ?, ?, '!')"
  )
    .bind(id, email, email.split("@")[0] || "Customer")
    .run();

  // OR IGNORE + re-select, so two payments arriving together both resolve to one row.
  const row = await env.DB.prepare("SELECT id FROM customers WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();
  return row?.id ?? null;
}

async function onPaymentSucceeded(env: Env, event: NormalizedEvent): Promise<void> {
  const intent = await findIntent(env, event);
  if (!intent) {
    console.error("Payment webhook for unknown intent:", event.reference);
    return;
  }
  if (intent.status === "Paid") return;

  const email = event.email ?? intent.customer_email ?? "";
  const orderId = `ORD-${generateId()}`;
  const paymentId = `PAY-${generateId()}`;
  const now = new Date().toISOString();

  // The event was already recorded by the caller, so a provider retry is deduped — which
  // means nothing below may throw the whole payment away. Each step is individually
  // fault-tolerant: the ledger row is the money truth, and a missing order is a
  // recoverable inconvenience rather than a lost payment.
  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO payments
         (id, intent_id, provider, provider_event_id, provider_reference, amount_cents, amount_minor, currency, fx_rate_used, status, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?)`
    )
      .bind(
        paymentId,
        intent.id,
        event.provider,
        event.eventId,
        event.reference ?? null,
        intent.amount_cents,
        intent.amount_minor,
        intent.currency,
        intent.fx_rate_used,
        email
      )
      .run();
  } catch (err) {
    console.error("Ledger insert failed:", err);
  }

  const customerId = await ensureCustomer(env, email).catch((err) => {
    console.error("ensureCustomer failed:", err);
    return null;
  });

  if (customerId) {
    try {
      // Carry the quote's own detail onto the order. It used to write a fixed
      // "TechRepubliQ project" with a placeholder slug, which left every order
      // indistinguishable and gave the order detail page nothing to show but a price —
      // the customer bought a described piece of work, not a placeholder.
      const quote = intent.quote_reference
        ? await env.DB.prepare(
            "SELECT service_slug, description, timeline, scope_summary, features FROM quotes WHERE reference_id = ?"
          )
            .bind(intent.quote_reference)
            .first<any>()
        : null;

      const slug = quote?.service_slug ?? "custom-project";
      const title = CATEGORIES.find((c) => c.slug === slug)?.title ?? "Custom project";

      await env.DB.prepare(
        `INSERT OR IGNORE INTO orders
           (id, customer_id, quote_reference, service_slug, service_title, description, scope_features, timeline, price_cents, currency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid')`
      )
        .bind(
          orderId,
          customerId,
          intent.quote_reference ?? intent.id,
          slug,
          title,
          quote?.description ?? `Payment via ${event.provider}`,
          quote?.scope_summary ?? quote?.features ?? "[]",
          quote?.timeline ?? null,
          // `price_cents` is read together with `currency`, so it has to be the minor unit
          // *of that currency* — cents for USD, kobo for NGN. `amount_cents` is always
          // USD-based, which would have made a naira order read as a few hundred naira.
          intent.amount_minor ?? intent.amount_cents,
          intent.currency ?? "USD"
        )
        .run();
    } catch (err) {
      console.error("Order insert failed:", err);
    }
  } else {
    console.error("No customer to attach the order to for intent", intent.id);
  }

  // Installments and renewals need a reusable method (§11).
  try {
    await saveMethodFor(env, event, email);
  } catch (err) {
    console.error("Saving the payment method failed:", err);
  }

  // Installments (§11): the fee becomes a 12-payment schedule, payment 1 taken now.
  try {
    const quote = intent.quote_reference
      ? await env.DB.prepare("SELECT * FROM quotes WHERE reference_id = ?")
          .bind(intent.quote_reference)
          .first<any>()
      : null;

    const price = quote
      ? recomputeFromQuote(
          quote,
          quote.cadence ?? "annual",
          (quote.dev_fee_mode ?? "once") === "installments" ? "installments" : "once"
        )
      : null;

    if (quote && price && (quote.dev_fee_mode ?? "once") === "installments") {
      const rate = intent.fx_rate_used ?? null;
      await createPlanForPayment(env, {
        intentId: intent.id,
        orderId,
        paymentId,
        email,
        provider: event.provider,
        currency: intent.currency,
        feeListCents: price.devFee.listCents,
        fxRateUsed: rate,
        toMinor: (cents) => (rate ? Math.round(cents * rate) : Math.round(cents)),
      });
    }
    // The project the customer now owns — the dashboard's reason to exist.
    if (quote && price && customerId) {
      await createProjectForOrder(env, {
        customerId,
        orderId,
        name: "New project",
        category: quote.service_slug,
        tierId: quote.tier_id ?? "startup",
        addonIds: parseJson<string[]>(quote.addons, []),
        devFeeCents: price.devFee.listCents,
        cadence: quote.cadence ?? "annual",
      });
    }
  } catch (err) {
    console.error("Creating the installment plan or project failed:", err);
  }

  try {
    await env.DB.prepare(
      "UPDATE payment_intents SET status = 'Paid', provider_reference = COALESCE(?, provider_reference), order_id = ?, updated_at = ? WHERE id = ?"
    )
      .bind(event.reference ?? null, orderId, now, intent.id)
      .run();
  } catch (err) {
    console.error("Intent update failed:", err);
  }

  if (email) {
    try {
      env.ctx.waitUntil(
        sendInvoiceEmail(env, email, {
          referenceId: orderId,
          serviceTitle: "TechRepubliQ project",
          amount: intent.amount_minor / 100,
          currency: intent.currency,
        })
      );
    } catch (err) {
      console.error("Invoice email failed:", err);
    }
  }
}

async function onPaymentFailed(env: Env, event: NormalizedEvent): Promise<void> {
  const intent = await findIntent(env, event);
  if (!intent) return;
  await env.DB.prepare(
    "UPDATE payment_intents SET status = 'Failed', updated_at = ? WHERE id = ? AND status = 'Pending'"
  )
    .bind(new Date().toISOString(), intent.id)
    .run();
}

export const payments = {
  /**
   * Create a payment intent.
   *
   * Recomputes the total from the stored quote, converts with the stored FX rate (locked
   * onto the intent), and opens the payment with the rail the resolver picks.
   */
  createIntent: async (request: Request, env: Env) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return error(400, "Invalid JSON body");
    }

    const quoteRef = String(body?.quoteRef ?? "");
    if (!quoteRef) return error(400, "Missing quoteRef");

    const quote = await env.DB.prepare("SELECT * FROM quotes WHERE reference_id = ?")
      .bind(quoteRef)
      .first<any>();
    if (!quote) return error(404, "Quote not found");

    const cadence = body?.cadence === "monthly" ? "monthly" : (quote.cadence ?? "annual");
    const devFeeMode = body?.devFeeMode === "installments" ? "installments" : (quote.dev_fee_mode ?? "once");

    const price = recomputeFromQuote(quote, cadence, devFeeMode);
    if (price.contactSales) {
      return error(409, "Enterprise projects are quoted by our sales team");
    }

    const amountCents = price.dueNowCents ?? 0;
    if (amountCents <= 0) return error(400, "Nothing to pay on this quote");

    // Discount codes are validated server-side; the discount is in USD cents.
    let discountAmountCents = 0;
    const discountCode = typeof body?.discountCode === "string" ? body.discountCode.trim() : "";
    if (discountCode) {
      const code = await env.DB.prepare(
        "SELECT * FROM discount_codes WHERE code = ? AND (expires_at IS NULL OR expires_at > datetime('now')) AND (max_uses IS NULL OR used_count < max_uses)"
      )
        .bind(discountCode)
        .first<any>();
      if (!code) return json({ valid: false, error: "Code not recognized" }, 400);

      discountAmountCents = code.is_percentage
        ? Math.round(amountCents * (code.amount_cents / 10000))
        : code.amount_cents;
      discountAmountCents = Math.min(discountAmountCents, amountCents);

      await env.DB.prepare("UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?")
        .bind(discountCode)
        .run();
    }

    const finalCents = Math.max(0, amountCents - discountAmountCents);

    // Rail and currency. Currency wins; an explicit choice is honoured only if the rail
    // can actually present that currency.
    const country = (request as any).cf?.country ?? null;
    const providerId: ProviderId = resolveProvider(country, body?.currency ?? null, body?.provider ?? null);
    const wanted = String(body?.currency ?? "").toUpperCase();
    const currency =
      wanted && PROVIDER_CURRENCIES[providerId].includes(wanted)
        ? wanted
        : presentmentCurrency(providerId);

    const rate: FxRate | null = currency === "NGN" ? await getRate(env) : null;
    if (currency === "NGN" && !rate) {
      return error(503, "Exchange rate unavailable — please try again in a moment");
    }

    let presentment;
    try {
      presentment = toPresentment(finalCents, currency, rate);
    } catch (err) {
      return error(503, err instanceof Error ? err.message : "Currency conversion failed");
    }

    const toMinor = (cents: number) =>
      presentment.fxRateUsed ? Math.round(cents * presentment.fxRateUsed) : Math.round(cents);
    const schedule =
      devFeeMode === "installments"
        ? installmentSchedule(price.devFee.listCents, toMinor)
        : null;

    const intentId = `PI-${generateId()}`;
    const email = String(body?.email ?? quote.contact_email ?? "");

    await env.DB.prepare(
      `INSERT INTO payment_intents
         (id, quote_reference, customer_email, provider, currency, amount_cents, amount_minor,
          fx_rate_used, fx_fetched_at, discount_code, discount_cents, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`
    )
      .bind(
        intentId,
        quoteRef,
        email,
        providerId,
        presentment.currency,
        finalCents,
        presentment.amountMinor,
        presentment.fxRateUsed,
        presentment.fxFetchedAt,
        discountCode || null,
        discountAmountCents
      )
      .run();

    if (discountCode) {
      // Usage was counted above; keep the intent honest about what was applied.
    }

    const provider = getProvider(providerId);
    try {
      const started = await provider.startIntent(
        {
          intentId,
          email,
          presentment: { ...presentment, amountCents: finalCents },
          metadata: {
            quote_reference: quoteRef,
            cadence,
            dev_fee_mode: devFeeMode,
          },
        },
        env
      );

      await env.DB.prepare(
        "UPDATE payment_intents SET provider_reference = ? WHERE id = ?"
      )
        .bind(started.reference, intentId)
        .run();

      // PRD §1.7 — proceeding to payment emails an unpaid invoice straight away; there is
      // no "Generate Invoice" step. §1.8's paid copy goes out from onPaymentSucceeded.
      // The rail is already started, so this fires once and only on a real attempt.
      if (email) {
        try {
          env.ctx.waitUntil(
            sendInvoiceEmail(env, email, {
              referenceId: intentId,
              serviceTitle: quote.service_title ?? "TechRepubliQ project",
              amount: presentment.amountMinor / 100,
              currency: presentment.currency,
              paid: false,
            })
          );
        } catch (err) {
          console.error("Unpaid invoice email failed:", err);
        }
      }

      return json({
        intent: {
          id: intentId,
          quoteReference: quoteRef,
          provider: providerId,
          currency: presentment.currency,
          amountCents: finalCents,
          amountMinor: presentment.amountMinor,
          fx: rate
            ? { rate: rate.rate, fetchedAt: rate.fetchedAt, stale: isStale(rate) }
            : null,
          discountApplied: discountAmountCents > 0,
          discountAmountCents,
          installments: schedule ? { count: schedule.length, schedule } : null,
          payload: started.payload,
        },
      });
    } catch (err) {
      console.error("startIntent failed:", err);
      await env.DB.prepare("UPDATE payment_intents SET status = 'Failed' WHERE id = ?")
        .bind(intentId)
        .run();
      return error(502, "Could not start payment — please try again");
    }
  },

  /**
   * Verify a payment after the customer returns from a rail. Webhooks remain the
   * authority; this exists so the confirmation screen isn't blank if one is delayed.
   */
  verify: async (request: Request, env: Env) => {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference") ?? "";
    if (!reference) return error(400, "Missing reference");

    const intent = await env.DB.prepare(
      "SELECT * FROM payment_intents WHERE id = ? OR provider_reference = ?"
    )
      .bind(reference, reference)
      .first<any>();
    if (!intent) return error(404, "Payment not found");

    if (intent.status !== "Paid" && intent.provider === "paystack") {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(intent.id)}`,
        { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } }
      ).catch(() => null);

      const data = (await res?.json().catch(() => ({}))) as any;
      if (data?.status === true && data?.data?.status === "success") {
        await env.DB.prepare(
          "UPDATE payment_intents SET status = 'Paid', updated_at = ? WHERE id = ?"
        )
          .bind(new Date().toISOString(), intent.id)
          .run();
        intent.status = "Paid";
      }
    }

    return json({
      status: intent.status,
      reference: intent.id,
      provider: intent.provider,
      currency: intent.currency,
      amountMinor: intent.amount_minor,
      amountCents: intent.amount_cents,
      fxRateUsed: intent.fx_rate_used,
      orderId: intent.order_id,
    });
  },

  paystackWebhook: (request: Request, env: Env) => handleWebhook("paystack", request, env),
  stripeWebhook: (request: Request, env: Env) => handleWebhook("stripe", request, env),
  paypalWebhook: (request: Request, env: Env) => handleWebhook("paypal", request, env),
};

/** Signature-verify, dedupe, then dispatch. A bad signature is a 400, never a 200. */
async function handleWebhook(providerId: ProviderId, request: Request, env: Env): Promise<Response> {
  const provider = getProvider(providerId);

  let event: NormalizedEvent;
  try {
    event = await provider.parseWebhook(request, env);
  } catch (err) {
    console.error(`${providerId} webhook rejected:`, err);
    return error(400, "Invalid webhook signature");
  }

  const isNew = await recordEvent(env, event);
  if (!isNew) return json({ received: true, duplicate: true });

  try {
    if (event.type === "payment.succeeded") await onPaymentSucceeded(env, event);
    else if (event.type === "payment.failed") await onPaymentFailed(env, event);
    else if (event.type === "method.saved" && event.email) {
      await saveMethodFor(env, event, event.email);
    }
  } catch (err) {
    console.error(`${providerId} webhook handling failed:`, err);
    return error(500, "Webhook handling failed");
  }

  return json({ received: true });
}
