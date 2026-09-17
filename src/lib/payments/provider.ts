export type ProviderId = "paystack" | "stripe" | "paypal";

/** What the browser needs to finish a payment, per rail. Mirrors the worker's payloads. */
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

export interface FxQuote {
  rate: number;
  fetchedAt: string;
  stale: boolean;
}

/**
 * A payment intent as the server returns it.
 *
 * `amountCents` is canonical USD cents; `amountMinor` is what the customer actually pays
 * in the presentment currency. The client renders `amountMinor` and never converts
 * anything itself — the rate came from the server and is locked onto the intent.
 */
export interface PaymentIntent {
  id: string;
  quoteReference: string;
  provider: ProviderId;
  currency: string;
  amountCents: number;
  amountMinor: number;
  fx: FxQuote | null;
  discountApplied: boolean;
  discountAmountCents: number;
  payload: ProviderPayload;
}

/** Minor units → display string. NGN has no minor unit in practice; USD keeps cents. */
export function formatMoney(amountMinor: number, currency: string): string {
  const value = amountMinor / 100;
  const whole = currency === "NGN";
  try {
    return new Intl.NumberFormat(whole ? "en-NG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

/** "Converted at ₦1,502 = $1 (rate as of 15 Sep 2026)" — the FX line the plan asks for. */
export function fxLine(fx: FxQuote | null, currency: string): string | null {
  if (!fx) return null;
  const date = new Date(fx.fetchedAt);
  const formatted = Number.isNaN(date.getTime())
    ? "the last sync"
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `Converted at ${formatMoney(Math.round(fx.rate * 100), currency)} = $1 (rate as of ${formatted})`;
}

export const PROVIDER_LABEL: Record<ProviderId, string> = {
  paystack: "Paystack",
  stripe: "card",
  paypal: "PayPal",
};
