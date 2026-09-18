import { error, json, generateId } from "../utils";
import type { Env } from "../index";
import {
  ADDON_CATALOG,
  CATEGORIES,
  INSTALLMENT_MONTHS,
  ONE_TIME_SERVICES,
  TIERS,
  computePrice,
  type ComplexityId,
  type TierId,
} from "../lib/pricing";

/** Sanity ceilings — the engine's estimate is clamped before it becomes money. */
const MAX_PAGES = 500;
const MAX_COMPONENTS = 500;

function clampInt(value: unknown, fallback: number, max: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(max, n);
}

function pickComplexity(value: unknown): ComplexityId {
  return value === "standard" || value === "elevated" || value === "complex"
    ? value
    : "standard";
}

function pickTier(value: unknown): TierId {
  return (TIERS.find((t) => t.id === value)?.id ?? "startup") as TierId;
}

function onlyKnown<T extends { id: string }>(value: unknown, catalog: readonly T[]): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((v): v is string => typeof v === "string"))).filter((id) =>
    catalog.some((item) => item.id === id)
  );
}

/**
 * PRD §1 steps 4–6 and §4.2.
 *
 * The client sends its estimate (pages / components / complexity / add-ons) plus the brief;
 * this route recomputes every amount with the mirrored model — the client never sends money.
 * It returns the four option totals the summary screen toggles between, and no per-unit
 * breakdown (§4.4: one final total, no line items).
 */
export const quotes = {
  generate: async (request: Request, env: Env) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return error(400, "Invalid JSON body");
    }

    const category = CATEGORIES.find((c) => c.slug === body?.category)?.slug;
    if (!category) return error(400, "Unknown category");

    const tierId = pickTier(body.tierId);
    const complexity = pickComplexity(body.complexity);
    const pages = clampInt(body.pages, 12, MAX_PAGES);
    const components = clampInt(body.components, 8, MAX_COMPONENTS);
    const addons = onlyKnown(body.addons, ADDON_CATALOG);
    const oneTimeServices = onlyKnown(body.oneTimeServices, ONE_TIME_SERVICES);
    const cadence = body.cadence === "monthly" ? "monthly" : "annual";
    const devFeeMode = body.devFeeMode === "installments" ? "installments" : "once";
    const brief = String(body.brief ?? "").slice(0, 4000);

    const input = {
      category,
      tierId,
      pages,
      components,
      complexity,
      addons,
      oneTimeServices,
    };

    const totalFor = (mode: typeof devFeeMode, cad: typeof cadence) =>
      computePrice({ ...input, devFeeMode: mode, cadence: cad }).dueNowCents;

    const price = computePrice({ ...input, devFeeMode, cadence });
    const totals = {
      onceAnnual: totalFor("once", "annual"),
      onceMonthly: totalFor("once", "monthly"),
      installAnnual: totalFor("installments", "annual"),
      installMonthly: totalFor("installments", "monthly"),
    };

    const referenceId = `QR-${generateId()}`;

    await env.DB.prepare(
      `INSERT INTO quotes
         (reference_id, service_slug, description, features, price_cents, currency, scope_summary, is_estimated,
          tier_id, metrics, assets, domain_option, cadence, dev_fee_mode, addons, one_time_services, breakdown, contact_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        referenceId,
        category,
        brief,
        JSON.stringify(addons),
        totals.onceAnnual ?? 0,
        "USD",
        "[]",
        1,
        tierId,
        JSON.stringify(body.metrics ?? {}),
        JSON.stringify(Array.isArray(body.assets) ? body.assets : []),
        String(body.domainOption ?? "") || null,
        cadence,
        devFeeMode,
        JSON.stringify(addons),
        JSON.stringify(oneTimeServices),
        JSON.stringify({
          pages,
          components,
          complexity,
          devFeeCents: price.devFeeCents,
          servicesAnnualCents: price.servicesAnnualCents,
          totals,
        }),
        String(body.contactEmail ?? "") || null
      )
      .run();

    return json(
      {
        referenceId,
        currency: "USD",
        contactSales: price.contactSales,
        feeCents: price.devFeeCents,
        feeOnceCents: price.devFee.payOnceCents,
        feePerMonthCents: price.devFee.perMonthCents[0],
        installmentMonths: INSTALLMENT_MONTHS,
        servicesAnnualCents: price.servicesAnnualCents,
        servicesMonthlyCents: price.servicesMonthlyCents,
        oneTimeServicesCents: price.oneTimeServicesCents,
        totals,
        addons,
        oneTimeServices,
      },
      201
    );
  },

  get: async (request: Request, env: Env) => {
    const url = new URL(request.url);
    const ref = url.pathname.split("/").pop() ?? "";
    const quote = await env.DB.prepare("SELECT * FROM quotes WHERE reference_id = ?")
      .bind(ref)
      .first();

    if (!quote) return error(404, "Quote not found");
    return json({ quote });
  },
};
