import type { Env } from "../index";
import { TIER_LIMITS, tierById } from "./pricing";
import { sendUpgradeNudgeEmail } from "../email";
import {
  CloudflareError,
  analyticsConfigured,
  zoneSettings,
  zoneTraffic,
  type TrafficDay,
} from "./cloudflare";

/**
 * The reading side of §12.
 *
 * Three jobs live here:
 *   1. `analyticsFor` — answer the dashboard's question for one project, from Cloudflare
 *      where possible and from our own roll-up where it isn't.
 *   2. `rollupAnalytics` — nightly, write yesterday into `analytics_daily` so history
 *      outlives Cloudflare's retention window and costs nothing to read back.
 *   3. `checkTierNudges` — nightly, compare a 7-day trailing average against the tier's
 *      ceiling and, after three consecutive days over the line, suggest an upgrade.
 *
 * The nudge is a suggestion and nothing more (decision 15). Nothing here throttles,
 * suspends or removes anything.
 */

export const RANGES = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];

export function parseRange(value: string | null): RangeId {
  return value === "30d" ? "30d" : "7d";
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 15 * 60 * 1000;

/* ------------------------------------------------------------------ *
 * Date windows
 * ------------------------------------------------------------------ */

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Yesterday is the last complete day. Today's numbers are still being written, so
 * including them would make every dashboard look like traffic was falling off a cliff.
 */
export function windowFor(days: number, now = new Date()) {
  const until = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  until.setUTCDate(until.getUTCDate() - 1);
  const since = new Date(until.getTime() - (days - 1) * DAY_MS);

  return {
    days,
    since: ymd(since),
    until: ymd(until),
    // The adaptive query takes timestamps covering the whole of the last day inclusive.
    sinceTime: `${ymd(since)}T00:00:00Z`,
    untilTime: `${ymd(until)}T23:59:59Z`,
  };
}

/* ------------------------------------------------------------------ *
 * Cache — 15 minutes, so a refresh doesn't spend the query budget
 * ------------------------------------------------------------------ */

async function readCache(env: Env, key: string): Promise<any | null> {
  const row = await env.DB.prepare(
    "SELECT payload, expires_at FROM analytics_cache WHERE cache_key = ?"
  )
    .bind(key)
    .first<any>();
  if (!row) return null;
  if (Date.parse(`${row.expires_at}Z`) <= Date.now()) return null;
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

async function writeCache(env: Env, key: string, payload: unknown): Promise<void> {
  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_TTL_MS);
  const stamp = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

  await env.DB.prepare(
    `INSERT INTO analytics_cache (cache_key, payload, fetched_at, expires_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload = excluded.payload,
       fetched_at = excluded.fetched_at,
       expires_at = excluded.expires_at`
  )
    .bind(key, JSON.stringify(payload), stamp(now), stamp(expires))
    .run();
}

/* ------------------------------------------------------------------ *
 * Roll-up history
 * ------------------------------------------------------------------ */

interface RollupRow {
  date: string;
  requests: number;
  pageviews: number;
  uniques: number;
  bytes: number;
  cached_requests: number;
}

async function rollupSeries(env: Env, projectId: string, days: number): Promise<TrafficDay[]> {
  const rows = await env.DB.prepare(
    `SELECT date, requests, pageviews, uniques, bytes, cached_requests
     FROM analytics_daily
     WHERE project_id = ?
     ORDER BY date DESC
     LIMIT ?`
  )
    .bind(projectId, days)
    .all<RollupRow>();

  return (rows.results ?? [])
    .map((row) => ({
      date: row.date,
      requests: row.requests,
      pageViews: row.pageviews,
      bytes: row.bytes,
      cachedBytes: 0,
      cachedRequests: row.cached_requests,
      uniques: row.uniques,
    }))
    .reverse();
}

function totalsFromSeries(series: TrafficDay[]) {
  return {
    requests: sum(series, (d) => d.requests),
    pageViews: sum(series, (d) => d.pageViews),
    bytes: sum(series, (d) => d.bytes),
    cachedBytes: 0,
    cachedRequests: sum(series, (d) => d.cachedRequests),
    encryptedBytes: 0,
    threats: 0,
    // Unique visitors cannot be summed across days — the same person on Monday and
    // Tuesday is one visitor, not two. The live path gets this from one query; the
    // roll-up path reports the best available daily figure instead of a wrong total.
    uniques: series.length ? Math.max(...series.map((d) => d.uniques)) : 0,
    sampleInterval: null as number | null,
  };
}

function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((total, item) => total + pick(item), 0);
}

