import { Router } from "itty-router";
import { error, json } from "./utils";
import { refreshFx, isStale } from "./lib/fx";
import { runDunning } from "./lib/installments";
import { sendAlertEmail } from "./email";
import { auth } from "./routes/auth";
import { quotes } from "./routes/quotes";
import { orders } from "./routes/orders";
import { payments } from "./routes/payments";
import { migrations } from "./routes/migrations";
import { customers } from "./routes/customers";
import { uploads } from "./routes/uploads";
import { contactSales } from "./routes/contactSales";
import { projects } from "./routes/projects";
import { edits } from "./routes/edits";
import { analytics } from "./routes/analytics";
import { rollupAnalytics, checkTierNudges } from "./lib/analytics";
import { email } from "./routes/email";
import { storeInboundEmail } from "./lib/emailInbound";

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  /** Where Enterprise/Contact Sales leads are delivered. Defaults to admin@techrepubliq.com. */
  ADMIN_EMAIL?: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  /** Endpoint secret from the Stripe webhook — without it the signature check cannot run. */
  STRIPE_WEBHOOK_SECRET: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  /** The PayPal webhook ID, required to verify inbound notifications. */
  PAYPAL_WEBHOOK_ID: string;
  /** Defaults to the live PayPal API; point it at api-m.sandbox.paypal.com for testing. */
  PAYPAL_API_BASE?: string;
  /** USD→NGN source for the FX cron. Defaults to open.er-api.com (no key needed). */
  FX_API_URL?: string;
  /**
   * Cloudflare GraphQL Analytics (§12). Zone-scoped reads only — the zones are ours
   * (decision 17). Without a token the Analytics tab says hosting isn't connected yet.
   */
  CF_API_TOKEN?: string;
  /** Where project zones are created. Required only to provision a new zone. */
  CF_ACCOUNT_ID?: string;
  /** Defaults to the live Cloudflare API; point it elsewhere to test the whole path. */
  CF_API_BASE?: string;
  JWT_SECRET: string;
  SEND_EMAIL: SendEmail;
  FROM_EMAIL: string;
  ctx: ExecutionContext;
}

const router = Router();

// Auth
router.post("/api/auth/register", auth.register);
router.post("/api/auth/login", auth.login);
router.get("/api/auth/me", auth.me);
router.get("/api/auth/verify", auth.verify);
router.post("/api/auth/resend-verification", auth.resendVerification);

// Quotes
router.post("/api/quotes/generate", quotes.generate);
router.get("/api/quotes/:ref", quotes.get);

// Intake assets (R2) + Enterprise leads
router.post("/api/uploads", uploads.create);
router.post("/api/contact-sales", contactSales.submit);

// Projects (WP5)
router.get("/api/projects", projects.list);
router.get("/api/projects/:id", projects.get);
router.get("/api/projects/:id/database", projects.database);
router.post("/api/projects/:id/launch", projects.launch);
router.post("/api/projects/:id/services/cancel", projects.cancelService);
router.post("/api/projects/:id/services/restore", projects.restoreService);
router.post("/api/projects/:id/migration", projects.requestMigration);
router.post("/api/projects/:id/migration/confirm", projects.confirmMigration);
router.get("/api/service-center", projects.serviceCenter);

// Traffic analytics (§12) — Cloudflare is called from the Worker only.
router.get("/api/projects/:id/analytics", analytics.get);

// Per-project Email Center (§13) — only for projects with the Email add-on.
router.get("/api/projects/:id/email", email.list);
router.post("/api/projects/:id/email", email.send);
router.post("/api/projects/:id/email/read", email.markRead);

// Revisions and post-launch edits (PRD §5, §5A)
router.get("/api/projects/:id/edits", edits.overview);
router.post("/api/projects/:id/edits/quote", edits.quote);
router.post("/api/projects/:id/edits/request", edits.request);
router.post("/api/projects/:id/edits/subscribe", edits.subscribe);
router.post("/api/projects/:id/edits/subscribe/cancel", edits.cancelSubscription);
router.post("/api/projects/:id/reviews/purchase", edits.buyReviews);

