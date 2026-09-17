/**
 * Product & pricing model — single source of truth for money math on the client.
 *
 * Rules kept in one place on purpose:
 *  - PRD v2.5 §3.3 add-on pricing (Startup-tier baselines), §4.2 development fee,
 *    §4.3 tiers, §4.7 recurring cadence, §5 pre-launch reviews, §5A post-launch edits.
 *  - Locked founder decisions: 7 categories, installments = 12 even monthly payments,
 *    one-time payment carries a 15% discount (decision 16).
 *
 * IMPORTANT: this file must stay import-free (no relative imports, no React, no browser APIs).
 * `workers/api/src/lib/pricing.ts` is a mirror of it, and the server recomputes every total —
 * the client never sends an amount. Run `node scripts/check-pricing-mirror.mjs` to verify the
 * two copies still agree on their constants.
 */

/* ------------------------------------------------------------------ *
 * Categories — locked decision 5 (PRD §1.2)
 * ------------------------------------------------------------------ */

export const CATEGORIES = [
  {
    slug: "web-development",
    title: "Web Development",
    short: "Websites, web apps and platforms, built and launched.",
  },
  {
    slug: "app-development",
    title: "App Development",
    short: "iOS and Android apps, from UI/UX preview to store deployment.",
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    short: "Agents and workflows that take manual work off your team.",
  },
  {
    slug: "ai-integration",
    title: "AI Integration",
    short: "Intelligence added to a product you already run.",
  },
  {
    slug: "training",
    title: "Training",
    short: "Hands-on enablement so your team can run what we build.",
  },
  {
    slug: "optimization",
    title: "Optimization",
    short: "Speed, cost and Core Web Vitals work on something already live.",
  },
  {
    slug: "web-app-management",
    title: "Web / App Management",
    short: "Ongoing care for a live product — monitoring, updates, edits.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function serviceTitle(slug: string): string {
  return categoryBySlug(slug)?.title ?? "Project";
}

/* ------------------------------------------------------------------ *
 * Tiers — PRD §4.3. Tiers scale RECURRING service pricing only (§10),
 * never the development-fee math in §4.2.
 * ------------------------------------------------------------------ */

export const TIERS = [
  {
    id: "mvp",
    name: "MVP",
    for: "Solo builders & small teams",
    monthlyCents: 500,
    emailPerDay: 2500,
    revisions: 3,
    requestsPerDay: 10000,
    bandwidthPerMonthGb: 150,
  },
  {
    id: "startup",
    name: "Startup",
    for: "Funded startups shipping fast",
    monthlyCents: 2500,
    emailPerDay: 50000,
    revisions: 5,
    requestsPerDay: 100000,
    bandwidthPerMonthGb: 1500,
  },
  {
    id: "business",
    name: "Business",
    for: "Established businesses",
    monthlyCents: 5000,
    emailPerDay: 100000,
    revisions: 10,
    requestsPerDay: 1000000,
    bandwidthPerMonthGb: 15000,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    for: "Large organizations",
    monthlyCents: null, // "Contact Sales" — no price is ever shown
    emailPerDay: null,
    revisions: null, // unlimited
    requestsPerDay: null, // negotiated
    bandwidthPerMonthGb: null,
  },
] as const;

export type TierId = (typeof TIERS)[number]["id"];

export function tierById(id: string) {
  return TIERS.find((t) => t.id === id);
}

export function revisionLabel(tierId: TierId): string {
  const tier = tierById(tierId);
  if (!tier) return "Pre-launch reviews included";
  return tier.revisions === null
    ? "Unlimited pre-launch reviews"
    : `${tier.revisions} pre-launch reviews`;
}

/** Upgrade nudge thresholds — decision 15 (§12.7 of the plan). Nudge only, never enforced. */
export const TIER_LIMITS = {
  warnAt: 0.8,
  breachDays: 3,
} as const;

/* ------------------------------------------------------------------ *
 * Recurring add-on services — PRD §3.3.
 *
 * The §3.3 figures ($10 Google, $25 email, $25 AI) are the STARTUP-tier
 * baselines. §4.3 gives each tier's standard add-on price ($5 / $25 / $50),
 * so each add-on is stored as a multiple of that tier price:
 *   startup $25 × 1.0 = $25 (email, AI) and × 0.4 = $10 (Google) → matches §3.3 exactly.
 * Unknown future add-ons default to 1.0 — §3.3 says the engine prices by analogy.
 * ------------------------------------------------------------------ */

export const ADDON_CATALOG = [
  {
    id: "google",
    kind: "google",
    label: "Google-powered services",
    example: "Maps, Places, Address autocomplete",
    multiple: 0.4,
  },
  {
    id: "email",
    kind: "email",
    label: "Email Center",
    example: "Dedicated inbox on your domain",
    multiple: 1,
  },
  {
    id: "ai",
    kind: "ai",
    label: "AI feature add-on",
    example: "Chat agent, blog agent, newsletter agent",
    multiple: 1,
  },
] as const;

export type AddonId = (typeof ADDON_CATALOG)[number]["id"];
export type AddonKind = (typeof ADDON_CATALOG)[number]["kind"];

/**
 * Always-included Project Services (PRD §3): domain (if bought through us),
 * hosting and backend. They are never line items and never disclosed as vendors.
 */
export const INCLUDED_SERVICES = [
  { id: "hosting", label: "Hosting" },
  { id: "backend", label: "Backend service" },
  { id: "domain", label: "Domain (if purchased through TechRepubliQ)" },
] as const;

/* ------------------------------------------------------------------ *
 * One-time services — PRD §4.1
 * ------------------------------------------------------------------ */

export const ONE_TIME_SERVICES = [
  {
    id: "domain-purchase",
    label: "Domain purchase",
    note: "Only if you want us to register one for you (PRD §2).",
    cents: 2000,
  },
  {
    id: "store-deployment",
    label: "App Store / Play Store deployment",
    note: "We handle submission; your developer accounts stay yours.",
    cents: 15000,
  },
] as const;

export type OneTimeServiceId = (typeof ONE_TIME_SERVICES)[number]["id"];

/* ------------------------------------------------------------------ *
 * Development fee — PRD §4.2. Identical math at every tier.
 * ------------------------------------------------------------------ */

export const BASE_DEV_FEE_CENTS = 50000; // $500
export const RATE_PER_PAGE_CENTS = 300; // $3
export const RATE_PER_COMPONENT_CENTS = 300; // $3

/**
 * Complexity multiplier — PRD §4.2 fixes the rates ($500 + $3/page + $3/component) but
 * leaves the complexity judgement to the engine, so these three numbers are the main
 * calibration knob. §4.2's own example is the guide: "an e-commerce app prices
 * differently from a restaurant app at a similar page count".
 */
export const COMPLEXITY = {
  standard: { id: "standard", label: "Standard", multiplier: 1 },
  elevated: { id: "elevated", label: "Elevated", multiplier: 1.5 },
  complex: { id: "complex", label: "Complex", multiplier: 2.5 },
} as const;

export type ComplexityId = keyof typeof COMPLEXITY;

/* ------------------------------------------------------------------ *
 * Payment options
 * ------------------------------------------------------------------ */

/** PRD §4.7 — recurring services are quoted annually; monthly adds 15% before splitting by 12. */
export const MONTHLY_MARKUP = 0.15;

/**
 * Decision 16 — the development fee is quoted as 12 even monthly payments, and paying it
 * in one go takes 15% off. The installments carry no markup and no interest: they are
 * simply the fee divided by twelve.
 *
 * Note for finance: the discount is taken off the installment total, so the two figures
 * differ by 1 ÷ 0.85 ≈ 17.6% when read the other way round. The customer-facing line is
 * always "15% off when you pay once" — never a surcharge on the installments.
 */
export const ONE_TIME_DISCOUNT = 0.15;
export const INSTALLMENT_MONTHS = 12;

/* ------------------------------------------------------------------ *
 * Revisions (PRD §5) and post-launch edits (PRD §5A)
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
 * Post-launch edit pricing (PRD §5A).
 *
 * §5A says edits use §4.2's page/component/complexity logic — but §4.2's $500 is a
 * *project* engagement base, and carrying it into an edit would make one change cost
 * $506 next to a $100/month plan covering ten. So an edit is priced on the rates alone,
 * with a floor so a trivial change still has a price. Tier never enters into it.
 */
export const EDIT_MINIMUM_CENTS = 2500; // $25

/** Unused subscription edits carry over, capped at one month's allowance. */
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

/* ------------------------------------------------------------------ *
 * Intake metrics — PRD §4.3 (used to recommend a tier, never to price)
 * ------------------------------------------------------------------ */

export const BUSINESS_STAGES = [
  { id: "solo", label: "Solo / small team" },
  { id: "funded", label: "Funded startup" },
  { id: "established", label: "Established business" },
  { id: "large", label: "Large organization" },
] as const;

/** PRD §2 — domain handling, web and app categories only. */
export const DOMAIN_OPTIONS = [
  {
    id: "have",
    label: "I already have a domain",
    note: "We'll send you the DNS details to point it at us. Hosting and backend are included either way.",
  },
  {
    id: "buy",
    label: "Register one through TechRepubliQ",
    note: "Added to your order as a one-time service.",
  },
] as const;

export type DomainOptionId = (typeof DOMAIN_OPTIONS)[number]["id"];

export const INTAKE_METRICS = [
  {
    id: "requestsPerDay",
    label: "Expected daily traffic",
    hint: "Rough page or API requests per day once it's live.",
    unit: "requests/day",
  },
  {
    id: "users",
    label: "Expected registered users",
    hint: "How many accounts you expect in the first year.",
    unit: "users",
  },
  {
    id: "transactions",
    label: "Expected daily transactions",
    hint: "Orders, bookings, or payments per day. Leave at 0 if not applicable.",
    unit: "per day",
  },
  {
    id: "staff",
    label: "Staff / admin users",
    hint: "How many people will need dashboard access.",
    unit: "people",
  },
] as const;

/**
 * Deterministic tier recommendation from the intake metrics (PRD §4.3).
 * Never blocks the customer — it only pre-selects a card in the UI.
 */
export function recommendTier(metrics: {
  requestsPerDay?: number;
  users?: number;
  transactions?: number;
  staff?: number;
  stage?: string;
}): TierId {
  const order: TierId[] = ["mvp", "startup", "business", "enterprise"];
  let rank = 0;

  const bump = (next: TierId) => {
    rank = Math.max(rank, order.indexOf(next));
  };

  if ((metrics.requestsPerDay ?? 0) > 100000) bump("business");
  else if ((metrics.requestsPerDay ?? 0) > 10000) bump("startup");

  if ((metrics.users ?? 0) > 25000) bump("business");
  else if ((metrics.users ?? 0) > 5000) bump("startup");

  if ((metrics.transactions ?? 0) > 1000) bump("business");
  else if ((metrics.transactions ?? 0) > 100) bump("startup");

  if ((metrics.staff ?? 0) > 20) bump("business");
  else if ((metrics.staff ?? 0) > 5) bump("startup");

  if (metrics.stage === "funded") bump("startup");
  if (metrics.stage === "established") bump("business");
  if (metrics.stage === "large") bump("enterprise");

  return order[rank];
}

/* ------------------------------------------------------------------ *
 * Money math
 * ------------------------------------------------------------------ */

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
  /** Engine output. Also the total when spread over 12 months. */
  listCents: number;
  /** Paying the whole fee at once — 15% off (decision 16). */
  payOnceCents: number;
  savedCents: number;
  /** 12 even monthly payments; the first few absorb the rounding remainder. */
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

/** Monthly price of one add-on at a tier. `null` = Enterprise (Contact Sales). */
export function addonMonthlyCents(tierId: TierId, addonId: string): number | null {
  const tier = tierById(tierId);
  if (!tier || tier.monthlyCents === null) return null;
  const addon = ADDON_CATALOG.find((a) => a.id === addonId);
  // Unknown add-ons fall back to the tier's standard price (§3.3, priced by analogy).
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

/** PRD §4.7 — monthly cadence: annual + 15%, split evenly across 12. */
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
  category: CategorySlug;
  tierId: TierId;
  pages: number;
  components: number;
  complexity: ComplexityId;
  /** Recurring add-ons, including anything the pricing engine inferred. */
  addons?: string[];
  /** Domain purchase, store deployment, etc. (PRD §4.1). */
  oneTimeServices?: string[];
  /** "once" = pay the fee in full (15% off); "installments" = 12 even payments. */
  devFeeMode?: "once" | "installments";
  /** Applies to recurring services only (PRD §4.7). */
  cadence?: "annual" | "monthly";
}

export interface PriceBreakdown {
  devFeeCents: number;
  devFee: DevFeeOptions;
  /** null for Enterprise — nothing is shown, it routes to Contact Sales. */
  servicesAnnualCents: number | null;
  servicesMonthlyCents: number | null;
  oneTimeServicesCents: number;
  /** What leaves the customer's account today. null for Enterprise. */
  dueNowCents: number | null;
  /** Total cost of the order under each fee option, for the summary screen. */
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
    input.devFeeMode === "installments"
      ? devFee.perMonthCents[0]
      : devFee.payOnceCents;
  const servicesNow =
    input.cadence === "monthly" ? monthly : annual;

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

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

export function formatUsd(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "Contact Sales";
  const value = cents / 100;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