/* ------------------------------------------------------------------ *
 * The dashboard's read
 * ------------------------------------------------------------------ */

export interface AnalyticsPayload {
  range: RangeId;
  connected: boolean;
  reason: string | null;
  /** True when the live query failed and these numbers came from our roll-up. */
  stale: boolean;
  /** True when Cloudflare sampled the data, so every figure is an estimate. */
  sampled: boolean;
  totals: {
    requests: number;
    pageViews: number;
    bytes: number;
    cachedBytes: number;
    cachedRequests: number;
    uniques: number;
    threats: number;
    cacheRatio: number | null;
    uniquesAreEstimated: boolean;
  };
  series: TrafficDay[];
  countries: { name: string; requests: number; bytes: number; threats: number }[];
  statuses: { status: number; requests: number }[];
  browsers: { name: string; pageViews: number }[] | null;
  limits: { notOlderThan: number | null; maxDuration: number | null };
  ranges: { id: RangeId; label: string; available: boolean; reason: string | null }[];
  tier: {
    id: string;
    requestsPerDay: number | null;
    averagePerDay: number;
    ratio: number | null;
    level: "none" | "warn" | "breach";
  } | null;
  /** Mobile projects have no zone; the tab shows build state instead of traffic. */
  mobile: boolean;
}

function notConnected(reason: string, range: RangeId, mobile: boolean): AnalyticsPayload {
  return {
    range,
    connected: false,
    reason,
    stale: false,
    sampled: false,
    totals: {
      requests: 0,
      pageViews: 0,
      bytes: 0,
      cachedBytes: 0,
      cachedRequests: 0,
      uniques: 0,
      threats: 0,
      cacheRatio: null,
      uniquesAreEstimated: false,
    },
    series: [],
    countries: [],
    statuses: [],
    browsers: null,
    limits: { notOlderThan: null, maxDuration: null },
    ranges: RANGES.map((r) => ({ id: r.id, label: r.label, available: false, reason })),
    tier: null,
    mobile,
  };
}

/** Connected, but the requested window is older than this zone's plan retains. */
function rangeUnavailable(
  rangeId: RangeId,
  reason: string,
  ranges: AnalyticsPayload["ranges"]
): AnalyticsPayload {
  return {
    ...notConnected(reason, rangeId, false),
    connected: true,
    ranges,
  };
}

