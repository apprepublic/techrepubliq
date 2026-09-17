import type { Env } from "./index";

const BASE_URL = "https://techrepubliq.com";
const LOGO_URL = `${BASE_URL}/assets/logo-dark.png`;

function baseHtml(logo: string, body: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body{margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#F5F3EE}
      .wrap{max-width:560px;margin:0 auto;padding:32px 24px;background:#FFFFFF;border:1px solid #E8E6F0;border-radius:16px}
      .header{padding:8px 0 24px;border-bottom:1px solid #E8E6F0;margin-bottom:24px}
      .header img{height:32px;width:auto}
      h1{font-size:22px;font-weight:600;color:#12151C;margin:0 0 12px;font-family:'Inter Tight',Arial,sans-serif}
      p{font-size:15px;line-height:1.6;color:#5B6472;margin:0 0 16px}
      .btn{display:inline-block;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;background:linear-gradient(135deg,#FF5C4D,#C8102E);margin:8px 0}
      .footer{font-size:12px;color:#9C99AC;margin-top:32px;border-top:1px solid #E8E6F0;padding-top:16px}
      a{color:#C8102E}
    </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <img src="${logo}" alt="TechRepubliQ" />
        </div>
        <h1>${title}</h1>
        ${body}
        <div class="footer">
          TechRepubliQ — Web, app, and AI automation work, scoped and priced before anything is built.<br/>
          <a href="${BASE_URL}">${BASE_URL.replace("https://", "")}</a>
        </div>
      </div>
    </body>
    </html>`;
}

export async function sendInvoiceEmail(
  env: Env,
  to: string,
  order: { referenceId: string; serviceTitle: string; amount: number; currency: string }
) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name: "Customer", email: to }],
      subject: `Invoice — ${order.referenceId}`,
      html: baseHtml(LOGO_URL, `
        <p>Thank you for your order. Here's your invoice.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="color:#5B6472;font-size:14px;padding:8px 0">Reference</td><td style="font-family:'JetBrains Mono',monospace;color:#12151C;font-size:14px;text-align:right;padding:8px 0">${order.referenceId}</td></tr>
          <tr><td style="color:#5B6472;font-size:14px;padding:8px 0">Service</td><td style="color:#12151C;font-size:14px;text-align:right;padding:8px 0">${order.serviceTitle}</td></tr>
          <tr style="border-top:1px solid #DFDBD3"><td style="color:#12151C;font-size:16px;font-weight:500;padding:12px 0">Total</td><td style="font-family:'JetBrains Mono',monospace;color:#12151C;font-size:16px;font-weight:500;text-align:right;padding:12px 0">${order.currency} ${order.amount.toLocaleString()}</td></tr>
        </table>
        <p>Your invoice is also available in your <a href="${BASE_URL}/dashboard">dashboard</a>.</p>
      `, "Invoice"),
    });
  } catch (err) {
    console.error("Failed to send invoice email:", err);
  }
}

/**
 * Internal alert to the admin inbox — used when something money-adjacent stops working
 * (a stale FX rate, a failed provider call). Never sent to a customer.
 */
export async function sendAlertEmail(env: Env, subject: string, bodyHtml: string) {
  const to = env.ADMIN_EMAIL || "admin@techrepubliq.com";
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ Alerts", email: env.FROM_EMAIL },
      to: [{ name: "Admin", email: to }],
      subject: `[TechRepubliQ] ${subject}`,
      html: baseHtml(LOGO_URL, bodyHtml, subject),
    });
  } catch (err) {
    console.error("Failed to send alert email:", err);
  }
}

function money(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toLocaleString()}`;
}

/** One-time code for owner-only actions — cancellation and migration (§6). */
export async function sendOtpEmail(env: Env, to: string, code: string, projectName: string) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name: "Customer", email: to }],
      subject: "Your verification code",
      html: baseHtml(LOGO_URL, `
        <p>Your code for <strong>${projectName}</strong> is:</p>
        <p style="font-family:'JetBrains Mono',monospace;font-size:28px;letter-spacing:6px;color:#12151C;margin:24px 0">${code}</p>
        <p>It expires in 15 minutes. If you didn't ask for it, you can ignore this email — nothing has changed on your project.</p>
      `, "Verification code"),
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err);
  }
}

/**
 * A nudge while an installment is in its 7-day grace window. Plain about what happens
 * next — no threats, no vagueness (PRD §4.5).
 */
export async function sendInstallmentReminderEmail(
  env: Env,
  to: string,
  installment: {
    planId: string;
    seq: number;
    amountMinor: number;
    currency: string;
    daysPastDue: number;
    graceUntil: string;
  }
) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name: "Customer", email: to }],
      subject: `Payment ${installment.seq} of 12 is overdue`,
      html: baseHtml(LOGO_URL, `
        <p>Payment ${installment.seq} of 12 on your development fee — ${money(installment.amountMinor, installment.currency)} — is ${installment.daysPastDue} day${installment.daysPastDue === 1 ? "" : "s"} overdue.</p>
        <p>We'll retry the card we have on file automatically. Service continues during the grace period, which ends on ${installment.graceUntil}.</p>
        <p>If that date passes unpaid, the add-on services on your project are removed. The project itself and everything already built stays yours.</p>
        <p>Plan reference: <span style="font-family:'JetBrains Mono',monospace">${installment.planId}</span></p>
        <p><a href="${BASE_URL}/dashboard">Review your plan in the dashboard</a></p>
      `, "Payment overdue"),
    });
  } catch (err) {
    console.error("Failed to send installment reminder:", err);
  }
}

