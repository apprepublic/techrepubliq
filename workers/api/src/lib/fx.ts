import type { Env } from "../index";

/**
 * FX — decision 10.
 *
 * Money is canonicalised in USD cents. NGN is a *presentation* conversion built from a
 * stored rate, never a hardcoded multiplier. A Cron Worker refreshes the rate daily; the
 * rate a checkout used is locked onto the payment intent so invoices reconcile later.
 *
 * Anything with a USD→NGN endpoint works — the point is that it is never hardcoded, so
 * the source is an env var with a sensible no-key default.
 */

export interface FxRate {
  base: string;
  quote: string;
  rate: number;
  source: string | null;
  fetchedAt: string;
}

export const FX_STALE_HOURS = 48;
const DEFAULT_FX_API = "https://open.er-api.com/v6/latest/USD";
const BASE = "USD";
const QUOTE = "NGN";

export async function getRate(env: Env): Promise<FxRate | null> {
  const row = await env.DB.prepare(
    "SELECT base, quote, rate, source, fetched_at FROM fx_rates WHERE base = ? AND quote = ?"
  )
    .bind(BASE, QUOTE)
    .first<any>();

  if (!row) return null;
  const rate = Number(row.rate);
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return {
    base: row.base,
    quote: row.quote,
    rate,
    source: row.source ?? null,
    fetchedAt: String(row.fetched_at ?? ""),
  };
}

export function isStale(rate: FxRate | null, now: number = Date.now()): boolean {
  if (!rate?.fetchedAt) return true;
  const fetched = Date.parse(rate.fetchedAt);
  if (!Number.isFinite(fetched)) return true;
  return now - fetched > FX_STALE_HOURS * 3600 * 1000;
}

/** Tolerant parse: several free FX endpoints, same one number we need. */
function extractRate(json: any): number | null {
  const candidates = [
    json?.rates?.NGN,
    json?.conversion_rates?.NGN,
    json?.quotes?.USDNGN,
    json?.data?.NGN,
    json?.NGN,
  ];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

/**
 * Pull the rate and upsert it. On failure the last known rate is kept and returned with
 * `refreshed: false` — a failed fetch must never take checkout down.
 */
export async function refreshFx(
  env: Env
): Promise<{ rate: FxRate | null; refreshed: boolean; error?: string }> {
  const previous = await getRate(env);
  const url = env.FX_API_URL || DEFAULT_FX_API;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`FX API responded ${res.status}`);
    const json = (await res.json()) as any;
    const rate = extractRate(json);
    if (rate === null) throw new Error("FX response did not contain a USD→NGN rate");

    const fetchedAt = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO fx_rates (base, quote, rate, source, fetched_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(base, quote) DO UPDATE SET rate = excluded.rate, source = excluded.source, fetched_at = excluded.fetched_at`
    )
      .bind(BASE, QUOTE, rate, url, fetchedAt)
      .run();

    return { rate: { base: BASE, quote: QUOTE, rate, source: url, fetchedAt }, refreshed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("FX refresh failed:", message);
    return { rate: previous, refreshed: false, error: message };
  }
}

/**
 * Convert canonical USD cents into the currency the customer will be shown.
 *
 * Only NGN and USD are supported. Both have two decimal places (kobo / cents), so the
 * maths is a straight multiply — but a rate we don't have is a hard stop, not a guess.
 */
export function toPresentment(
  amountCents: number,
  currency: string,
  rate: FxRate | null
): { currency: string; amountMinor: number; fxRateUsed: number | null; fxFetchedAt: string | null } {
  if (currency === "USD") {
    return { currency, amountMinor: Math.round(amountCents), fxRateUsed: null, fxFetchedAt: null };
  }
  if (currency !== "NGN") {
    throw new Error(`No conversion available for ${currency} — only USD and NGN are supported`);
  }
  if (!rate) throw new Error("No USD→NGN rate available");

  return {
    currency,
    amountMinor: Math.round(amountCents * rate.rate),
    fxRateUsed: rate.rate,
    fxFetchedAt: rate.fetchedAt,
  };
}
