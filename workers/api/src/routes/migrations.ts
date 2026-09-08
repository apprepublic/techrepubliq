import { error, json, getAuthToken, verifyToken, generateId } from "../utils";
import type { Env } from "../index";

export const migrations = {
  request: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const { orderId, scope } = await request.json() as any;
    if (!orderId || !scope) return error(400, "Missing fields");
    if (!["frontend", "full"].includes(scope)) return error(400, "Invalid scope");

    // Verify order belongs to customer
    const order = await env.DB.prepare(
      "SELECT id, status FROM orders WHERE id = ? AND customer_id = ?"
    ).bind(orderId, session.customer_id).first<{ id: string; status: string }>();

    if (!order) return error(404, "Order not found");
    if (order.status !== "Delivered") return error(400, "Order must be delivered before migration");

    // Check for existing pending request
    const existing = await env.DB.prepare(
      "SELECT id, status FROM migration_requests WHERE order_id = ? AND status = 'Pending'"
    ).bind(orderId).first();

    if (existing) return error(409, "Migration already requested");

    const id = `MIG-${generateId()}`;
    await env.DB.prepare(
      "INSERT INTO migration_requests (id, order_id, customer_id, scope) VALUES (?, ?, ?, ?)"
    ).bind(id, orderId, session.customer_id, scope).run();

    return json({ request: { id, status: "Pending" } }, 201);
  },
};