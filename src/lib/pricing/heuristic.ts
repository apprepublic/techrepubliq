/**
 * Heuristic pricing engine (PRD §4.2, locked decision 1).
 *
 * v1 is deliberately dumb, deterministic and explainable: it reads the brief,
 * counts the screens and data entities it can recognise, judges complexity from a
 * fixed signal list, and returns the three numbers §4.2 prices on
 * (pages, components, complexity).
 *
 * It is wrapped by the `PricingEngine` seam (`@/lib/pricing-engine`) so an AI
 * implementation can replace it later with no call-site changes.
 */

import type { CategorySlug, ComplexityId } from "@/lib/product";

export interface ProjectEstimate {
  pages: number;
  components: number;
  complexity: ComplexityId;
  /** Why the engine landed where it did — shown on the "Get Priced" screen. */
  signals: string[];
  confidence: "low" | "medium" | "high";
}

type Signal = { re: RegExp; label: string };

/** Named screens. Each hit is one page (PRD §4.2 "number of pages"). */
const PAGE_SIGNALS: Signal[] = [
  { re: /\b(landing page|home ?page|homepage)\b/, label: "landing page" },
  { re: /\b(log ?in|sign ?in|login)\b/, label: "sign-in" },
  { re: /\b(sign ?up|register|registration|onboarding)\b/, label: "sign-up" },
  { re: /\b(dashboard|admin panel|back ?office|console)\b/, label: "dashboard" },
  { re: /\b(checkout|payment page)\b/, label: "checkout" },
  { re: /\b(cart|basket|shop|store)\b/, label: "store" },
  { re: /\b(pricing|plans?|subscription page)\b/, label: "pricing" },
  { re: /\b(blog|articles?|news)\b/, label: "blog" },
  { re: /\b(contact|enquir(?:y|ies)|get in touch)\b/, label: "contact" },
  { re: /\b(about|company|team page|our story)\b/, label: "about" },
  { re: /\b(profile|account settings|settings)\b/, label: "profile" },
  { re: /\b(search|filter|browse)\b/, label: "search" },
  { re: /\b(booking|appointments?|scheduling|reservation)\b/, label: "booking" },
  { re: /\b(gallery|portfolio|showcase)\b/, label: "gallery" },
  { re: /\b(faq|help ?cent(?:re|er)|knowledge base)\b/, label: "FAQ" },
  { re: /\b(notification|alerts?|inbox)\b/, label: "notifications" },
  { re: /\b(chat|messages?|messaging|inbox)\b/, label: "messaging" },
  { re: /\b(reports?|analytics|insights|metrics)\b/, label: "reporting" },
  { re: /\b(listings?|catalog(?:ue)?|marketplace|properties)\b/, label: "listings" },
  { re: /\b(courses?|lessons?|curriculum|learning)\b/, label: "courses" },
  { re: /\b(inventory|stock|warehouse)\b/, label: "inventory" },
  { re: /\b(crm|pipeline|deals?|leads?)\b/, label: "CRM" },
  { re: /\b(invoices?|billing|receipts?)\b/, label: "billing" },
  { re: /\b(tracking|delivery status|order status)\b/, label: "tracking" },
  { re: /\b(terms|privacy policy|legal)\b/, label: "policy pages" },
];

/** Data entities implied by the brief. Each hit is one component/model (§4.2). */
const MODEL_SIGNALS: Signal[] = [
  { re: /\b(users?|accounts?|customers?|members?|profiles?)\b/, label: "users" },
  { re: /\b(orders?|purchases?|transactions?)\b/, label: "orders" },
  { re: /\b(products?|items?|services?|catalog(?:ue)?)\b/, label: "products" },
  { re: /\b(payments?|invoices?|billing)\b/, label: "payments" },
  { re: /\b(bookings?|appointments?|reservations?|slots?)\b/, label: "bookings" },
  { re: /\b(messages?|chat|conversations?|threads?)\b/, label: "messages" },
  { re: /\b(notifications?|alerts?|reminders?)\b/, label: "notifications" },
  { re: /\b(documents?|files?|uploads?|attachments?)\b/, label: "documents" },
  { re: /\b(courses?|lessons?|modules?|curriculum)\b/, label: "courses" },
  { re: /\b(inventory|stock|sku)\b/, label: "inventory" },
  { re: /\b(tickets?|support cases?|issues?)\b/, label: "tickets" },
  { re: /\b(leads?|prospects?|enquiries|inquiries)\b/, label: "leads" },
  { re: /\b(staff|employees?|team members?|agents?)\b/, label: "staff" },
  { re: /\b(reviews?|ratings?|testimonials?|feedback)\b/, label: "reviews" },
  { re: /\b(subscriptions?|plans?|tiers?|packages?)\b/, label: "subscriptions" },
  { re: /\b(deliveries|shipments?|logistics|fleet|vehicles?)\b/, label: "deliveries" },
  { re: /\b(events?|sessions?|webinars?|classes)\b/, label: "events" },
  { re: /\b(listings?|properties|units?|rooms?)\b/, label: "listings" },
  { re: /\b(patients?|clients?|cases?|records?)\b/, label: "records" },
  { re: /\b(students?|learners?|enrol(?:l)?ments?)\b/, label: "students" },
  { re: /\b(jobs?|vacancies|applications?|cv|resumes?)\b/, label: "applications" },
  { re: /\b(comments?|posts?|threads?|feed)\b/, label: "posts" },
  { re: /\b(categories|tags|taxonom(y|ies))\b/, label: "categories" },
];

