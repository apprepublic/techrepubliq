-- PR 6 — revisions and post-launch edits (PRD §5, §5A).
--
-- Reviews are the pre-launch build cycle; edits are what happens once a project is
-- live. They are separate mechanisms even though both are "a request for change".

-- One edit subscription per project. `edits_included` NULL means unlimited, which is the
-- $1,000 plan — in that case `edits_remaining` stays NULL too and is never decremented.
CREATE TABLE IF NOT EXISTS edit_subscriptions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  monthly_cents INTEGER NOT NULL,
  edits_included INTEGER,
  edits_remaining INTEGER,
  renews_on TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Cancel at renewal')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- How an edit was paid for: from the monthly bundle, or individually.
ALTER TABLE edit_requests ADD COLUMN billed_via TEXT NOT NULL DEFAULT 'payg';
ALTER TABLE edit_requests ADD COLUMN edits_used INTEGER;

CREATE INDEX IF NOT EXISTS idx_edit_requests_project ON edit_requests(project_id, created_at);
