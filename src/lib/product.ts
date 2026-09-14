import { services } from "./utils";

export type TierId = "mvp" | "startup" | "business" | "enterprise";
export type AddonKind = "google" | "email" | "ai";
export type BillingCadence = "annual" | "monthly";
export type ProjectStatus = "Queued" | "In preview" | "Live";

export type Addon = {
  id: string;
  name: string;
  blurb: string;
  kind: AddonKind;
  keywords: string[];
};

export type Tier = {
  id: TierId;
  name: string;
  for: string;
  revisions: number | null;
  serviceMonthly: number | null;
  emailVolume: string;
  stageHint: string;
};

export const tiers: Tier[] = [
  {
    id: "mvp",
    name: "MVP",
    for: "Solo / small team",
    revisions: 3,
    serviceMonthly: 5,
    emailVolume: "2,500 mails/day",
    stageHint: "solo/small team",
  },
  {
    id: "startup",
    name: "Startup",
    for: "Funded startup",
    revisions: 5,
    serviceMonthly: 25,
    emailVolume: "50,000 mails/day",
    stageHint: "funded startup",
  },
  {
    id: "business",
    name: "Business",
    for: "Established business",
    revisions: 10,
    serviceMonthly: 50,
    emailVolume: "100,000 mails/day",
    stageHint: "established business",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    for: "Large organization",
    revisions: null,
    serviceMonthly: null,
    emailVolume: "Custom",
    stageHint: "large organization",
  },
];

export const addonCatalog: Addon[] = [
  {
    id: "maps",
    name: "Maps",
    blurb: "Location, store finders, and in-product maps.",
    kind: "google",
    keywords: ["map", "maps", "location", "store locator", "directions", "geo"],
  },
  {
    id: "email",
    name: "Email",
    blurb: "Transactional and campaign mail from your project domain.",
    kind: "email",
    keywords: ["email", "mail", "inbox", "smtp", "newsletter"],
  },
  {
    id: "ai-live-chat",
    name: "AI Live Chat",
    blurb: "On-site live chat handled by an AI agent.",
    kind: "ai",
    keywords: ["live chat", "support chat", "helpdesk", "customer support"],
  },
  {
    id: "blog-agent",
    name: "Blog Agent",
    blurb: "Ongoing content drafting for your blog.",
    kind: "ai",
    keywords: ["blog", "articles", "content site", "cms"],
  },
  {
    id: "newsletter-agent",
    name: "Newsletter Agent",
    blurb: "Recurring newsletter writing and send.",
    kind: "ai",
    keywords: ["newsletter", "digest", "subscribers"],
  },
  {
    id: "ai-chat-agent",
    name: "AI Chat Agent",
    blurb: "A product-native assistant over your data.",
    kind: "ai",
    keywords: ["chatbot", "assistant", "agent", "ai chat", "copilot"],
  },
];

export const editPlans = [
  { id: "10", monthly: 100, edits: "up to 10" },
  { id: "25", monthly: 200, edits: "up to 25" },
  { id: "50", monthly: 500, edits: "up to 50" },
  { id: "unlimited", monthly: 1000, edits: "unlimited" },
];

export const extraReviews = [
  { id: "plus-2", price: 10, extra: 2 },
  { id: "plus-3", price: 15, extra: 3 },
];

export const BASE_DEV_FEE = 500;
export const RATE_PER_PAGE = 3;
export const RATE_PER_COMPONENT = 3;
export const MONTHLY_MARKUP = 0.15;
export const DOMAIN_FEE = 14;
export const STORE_DEPLOY_FEE = 99;

export function addonMonthly(addon: Addon, tier: Tier): number {
  if (tier.serviceMonthly == null) return 0;
  if (addon.kind === "google") {
    return Math.max(4, Math.round((tier.serviceMonthly / 25) * 10));
  }
  return tier.serviceMonthly;
}

export function inferAddons(brief: string, category: string): string[] {
  const text = `${category} ${brief}`.toLowerCase();
  const hits = addonCatalog.filter((a) => a.keywords.some((k) => text.includes(k))).map((a) => a.id);
  if (category === "ai-integration" && !hits.includes("ai-chat-agent")) hits.push("ai-chat-agent");
  if (category === "ai-automation" && !hits.includes("email")) hits.push("email");
  return Array.from(new Set(hits));
}

