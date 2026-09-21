import { error, json, generateId, getAuthToken, verifyToken } from "../utils";
import type { Env } from "../index";
import {
  EDIT_PLANS,
  EDIT_ROLLOVER_CAP_MONTHS,
  EXTRA_REVIEWS,
  computeEditCents,
  type ComplexityId,
} from "../lib/pricing";
import { getProvider } from "../payments";
import type { ProviderId } from "../payments/types";
import { addMonths, sqlNow } from "../lib/installments";

/**
 * Revisions and post-launch edits (PRD §5 and §5A).
 *
 * Reviews are the pre-launch cycle: a project ships with an allowance, and extra packs
 * ($10 for two, $15 for three) can be bought until it goes live — never after, because
 * §5 says the review system stops applying at launch.
 *
 * Once live, changes are edits: either drawn from a monthly bundle
 * ($100/10, $200/25, $500/50, $1,000/unlimited) or priced individually by the same
 * page/component/complexity rates, with a floor so a small change still has a price.
 *
 * Purchases charge the card the customer saved at checkout. There is no card-entry flow
 * in the dashboard — if the charge fails, the answer is the Service Center, not a form.
 */

async function requireCustomer(request: Request, env: Env): Promise<string | null> {
  const token = getAuthToken(request);
  if (!token) return null;
  const session = await verifyToken(token, env);
  return session?.customer_id ?? null;
}

async function ownedProject(env: Env, customerId: string, projectId: string) {
  return env.DB.prepare("SELECT * FROM projects WHERE id = ? AND customer_id = ?")
    .bind(projectId, customerId)
    .first<any>();
}

/** The currency and rail the customer paid with when the project was created. */
async function presentmentFor(env: Env, orderId: string | null, amountCents: number) {
  const intent = orderId
    ? await env.DB.prepare(
        "SELECT currency, provider, fx_rate_used FROM payment_intents WHERE order_id = ? ORDER BY rowid DESC LIMIT 1"
      )
        .bind(orderId)
        .first<any>()
    : null;

  const currency = intent?.currency ?? "USD";
  const rate = intent?.fx_rate_used ?? null;
  const provider = (intent?.provider ?? "stripe") as ProviderId;

  return {
    currency,
    provider,
    fxRateUsed: rate,
    amountMinor: rate ? Math.round(amountCents * rate) : Math.round(amountCents),
  };
}

async function chargeOnFile(
  env: Env,
  params: { email: string; provider: ProviderId; currency: string; amountMinor: number; amountCents: number; reference: string }
): Promise<{ ok: boolean; message?: string }> {
  const method = await env.DB.prepare(
    "SELECT * FROM saved_methods WHERE email = ? AND provider = ? AND status = 'Active' ORDER BY created_at DESC LIMIT 1"
  )
    .bind(params.email, params.provider)
    .first<any>();

  if (!method) {
    return { ok: false, message: "No card on file — message us in the Service Center and we'll sort it out." };
  }

  const provider = getProvider(params.provider);
  const result = await provider
    .chargeSaved(
      { provider: params.provider, token: method.token },
      {
        email: params.email,
        amountMinor: params.amountMinor,
        currency: params.currency,
        reference: params.reference,
      },
      env
    )
    .catch((err) => ({
      ok: false,
      failureMessage: err instanceof Error ? err.message : String(err),
    }));

  if (!result.ok) {
    return { ok: false, message: result.failureMessage ?? "The payment didn't go through." };
  }

  await env.DB.prepare(
    `INSERT INTO payments (id, provider, provider_reference, amount_cents, amount_minor, currency, status, email)
     VALUES (?, ?, ?, ?, ?, ?, 'Paid', ?)`
  )
    .bind(
      `PAY-${generateId()}`,
      params.provider,
      params.reference,
      params.amountCents,
      params.amountMinor,
      params.currency,
      params.email
    )
    .run();

  return { ok: true };
}

/**
 * Roll the subscription forward if its renewal date has passed. Unused edits carry over,
 * capped at one month's allowance, so hoarding isn't a thing.
 */
