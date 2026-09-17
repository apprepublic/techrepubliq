import type { Env } from "../index";
import type {
  ChargeResult,
  IntentInput,
  NormalizedEvent,
  PaymentProvider,
  SavedMethod,
  StartResult,
} from "./types";
import { verifyPaystackSignature as verifySignature } from "./signing";

const API = "https://api.paystack.co";

function headers(env: Env): HeadersInit {
  return {
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

/**
 * Paystack — the NGN rail.
 *
 * One-time: `transaction/initialize`, whose `access_code` drives Paystack Inline in the
 * browser. Recurring: Paystack's own Subscriptions API only charges a fixed plan amount,
 * so installments are driven by us calling `charge_authorization` on our own schedule
 * (decision 3 / §11) — which is also why the authorization_code is stored on success.
 */
export const paystack: PaymentProvider = {
  id: "paystack",
  currencies: ["NGN"],

  async startIntent(input: IntentInput, env: Env): Promise<StartResult> {
    const reference = input.intentId;
    const body = {
      email: input.email,
      // Paystack wants kobo; `amountMinor` is already kobo for NGN.
      amount: input.presentment.amountMinor,
      currency: input.presentment.currency,
      reference,
      metadata: { ...input.metadata, intent_id: reference },
    };

    const res = await fetch(`${API}/transaction/initialize`, {
      method: "POST",
      headers: headers(env),
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data?.status === false) {
      throw new Error(data?.message ?? `Paystack initialize failed (${res.status})`);
    }

    return {
      provider: "paystack",
      reference,
      payload: {
        kind: "paystack",
        publicKey: env.PAYSTACK_PUBLIC_KEY ?? "",
        email: input.email,
        amountKobo: input.presentment.amountMinor,
        reference,
        accessCode: data?.data?.access_code ?? null,
      },
    };
  },

  /**
   * Nothing to do: the reusable authorization_code arrives on `charge.success` and is
   * stored by the webhook handler, which is the only place Paystack hands it over.
   */
  async saveMethod(): Promise<SavedMethod | null> {
    return null;
  },

  async chargeSaved(
    method: SavedMethod,
    money: { email: string; amountMinor: number; currency: string; reference: string },
    env: Env
  ): Promise<ChargeResult> {
    const res = await fetch(`${API}/transaction/charge_authorization`, {
      method: "POST",
      headers: headers(env),
      body: JSON.stringify({
        authorization_code: method.token,
        email: money.email,
        amount: money.amountMinor,
        currency: money.currency,
        reference: money.reference,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || data?.status === false) {
      return {
        ok: false,
        reference: money.reference,
        failureCode: data?.data?.gateway_response ?? String(res.status),
        failureMessage: data?.message ?? "Charge authorization failed",
        raw: data,
      };
    }
    return { ok: true, reference: data?.data?.reference ?? money.reference, raw: data };
  },

  async parseWebhook(request: Request, env: Env): Promise<NormalizedEvent> {
    const raw = await request.text();
    await verifySignature(raw, request.headers.get("x-paystack-signature"), env.PAYSTACK_SECRET_KEY);

    const event = JSON.parse(raw) as any;
    const data = event?.data ?? {};
    const provider: "paystack" = "paystack";

    const base = {
      provider,
      eventId: data?.id ? `${provider}:${data.id}` : `${provider}:${crypto.randomUUID()}`,
      reference: data?.reference,
      amountMinor: typeof data?.amount === "number" ? data.amount : undefined,
      currency: data?.currency ?? "NGN",
      email: data?.customer?.email,
      raw: event,
    };

    if (event?.event === "charge.success") {
      return {
        ...base,
        type: "payment.succeeded",
        authorizationCode: data?.authorization?.authorization_code,
      };
    }
    if (event?.event === "charge.failed") {
      return { ...base, type: "payment.failed" };
    }
    return { ...base, type: "unknown" };
  },
};
