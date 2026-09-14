import { error, json, generateId } from "../utils";
import type { Env } from "../index";

const services = [
  { slug: "web-development", title: "Web Development", basePriceCents: 250000 },
  { slug: "app-development", title: "App Development", basePriceCents: 500000 },
  { slug: "ai-automation", title: "AI Automation", basePriceCents: 300000 },
  { slug: "ai-integration", title: "AI Integration", basePriceCents: 200000 },
  { slug: "training", title: "Training", basePriceCents: 150000 },
  { slug: "optimization", title: "Optimization", basePriceCents: 100000 },
];

export const quotes = {
  generate: async (request: Request, env: Env) => {
    const { category, description, features, timeline, budget } = await request.json() as any;
    if (!category || !description) return error(400, "Missing required fields");

    const service = services.find(s => s.slug === category);
    const basePrice = service?.basePriceCents ?? 200000;
    const complexity = description.length > 200 ? 1.5 : description.length > 100 ? 1.2 : 1;
    const priceCents = Math.round(basePrice * complexity);

    const referenceId = `QR-${generateId()}`;
    const scopeSummary = [
      service
        ? `${service.title} — full project delivery`
        : "Custom scoping based on your description",
      "Responsive, production-ready build",
      "Performance optimization & SEO basics",
      "Deployment & hosting configuration",
      "30-day post-delivery support",
    ];

    await env.DB.prepare(
      `INSERT INTO quotes (reference_id, service_slug, description, features, timeline, budget_range, price_cents, scope_summary, is_estimated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      referenceId,
      category,
      description,
      JSON.stringify(features ?? []),
      timeline ?? null,
      budget ?? null,
      priceCents,
      JSON.stringify(scopeSummary),
      complexity > 1.3 ? 1 : 0
    ).run();

    return json({
      referenceId,
      priceCents,
      currency: "USD",
      scopeSummary,
      isEstimated: complexity > 1.3,
      timeline: timeline === "asap" ? "2–3 weeks"
        : timeline === "1-2 weeks" ? "1–3 weeks"
        : timeline === "3-4 weeks" ? "3–5 weeks"
        : timeline === "1-2 months" ? "4–8 weeks"
        : "To be confirmed",
    }, 201);
  },

  get: async (request: Request, env: Env) => {
    const url = new URL(request.url);
    const ref = url.pathname.split("/").pop() ?? "";
    const quote = await env.DB.prepare(
      "SELECT * FROM quotes WHERE reference_id = ?"
    ).bind(ref).first();

    if (!quote) return error(404, "Quote not found");
    return json({ quote });
  },
};