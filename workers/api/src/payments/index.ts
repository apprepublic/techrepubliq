import { paypal } from "./paypal";
import { paystack } from "./paystack";
import { stripe } from "./stripe";
import type { PaymentProvider, ProviderId } from "./types";

/** The three rails behind one interface (decision 2). */
export const PROVIDERS: Record<ProviderId, PaymentProvider> = {
  paystack,
  stripe,
  paypal,
};

export function getProvider(id: ProviderId): PaymentProvider {
  return PROVIDERS[id];
}

export function isProviderId(value: unknown): value is ProviderId {
  return value === "paystack" || value === "stripe" || value === "paypal";
}

export { resolveProvider, presentmentCurrency, PROVIDER_CURRENCIES } from "./resolve";
export type * from "./types";