/** Complexity signals (§4.2 "overall project complexity"). Weight 2 = heavy. */
const COMPLEXITY_SIGNALS: { re: RegExp; weight: number; label: string }[] = [
  { re: /\b(payments?|stripe|paystack|checkout|escrow)\b/, weight: 1, label: "payments" },
  { re: /\b(real ?time|live updat\w+|websocket|socket\.io|collaborat\w+)\b/, weight: 2, label: "realtime" },
  { re: /\b(multi ?tenant|tenants?|roles?|permissions?|sso|rbac)\b/, weight: 2, label: "multi-tenant/roles" },
  { re: /\b(integrat\w+|third ?party|api|webhooks?|sync with)\b/, weight: 1, label: "integrations" },
  { re: /\b(ai|llm|gpt|machine learning|model inference)\b/, weight: 1, label: "AI" },
  { re: /\b(e ?commerce|marketplace|multi ?vendor)\b/, weight: 2, label: "commerce" },
  { re: /\b(migrat\w+|legacy|existing system|re ?platform)\b/, weight: 1, label: "migration" },
  { re: /\b(offline|sync|background jobs?)\b/, weight: 1, label: "offline/sync" },
  { re: /\b(multi ?lingual|locali[sz]ation|i18n|languages?)\b/, weight: 1, label: "localisation" },
  { re: /\b(analytics|reporting|report builder|dashboards?)\b/, weight: 1, label: "reporting" },
  { re: /\b(hipaa|gdpr|pci|compliance|audit log)\b/, weight: 2, label: "compliance" },
  { re: /\b(high traffic|scale|scaling|100,?000|1 ?million|millions of)\b/, weight: 1, label: "scale" },
  { re: /\b(maps?|location|geolocation|directions|store locator|near ?me)\b/, weight: 1, label: "geo" },
  { re: /\b(push notifications?|notifications?|background jobs?|scheduled)\b/, weight: 1, label: "push/scheduled" },
  { re: /\b(video|streaming|media|uploads? of (?:video|audio))\b/, weight: 1, label: "media" },
  { re: /\b(kyc|identity|verification|2fa|two ?factor)\b/, weight: 2, label: "identity" },
  { re: /\b(wallet|ledger|payouts?|split payment|multi ?currency)\b/, weight: 2, label: "money movement" },
  { re: /\b(social|feed|follow|friends?|groups?)\b/, weight: 1, label: "social graph" },
  { re: /\b(calendar|scheduling|availability|time ?slots?)\b/, weight: 1, label: "scheduling" },
];

/**
 * Typical scope of a mid-size project in each category — the anchor the signals scale
 * up or down from. Calibrate here (and in COMPLEXITY) once real briefs start arriving;
 * nothing else in the engine needs to change.
 */
const CATEGORY_SCOPE: Record<string, { pages: number; components: number }> = {
  "web-development": { pages: 20, components: 12 },
  "app-development": { pages: 24, components: 14 },
  "ai-automation": { pages: 4, components: 12 },
  "ai-integration": { pages: 6, components: 10 },
  training: { pages: 3, components: 3 },
  optimization: { pages: 12, components: 4 },
  "web-app-management": { pages: 12, components: 4 },
};

/** Scope scaling. A short, plain brief sits near the floor; a dense one near the ceiling. */
const SCALE_BASE = 0.35;
const SCALE_PER_SIGNAL = 0.1;
const SCALE_MIN = 0.35;
const SCALE_MAX = 2.5;

