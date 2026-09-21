-- PR 4 — payments ledger, FX rates and saved methods (decisions 2, 3, 10).
--
-- Money of record is USD cents everywhere in the app. `fx_rates` holds the USD→NGN rate
-- a Cron Worker refreshes daily; the rate a checkout actually used is locked onto the
-- payment intent so an invoice can be reconciled months later.

CREATE TABLE IF NOT EXISTS fx_rates (
  base TEXT NOT NULL,
  quote TEXT NOT NULL,
  rate REAL NOT NULL,
  source TEXT,
  fetched_at TEXT NOT NULL,
  PRIMARY KEY (base, quote)
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  quote_reference TEXT,
  customer_email TEXT,
  provider TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,      -- canonical USD cents
  amount_minor INTEGER NOT NULL,      -- presentment minor units (kobo / cents)
  fx_rate_used REAL,
  fx_fetched_at TEXT,
  discount_code TEXT,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Paid', 'Failed')),
  provider_reference TEXT,
  order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_quote ON payment_intents(quote_reference);
CREATE INDEX IF NOT EXISTS idx_payment_intents_provider_ref ON payment_intents(provider_reference);

-- Replay safety: a provider is free to deliver the same event twice.
CREATE TABLE IF NOT EXISTS payment_events (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  intent_id TEXT,
  type TEXT,
  amount_minor INTEGER,
  currency TEXT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (provider, event_id)
);

-- One row per charge. project_id / installment_id are nullable until §11 lands.
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  intent_id TEXT,
  provider TEXT NOT NULL,
  provider_event_id TEXT,
  provider_reference TEXT,
  amount_cents INTEGER NOT NULL,      -- canonical USD cents
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  fx_rate_used REAL,
  status TEXT NOT NULL,
  email TEXT,
  project_id TEXT,
  installment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_event ON payments(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_intent ON payments(intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);

-- Reusable methods for installments and renewals (§11). One token per rail.
CREATE TABLE IF NOT EXISTS saved_methods (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  token TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Revoked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_methods_token ON saved_methods(provider, token);
CREATE INDEX IF NOT EXISTS idx_saved_methods_email ON saved_methods(email);
