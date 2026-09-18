import type { ProviderId } from "./types";

/** Which currencies each rail can present (decision 2). */
export const PROVIDER_CURRENCIES: Record<ProviderId, string[]> = {
  paystack: ["NGN"],
  stripe: ["USD"],
  paypal: ["USD"],
};

/**
 * Pick the rail for a payment.
 *
 * Currency wins — NGN can only be Paystack. Otherwise the customer's country decides,
 * with an explicit, validated choice honoured when that rail supports the currency.
 * Anything unrecognised falls back to Stripe, the default USD rail; a caller asking for
 * a currency a rail cannot present is never silently given a different rail.
 */
export function resolveProvider(
  country?: string | null,
  currency?: string | null,
  requested?: string | null
): ProviderId {
  const iso = (currency ?? "").toUpperCase();
  const nat = (country ?? "").toUpperCase();

  if (iso === "NGN" || (!iso && nat === "NG")) return "paystack";

  const wanted = (requested ?? "").toLowerCase();
  if (wanted === "paystack" || wanted === "stripe" || wanted === "paypal") {
    if (iso && !PROVIDER_CURRENCIES[wanted].includes(iso)) return "stripe";
    return wanted;
  }

  return iso && iso !== "USD" ? "stripe" : nat === "NG" ? "paystack" : "stripe";
}

/**
 * The presentment currency for a rail. Canonical money stays USD cents.
 *
 * Only NGN and USD today: both have stored rates or need none. GBP/EUR are deliberately
 * absent rather than converted with a rate we don't have (decision 10).
 */
export function presentmentCurrency(provider: ProviderId): string {
  return provider === "paystack" ? "NGN" : "USD";
}
