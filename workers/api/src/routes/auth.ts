import { error, json, getAuthToken, verifyToken, generateToken } from "../utils";
import { sendConfirmationEmail } from "../email";
import type { Env } from "../index";

export const auth = {
  register: async (request: Request, env: Env) => {
    const { email, name, password } = await request.json() as any;
    if (!email || !name || !password) return error(400, "Missing fields");

    const existing = await env.DB.prepare("SELECT id FROM customers WHERE email = ?").bind(email).first();
    if (existing) return error(409, "Email already registered");

    const id = crypto.randomUUID();
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");

    await env.DB.prepare(
      "INSERT INTO customers (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
    ).bind(id, email, name, hashHex).run();

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare(
      "INSERT INTO sessions (token, customer_id, expires_at) VALUES (?, ?, ?)"
    ).bind(token, id, expires).run();

    // Send confirmation email (non-blocking)
    env.ctx.waitUntil(sendConfirmationEmail(env, email, name));

    return json({ token, customer: { id, email, name } }, 201);
  },

  login: async (request: Request, env: Env) => {
    const { email, password } = await request.json() as any;
    if (!email || !password) return error(400, "Missing fields");

    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");

    const customer = await env.DB.prepare(
      "SELECT id, email, name FROM customers WHERE email = ? AND password_hash = ?"
    ).bind(email, hashHex).first<{ id: string; email: string; name: string }>();

    if (!customer) return error(401, "That email and password don't match");

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare(
      "INSERT INTO sessions (token, customer_id, expires_at) VALUES (?, ?, ?)"
    ).bind(token, customer.id, expires).run();

    return json({ token, customer });
  },

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
};