/**
 * Webhook signature helpers.
 *
 * Every rail signs differently, but the shape of the check is the same: HMAC over the
 * **raw** body (never a re-serialised object — re-encoding changes bytes and breaks
 * verification), compared in constant time.
 */

export async function hmacHex(
  key: string,
  data: string,
  algorithm: "SHA-256" | "SHA-512" = "SHA-512"
): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string compare. Length is not treated as a secret. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Stripe's `Stripe-Signature` scheme: `t=<unix>,v1=<hex>` over `${t}.${rawBody}`,
 * HMAC-SHA256 with the endpoint secret. Rejects timestamps outside the tolerance so a
 * captured payload cannot be replayed later.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300
): Promise<void> {
  if (!header) throw new Error("Missing Stripe-Signature header");

  let timestamp: string | null = null;
  const provided: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "t") timestamp = value;
    else if (key === "v1") provided.push(value);
  }
  if (!timestamp || provided.length === 0) throw new Error("Malformed Stripe-Signature header");

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) throw new Error("Stripe timestamp outside tolerance");

  const expected = await hmacHex(secret, `${timestamp}.${rawBody}`, "SHA-256");
  if (!provided.some((sig) => timingSafeEqual(sig, expected))) {
    throw new Error("Stripe signature mismatch");
  }
}

/** Paystack: HMAC-SHA512 of the raw body with the secret key, hex encoded. */
export async function verifyPaystackSignature(
  rawBody: string,
  header: string | null,
  secret: string
): Promise<void> {
  if (!header) throw new Error("Missing x-paystack-signature header");
  const expected = await hmacHex(secret, rawBody, "SHA-512");
  if (!timingSafeEqual(header.toLowerCase(), expected.toLowerCase())) {
    throw new Error("Paystack signature mismatch");
  }
}