// Orders
router.get("/api/orders", orders.list);
router.get("/api/orders/:id", orders.get);

// Payments
router.post("/api/payments/create-intent", payments.createIntent);
router.get("/api/payments/verify", payments.verify);
router.post("/api/webhooks/paystack", payments.paystackWebhook);
router.post("/api/webhooks/stripe", payments.stripeWebhook);
router.post("/api/webhooks/paypal", payments.paypalWebhook);

// Migrations
router.post("/api/migrations/request", migrations.request);

// Customers
router.get("/api/customers/me", customers.me);
router.put("/api/customers/me", customers.update);
router.delete("/api/customers/me", customers.remove);

// 404
router.all("*", () => error(404, "Not found"));

function handleOptions(request: Request): Response {
  const origin = request.headers.get("Origin") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export default {
  /**
   * Inbound mail to a project's own domain address (§13).
   *
   * This only fires once a Cloudflare Email Routing rule points the domain at this
   * Worker — that's an operator step in the dashboard, not something the Worker can do
   * for itself. Until it's configured, no project inbox receives anything.
   */
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    const result = await storeInboundEmail(env, message);
    if (!result.stored) {
      console.error(`Inbound mail for ${message.to} wasn't stored — ${result.reason}`);
      // Reject rather than accept-and-drop, so the sender gets a bounce instead of
      // silence. A bounce is at least an answer.
      message.setReject(`${message.to} isn't accepting mail right now`);
    }
  },

  /**
   * Cron Worker (decision 10): refresh USD→NGN once a day and shout if the rate we are
   * serving goes stale. Installment dunning (§11) will run here too.
   */
  scheduled: async (_event: ScheduledController, env: Env, ctx: ExecutionContext) => {
    env.ctx = ctx;
    const { rate, refreshed, error } = await refreshFx(env);

    // §12: write yesterday into analytics_daily, then see whether any project has spent
    // three days against its tier's ceiling. Both are best-effort — a Cloudflare blip
    // must not stop the FX refresh below from reporting.
    try {
      const rollup = await rollupAnalytics(env);
      if (rollup.rolled) {
        console.log(`Analytics roll-up: ${rollup.rolled} project(s) written, ${rollup.skipped} skipped`);
      }
      const nudges = await checkTierNudges(env);
      if (nudges.nudged || nudges.cleared) {
        console.log(
          `Tier nudges: ${nudges.nudged} active, ${nudges.cleared} clear, ${nudges.emailed} emailed`
        );
      }
    } catch (err) {
      console.error("Nightly analytics run failed:", err);
    }

    // Dunning: charge whatever fell due, open grace windows, and hand defaults to a human.
    const dunning = await runDunning(env);
    if (dunning.charged || dunning.failed || dunning.ended) {
      console.log(
        `Installments: ${dunning.charged} charged, ${dunning.failed} failed, ${dunning.ended} ended, ${dunning.skipped} awaiting a saved method`
      );
    }

    if (!refreshed || isStale(rate)) {
      const reason = error ? `the fetch failed: ${error}` : "no rate has been stored yet";
      console.error(`FX rate is stale — ${reason}`);
      await sendAlertEmail(
        env,
        "FX rate is stale",
        `<p>The USD→NGN rate used at checkout is stale or missing.</p>
         <p>${reason}${rate ? ` — last good rate ${rate.rate} fetched ${rate.fetchedAt}` : ""}.</p>
         <p>Naira checkouts will be refused until this is resolved.</p>`
      );
    }
  },

  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") return handleOptions(request);

    env.ctx = ctx;
    return router.fetch(request, env).catch((err) => {
      console.error(err);
      return error(500, "Internal server error");
    });
  },
};