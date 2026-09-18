import { error, json, getAuthToken, verifyToken } from "../utils";
import type { Env } from "../index";
import { analyticsFor, parseRange } from "../lib/analytics";

/**
 * §12 — the project's traffic, read by the dashboard.
 *
 * Cloudflare is queried from here and nowhere else: the token is a Worker secret and the
 * GraphQL API meters the whole account, so it can't be left to a browser to call.
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

export const analytics = {
  get: async (request: Request, env: Env) => {
    const customerId = await requireCustomer(request, env);
    if (!customerId) return error(401, "Sign in to see your traffic");

    const url = new URL(request.url);
    const id = url.pathname.split("/")[3] ?? "";
    const project = await ownedProject(env, customerId, id);
    if (!project) return error(404, "Project not found");

    const range = parseRange(url.searchParams.get("range"));
    const payload = await analyticsFor(env, project, range);

    return json(payload);
  },
};