export async function analyticsFor(
  env: Env,
  project: any,
  rangeId: RangeId
): Promise<AnalyticsPayload> {
  // A mobile app has no zone to query. Its tab is a build-state panel, not a traffic one
  // (§12.4) — saying so is more useful than an empty chart.
  const mobile = project.category === "app-development";
  if (mobile) {
    return notConnected("This project is a mobile app — there's no hosted site to measure.", rangeId, true);
  }

  if (!analyticsConfigured(env)) {
    return notConnected(
      "Traffic analytics connect when your project's hosting goes live.",
      rangeId,
      false
    );
  }

  if (!project.zone_id) {
    return notConnected(
      "Traffic analytics connect when your project's hosting goes live.",
      rangeId,
      false
    );
  }

  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[0];
  const cacheKey = `analytics:${project.zone_id}:${range.id}`;

  const cached = await readCache(env, cacheKey);
  if (cached) return cached as AnalyticsPayload;

  let settings;
  try {
    settings = await zoneSettings(env, project.zone_id);
  } catch (err) {
    return fallback(env, project, rangeId, err);
  }

  if (!settings.enabled) {
    return notConnected(
      "Traffic analytics aren't available for this project's hosting plan yet.",
      rangeId,
      false
    );
  }

  // Which presets this zone can actually serve. A Free zone keeps 30 days of traffic, a
  // Pro zone only 7 — disabling the button beats rendering a chart with a hole in it.
  const notOlderThan = settings.notOlderThan;
  const ranges = RANGES.map((r) => {
    const seconds = r.days * 86400;
    const available = notOlderThan === null || seconds <= notOlderThan;
    return {
      id: r.id,
      label: r.label,
      available,
      reason: available
        ? null
        : `This hosting plan keeps ${Math.floor((notOlderThan ?? 0) / 86400)} days of history.`,
    };
  });

  const active = ranges.find((r) => r.id === range.id);
  if (active && !active.available) {
    // The zone is fine; this particular window is older than its plan keeps. Say that
    // rather than pretending the project has no traffic at all.
    return rangeUnavailable(rangeId, active.reason ?? "That range isn't available.", ranges);
  }

  const window = windowFor(range.days);

  try {
    const traffic = await zoneTraffic(env, project.zone_id, settings, window);

    const payload: AnalyticsPayload = {
      range: range.id,
      connected: true,
      reason: null,
      stale: false,
      sampled: (traffic.totals.sampleInterval ?? 1) > 1,
      totals: {
        requests: traffic.totals.requests,
        pageViews: traffic.totals.pageViews,
        bytes: traffic.totals.bytes,
        cachedBytes: traffic.totals.cachedBytes,
        cachedRequests: traffic.totals.cachedRequests,
        uniques: traffic.totals.uniques,
        threats: traffic.totals.threats,
        cacheRatio:
          traffic.totals.requests > 0
            ? traffic.totals.cachedRequests / traffic.totals.requests
            : null,
        uniquesAreEstimated: false,
      },
      series: traffic.series,
      countries: traffic.breakdown.countries,
      statuses: traffic.breakdown.statuses,
      browsers: traffic.breakdown.browsers,
      limits: { notOlderThan: settings.notOlderThan, maxDuration: settings.maxDuration },
      ranges,
      tier: tierUsage(project, traffic.totals.requests / Math.max(window.days, 1)),
      mobile: false,
    };

    await writeCache(env, cacheKey, payload);
    return payload;
  } catch (err) {
    return fallback(env, project, rangeId, err);
  }
}

/**
 * Live queries fail for reasons outside our control — the quota, a token rotation, a
 * Cloudflare blip. Our own roll-up is still there, so serve it and say it's stale rather
 * than showing an error the customer can't act on (§12.3).
 */
async function fallback(
  env: Env,
  project: any,
  rangeId: RangeId,
  err: unknown
): Promise<AnalyticsPayload> {
  console.error(
    `Analytics live query failed for ${project.id}: ${err instanceof Error ? err.message : err}`
  );

  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[0];
  const series = await rollupSeries(env, project.id, range.days);
  if (series.length === 0) {
    const message =
      err instanceof CloudflareError && err.status === 429
        ? "Traffic analytics are busy right now. Try again in a few minutes."
        : "Traffic analytics are temporarily unavailable. Nothing is wrong with your project.";
    return notConnected(message, rangeId, project.category === "app-development");
  }

  const totals = totalsFromSeries(series);
  return {
    range: range.id,
    connected: true,
    reason: null,
    stale: true,
    sampled: false,
    totals: {
      requests: totals.requests,
      pageViews: totals.pageViews,
      bytes: totals.bytes,
      cachedBytes: totals.cachedBytes,
      cachedRequests: totals.cachedRequests,
      uniques: totals.uniques,
      threats: totals.threats,
      cacheRatio: totals.requests > 0 ? totals.cachedRequests / totals.requests : null,
      uniquesAreEstimated: true,
    },
    series,
    countries: [],
    statuses: [],
    browsers: null,
    limits: { notOlderThan: null, maxDuration: null },
    ranges: RANGES.map((r) => ({ id: r.id, label: r.label, available: true, reason: null })),
    tier: tierUsage(project, totals.requests / Math.max(series.length, 1)),
    mobile: false,
  };
}

