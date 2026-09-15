import { Router } from "itty-router";
import { error, json } from "./utils";
import { auth } from "./routes/auth";
import { quotes } from "./routes/quotes";
import { orders } from "./routes/orders";
import { payments } from "./routes/payments";
import { migrations } from "./routes/migrations";
import { customers } from "./routes/customers";
import { uploads } from "./routes/uploads";
import { contactSales } from "./routes/contactSales";

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  /** Where Enterprise/Contact Sales leads are delivered. Defaults to admin@techrepubliq.com. */
  ADMIN_EMAIL?: string;
  PAYSTACK_SECRET_KEY: string;
  STRIPE_SECRET_KEY: string;
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

// Orders
router.get("/api/orders", orders.list);
router.get("/api/orders/:id", orders.get);

// Payments
router.post("/api/payments/create-intent", payments.createIntent);
router.post("/api/webhooks/paystack", payments.paystackWebhook);
router.post("/api/webhooks/stripe", payments.stripeWebhook);

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
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") return handleOptions(request);

    env.ctx = ctx;
    return router.fetch(request, env).catch((err) => {
      console.error(err);
      return error(500, "Internal server error");
    });
  },
};