async function currentSubscription(env: Env, projectId: string): Promise<any | null> {
  const sub = await env.DB.prepare(
    "SELECT * FROM edit_subscriptions WHERE project_id = ?"
  )
    .bind(projectId)
    .first<any>();
  if (!sub) return null;
  if (sub.status !== "Active" || !sub.renews_on) return sub;

  const now = new Date();
  let renewsOn = new Date(`${sub.renews_on}T00:00:00Z`);
  if (!(renewsOn <= now)) return sub;

  let remaining = sub.edits_remaining;
  let guard = 0;
  while (renewsOn <= now && guard++ < 24) {
    if (sub.edits_included !== null) {
      const carry = Math.min(remaining ?? 0, sub.edits_included * EDIT_ROLLOVER_CAP_MONTHS);
      remaining = sub.edits_included + carry;
    }
    renewsOn = addMonths(renewsOn, 1);
  }

  const next = sqlNow(renewsOn).slice(0, 10);
  await env.DB.prepare("UPDATE edit_subscriptions SET edits_remaining = ?, renews_on = ? WHERE id = ?")
    .bind(sub.edits_included === null ? null : remaining, next, sub.id)
    .run();

  return { ...sub, edits_remaining: sub.edits_included === null ? null : remaining, renews_on: next };
}

