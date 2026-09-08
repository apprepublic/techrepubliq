import { error, json, getAuthToken, verifyToken, generateToken, generateId } from "../utils";
import { sendVerificationEmail, sendWelcomeEmail } from "../email";
import type { Env } from "../index";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return saltHex + ":" + hashHex;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const derived = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return derived === hashHex;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const auth = {
  register: async (request: Request, env: Env) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return error(400, "Invalid request body");
    }

    const { email, name, password, phone, phone_country_code, country } = body;
    if (!email || !name || !password) return error(400, "All fields are required");
    if (!isValidEmail(email)) return error(400, "Invalid email format");
    if (password.length < 6) return error(400, "Password must be at least 6 characters");
    if (name.length < 1) return error(400, "Name is required");

    const existing = await env.DB.prepare("SELECT id, email_verified FROM customers WHERE email = ?").bind(email).first();
    if (existing) return error(409, "An account with this email already exists.");

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const verificationToken = generateId() + generateId();

    await env.DB.prepare(
      "INSERT INTO customers (id, email, name, password_hash, email_verified, verification_token, phone, phone_country_code, country) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)"
    ).bind(id, email, name, passwordHash, verificationToken, phone || null, phone_country_code || null, country || null).run();

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare("INSERT INTO sessions (token, customer_id, expires_at) VALUES (?, ?, ?)")
      .bind(token, id, expires).run();

    const origin = request.headers.get("Origin") || "https://techrepubliq.pages.dev";
    env.ctx.waitUntil(sendVerificationEmail(env, email, name, verificationToken, origin));

    return json({ token, customer: { id, email, name, phone, phone_country_code, country, emailVerified: false } }, 201);
  },

  login: async (request: Request, env: Env) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return error(400, "Invalid request body");
    }

    const { email, password } = body;
    if (!email || !password) return error(400, "Email and password are required");

    const customer = await env.DB.prepare(
      "SELECT id, email, name, password_hash, email_verified FROM customers WHERE email = ?"
    ).bind(email).first<{ id: string; email: string; name: string; password_hash: string; email_verified: number }>();

    if (!customer) return error(401, "That email and password don't match");

    const valid = await verifyPassword(password, customer.password_hash);
    if (!valid) return error(401, "That email and password don't match");

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare("INSERT INTO sessions (token, customer_id, expires_at) VALUES (?, ?, ?)")
      .bind(token, customer.id, expires).run();

    // Fetch full customer with phone/country
    const full = await env.DB.prepare(
      "SELECT id, email, name, phone, phone_country_code, country, email_verified FROM customers WHERE id = ?"
    ).bind(customer.id).first<any>();

    return json({
      token,
      customer: { id: full.id, email: full.email, name: full.name, phone: full.phone, phone_country_code: full.phone_country_code, country: full.country, emailVerified: !!full.email_verified },
    });
  },

  me: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const customer = await env.DB.prepare(
      "SELECT id, email, name, phone, phone_country_code, country, created_at, email_verified FROM customers WHERE id = ?"
    ).bind(session.customer_id).first<any>();

    if (!customer) return error(404, "Customer not found");

    return json({ customer: { ...customer, emailVerified: !!customer.email_verified } });
  },

  verify: async (request: Request, env: Env) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) return error(400, "Missing verification token");

    const customer = await env.DB.prepare(
      "SELECT id, email, name FROM customers WHERE verification_token = ? AND email_verified = 0"
    ).bind(token).first<{ id: string; email: string; name: string }>();

    if (!customer) return error(400, "Invalid or expired verification token");

    await env.DB.prepare(
      "UPDATE customers SET email_verified = 1, verification_token = NULL, updated_at = datetime('now') WHERE id = ?"
    ).bind(customer.id).run();

    env.ctx.waitUntil(sendWelcomeEmail(env, customer.email, customer.name));

    return json({ verified: true, email: customer.email });
  },

  resendVerification: async (request: Request, env: Env) => {
    const token = getAuthToken(request);
    if (!token) return error(401, "Unauthorized");
    const session = await verifyToken(token, env);
    if (!session) return error(401, "Unauthorized");

    const customer = await env.DB.prepare(
      "SELECT id, email, name, email_verified FROM customers WHERE id = ?"
    ).bind(session.customer_id).first<{ id: string; email: string; name: string; email_verified: number }>();

    if (!customer) return error(404, "Customer not found");
    if (customer.email_verified) return error(400, "Email already verified");

    const verificationToken = generateId() + generateId();
    await env.DB.prepare(
      "UPDATE customers SET verification_token = ? WHERE id = ?"
    ).bind(verificationToken, customer.id).run();

    const origin = request.headers.get("Origin") || "https://techrepubliq.pages.dev";
    env.ctx.waitUntil(sendVerificationEmail(env, customer.email, customer.name, verificationToken, origin));

    return json({ sent: true });
  },
};