/** The grace window closed — tell the customer, and copy the admin. */
export async function sendInstallmentFailedEmail(
  env: Env,
  to: string,
  installment: { planId: string; seq: number; amountMinor: number; currency: string }
) {
  const body = `
    <p>The grace period on payment ${installment.seq} of 12 (${money(installment.amountMinor, installment.currency)}) has ended without payment.</p>
    <p>The add-on services attached to this project have been removed. Your project and the work already delivered are untouched, and we'll be in touch about settling the balance.</p>
    <p>Plan reference: <span style="font-family:'JetBrains Mono',monospace">${installment.planId}</span></p>
  `;
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name: "Customer", email: to }],
      subject: `Grace period ended on payment ${installment.seq} of 12`,
      html: baseHtml(LOGO_URL, body, "Grace period ended"),
    });
  } catch (err) {
    console.error("Failed to send installment failed email:", err);
  }

  const admin = env.ADMIN_EMAIL || "admin@techrepubliq.com";
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ Alerts", email: env.FROM_EMAIL },
      to: [{ name: "Admin", email: admin }],
      subject: `Installment defaulted — ${installment.planId} #${installment.seq}`,
      html: baseHtml(LOGO_URL, `<p>An installment passed its grace period and was defaulted.</p>${body}`, "Installment defaulted"),
    });
  } catch (err) {
    console.error("Failed to send default alert:", err);
  }
}

export async function sendVerificationEmail(
  env: Env,
  to: string,
  name: string,
  token: string,
  _origin: string
) {
  const link = `${BASE_URL}/verify?token=${token}`;
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name, email: to }],
      subject: "Verify your email — TechRepubliQ",
      html: baseHtml(LOGO_URL, `
        <p>Hi ${name},</p>
        <p>Thanks for creating an account. Tap the button below to verify your email address and activate your account.</p>
        <a href="${link}" class="btn">Verify email</a>
        <p style="font-size:13px;color:#9C99AC">Or paste this link in your browser:<br><a href="${link}">${link}</a></p>
        <p>If you didn't create this account, you can ignore this email.</p>
      `, "Verify your email"),
    });
  } catch (err: any) {
    console.error("Failed to send verification email:", err);
  }
}

export async function sendWelcomeEmail(
  env: Env,
  to: string,
  name: string
) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name, email: to }],
      subject: "Email verified — welcome to TechRepubliQ",
      html: baseHtml(LOGO_URL, `
        <p>Hi ${name},</p>
        <p>Your email has been verified. You can now track orders, download invoices, and request migrations from your dashboard.</p>
        <p>Ready to get started? <a href="${BASE_URL}/quote">Request a quote</a> and we'll scope your project, priced before anything is built.</p>
        <a href="${BASE_URL}/dashboard" class="btn">Go to dashboard</a>
      `, "Email verified"),
    });
    return { ok: true };
  } catch (err: any) {
    console.error("Failed to send welcome email:", err);
    return { ok: false };
  }
}
interface LeadDetails {
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

function leadRow(label: string, value?: string): string {
  if (!value) return "";
  return `<tr><td style="color:#5B6472;font-size:14px;padding:6px 16px 6px 0;vertical-align:top">${label}</td>` +
    `<td style="color:#12151C;font-size:14px;padding:6px 0;vertical-align:top">${value}</td></tr>`;
}

/** Decision 14 — the full form submission, straight to admin@techrepubliq.com. */
export async function sendContactSalesEmail(
  env: Env,
  to: string,
  lead: LeadDetails
) {
  const rows = [
    leadRow("Name", lead.name),
    leadRow("Email", lead.email),
    leadRow("Company", lead.company),
    leadRow("Stage", lead.businessStage),
    leadRow("Expected scale", lead.expectedScale),
    leadRow("Category", lead.category),
    leadRow("Tier", lead.tierId),
    leadRow("Notes", lead.notes),
    leadRow("Source", lead.source),
  ].join("");

  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name: "TechRepubliQ Sales", email: to }],
      subject: `Enterprise enquiry — ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      html: baseHtml(
        LOGO_URL,
        `<p>A new Enterprise enquiry came in through the site.</p>
         <table style="border-collapse:collapse;margin:16px 0">${rows}</table>
         <p>Reply to the customer directly at <a href="mailto:${lead.email}">${lead.email}</a>.</p>`,
        "Enterprise enquiry"
      ),
    });
  } catch (err) {
    console.error("Failed to send contact-sales email:", err);
  }
}

/** Short acknowledgement so the customer knows it landed. No pricing, no commitments. */
export async function sendContactSalesAck(env: Env, to: string, name: string) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", email: env.FROM_EMAIL },
      to: [{ name, email: to }],
      subject: "We got your Enterprise enquiry",
      html: baseHtml(
        LOGO_URL,
        `<p>Hi ${name},</p>
         <p>Thanks for getting in touch about an Enterprise project. We have your details and someone from the team will reply within one business day to scope it with you.</p>
         <p>Enterprise work is quoted by conversation rather than by the online estimator, so there's nothing you need to do next.</p>`,
        "We'll be in touch"
      ),
    });
  } catch (err) {
    console.error("Failed to send contact-sales acknowledgement:", err);
  }
}