function complexityFromBrief(brief: string, category: string): number {
  const t = brief.toLowerCase();
  if (/(marketplace|multi-vendor)/.test(t)) return 1.55;
  if (/(e-?commerce|shop|store|checkout|cart)/.test(t)) return 1.45;
  if (/(saas|subscription|dashboard|portal)/.test(t)) return 1.3;
  if (/(booking|restaurant|hotel|appointment)/.test(t)) return 1.2;
  if (category === "app-development") return 1.25;
  if (category === "ai-automation" || category === "ai-integration") return 1.2;
  if (/(portfolio|brochure|marketing landing)/.test(t)) return 1.0;
  return 1.1;
}

function estimateShape(brief: string, category: string) {
  const words = brief.trim().split(/\s+/).filter(Boolean).length;
  const pages = Math.min(40, Math.max(4, Math.round(words / 18) + (category === "web-development" ? 4 : 3)));
  const components = Math.min(30, Math.max(3, Math.round(words / 22) + 4));
  return { pages, components };
}

export type PriceInput = {
  category: string;
  tierId: TierId;
  brief: string;
  addonIds: string[];
  buyDomain: boolean;
  storeDeploy: boolean;
  cadence: BillingCadence;
};

export type PriceResult = {
  pages: number;
  components: number;
  complexity: number;
  developmentFee: number;
  oneTime: number;
  recurringMonthly: number;
  recurringAnnual: number;
  totalDue: number;
  inferredAddonIds: string[];
  cadence: BillingCadence;
  enterprise: boolean;
};

export function computePrice(input: PriceInput): PriceResult {
  const tier = tiers.find((t) => t.id === input.tierId) ?? tiers[1];
  const enterprise = tier.id === "enterprise";
  const inferredAddonIds = inferAddons(input.brief, input.category);
  const addonIds = Array.from(new Set([...inferredAddonIds, ...input.addonIds]));
  const { pages, components } = estimateShape(input.brief, input.category);
  const complexity = complexityFromBrief(input.brief, input.category);
  const developmentFee = Math.round(
    (BASE_DEV_FEE + RATE_PER_PAGE * pages + RATE_PER_COMPONENT * components) * complexity
  );
  const oneTime =
    (input.buyDomain ? DOMAIN_FEE : 0) + (input.storeDeploy ? STORE_DEPLOY_FEE : 0);
  const recurringMonthly = enterprise
    ? 0
    : addonIds.reduce((sum, id) => {
        const addon = addonCatalog.find((a) => a.id === id);
        return addon ? sum + addonMonthly(addon, tier) : sum;
      }, 0);
  const recurringAnnual = recurringMonthly * 12;
  const servicesDue =
    input.cadence === "annual"
      ? recurringAnnual
      : Math.round((recurringAnnual * (1 + MONTHLY_MARKUP)) / 12);
  const totalDue = enterprise ? 0 : developmentFee + oneTime + servicesDue;
  return {
    pages,
    components,
    complexity,
    developmentFee,
    oneTime,
    recurringMonthly,
    recurringAnnual,
    totalDue,
    inferredAddonIds,
    cadence: input.cadence,
    enterprise,
  };
}

export function serviceTitle(slug: string) {
  return services.find((s) => s.slug === slug)?.title ?? "Custom project";
}

export function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function revisionLabel(tier: Tier) {
  return tier.revisions == null ? "Unlimited pre-launch reviews" : `${tier.revisions} pre-launch reviews`;
}

export type IntakeState = {
  category: string;
  tierId: TierId;
  brief: string;
  logoName: string;
  traffic: string;
  users: string;
  transactions: string;
  staff: string;
  stage: string;
  hasDomain: "yes" | "no" | "";
  buyDomain: boolean;
  storeDeploy: boolean;
  extraAddonIds: string[];
  cadence: BillingCadence;
};

export const emptyIntake = (): IntakeState => ({
  category: "",
  tierId: "startup",
  brief: "",
  logoName: "",
  traffic: "",
  users: "",
  transactions: "",
  staff: "",
  stage: "",
  hasDomain: "",
  buyDomain: false,
  storeDeploy: false,
  extraAddonIds: [],
  cadence: "annual",
});

export const INTAKE_KEY = "techrepubliq-intake-v2";
export const ORDER_KEY = "techrepubliq-last-order";
