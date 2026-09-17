-- PR 4 part 2 — installments on the one-time development fee (§11, decisions 3, 11, 16).
--
-- A plan is a debt schedule, not a subscription: twelve dated payments against the fee,
-- the first taken at checkout. The fee is split in canonical cents by the same rule the
-- pricing model already uses (base = floor(total / 12), the first `remainder` payments
-- carry the extra cent), so the twelve always sum to the fee exactly.

CREATE TABLE IF NOT EXISTS installment_plans (
  id TEXT PRIMARY KEY,
  intent_id TEXT,
  order_id TEXT,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  currency TEXT NOT NULL,
  total_cents INTEGER NOT NULL,      -- canonical USD cents (the fee's 12-month total)
  total_minor INTEGER NOT NULL,      -- the same, in the currency the customer pays
  fx_rate_used REAL,
  count INTEGER NOT NULL DEFAULT 12,
  interval TEXT NOT NULL DEFAULT 'monthly',
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Completed', 'Defaulted')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_installment_plans_email ON installment_plans(email);
CREATE INDEX IF NOT EXISTS idx_installment_plans_status ON installment_plans(status);

CREATE TABLE IF NOT EXISTS installments (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  due_at TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  amount_minor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Paid', 'Due', 'Grace', 'Failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  reminder_day INTEGER NOT NULL DEFAULT 0,   -- last day-past-due we emailed about
  paid_at TEXT,
  grace_until TEXT,
  last_error TEXT,
  payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (plan_id, seq),
  FOREIGN KEY (plan_id) REFERENCES installment_plans(id)
);

CREATE INDEX IF NOT EXISTS idx_installments_due ON installments(status, due_at);
CREATE INDEX IF NOT EXISTS idx_installments_plan ON installments(plan_id);
