import { error, json, generateId, getAuthToken, verifyToken } from "../utils";
import { ensureZone } from "../lib/cloudflare";
import type { Env } from "../index";
import { TIERS, ADDON_CATALOG, CATEGORIES, addonMonthlyCents } from "../lib/pricing";
import { sendOtpEmail } from "../email";
import { nudgesFor } from "../lib/analytics";

/**
 * Projects (WP5) — the surface a customer actually lives in once they've paid.
 *
 * Everything here is owner-scoped: a project is only ever visible to the customer whose
 * id is on it. Historical `orders` are deliberately left alone (§15); projects take over
 * the dashboard while the old order views keep working.
 */

async function requireCustomer(request: Request, env: Env): Promise<string | null> {
  const token = getAuthToken(request);
  if (!token) return null;
  const session = await verifyToken(token, env);
  return session?.customer_id ?? null;
}

/**
 * Find or create the Cloudflare zone for a project's domain. Zones live in our account
 * (decision 17). Returns null when analytics isn't configured or the domain isn't known
 * yet — the project still launches, the tab simply says it's connecting.
 */
async function attachZone(env: Env, project: any): Promise<string | null> {
  if (!project.custom_domain || !env.CF_API_TOKEN) return null;
  try {
    const zoneId = await ensureZone(env, project.custom_domain);
    if (zoneId) return zoneId;
    console.error(`Couldn't attach a zone for ${project.custom_domain}`);
  } catch (err) {
    console.error(`Zone lookup failed for ${project.custom_domain}:`, err);
  }
  return null;
}

async function ownedProject(
  env: Env,
  customerId: string,
  projectId: string
): Promise<any | null> {
  const project = await env.DB.prepare(
    "SELECT * FROM projects WHERE id = ? AND customer_id = ?"
  )
    .bind(projectId, customerId)
    .first<any>();
  return project ?? null;
}

/** Tier base + add-ons as service rows. Created when a paid order becomes a project. */
export async function createProjectForOrder(
  env: Env,
  params: {
    customerId: string;
    orderId: string;
    name: string;
    category: string;
    tierId: string;
    addonIds: string[];
    devFeeCents: number;
    cadence: string;
  }
): Promise<string | null> {
  const tier = TIERS.find((t) => t.id === params.tierId);
  const title =
    CATEGORIES.find((c) => c.slug === params.category)?.title ?? params.name ?? "New project";
  const projectId = `PRJ-${generateId()}`;
  const renewsOn = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  try {
    await env.DB.prepare(
      `INSERT INTO projects (id, customer_id, order_id, name, category, tier_id, status, dev_fee_cents, cadence)
       VALUES (?, ?, ?, ?, ?, ?, 'Queued', ?, ?)`
    )
      .bind(
        projectId,
        params.customerId,
        params.orderId,
        title,
        params.category,
        params.tierId,
        params.devFeeCents,
        params.cadence === "monthly" ? "monthly" : "annual"
      )
      .run();

    // The tier's own monthly fee is the base service — hosting, backend and monitoring.
    if (tier?.monthlyCents) {
      await env.DB.prepare(
        `INSERT INTO project_services (id, project_id, name, kind, monthly_cents, status, renews_on)
         VALUES (?, ?, ?, 'base', ?, 'Active', ?)`
      )
        .bind(`PS-${generateId()}`, projectId, "Hosting, backend & monitoring", tier.monthlyCents, renewsOn)
        .run();
    }

    for (const addonId of params.addonIds) {
      const addon = ADDON_CATALOG.find((a) => a.id === addonId);
      const cents = addonMonthlyCents(params.tierId as any, addonId);
      if (!addon || cents === null) continue;
      await env.DB.prepare(
        `INSERT INTO project_services (id, project_id, name, service_key, kind, monthly_cents, status, renews_on)
         VALUES (?, ?, ?, ?, 'addon', ?, 'Active', ?)`
      )
        .bind(`PS-${generateId()}`, projectId, addon.label, addon.id, cents, renewsOn)
        .run();
    }

    await env.DB.prepare(
      "INSERT OR IGNORE INTO revisions (project_id, included, used, purchased) VALUES (?, ?, 0, 0)"
    )
      .bind(projectId, tier?.revisions ?? 0)
      .run();

    return projectId;
  } catch (err) {
    console.error("Creating the project failed:", err);
    return null;
  }
}