/** Where a project sits against its tier's ceiling. Enterprise has no ceiling. */
function tierUsage(project: any, averagePerDay: number) {
  const tier = tierById(project.tier_id);
  if (!tier) return null;

  const ceiling = tier.requestsPerDay ?? null;
  return {
    id: tier.id,
    requestsPerDay: ceiling,
    averagePerDay: Math.round(averagePerDay),
    ratio: ceiling ? averagePerDay / ceiling : null,
    level: "none" as "none" | "warn" | "breach",
  };
}

/* ------------------------------------------------------------------ *
 * Nightly roll-up
 * ------------------------------------------------------------------ */

/** Cap per run so one cron invocation can't spend the whole query budget. */
const ROLLUP_ZONE_CAP = 50;

export async function rollupAnalytics(env: Env): Promise<{ rolled: number; skipped: number }> {
  if (!analyticsConfigured(env)) return { rolled: 0, skipped: 0 };

  const projects = await env.DB.prepare(
    `SELECT id, zone_id FROM projects
     WHERE zone_id IS NOT NULL AND zone_id != '' AND category != 'app-development'
     ORDER BY updated_at DESC
     LIMIT ?`
  )
    .bind(ROLLUP_ZONE_CAP)
    .all<any>();

  // Yesterday alone: today's row would be rewritten all day long.
  const window = windowFor(1);
  let rolled = 0;
  let skipped = 0;

  for (const project of projects.results ?? []) {
    try {
      const settings = await zoneSettings(env, project.zone_id);
      if (!settings.enabled) {
        skipped++;
        continue;
      }

      const traffic = await zoneTraffic(env, project.zone_id, settings, window);
      const day = traffic.series[0] ?? {
        date: window.until,
        requests: traffic.totals.requests,
        pageViews: traffic.totals.pageViews,
        bytes: traffic.totals.bytes,
        cachedBytes: traffic.totals.cachedBytes,
        cachedRequests: traffic.totals.cachedRequests,
        uniques: traffic.totals.uniques,
      };

      await env.DB.prepare(
        `INSERT INTO analytics_daily
           (project_id, date, requests, pageviews, uniques, bytes, cached_requests, sample_interval)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(project_id, date) DO UPDATE SET
           requests = excluded.requests,
           pageviews = excluded.pageviews,
           uniques = excluded.uniques,
           bytes = excluded.bytes,
           cached_requests = excluded.cached_requests,
           sample_interval = excluded.sample_interval`
      )
        .bind(
          project.id,
          day.date || window.until,
          day.requests,
          day.pageViews,
          day.uniques,
          day.bytes,
          day.cachedRequests,
          traffic.totals.sampleInterval === null ? null : String(traffic.totals.sampleInterval)
        )
        .run();

      rolled++;
    } catch (err) {
      // One bad zone must not stop the run.
      console.error(
        `Analytics roll-up failed for ${project.id}: ${err instanceof Error ? err.message : err}`
      );
      skipped++;
    }
  }

  return { rolled, skipped };
}

/* ------------------------------------------------------------------ *
 * Tier nudge (decision 15)
 * ------------------------------------------------------------------ */

/**
 * Compares a 7-day trailing average against the tier's ceiling. The average matters: a
 * single launch-day spike shouldn't produce an upgrade email, which is why §12.7 asks
 * for three *consecutive* days over the line rather than one.
 */
