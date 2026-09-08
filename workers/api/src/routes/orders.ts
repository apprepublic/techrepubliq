import { error, json, getAuthToken, verifyToken } from "../utils";
import type { Env } from "../index";

export const orders = {
  list: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const results = await env.DB.prepare(
      `SELECT id, service_title, quote_reference, status, created_at as date
       FROM orders WHERE customer_id = ? ORDER BY created_at DESC`
    ).bind(session.customer_id).all();

    return json({ orders: results.results });
  },

  get: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const order = await env.DB.prepare(
      `SELECT * FROM orders WHERE id = ? AND customer_id = ?`
    ).bind(id, session.customer_id).first();

    if (!order) return error(404, "Order not found");

    const migration = await env.DB.prepare(
      "SELECT * FROM migration_requests WHERE order_id = ? ORDER BY requested_at DESC LIMIT 1"
    ).bind(id).first();

    return json({ order, migration: migration ?? null });
  },
};