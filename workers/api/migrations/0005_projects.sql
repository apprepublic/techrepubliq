-- PR 5 — WP5: projects, the service each project carries, and the surfaces the
-- dashboard reads (decisions 6, 7, 8, 9).
--
-- Fresh tables: historical `orders` and `quotes` are left exactly as they are (§15), so
-- the old dashboard/orders views keep working while projects take over the main surface.
-- `fx_rates`, `installment_plans` and `contact_sales_leads` already exist (0006, 0007,
-- 0004) and are referenced here for completeness rather than recreated.

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  order_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Queued' CHECK(status IN ('Queued', 'In preview', 'Live')),
  zone_id TEXT,                 -- our Cloudflare zone (decision 17)
  preview_url TEXT,
  custom_domain TEXT,
  launch_at TEXT,
  dev_fee_cents INTEGER NOT NULL DEFAULT 0,
  cadence TEXT NOT NULL DEFAULT 'annual' CHECK(cadence IN ('annual', 'monthly')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- One row per service attached to a project: the tier's base plus any add-ons.
CREATE TABLE IF NOT EXISTS project_services (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('base', 'addon')),
  monthly_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Cancel at renewal', 'Grace period')),
  renews_on TEXT,
  grace_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_project_services_project ON project_services(project_id);

-- Pre-launch review allowance (§6 / WP6 prices the extras).
CREATE TABLE IF NOT EXISTS revisions (
  project_id TEXT PRIMARY KEY,
  included INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  purchased INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Owner-only, OTP-gated actions: cancellation and migration (§6).
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  project_id TEXT,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_codes(customer_id, purpose, consumed_at);

-- Per-project Email Center (decision 8) — populated in PR 7.
CREATE TABLE IF NOT EXISTS email_messages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  from_addr TEXT NOT NULL,
  to_addr TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_email_messages_project ON email_messages(project_id, sent_at);

-- Zone analytics, one row per project per day (decision 9) — populated in PR 7.
CREATE TABLE IF NOT EXISTS analytics_daily (
  project_id TEXT NOT NULL,
  date TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  pageviews INTEGER NOT NULL DEFAULT 0,
  uniques INTEGER NOT NULL DEFAULT 0,
  bytes INTEGER NOT NULL DEFAULT 0,
  cached_requests INTEGER NOT NULL DEFAULT 0,
  sample_interval TEXT,
  PRIMARY KEY (project_id, date)
);

-- Post-launch edit requests and review packs (WP6 prices these).
CREATE TABLE IF NOT EXISTS edit_requests (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  description TEXT NOT NULL,
  pages INTEGER,
  components INTEGER,
  complexity TEXT,
  price_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'Requested',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS review_purchases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  reviews INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