export async function checkTierNudges(
  env: Env
): Promise<{ nudged: number; cleared: number; emailed: number }> {
  const projects = await env.DB.prepare(
    "SELECT id, customer_id, name, tier_id FROM projects WHERE zone_id IS NOT NULL AND zone_id != ''"
  ).all<any>();

  const today = ymd(new Date());
  let nudged = 0;
  let cleared = 0;
  let emailed = 0;

  for (const project of projects.results ?? []) {
    const tier = tierById(project.tier_id);
    const ceiling = tier?.requestsPerDay ?? null;
    // Enterprise has no published ceiling — there is nothing to nudge towards (§12.7).
    if (!ceiling) {
      await clearNudge(env, project.id);
      continue;
    }

    const rows = await env.DB.prepare(
      `SELECT date, requests FROM analytics_daily
       WHERE project_id = ? AND date <= ?
       ORDER BY date DESC
       LIMIT 7`
    )
      .bind(project.id, today)
      .all<{ date: string; requests: number }>();

    const days = rows.results ?? [];
    if (days.length === 0) continue;

    const average = days.reduce((total, row) => total + row.requests, 0) / days.length;
    const ratio = average / ceiling;

    const previous = await env.DB.prepare(
      "SELECT * FROM tier_nudges WHERE project_id = ?"
    )
      .bind(project.id)
      .first<any>();

    const overWarn = ratio >= TIER_LIMITS.warnAt;
    const level: "none" | "warn" | "breach" = ratio >= 1 ? "breach" : overWarn ? "warn" : "none";

    // "Three days in a row" means three days in a row: a gap resets the count to one.
    // Re-running on the same day leaves it alone, so an operator can re-run the cron
    // without wiping a streak that took three days to build.
    const yesterday = ymd(new Date(Date.now() - DAY_MS));
    let consecutiveDays: number;
    if (level === "none") {
      consecutiveDays = 0;
    } else if (previous?.last_seen_on === today) {
      consecutiveDays = previous.consecutive_days;
    } else if (previous?.last_seen_on === yesterday) {
      consecutiveDays = previous.consecutive_days + 1;
    } else {
      consecutiveDays = 1;
    }
    consecutiveDays = Math.min(consecutiveDays, 99);
    const confirmed = consecutiveDays >= TIER_LIMITS.breachDays;
    const effective = confirmed ? level : "none";

    await env.DB.prepare(
      `INSERT INTO tier_nudges
         (project_id, level, metric, observed, ceiling, consecutive_days, last_seen_on, updated_at)
       VALUES (?, ?, 'requests/day', ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(project_id) DO UPDATE SET
         level = excluded.level,
         observed = excluded.observed,
         ceiling = excluded.ceiling,
         consecutive_days = excluded.consecutive_days,
         last_seen_on = excluded.last_seen_on,
         updated_at = excluded.updated_at`
    )
      .bind(project.id, effective, Math.round(average), ceiling, consecutiveDays, today)
      .run();

    if (effective === "none") {
      cleared++;
      continue;
    }

    nudged++;

    // Email on the way up, and weekly while a breach persists. Never twice for the same
    // level on the same day.
    const alreadyTold = previous?.level === effective && previous?.notified_on === today;
    const weeklyDue =
      effective === "breach" &&
      previous?.notified_on &&
      Date.parse(`${today}T00:00:00Z`) - Date.parse(`${previous.notified_on}T00:00:00Z`) >=
        7 * DAY_MS;

    if (alreadyTold && !weeklyDue) continue;
    if (previous?.level === effective && previous?.notified_on && !weeklyDue) continue;

    const customer = await env.DB.prepare("SELECT email, name FROM customers WHERE id = ?")
      .bind(project.customer_id)
      .first<any>();

    if (customer?.email) {
      const sent = await sendUpgradeNudgeEmail(env, {
        to: customer.email,
        name: customer.name ?? "there",
        projectName: project.name,
        projectId: project.id,
        tierId: project.tier_id,
        averagePerDay: Math.round(average),
        ceiling,
        level: effective,
      });
      if (sent) {
        await env.DB.prepare(
          "UPDATE tier_nudges SET notified_on = ? WHERE project_id = ?"
        )
          .bind(today, project.id)
          .run();
        emailed++;
      }
    }
  }

  return { nudged, cleared, emailed };
}

async function clearNudge(env: Env, projectId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM tier_nudges WHERE project_id = ?").bind(projectId).run();
}

/** What the projects list needs to render the banner. */
export async function nudgesFor(env: Env, projectIds: string[]): Promise<Record<string, any>> {
  if (projectIds.length === 0) return {};
  const placeholders = projectIds.map(() => "?").join(", ");
  const rows = await env.DB.prepare(
    `SELECT project_id, level, observed, ceiling FROM tier_nudges
     WHERE project_id IN (${placeholders}) AND level != 'none'`
  )
    .bind(...projectIds)
    .all<any>();

  const map: Record<string, any> = {};
  for (const row of rows.results ?? []) {
    map[row.project_id] = {
      level: row.level,
      observed: row.observed,
      ceiling: row.ceiling,
    };
  }
  return map;
}
