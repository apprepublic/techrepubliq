import { Router } from "itty-router";
import { error, json } from "./utils";
import { auth } from "./routes/auth";
import { quotes } from "./routes/quotes";
import { orders } from "./routes/orders";
import { payments } from "./routes/payments";
import { migrations } from "./routes/migrations";
import { customers } from "./routes/customers";

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
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

// Quotes
router.post("/api/quotes/generate", quotes.generate);
router.get("/api/quotes/:ref", quotes.get);

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

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    env.ctx = ctx;
    return router.handle(request, env).then(json).catch((err) => {
      console.error(err);
      return error(500, "Internal server error");
    });
  },
};