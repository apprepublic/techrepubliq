import type { Env } from "../index";
import { INSTALLMENT_MONTHS, devFeeOptions } from "./pricing";
import { getProvider } from "../payments";
import type { ProviderId } from "../payments/types";
import { sendInstallmentReminderEmail, sendInstallmentFailedEmail } from "../email";
import { generateId } from "../utils";

/**
 * Installments (§11) — the development fee as a dated debt schedule.
 *
 * Decision 11: twelve even monthly payments, the first taken at checkout.
 * Decision 16: the fee's list price *is* the twelve-month total; paying in one go takes
 * 15% off, and the installments carry no markup and no interest.
 * The split rule lives in `devFeeOptions` and is shared with the pricing model, so the
 * twelve always sum back to the fee exactly.
 */

export const GRACE_DAYS = 7;
/** Days past due on which the customer gets a nudge (PRD §4.5). */
const REMINDER_DAYS = [1, 3, 5, 7];

/** SQLite's `datetime('now')` format, so string comparisons against it are valid. */
export function sqlNow(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

/** Add months, clamping to the end of the month so 31 Jan + 1 month is 28/29 Feb. */
export function addMonths(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

export interface ScheduleEntry {
  seq: number;
  dueAt: string;
  amountCents: number;
  amountMinor: number;
}

/**
 * The twelve dated payments. `toMinor` converts one installment's canonical cents into
 * the presentment currency with the rate locked onto the intent.
 */
export function installmentSchedule(
  feeListCents: number,
  toMinor: (cents: number) => number,
  startedAt: Date = new Date()
): ScheduleEntry[] {
  const { perMonthCents } = devFeeOptions(feeListCents);
  return perMonthCents.map((amountCents, index) => ({
    seq: index + 1,
    dueAt: sqlNow(addMonths(startedAt, index)),
    amountCents,
    amountMinor: toMinor(amountCents),
  }));
}

/**
 * Create the plan when an installment purchase succeeds. Payment 1 has just been taken
 * at checkout, so it is written as Paid; the remaining eleven are Scheduled.
 */
export async function createPlanForPayment(
  env: Env,
  params: {
    intentId: string;
    orderId: string;
    paymentId: string;
    email: string;
    provider: ProviderId;
    currency: string;
    feeListCents: number;
    fxRateUsed: number | null;
    toMinor: (cents: number) => number;
  }
): Promise<string | null> {
  const schedule = installmentSchedule(params.feeListCents, params.toMinor);
  const planId = `IP-${generateId()}`;
  const now = sqlNow();

  try {
    await env.DB.prepare(
      `INSERT INTO installment_plans
         (id, intent_id, order_id, email, provider, currency, total_cents, total_minor, fx_rate_used, count, interval, started_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'monthly', ?, 'Active')`
    )
      .bind(
        planId,
        params.intentId,
        params.orderId,
        params.email,
        params.provider,
        params.currency,
        params.feeListCents,
        schedule.reduce((sum, entry) => sum + entry.amountMinor, 0),
        params.fxRateUsed,
        INSTALLMENT_MONTHS,
        now
      )
      .run();

    for (const entry of schedule) {
      const isFirst = entry.seq === 1;
      await env.DB.prepare(
        `INSERT INTO installments
           (id, plan_id, seq, due_at, amount_cents, amount_minor, status, paid_at, payment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          `INS-${generateId()}`,
          planId,
          entry.seq,
          entry.dueAt,
          entry.amountCents,
          entry.amountMinor,
          isFirst ? "Paid" : "Scheduled",
          isFirst ? now : null,
          isFirst ? params.paymentId : null
        )
        .run();
    }
    return planId;
  } catch (err) {
    console.error("Creating the installment plan failed:", err);
    return null;
  }
}

function daysPastDue(dueAt: string, now: Date): number {
  const due = Date.parse(`${dueAt.replace(" ", "T")}Z`);
  if (!Number.isFinite(due)) return 0;
  return Math.max(0, Math.floor((now.getTime() - due) / 86_400_000));
}

/**
 * Dunning — run daily by the Cron Worker.
 *
 * Charge whatever is due from the customer's saved method. On failure the installment
 * enters a 7-day grace where the service keeps running; reminders go out on days 1, 3,
 * 5 and 7; after that the affected add-on services are removed. The project itself is
 * never deleted mid-build (§11).
 */
export async function runDunning(
  env: Env,
  now: Date = new Date()
): Promise<{ charged: number; failed: number; skipped: number; ended: number }> {
  const stats = { charged: 0, failed: 0, skipped: 0, ended: 0 };
  const nowSql = sqlNow(now);

  const due = await env.DB.prepare(
    `SELECT i.*, p.email, p.provider, p.currency, p.id AS plan_row_id, p.status AS plan_status
       FROM installments i
       JOIN installment_plans p ON p.id = i.plan_id
      WHERE p.status = 'Active'
        AND i.status IN ('Scheduled', 'Due', 'Grace')
        AND i.due_at <= ?
      ORDER BY i.due_at ASC`
  )
    .bind(nowSql)
    .all<any>();

  for (const row of due.results ?? []) {
    const overdue = daysPastDue(row.due_at, now);

    // Grace expired — stop charging and hand it to a human.
    if (row.status === "Grace" && row.grace_until && row.grace_until <= nowSql) {
      await env.DB.prepare(
        "UPDATE installments SET status = 'Failed', last_error = 'Grace period ended' WHERE id = ?"
      )
        .bind(row.id)
        .run();
      await env.DB.prepare(
        "UPDATE installment_plans SET status = 'Defaulted' WHERE id = ?"
      )
        .bind(row.plan_id)
        .run();
      if (env.ctx) {
        env.ctx.waitUntil(
          sendInstallmentFailedEmail(env, row.email, {
            planId: row.plan_id,
            seq: row.seq,
            amountMinor: row.amount_minor,
            currency: row.currency,
          })
        );
      }
      stats.ended++;
      continue;
    }

    const method = await env.DB.prepare(
      "SELECT * FROM saved_methods WHERE email = ? AND provider = ? AND status = 'Active' ORDER BY created_at DESC LIMIT 1"
    )
      .bind(row.email, row.provider)
      .first<any>();

    if (!method) {
      // No reusable method on file — nudge the customer to pay manually.
      await env.DB.prepare("UPDATE installments SET status = 'Due' WHERE id = ?")
        .bind(row.id)
        .run();
      stats.skipped++;
      continue;
    }

    const reference = `${row.plan_id}-${row.seq}`;
    const provider = getProvider(row.provider as ProviderId);
    const result = await provider
      .chargeSaved(
        { provider: row.provider as ProviderId, token: method.token },
        {
          email: row.email,
          amountMinor: row.amount_minor,
          currency: row.currency,
          reference,
        },
        env
      )
      .catch((err) => ({
        ok: false,
        failureMessage: err instanceof Error ? err.message : String(err),
      }));

    if (result.ok) {
      const paymentId = `PAY-${generateId()}`;
      const paidAt = sqlNow(now);

      await env.DB.prepare(
        `INSERT OR IGNORE INTO payments
           (id, provider, provider_reference, amount_cents, amount_minor, currency, status, email, installment_id)
         VALUES (?, ?, ?, ?, ?, ?, 'Paid', ?, ?)`
      )
        .bind(
          paymentId,
          row.provider,
          reference,
          row.amount_cents,
          row.amount_minor,
          row.currency,
          row.email,
          row.id
        )
        .run();

      await env.DB.prepare(
        "UPDATE installments SET status = 'Paid', paid_at = ?, payment_id = ?, last_error = NULL WHERE id = ?"
      )
        .bind(paidAt, paymentId, row.id)
        .run();

      const remaining = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM installments WHERE plan_id = ? AND status <> 'Paid'"
      )
        .bind(row.plan_id)
        .first<{ n: number }>();
      if (!remaining || remaining.n === 0) {
        await env.DB.prepare(
          "UPDATE installment_plans SET status = 'Completed', completed_at = ? WHERE id = ?"
        )
          .bind(paidAt, row.plan_id)
          .run();
      }
      stats.charged++;
      continue;
    }

    // Failed: first failure opens the grace window.
    const attempts = (row.attempts ?? 0) + 1;
    const graceUntil = sqlNow(new Date(now.getTime() + GRACE_DAYS * 86_400_000));
    await env.DB.prepare(
      `UPDATE installments
          SET attempts = ?, status = 'Grace',
              grace_until = COALESCE(grace_until, ?),
              last_error = ?,
              reminder_day = ?
        WHERE id = ?`
    )
      .bind(attempts, graceUntil, result.failureMessage ?? "Charge failed", overdue, row.id)
      .run();

    if (env.ctx && overdue > (row.reminder_day ?? 0)) {
      const nextReminder = REMINDER_DAYS.find((day) => day > (row.reminder_day ?? 0));
      if (nextReminder !== undefined && overdue >= nextReminder) {
        env.ctx.waitUntil(
          sendInstallmentReminderEmail(env, row.email, {
            planId: row.plan_id,
            seq: row.seq,
            amountMinor: row.amount_minor,
            currency: row.currency,
            daysPastDue: overdue,
            graceUntil,
          })
        );
        await env.DB.prepare("UPDATE installments SET reminder_day = ? WHERE id = ?")
          .bind(overdue, row.id)
          .run();
      }
    }
    stats.failed++;
  }

  return stats;
}
