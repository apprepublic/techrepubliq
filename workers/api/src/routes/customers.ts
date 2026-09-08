import { error, json, getAuthToken, verifyToken } from "../utils";
import type { Env } from "../index";

export const customers = {
  me: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const customer = await env.DB.prepare(
      "SELECT id, email, name, created_at FROM customers WHERE id = ?"
    ).bind(session.customer_id).first();

    return json({ customer });
  },

  update: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const { name, email } = await request.json() as any;

    if (name) {
      await env.DB.prepare("UPDATE customers SET name = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(name, session.customer_id).run();
    }
    if (email) {
      // Check uniqueness
      const existing = await env.DB.prepare("SELECT id FROM customers WHERE email = ? AND id != ?")
        .bind(email, session.customer_id).first();
      if (existing) return error(409, "Email already in use");
      await env.DB.prepare("UPDATE customers SET email = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(email, session.customer_id).run();
    }

    const customer = await env.DB.prepare(
      "SELECT id, email, name FROM customers WHERE id = ?"
    ).bind(session.customer_id).first();

    return json({ customer });
  },

  remove: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    // Check for in-progress orders
    const active = await env.DB.prepare(
      "SELECT id FROM orders WHERE customer_id = ? AND status = 'In Progress' LIMIT 1"
    ).bind(session.customer_id).first();

    // Clear sessions and delete customer
    await env.DB.prepare("DELETE FROM sessions WHERE customer_id = ?")
      .bind(session.customer_id).run();
    await env.DB.prepare("DELETE FROM customers WHERE id = ?")
      .bind(session.customer_id).run();

    return json({ deleted: true, hadActiveOrder: !!active });
  },
};