function hits(brief: string, signals: Signal[]): string[] {
  return signals.filter((s) => s.re.test(brief)).map((s) => s.label);
}

function unique(list: string[]): string[] {
  return Array.from(new Set(list));
}

/** "about 12 pages" / "8 screens" wins over anything we inferred. */
function explicitPageCount(brief: string): number {
  const matches = brief.matchAll(
    /\b(\d{1,3})\s*(?:\+|to|-)?\s*(?:\d{1,3}\s*)?(?:pages?|screens?|views?|templates?)\b/g
  );
  let max = 0;
  for (const m of matches) {
    const value = Number(m[1]);
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  return max;
}

export function estimate(brief: string, category: CategorySlug | string): ProjectEstimate {
  const text = (brief || "").toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const scope = CATEGORY_SCOPE[category] ?? { pages: 12, components: 8 };

  const pageSignals = unique(hits(text, PAGE_SIGNALS));
  const modelSignals = unique(hits(text, MODEL_SIGNALS));
  const complexitySignals = COMPLEXITY_SIGNALS.filter((s) => s.re.test(text));
  const score = complexitySignals.reduce((sum, s) => sum + s.weight, 0);

  // Scope scales with how much the brief actually describes: named screens, named
  // data entities, complexity signals, and the length of the brief itself.
  const sizeScore =
    pageSignals.length + modelSignals.length + score + Math.min(4, words / 120);
  const scale = Math.min(
    SCALE_MAX,
    Math.max(SCALE_MIN, SCALE_BASE + sizeScore * SCALE_PER_SIGNAL)
  );

  let pages = Math.max(1, Math.round(scope.pages * scale));
  const explicit = explicitPageCount(text);
  if (explicit > pages) pages = explicit;
  const components = Math.max(1, Math.round(scope.components * scale));
  let complexity: ComplexityId =
    score >= 5 ? "complex" : score >= 2 ? "elevated" : "standard";
  // An AI product is never "standard" underneath, whatever the brief says.
  if (
    (category === "ai-automation" || category === "ai-integration") &&
    complexity === "standard"
  ) {
    complexity = "elevated";
  }

  const signals = [
    `${pages} pages`,
    `${components} components/models`,
    `${complexity} complexity`,
    ...pageSignals.slice(0, 4).map((s) => `page: ${s}`),
    ...modelSignals.slice(0, 4).map((s) => `model: ${s}`),
    ...complexitySignals.slice(0, 3).map((s) => `complexity: ${s.label}`),
  ];

  return {
    pages,
    components,
    complexity,
    signals,
    confidence: words < 20 ? "low" : words < 60 ? "medium" : "high",
  };
}

/**
 * Which recurring add-ons the project needs (PRD §3.1).
 * Inferred, never vendor-disclosed — the customer sees a cumulative line item.
 */
/**
 * The smallest scope the engine will return for a category — used for "from" prices on
 * marketing pages so they can never drift from the model.
 */
export function floorEstimate(category: CategorySlug | string): {
  pages: number;
  components: number;
  complexity: ComplexityId;
} {
  const scope = CATEGORY_SCOPE[category] ?? { pages: 12, components: 8 };
  return {
    pages: Math.max(1, Math.round(scope.pages * SCALE_MIN)),
    components: Math.max(1, Math.round(scope.components * SCALE_MIN)),
    complexity: "standard",
  };
}

export function inferAddons(brief: string, category: CategorySlug | string): string[] {
  const text = (brief || "").toLowerCase();
  const addons: string[] = [];

  if (
    /\b(maps?|map view|location|geolocation|directions|address autocomplete|route|gps|near ?me|store locator|places)\b/.test(
      text
    )
  ) {
    addons.push("google");
  }

  if (
    /\b(email|emails|newsletter|mailing list|inbox|smtp|transactional mail|mail shots?)\b/.test(
      text
    )
  ) {
    addons.push("email");
  }

  if (
    /\b(ai|llm|gpt|chat ?bot|chatbot|agent|assistant|automat\w+|generate|generative|summari[sz]e|recommend\w+|classif\w+|extract|ocr|sentiment|translat\w+)\b/.test(
      text
    )
  ) {
    addons.push("ai");
  }

  // An AI product runs AI features after launch, so the AI add-on is implied (§3.3).
  if ((category === "ai-automation" || category === "ai-integration") && !addons.includes("ai")) {
    addons.push("ai");
  }

  return unique(addons);
}

export const heuristicEngine = {
  id: "heuristic-v1",
  estimate,
  inferAddons,
};
