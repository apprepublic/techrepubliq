-- PR 7 — §12 Analytics.
--
-- `analytics_daily` already exists (0005). These three tables are what the reading
-- side needs:
--
--   analytics_settings   one row per Cloudflare zone. Every zone publishes its own
--                        limits — how far back a query may read (notOlderThan), how
--                        wide a window it may span (maxDuration), and which fields
--                        this plan is allowed to ask for (availableFields). Free keeps
--                        30 days of traffic, Pro only 7, so retention is read from the
--                        zone at runtime rather than hardcoded. Cached for a day: these
--                        change when a plan changes, not minute to minute.
--
--   analytics_cache      Cloudflare allows 300 GraphQL queries per 5-minute window
--                        across the whole account. A dashboard that re-queried on every
--                        keystroke would spend that on one customer. Tiles are cached
--                        here for fifteen minutes.
--
--   tier_nudges          Decision 15: a nudge fires only after three consecutive days
--                        over the line, so the streak has to live somewhere. Nothing
--                        here throttles or removes anything — the worst outcome of a
--                        row in this table is an email suggesting an upgrade.

CREATE TABLE IF NOT EXISTS analytics_settings (
  zone_id TEXT PRIMARY KEY,
  dataset TEXT NOT NULL DEFAULT 'httpRequests1dGroups',
  enabled INTEGER NOT NULL DEFAULT 0,
  -- JSON array of flattened field paths, e.g. ["sum_requests","uniq_uniques"].
  available_fields TEXT,
  max_page_size INTEGER,
  max_number_of_fields INTEGER,
  max_duration INTEGER,
  -- Seconds. How far back a query may read for this zone on this plan.
  not_older_than INTEGER,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_cache (
  cache_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_expiry ON analytics_cache(expires_at);

CREATE TABLE IF NOT EXISTS tier_nudges (
  project_id TEXT PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'none' CHECK(level IN ('none', 'warn', 'breach')),
  metric TEXT NOT NULL DEFAULT 'requests/day',
  observed REAL NOT NULL DEFAULT 0,
  ceiling REAL,
  consecutive_days INTEGER NOT NULL DEFAULT 0,
  -- The day the streak last counted. A gap resets the streak to one.
  last_seen_on TEXT,
  notified_on TEXT,
  acknowledged_on TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
