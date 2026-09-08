import type { Env } from "./index";

function baseHtml(body: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body{margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#F5F3EE}
      .wrap{max-width:560px;margin:0 auto;padding:32px 24px}
      h1{font-size:24px;font-weight:600;color:#12151C;margin:0 0 12px}
      p{font-size:15px;line-height:1.6;color:#5B6472;margin:0 0 16px}
      .btn{display:inline-block;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:500;color:#fff;text-decoration:none;background:linear-gradient(135deg,#FF5C4D,#C8102E);margin:8px 0}
      .footer{font-size:12px;color:#9C99AC;margin-top:32px;border-top:1px solid #DFDBD3;padding-top:16px}
    </style>
    </head>
    <body><div class="wrap">
      <h1 style="font-family:'Inter Tight',sans-serif">${title}</h1>
      ${body}
      <div class="footer">TechRepubliQ — Web, app, and AI automation work, scoped and priced before anything is built.</div>
    </div></body></html>`;
}

export async function sendInvoiceEmail(
  env: Env,
  to: string,
  order: { referenceId: string; serviceTitle: string; amount: number; currency: string }
) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", address: env.FROM_EMAIL },
      to: [{ address: to }],
      subject: `Invoice — ${order.referenceId}`,
      htmlBody: baseHtml(`
        <p>Thank you for your order. Here's your invoice.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="color:#5B6472;font-size:14px;padding:8px 0">Reference</td><td style="font-family:'JetBrains Mono',monospace;color:#12151C;font-size:14px;text-align:right;padding:8px 0">${order.referenceId}</td></tr>
          <tr><td style="color:#5B6472;font-size:14px;padding:8px 0">Service</td><td style="color:#12151C;font-size:14px;text-align:right;padding:8px 0">${order.serviceTitle}</td></tr>
          <tr style="border-top:1px solid #DFDBD3"><td style="color:#12151C;font-size:16px;font-weight:500;padding:12px 0">Total</td><td style="font-family:'JetBrains Mono',monospace;color:#12151C;font-size:16px;font-weight:500;text-align:right;padding:12px 0">${order.currency} ${order.amount.toLocaleString()}</td></tr>
        </table>
        <p>Your invoice is also available in your dashboard.</p>
      `, "Invoice"),
    });
  } catch (err) {
    console.error("Failed to send invoice email:", err);
  }
}

export async function sendVerificationEmail(
  env: Env,
  to: string,
  name: string,
  token: string,
  origin: string
) {
  const link = `${origin}/verify?token=${token}`;
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", address: env.FROM_EMAIL },
      to: [{ address: to }],
      subject: "Verify your email — TechRepubliQ",
      htmlBody: baseHtml(`
        <p>Hi ${name},</p>
        <p>Thanks for creating an account. Tap the button below to verify your email address and activate your account.</p>
        <a href="${link}" class="btn">Verify email</a>
        <p style="font-size:13px;color:#9C99AC">Or paste this link in your browser:<br>${link}</p>
        <p>If you didn't create this account, you can ignore this email.</p>
      `, "Verify your email"),
    });
  } catch (err) {
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
      from: { name: "TechRepubliQ", address: env.FROM_EMAIL },
      to: [{ address: to }],
      subject: "Email verified — welcome to TechRepubliQ",
      htmlBody: baseHtml(`
        <p>Hi ${name},</p>
        <p>Your email has been verified. You can now track orders, download invoices, and request migrations from your dashboard.</p>
        <p>Ready to get started? <a href="${env.FROM_EMAIL ? "https://techrepubliq.pages.dev/quote" : "/quote"}" style="color:#C8102E">Request a quote</a> and we'll scope your project, priced before anything is built.</p>
      `, "Email verified"),
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}