export const edits = {
  /** Everything the Edits tab needs, in one call. */
  overview: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to view this project");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const revisions = await env.DB.prepare("SELECT * FROM revisions WHERE project_id = ?")
      .bind(project.id)
      .first<any>();
    const subscription = await currentSubscription(env, project.id);
    const requests = await env.DB.prepare(
      "SELECT id, description, pages, components, complexity, price_cents, billed_via, status, created_at FROM edit_requests WHERE project_id = ? ORDER BY created_at DESC LIMIT 25"
    )
      .bind(project.id)
      .all<any>();

    return json({
      status: project.status,
      revisions: revisions ?? { included: 0, used: 0, purchased: 0 },
      subscription,
      requests: requests.results ?? [],
      packs: EXTRA_REVIEWS,
      plans: EDIT_PLANS,
    });
  },

  /** Price an edit before committing to it — the customer always sees the number first. */
  quote: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    if (!(await ownedProject(env, customerId, id))) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const complexity = (["standard", "elevated", "complex"].includes(body?.complexity)
      ? body.complexity
      : "standard") as ComplexityId;

    return json({
      priceCents: computeEditCents({
        pages: Math.round(Number(body?.pages) || 0),
        components: Math.round(Number(body?.components) || 0),
        complexity,
      }),
      complexity,
    });
  },

  /**
   * Buy a review pack. Pre-launch only — §5's review system stops at launch, after which
   * changes are edits (§5A).
   */
  buyReviews: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to buy reviews");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");
    if (project.status === "Live") {
      return error(409, "This project has launched — extra reviews no longer apply. Request an edit instead.");
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const pack = EXTRA_REVIEWS.find((p) => p.count === Math.round(Number(body?.count)));
    if (!pack) return error(400, "Unknown review pack");

    const email = (
      await env.DB.prepare("SELECT email FROM customers WHERE id = ?").bind(customerId).first<{ email: string }>()
    )?.email;
    if (!email) return error(400, "No email on this account");

    const presentment = await presentmentFor(env, project.order_id, pack.cents);
    const reference = `REV-${generateId()}`;
    const charge = await chargeOnFile(env, {
      email,
      provider: presentment.provider,
      currency: presentment.currency,
      amountMinor: presentment.amountMinor,
      amountCents: pack.cents,
      reference,
    });
    if (!charge.ok) return error(402, charge.message ?? "The payment didn't go through.");

    await env.DB.prepare(
      "UPDATE revisions SET purchased = purchased + ? WHERE project_id = ?"
    )
      .bind(pack.count, project.id)
      .run();
    await env.DB.prepare(
      "INSERT INTO review_purchases (id, project_id, reviews, price_cents) VALUES (?, ?, ?, ?)"
    )
      .bind(`RP-${generateId()}`, project.id, pack.count, pack.cents)
      .run();

    const revisions = await env.DB.prepare("SELECT * FROM revisions WHERE project_id = ?")
      .bind(project.id)
      .first<any>();

    return json({ ok: true, revisions });
  },

  /**
   * Request an edit. If a monthly bundle has edits left, one is drawn from it; otherwise
   * the edit is priced and charged to the card on file.
   */
  request: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to request an edit");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const description = String(body?.description ?? "").slice(0, 2000).trim();
    if (!description) return error(400, "Describe the change you want");

    const complexity = (["standard", "elevated", "complex"].includes(body?.complexity)
      ? body.complexity
      : "standard") as ComplexityId;
    const pages = Math.max(0, Math.round(Number(body?.pages) || 0));
    const components = Math.max(0, Math.round(Number(body?.components) || 0));

    const subscription = await currentSubscription(env, project.id);
    const covered =
      subscription?.status === "Active" &&
      (subscription.edits_included === null || (subscription.edits_remaining ?? 0) > 0);

    let priceCents = 0;
    if (!covered) {
      priceCents = computeEditCents({ pages, components, complexity });

      const email = (
        await env.DB.prepare("SELECT email FROM customers WHERE id = ?").bind(customerId).first<{ email: string }>()
      )?.email;
      if (!email) return error(400, "No email on this account");

      const presentment = await presentmentFor(env, project.order_id, priceCents);
      const charge = await chargeOnFile(env, {
        email,
        provider: presentment.provider,
        currency: presentment.currency,
        amountMinor: presentment.amountMinor,
        amountCents: priceCents,
        reference: `EDT-${generateId()}`,
      });
      if (!charge.ok) return error(402, charge.message ?? "The payment didn't go through.");
    } else if (subscription.edits_included !== null) {
      await env.DB.prepare("UPDATE edit_subscriptions SET edits_remaining = edits_remaining - 1 WHERE id = ?")
        .bind(subscription.id)
        .run();
    }

    const editId = `EDR-${generateId()}`;
    await env.DB.prepare(
      `INSERT INTO edit_requests (id, project_id, description, pages, components, complexity, price_cents, billed_via, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Requested')`
    )
      .bind(
        editId,
        project.id,
        description,
        pages,
        components,
        complexity,
        priceCents,
        covered ? "subscription" : "payg"
      )
      .run();

    return json({ ok: true, id: editId, billedVia: covered ? "subscription" : "payg", priceCents });
  },

  /** Start (or switch to) a monthly edit plan. First month is charged now. */
  subscribe: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to subscribe");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const plan = EDIT_PLANS.find((p) => p.monthlyCents === Math.round(Number(body?.monthlyCents)));
    if (!plan) return error(400, "Unknown plan");

    const email = (
      await env.DB.prepare("SELECT email FROM customers WHERE id = ?").bind(customerId).first<{ email: string }>()
    )?.email;
    if (!email) return error(400, "No email on this account");

    const presentment = await presentmentFor(env, project.order_id, plan.monthlyCents);
    const charge = await chargeOnFile(env, {
      email,
      provider: presentment.provider,
      currency: presentment.currency,
      amountMinor: presentment.amountMinor,
      amountCents: plan.monthlyCents,
      reference: `SUB-${generateId()}`,
    });
    if (!charge.ok) return error(402, charge.message ?? "The payment didn't go through.");

    const renewsOn = sqlNow(addMonths(new Date(), 1)).slice(0, 10);
    await env.DB.prepare(
      `INSERT INTO edit_subscriptions (id, project_id, monthly_cents, edits_included, edits_remaining, renews_on, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')
       ON CONFLICT(project_id) DO UPDATE SET
         monthly_cents = excluded.monthly_cents,
         edits_included = excluded.edits_included,
         edits_remaining = excluded.edits_remaining,
         renews_on = excluded.renews_on,
         status = 'Active'`
    )
      .bind(
        `ES-${generateId()}`,
        project.id,
        plan.monthlyCents,
        plan.edits,
        plan.edits,
        renewsOn
      )
      .run();

    return json({ ok: true, subscription: await currentSubscription(env, project.id) });
  },

  cancelSubscription: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    await env.DB.prepare(
      "UPDATE edit_subscriptions SET status = 'Cancel at renewal' WHERE project_id = ? AND status = 'Active'"
    )
      .bind(project.id)
      .run();

    return json({ ok: true, subscription: await currentSubscription(env, project.id) });
  },
};
