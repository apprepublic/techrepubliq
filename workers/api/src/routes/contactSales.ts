import { error, json, generateId } from "../utils";
import type { Env } from "../index";
import { sendContactSalesEmail, sendContactSalesAck } from "../email";

/** Decision 14 — every Enterprise lead lands in this inbox. */
const ADMIN_EMAIL = "admin@techrepubliq.com";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface ContactSalesLead {
  name: string;
  email: string;
  company?: string;
  businessStage?: string;
  expectedScale?: string;
  category?: string;
  tierId?: string;
  notes?: string;
  source?: string;
}

export const contactSales = {
  submit: async (request: Request, env: Env) => {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return error(400, "Invalid JSON body");
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    if (!name) return error(400, "Please tell us your name");
    if (!EMAIL_RE.test(email)) return error(400, "Please provide a valid email address");

    const lead: ContactSalesLead = {
      name,
      email,
      company: String(body.company ?? "").trim() || undefined,
      businessStage: String(body.businessStage ?? "").trim() || undefined,
      expectedScale: String(body.expectedScale ?? "").trim() || undefined,
      category: String(body.category ?? "").trim() || undefined,
      tierId: String(body.tierId ?? "").trim() || undefined,
      notes: String(body.notes ?? "").trim() || undefined,
      source: String(body.source ?? "contact-sales").trim() || "contact-sales",
    };

    const id = generateId();
    await env.DB.prepare(
      `INSERT INTO contact_sales_leads
         (id, name, email, company, business_stage, expected_scale, category, tier_id, notes, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        lead.name,
        lead.email,
        lead.company ?? null,
        lead.businessStage ?? null,
        lead.expectedScale ?? null,
        lead.category ?? null,
        lead.tierId ?? null,
        lead.notes ?? null,
        lead.source ?? "contact-sales"
      )
      .run();

    const adminEmail = env.ADMIN_EMAIL || ADMIN_EMAIL;
    await sendContactSalesEmail(env, adminEmail, lead);
    await sendContactSalesAck(env, lead.email, lead.name);

    return json({ id, received: true }, 201);
  },
};
