/**
 * MIRROR of `src/lib/product.ts` — server-side money math.
 *
 * The server recomputes every total from the client's *inputs* (pages, components,
 * complexity, add-ons, cadence, fee mode). The client never sends an amount.
 *
 * Keep the constants in this file identical to the ones in `src/lib/product.ts`.
 * `node scripts/check-pricing-mirror.mjs` fails if they drift.
 *
 * Deliberately import-free so the mirror stays trivial to diff.
 */

/* ------------------------------------------------------------------ *
 * Categories — locked decision 5
 * ------------------------------------------------------------------ */

export const CATEGORIES = [
  { slug: "web-development", title: "Web Development" },
  { slug: "app-development", title: "App Development" },
  { slug: "ai-automation", title: "AI Automation" },
  { slug: "ai-integration", title: "AI Integration" },
  { slug: "training", title: "Training" },
  { slug: "optimization", title: "Optimization" },
  { slug: "web-app-management", title: "Web / App Management" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ *
 * Tiers — PRD §4.3
 * ------------------------------------------------------------------ */

export const TIERS = [
  {
    id: "mvp",
    name: "MVP",
    monthlyCents: 500,
    emailPerDay: 2500,
    revisions: 3,
    requestsPerDay: 10000,
  },
  {
    id: "startup",
    name: "Startup",
    monthlyCents: 2500,
    emailPerDay: 50000,
    revisions: 5,
    requestsPerDay: 100000,
  },
  {
    id: "business",
    name: "Business",
    monthlyCents: 5000,
    emailPerDay: 100000,
    revisions: 10,
    requestsPerDay: 1000000,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyCents: null,
    emailPerDay: null,
    revisions: null,
    requestsPerDay: null,
  },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export function tierById(id: string) {
  return TIERS.find((t) => t.id === id);
}

/**
 * Upgrade nudge thresholds — decision 15 (§12.7). Nudge only, never enforced: nothing
 * is throttled or removed when a project crosses these lines.
 */
export const TIER_LIMITS = {
  /** Fraction of the tier's ceiling that starts the conversation. */
  warnAt: 0.8,
  /** Consecutive days over the line before the nudge is actually shown. */
  breachDays: 3,
} as const;

/* ------------------------------------------------------------------ *
 * Add-ons (PRD §3.3) and one-time services (PRD §4.1)
 * ------------------------------------------------------------------ */

export const ADDON_CATALOG = [
  { id: "google", kind: "google", label: "Maps and location services", multiple: 0.4 },
  { id: "email", kind: "email", label: "Email Center", multiple: 1 },
  { id: "ai", kind: "ai", label: "AI feature add-on", multiple: 1 },
] as const;

export type AddonId = (typeof ADDON_CATALOG)[number]["id"];

export const ONE_TIME_SERVICES = [
  { id: "domain-purchase", cents: 2000 },
  { id: "store-deployment", cents: 15000 },
] as const;

export type OneTimeServiceId = (typeof ONE_TIME_SERVICES)[number]["id"];

/* ------------------------------------------------------------------ *
 * Rates and payment options
 * ------------------------------------------------------------------ */

export const BASE_DEV_FEE_CENTS = 50000;
export const RATE_PER_PAGE_CENTS = 300;
export const RATE_PER_COMPONENT_CENTS = 300;

export const COMPLEXITY = {
  standard: { id: "standard", multiplier: 1 },
  elevated: { id: "elevated", multiplier: 1.5 },
  complex: { id: "complex", multiplier: 2.5 },
} as const;

export type ComplexityId = keyof typeof COMPLEXITY;

export const MONTHLY_MARKUP = 0.15;
/** No markup on installments — paying the fee in one go takes this off. Mirrors src/lib/product.ts. */
export const ONE_TIME_DISCOUNT = 0.15;
export const INSTALLMENT_MONTHS = 12;

/* ------------------------------------------------------------------ *
 * Money math — mirrors src/lib/product.ts exactly
 * ------------------------------------------------------------------ */

export const EXTRA_REVIEWS = [
  { cents: 1000, count: 2 },
  { cents: 1500, count: 3 },
] as const;

export const EDIT_PLANS = [
  { monthlyCents: 10000, edits: 10 },
  { monthlyCents: 20000, edits: 25 },
  { monthlyCents: 50000, edits: 50 },
  { monthlyCents: 100000, edits: null }, // unlimited
] as const;

/**
 * Post-launch edit pricing (PRD §5A). Mirrors src/lib/product.ts — see the note there
 * for why §4.2's $500 base is deliberately absent.
 */
export const EDIT_MINIMUM_CENTS = 2500;
export const EDIT_ROLLOVER_CAP_MONTHS = 1;

export function computeEditCents(input: {
  pages: number;
  components: number;
  complexity: ComplexityId;
}): number {
  const pages = Math.max(0, Math.round(input.pages || 0));
  const components = Math.max(0, Math.round(input.components || 0));
  const raw =
    (pages * RATE_PER_PAGE_CENTS + components * RATE_PER_COMPONENT_CENTS) *
    (COMPLEXITY[input.complexity]?.multiplier ?? 1);
  return Math.max(EDIT_MINIMUM_CENTS, Math.round(raw));
}

export function computeDevFeeCents(input: {
  pages: number;
  components: number;
  complexity: ComplexityId;
}): number {
  const pages = Math.max(0, Math.round(input.pages || 0));
  const components = Math.max(0, Math.round(input.components || 0));
  const raw =
    BASE_DEV_FEE_CENTS +
    pages * RATE_PER_PAGE_CENTS +
    components * RATE_PER_COMPONENT_CENTS;
  return Math.round(raw * (COMPLEXITY[input.complexity]?.multiplier ?? 1));
}

export interface DevFeeOptions {
  listCents: number;
  payOnceCents: number;
  savedCents: number;
  perMonthCents: number[];
}

export function devFeeOptions(feeCents: number): DevFeeOptions {
  const listCents = Math.max(0, Math.round(feeCents));
  const payOnceCents = Math.round(listCents * (1 - ONE_TIME_DISCOUNT));
  const base = Math.floor(listCents / INSTALLMENT_MONTHS);
  const remainder = listCents - base * INSTALLMENT_MONTHS;
  const perMonthCents = Array.from({ length: INSTALLMENT_MONTHS }, (_, i) =>
    base + (i < remainder ? 1 : 0)
  );
  return {
    listCents,
    payOnceCents,
    savedCents: listCents - payOnceCents,
    perMonthCents,
  };
}

export function addonMonthlyCents(tierId: TierId, addonId: string): number | null {
  const tier = tierById(tierId);
  if (!tier || tier.monthlyCents === null) return null;
  const addon = ADDON_CATALOG.find((a) => a.id === addonId);
  return Math.round(tier.monthlyCents * (addon?.multiple ?? 1));
}

export function servicesAnnualCents(tierId: TierId, addonIds: string[]): number | null {
  const tier = tierById(tierId);
  if (!tier || tier.monthlyCents === null) return null;
  // The tier's own monthly fee is the base; add-ons sit on top of it. Without this the
  // recurring services were billed at zero for any project with no add-ons.
  const perMonth = addonIds.reduce<number>(
    (sum, id) => sum + (addonMonthlyCents(tierId, id) ?? 0),
    tier.monthlyCents
  );
  return perMonth * 12;
}

export function servicesMonthlyCents(annualCents: number): number {
  return Math.round((annualCents * (1 + MONTHLY_MARKUP)) / 12);
}

export function oneTimeServicesCents(ids: string[]): number {
  return ids.reduce<number>(
    (sum, id) => sum + (ONE_TIME_SERVICES.find((s) => s.id === id)?.cents ?? 0),
    0
  );
}

export interface PriceInput {
  category: CategorySlug | string;
  tierId: TierId;
  pages: number;
  components: number;
  complexity: ComplexityId;
  addons?: string[];
  oneTimeServices?: string[];
  devFeeMode?: "once" | "installments";
  cadence?: "annual" | "monthly";
}

export interface PriceBreakdown {
  devFeeCents: number;
  devFee: DevFeeOptions;
  servicesAnnualCents: number | null;
  servicesMonthlyCents: number | null;
  oneTimeServicesCents: number;
  dueNowCents: number | null;
  totalIfPaidOnceCents: number | null;
  totalIfInstallmentsCents: number | null;
  contactSales: boolean;
}

export function computePrice(input: PriceInput): PriceBreakdown {
  const devFeeCents = computeDevFeeCents(input);
  const devFee = devFeeOptions(devFeeCents);
  const contactSales = input.tierId === "enterprise";

  const annual = servicesAnnualCents(input.tierId, input.addons ?? []);
  const monthly = annual === null ? null : servicesMonthlyCents(annual);
  const oneTime = oneTimeServicesCents(input.oneTimeServices ?? []);

  const devNow =
    input.devFeeMode === "installments" ? devFee.perMonthCents[0] : devFee.payOnceCents;
  const servicesNow = input.cadence === "monthly" ? monthly : annual;

  const dueNowCents =
    contactSales || servicesNow === null ? null : devNow + servicesNow + oneTime;

  return {
    devFeeCents,
    devFee,
    servicesAnnualCents: annual,
    servicesMonthlyCents: monthly,
    oneTimeServicesCents: oneTime,
    dueNowCents,
    totalIfPaidOnceCents:
      annual === null ? null : devFee.payOnceCents + annual + oneTime,
    totalIfInstallmentsCents:
      annual === null ? null : devFee.listCents + annual + oneTime,
    contactSales,
  };
}
