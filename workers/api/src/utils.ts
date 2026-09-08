import type { Env } from "./index";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function error(status: number, message: string): Response {
  return json({ error: message }, status);
}

export function getAuthToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function verifyToken(
  token: string,
  env: Env
): Promise<{ customer_id: string } | null> {
  const result = await env.DB.prepare(
    "SELECT customer_id FROM sessions WHERE token = ? AND expires_at > datetime('now')"
  )
    .bind(token)
    .first<{ customer_id: string }>();
  return result ?? null;
}

export function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}