async function installmentSummary(env: Env, orderId: string | null, email: string) {
  const plan = await env.DB.prepare(
    "SELECT * FROM installment_plans WHERE order_id = ? OR email = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(orderId ?? "", email)
    .first<any>();
  if (!plan) return null;

  const paid = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(due_at) AS next_due FROM installments WHERE plan_id = ? AND status = 'Paid'"
  )
    .bind(plan.id)
    .first<{ n: number; next_due: string | null }>();

  const upcoming = await env.DB.prepare(
    "SELECT seq, due_at, amount_minor, status FROM installments WHERE plan_id = ? AND status <> 'Paid' ORDER BY seq ASC LIMIT 1"
  )
    .bind(plan.id)
    .first<any>();

  return {
    planId: plan.id,
    paid: paid?.n ?? 0,
    count: plan.count,
    currency: plan.currency,
    nextDueAt: upcoming?.due_at ?? null,
    nextAmountMinor: upcoming?.amount_minor ?? null,
    nextSeq: upcoming?.seq ?? null,
    status: plan.status,
  };
}

export const projects = {
  list: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to view your projects");

    const rows = await env.DB.prepare(
      "SELECT * FROM projects WHERE customer_id = ? ORDER BY created_at DESC"
    )
      .bind(customerId)
      .all<any>();

    const customer = await env.DB.prepare("SELECT email FROM customers WHERE id = ?")
      .bind(customerId)
      .first<{ email: string }>();

    const withServices = await Promise.all(
      (rows.results ?? []).map(async (project) => ({
        ...project,
        services: (
          await env.DB.prepare(
            "SELECT id, name, service_key, kind, monthly_cents, status, renews_on, grace_until FROM project_services WHERE project_id = ? ORDER BY kind DESC, name"
          )
            .bind(project.id)
            .all<any>()
        ).results,
        // The Subscriptions page needs the fee schedule next to the service renewals.
        installments: await installmentSummary(env, project.order_id, customer?.email ?? ""),
      }))
    );

    // Decision 15: any project that has spent three days against its tier's ceiling gets
    // a banner in the list. Suggestion only — the response carries the numbers, never a
    // restriction.
    const nudges = await nudgesFor(
      env,
      withServices.map((project) => project.id)
    );

    return json({
      projects: withServices,
      nudges: withServices
        .filter((project) => nudges[project.id])
        .map((project) => ({ projectId: project.id, name: project.name, ...nudges[project.id] })),
    });
  },

  get: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to view this project");

    const id = new URL(request.url).pathname.split("/").pop() ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const services = await env.DB.prepare(
      "SELECT * FROM project_services WHERE project_id = ? ORDER BY kind DESC, name"
    )
      .bind(project.id)
      .all<any>();

    const revisions = await env.DB.prepare("SELECT * FROM revisions WHERE project_id = ?")
      .bind(project.id)
      .first<any>();

    const customer = await env.DB.prepare("SELECT email FROM customers WHERE id = ?")
      .bind(customerId)
      .first<{ email: string }>();

    return json({
      project,
      services: services.results ?? [],
      revisions: revisions ?? { included: 0, used: 0, purchased: 0 },
      installments: await installmentSummary(env, project.order_id, customer?.email ?? ""),
    });
  },

  /**
   * Cancel a service. Nothing stops today — cancellation takes effect at the next
   * renewal, and the grace badge is what tells the customer when.
   */
  cancelService: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to manage your services");

    const parts = new URL(request.url).pathname.split("/");
    const projectId = parts[3] ?? "";
    const project = await ownedProject(env, customerId, projectId);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const serviceId = String(body?.serviceId ?? "");
    if (!serviceId) return error(400, "Missing serviceId");

    const service = await env.DB.prepare(
      "SELECT * FROM project_services WHERE id = ? AND project_id = ? AND kind = 'addon'"
    )
      .bind(serviceId, project.id)
      .first<any>();
    if (!service) return error(404, "Add-on not found on this project");

    await env.DB.prepare("UPDATE project_services SET status = 'Cancel at renewal' WHERE id = ?")
      .bind(serviceId)
      .run();

    return json({ service: { ...service, status: "Cancel at renewal" } });
  },

  restoreService: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to manage your services");

    const parts = new URL(request.url).pathname.split("/");
    const projectId = parts[3] ?? "";
    const project = await ownedProject(env, customerId, projectId);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const serviceId = String(body?.serviceId ?? "");
    if (!serviceId) return error(400, "Missing serviceId");

    await env.DB.prepare(
      "UPDATE project_services SET status = 'Active' WHERE id = ? AND project_id = ?"
    )
      .bind(serviceId, project.id)
      .run();

    return json({ ok: true });
  },

  /** Go live. A project has to have been in preview first — there's no blind launch. */
  launch: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to launch a project");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    if (project.status === "Live") return json({ project });

    if (project.status === "Queued") {
      await env.DB.prepare(
        "UPDATE projects SET status = 'In preview', updated_at = datetime('now') WHERE id = ?"
      )
        .bind(project.id)
        .run();
      return json({ project: { ...project, status: "In preview" } });
    }

    // Attach the project's zone if we can, so the Analytics tab has something to read
    // (§12.3). Deliberately after the status change and deliberately non-fatal: going
    // live is the moment the customer paid for, and it must not depend on Cloudflare.
    const zoneId = await attachZone(env, project);

    const launchAt = new Date().toISOString();
    await env.DB.prepare(
      "UPDATE projects SET status = 'Live', launch_at = ?, zone_id = COALESCE(?, zone_id), updated_at = datetime('now') WHERE id = ?"
    )
      .bind(launchAt, zoneId, project.id)
      .run();

    return json({ project: { ...project, status: "Live", launch_at: launchAt, zone_id: zoneId ?? project.zone_id } });
  },

  /**
   * What's in the project's database, or an explicit "not applicable" — §7 says never
   * invent an answer here.
   */
  database: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to view your data");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const hasDatabase = project.category !== "web-ui-design" && project.status !== "Queued";
    if (!hasDatabase) {
      return json({
        applicable: false,
        message: "This project doesn't have a database yet. It appears here as soon as the build starts.",
      });
    }

    const tables = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM email_messages WHERE project_id = ?"
    )
      .bind(project.id)
      .first<{ n: number }>();

    return json({
      applicable: true,
      project: project.id,
      records: { emailMessages: tables?.n ?? 0 },
      note: "Managed by us. Ask in Service Center if you need an export.",
    });
  },

  /** OTP-gated (§6): the owner asks for a code, we email it, then verify it. */
  requestMigration: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to request a migration");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const customer = await env.DB.prepare("SELECT email FROM customers WHERE id = ?")
      .bind(customerId)
      .first<{ email: string }>();
    if (!customer?.email) return error(400, "No email on this account");

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();

    await env.DB.prepare(
      `INSERT INTO otp_codes (id, customer_id, project_id, purpose, code_hash, expires_at)
       VALUES (?, ?, ?, 'migration', ?, ?)`
    )
      .bind(`OTP-${generateId()}`, customerId, project.id, codeHash, expiresAt)
      .run();

    env.ctx.waitUntil(sendOtpEmail(env, customer.email, code, project.name));

    return json({ sent: true, expiresAt });
  },

  confirmMigration: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to confirm a migration");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const code = String(body?.code ?? "").trim();
    if (!code) return error(400, "Enter the code we emailed you");

    const record = await env.DB.prepare(
      `SELECT * FROM otp_codes
        WHERE customer_id = ? AND project_id = ? AND purpose = 'migration'
          AND consumed_at IS NULL AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1`
    )
      .bind(customerId, project.id)
      .first<any>();
    if (!record) return error(400, "That code has expired — request a new one");

    const candidate = await hashOtp(code);
    if (candidate !== record.code_hash) return error(400, "That code isn't right");

    await env.DB.prepare("UPDATE otp_codes SET consumed_at = datetime('now') WHERE id = ?")
      .bind(record.id)
      .run();

    // §6: front-end only, no GitHub handover, no server-side runtime.
    return json({
      ok: true,
      bundle: {
        note: "Front-end bundle only — static assets and configuration. Backend and database stay with us.",
      },
    });
  },

  /** What we handle so the customer never has to — §7: no third-party logins. */
  serviceCenter: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to reach the service center");

    return json({
      handled: [
        "Hosting, uptime and scaling",
        "Backend, database and backups",
        "Domains, DNS and SSL certificates",
        "Monitoring, error alerts and log retention",
        "Every vendor account and licence we use to run your project",
      ],
      note: "We hold the vendor accounts. You never get a third-party login to chase, and we never name the vendors.",
      contact: env.ADMIN_EMAIL || "admin@techrepubliq.com",
    });
  },
};

export async function hashOtp(code: string): Promise<string> {
  const data = new TextEncoder().encode(`trq-otp:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
