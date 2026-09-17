import { error, json, generateId, getAuthToken, verifyToken } from "../utils";
import type { Env } from "../index";
import { mailboxFor } from "../lib/emailInbound";

/**
 * §13 — the per-project Email Center.
 *
 * Only projects with an active Email add-on get this. That check gates every route
 * here: the tab itself is hidden without the add-on, but hiding a tab is not a control,
 * so the server enforces it too.
 *
 * Outbound mail is sent as the project's own domain address so replies come back to the
 * same inbox. That only works once the domain is set up to send; if the provider refuses,
 * the customer is told that rather than having the message silently sent from a different
 * address than the one they're looking at.
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

/** The add-on is the entitlement, not the tab's visibility. */
async function entitled(env: Env, projectId: string): Promise<boolean> {
  const row = await env.DB.prepare(
    "SELECT 1 FROM project_services WHERE project_id = ? AND service_key = 'email' AND status = 'Active'"
  )
    .bind(projectId)
    .first();
  return Boolean(row);
}

async function unreadCount(env: Env, projectId: string): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM email_messages WHERE project_id = ? AND direction = 'inbound' AND read_at IS NULL"
  )
    .bind(projectId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export const email = {
  list: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to open your inbox");

    const url = new URL(request.url);
    const id = url.pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const hasAddon = await entitled(env, project.id);
    if (!hasAddon) return error(403, "The Email Center add-on isn't active on this project");

    const folder = url.searchParams.get("folder") === "sent" ? "sent" : "inbound";
    const rows = await env.DB.prepare(
      `SELECT id, direction, from_addr, to_addr, subject, body, sent_at, read_at
       FROM email_messages
       WHERE project_id = ? AND direction = ?
       ORDER BY sent_at DESC
       LIMIT 100`
    )
      .bind(project.id, folder === "sent" ? "outbound" : "inbound")
      .all<any>();

    return json({
      mailbox: mailboxFor(project.custom_domain),
      // Null until the project has a domain. Everything else still works — you just
      // can't be emailed at an address that doesn't exist yet.
      domain: project.custom_domain,
      folder,
      messages: rows.results ?? [],
      unread: await unreadCount(env, project.id),
    });
  },

  send: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to send mail");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const hasAddon = await entitled(env, project.id);
    if (!hasAddon) return error(403, "The Email Center add-on isn't active on this project");

    const mailbox = mailboxFor(project.custom_domain);
    if (!mailbox) {
      return error(400, "This project doesn't have a domain yet, so it has no address to send from.");
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const to = String(body?.to ?? "").trim();
    const subject = String(body?.subject ?? "").trim();
    const text = String(body?.body ?? "").trim();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return error(400, "That doesn't look like an email address.");
    if (!subject) return error(400, "Add a subject.");
    if (!text) return error(400, "Write something first.");

    // No colour is set: mail clients render their own default text colour, and picking
    // one is how a message ends up near-invisible in someone's dark-mode client.
    const html = `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6">${text
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
      .join("")}</div>`;

    try {
      await env.SEND_EMAIL.send({
        from: { name: project.name, email: mailbox },
        // A name is required in practice — omitting it produces a header reading
        // `undefined <address>`, which some receivers reject outright.
        to: [{ name: to.split("@")[0], email: to }],
        subject,
        text,
        html,
      } as any);
    } catch (err) {
      console.error(`Sending from ${mailbox} failed:`, err);
      // Don't quietly reroute through our own address — the recipient would see a
      // different sender than the one in the customer's Sent folder.
      return error(
        502,
        "This project's domain isn't set up to send yet. We're on it — try again shortly."
      );
    }

    const messageId = `EM-${generateId()}`;
    await env.DB.prepare(
      `INSERT INTO email_messages (id, project_id, direction, from_addr, to_addr, subject, body, sent_at)
       VALUES (?, ?, 'outbound', ?, ?, ?, ?, datetime('now'))`
    )
      .bind(messageId, project.id, mailbox, to, subject.slice(0, 300), text.slice(0, 20_000))
      .run();

    // Outbound mail is read by definition — it's in Sent, not the inbox.
    return json({ ok: true, id: messageId, unread: await unreadCount(env, project.id) });
  },

  markRead: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in");

    const id = new URL(request.url).pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const body = (await request.json().catch(() => ({}))) as any;
    const messageId = String(body?.id ?? "");
    if (!messageId) {
      // No id means "everything" — the tab offers "mark all read".
      await env.DB.prepare(
        "UPDATE email_messages SET read_at = datetime('now') WHERE project_id = ? AND direction = 'inbound' AND read_at IS NULL"
      )
        .bind(project.id)
        .run();
      return json({ ok: true, unread: 0 });
    }

    await env.DB.prepare(
      "UPDATE email_messages SET read_at = datetime('now') WHERE id = ? AND project_id = ?"
    )
      .bind(messageId, project.id)
      .run();

    return json({ ok: true, unread: await unreadCount(env, project.id) });
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
