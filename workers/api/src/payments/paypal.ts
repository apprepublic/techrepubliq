import type { Env } from "../index";
import type {
  ChargeResult,
  IntentInput,
  NormalizedEvent,
  PaymentProvider,
  SavedMethod,
  StartResult,
} from "./types";

function base(env: Env): string {
  return env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
}

/** PayPal's OAuth token — cached per request by simply re-fetching; Workers are cheap. */
async function accessToken(env: Env): Promise<string> {
  const res = await fetch(`${base(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok || !data?.access_token) throw new Error("PayPal authentication failed");
  return data.access_token;
}

/**
 * PayPal — the alternative USD rail.
 *
 * One-time is Orders v2 (create → customer approves → capture). Recurring uses Vault
 * setup tokens / billing agreements; the webhook verification below is the piece that
 * matters most, since an unverified PayPal webhook is an open door.
 */
export const paypal: PaymentProvider = {
  id: "paypal",
  currencies: ["USD", "GBP", "EUR"],

  async startIntent(input: IntentInput, env: Env): Promise<StartResult> {
    const token = await accessToken(env);
    const res = await fetch(`${base(env)}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.intentId,
            amount: {
              currency_code: input.presentment.currency,
              value: (input.presentment.amountMinor / 100).toFixed(2),
            },
            description: input.metadata.description ?? "TechRepubliq project",
          },
        ],
        application_context: {
          return_url: `${input.metadata.returnUrl ?? "https://techrepubliq.com/checkout/confirmation"}?ref=${input.intentId}`,
          cancel_url: input.metadata.cancelUrl ?? "https://techrepubliq.com/checkout",
        },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) throw new Error(data?.message ?? `PayPal create order failed (${res.status})`);

    const approvalUrl: string =
      data?.links?.find((l: any) => l.rel === "approve")?.href ?? "";

    return {
      provider: "paypal",
      reference: data?.id ?? input.intentId,
      payload: { kind: "paypal", orderId: data?.id ?? "", approvalUrl },
    };
  },

  async saveMethod(input: { email: string; method: SavedMethod }): Promise<SavedMethod | null> {
    // Vault setup tokens are created in the browser; the resulting billing agreement
    // arrives on BILLING.SUBSCRIPTION.ACTIVATED and is stored by the webhook handler.
    return input.method;
  },

  async chargeSaved(
    method: SavedMethod,
    money: { amountMinor: number; currency: string; reference: string },
    env: Env
  ): Promise<ChargeResult> {
    // A saved PayPal agreement is charged by PayPal's own subscription schedule; there is
    // no off-session pull for a vaulted method outside of a billing plan.
    const token = await accessToken(env).catch(() => "");
    if (!token) {
      return {
        ok: false,
        failureCode: "paypal_auth_failed",
        failureMessage: "PayPal authentication failed",
      };
    }
    const res = await fetch(`${base(env)}/v1/billing/agreements/${method.token}/bill-balance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        note: money.reference,
        amount: { currency: money.currency, value: (money.amountMinor / 100).toFixed(2) },
      }),
    });
    const ok = res.status === 204 || res.ok;
    const data = ok ? {} : ((await res.json().catch(() => ({}))) as any);
    return ok
      ? { ok: true, reference: money.reference }
      : {
          ok: false,
          failureCode: data?.name,
          failureMessage: data?.message ?? "PayPal balance charge failed",
          raw: data,
        };
  },

  async parseWebhook(request: Request, env: Env): Promise<NormalizedEvent> {
    const raw = await request.text();
    const event = JSON.parse(raw) as any;
    const provider = "paypal" as const;

    // PayPal signs with its own cert, so verification is an API call rather than local HMAC.
    const headers = request.headers;
    const payload = {
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    };

    if (!payload.transmission_sig || !payload.webhook_id) {
      throw new Error("Missing PayPal signature headers or PAYPAL_WEBHOOK_ID");
    }

    const token = await accessToken(env);
    const res = await fetch(`${base(env)}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const verification = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || verification?.verification_status !== "SUCCESS") {
      throw new Error("PayPal webhook signature verification failed");
    }

    const resource = event?.resource ?? {};
    const amount = resource?.amount ?? resource?.amount_with_breakdown?.gross_amount;

    const eventBase = {
      provider,
      eventId: `${provider}:${event?.id ?? crypto.randomUUID()}`,
      reference: resource?.id ?? resource?.custom_id,
      amountMinor: amount?.value ? Math.round(Number(amount.value) * 100) : undefined,
      currency: amount?.currency_code ?? "USD",
      email: resource?.payer?.email_address ?? resource?.subscriber?.email_address,
      raw: event,
    };

    switch (event?.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
      case "CHECKOUT.ORDER.APPROVED":
        return { ...eventBase, type: "payment.succeeded" };
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED":
        return { ...eventBase, type: "payment.failed" };
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "VAULT.PAYMENT-TOKEN.CREATED":
        return { ...eventBase, type: "method.saved", billingAgreementId: resource?.id };
      default:
        return { ...eventBase, type: "unknown" };
    }
  },
};
