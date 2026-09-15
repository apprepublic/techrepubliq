-- Migration 0004: Enterprise leads + PRD v2.5 quote intake
-- Writes: contact_sales_leads (new), quotes (new columns for the new intake payload).

CREATE TABLE IF NOT EXISTS contact_sales_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  business_stage TEXT,
  expected_scale TEXT,
  category TEXT,
  tier_id TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'contact-sales',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_sales_leads_email ON contact_sales_leads(email);
CREATE INDEX IF NOT EXISTS idx_contact_sales_leads_created ON contact_sales_leads(created_at);

-- Quote intake (PRD §1.3, §4.2): the client sends pages/components/complexity/add-ons and
-- the server recomputes every amount. These columns persist that payload for audit.
ALTER TABLE quotes ADD COLUMN tier_id TEXT;
ALTER TABLE quotes ADD COLUMN metrics TEXT;
ALTER TABLE quotes ADD COLUMN assets TEXT;
ALTER TABLE quotes ADD COLUMN domain_option TEXT;
ALTER TABLE quotes ADD COLUMN cadence TEXT;
ALTER TABLE quotes ADD COLUMN dev_fee_mode TEXT;
ALTER TABLE quotes ADD COLUMN addons TEXT;
ALTER TABLE quotes ADD COLUMN one_time_services TEXT;
ALTER TABLE quotes ADD COLUMN breakdown TEXT;
ALTER TABLE quotes ADD COLUMN contact_email TEXT;
