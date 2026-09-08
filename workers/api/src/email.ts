import type { Env } from "./index";

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
      htmlBody: `
        <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F5F3EE;">
          <h1 style="font-size: 28px; font-weight: 600; color: #12151C; margin: 0 0 16px;">TechRepubliQ</h1>
          <p style="color: #5B6472; font-size: 16px; line-height: 1.6;">Thank you for your order. Here's your invoice.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="color: #5B6472; font-size: 14px; padding: 8px 0;">Reference</td>
              <td style="font-family: 'JetBrains Mono', monospace; color: #12151C; font-size: 14px; text-align: right; padding: 8px 0;">${order.referenceId}</td>
            </tr>
            <tr>
              <td style="color: #5B6472; font-size: 14px; padding: 8px 0;">Service</td>
              <td style="color: #12151C; font-size: 14px; text-align: right; padding: 8px 0;">${order.serviceTitle}</td>
            </tr>
            <tr style="border-top: 1px solid #DFDBD3;">
              <td style="color: #12151C; font-size: 16px; font-weight: 500; padding: 12px 0;">Total</td>
              <td style="font-family: 'JetBrains Mono', monospace; color: #12151C; font-size: 16px; font-weight: 500; text-align: right; padding: 12px 0;">${order.currency} ${order.amount.toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #5B6472; font-size: 14px;">Your invoice is also available in your dashboard.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send invoice email:", err);
  }
}

export async function sendConfirmationEmail(
  env: Env,
  to: string,
  name: string
) {
  try {
    await env.SEND_EMAIL.send({
      from: { name: "TechRepubliQ", address: env.FROM_EMAIL },
      to: [{ address: to }],
      subject: "Account created — TechRepubliQ",
      htmlBody: `
        <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #F5F3EE;">
          <h1 style="font-size: 28px; font-weight: 600; color: #12151C; margin: 0 0 16px;">Welcome to TechRepubliQ</h1>
          <p style="color: #5B6472; font-size: 16px; line-height: 1.6;">Hi ${name}, your account has been created. You can now track your orders and request migrations from your dashboard.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}