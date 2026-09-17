import type { Env } from "../index";

export type ProviderId = "paystack" | "stripe" | "paypal";

/**
 * Canonical money is USD cents everywhere in this codebase. `Presentment` is what the
 * customer actually pays, in the provider's minor units (kobo for NGN, cents for USD),
 * plus the rate it was derived from so an invoice can be reconciled later (decision 10).
 */
export interface Presentment {
  currency: string;
  amountMinor: number;
  /** The canonical USD cents this presentment was converted from. */
  amountCents: number;
  fxRateUsed: number | null;
  fxFetchedAt: string | null;
}

export interface IntentInput {
  intentId: string;
  email: string;
  presentment: Presentment;
  metadata: Record<string, string>;
}

/** What the browser needs to finish the payment, per rail. */
export type ProviderPayload =
  | {
      kind: "paystack";
      publicKey: string;
      email: string;
      amountKobo: number;
      reference: string;
      accessCode: string | null;
    }
  | { kind: "stripe"; publishableKey: string; url: string; amountCents: number; currency: string }
  | { kind: "paypal"; orderId: string; approvalUrl: string };

export interface StartResult {
  provider: ProviderId;
  /** Our reference, also handed to the provider so webhooks can find the intent. */
  reference: string;
  payload: ProviderPayload;
}

/** A reusable token for installments and renewals (§11). */
export interface SavedMethod {
  provider: ProviderId;
  token: string;
  brand?: string | null;
  last4?: string | null;
}

export interface ChargeResult {
  ok: boolean;
  reference?: string;
  failureCode?: string;
  failureMessage?: string;
  raw?: unknown;
}

export interface NormalizedEvent {
  provider: ProviderId;
  eventId: string;
  type: "payment.succeeded" | "payment.failed" | "method.saved" | "unknown";
  /** Our reference, echoed back by the provider. */
  reference?: string;
  amountMinor?: number;
  currency?: string;
  email?: string;
  /** Reusable tokens — whichever of these the rail produces. */
  authorizationCode?: string;
  paymentMethod?: string;
  billingAgreementId?: string;
  raw: unknown;
}

export interface PaymentProvider {
  id: ProviderId;
  /** ISO currency codes this rail can present. */
  currencies: string[];
  /** Open the payment: Paystack inline, Stripe PaymentIntent, PayPal order. */
  startIntent(input: IntentInput, env: Env): Promise<StartResult>;
  /**
   * Persist a reusable method. Rails differ: Paystack's authorization_code arrives on
   * `charge.success`, so Paystack returns null here and the webhook handler stores it.
   */
  saveMethod(
    input: { email: string; method: SavedMethod; env: Env }
  ): Promise<SavedMethod | null>;
  /** Charge a saved method off-session — installments and renewals (§11). */
  chargeSaved(
    method: SavedMethod,
    money: { email: string; amountMinor: number; currency: string; reference: string },
    env: Env
  ): Promise<ChargeResult>;
  /** Verify the signature and normalise the event. Throws on a bad signature. */
  parseWebhook(request: Request, env: Env): Promise<NormalizedEvent>;
}
