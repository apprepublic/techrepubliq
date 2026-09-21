import type { Env } from "../index";

/**
 * Cloudflare GraphQL Analytics client (§12).
 *
 * Two rules shape this file:
 *
 * 1. **Cloudflare is only ever called from here**, never from the browser. The token is
 *    a Worker secret and the API has a hard 300-queries-per-5-minutes budget shared
 *    across the whole account, so every read goes through this module where it can be
 *    cached and rate-limited.
 *
 * 2. **Never assume what a zone can answer.** How far back a query may read depends on
 *    the zone's plan — Free keeps 30 days of traffic history, Pro only 7 — and which
 *    fields may be asked for varies the same way. Cloudflare publishes both through the
 *    `settings` node, so we read them per zone and ask only for what's on offer. That is
 *    why `availableFields` gates half the query below.
 *
 * `CF_API_BASE` is overridable so the whole path can be exercised against a local
 * stand-in; it defaults to the live API.
 */

const DEFAULT_API_BASE = "https://api.cloudflare.com/client/v4";

/** The dataset every tile reads from. */
const DATASET = "httpRequests1dGroups";
/** Adaptive groups aggregate a whole window into one row — used for totals and breakdowns. */
const ADAPTIVE_DATASET = "httpRequestsAdaptiveGroups";

export class CloudflareError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CloudflareError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function base(env: Env): string {
  return (env.CF_API_BASE ?? DEFAULT_API_BASE).replace(/\/+$/, "");
}

/** Analytics is wired only when the token exists; without it the tab says so plainly. */
export function analyticsConfigured(env: Env): boolean {
  return Boolean(env.CF_API_TOKEN);
}

/* ------------------------------------------------------------------ *
 * GraphQL transport, with backoff for the 300-per-5-minute quota
 * ------------------------------------------------------------------ */

interface GraphqlResponse {
  data?: any;
  errors?: { message: string }[];
}

export async function graphql(
  env: Env,
  query: string,
  variables: Record<string, unknown>
): Promise<any> {
  const body = JSON.stringify({ query, variables });
  const attempts = 4;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      // 250ms, 500ms, 1000ms — plus jitter so parallel requests don't resynchronise.
      await sleep(250 * 2 ** (attempt - 1) + Math.random() * 100);
    }

    let res: Response;
    try {
      res = await fetch(`${base(env)}/graphql`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body,
      });
    } catch (err) {
      if (attempt === attempts - 1) {
        throw new CloudflareError(
          `Couldn't reach Cloudflare Analytics: ${err instanceof Error ? err.message : "network error"}`
        );
      }
      continue;
    }

    // 429 is the quota talking, not an error state. Honour Retry-After, then back off.
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "0");
      if (retryAfter > 0 && retryAfter <= 30) await sleep(retryAfter * 1000);
      if (attempt === attempts - 1) {
        throw new CloudflareError("Cloudflare Analytics is rate limited right now.", 429);
      }
      continue;
    }

    if (res.status === 401 || res.status === 403) {
      throw new CloudflareError("This server's Cloudflare token isn't accepted.", res.status);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (attempt === attempts - 1) {
        throw new CloudflareError(`Cloudflare Analytics returned ${res.status}. ${text.slice(0, 200)}`, res.status);
      }
      continue;
    }

    const payload = (await res.json().catch(() => ({}))) as GraphqlResponse;
    if (payload.errors?.length) {
      throw new CloudflareError(payload.errors.map((e) => e.message).join("; "));
    }
    return payload.data;
  }

  throw new CloudflareError("Cloudflare Analytics didn't respond.");
}

/* ------------------------------------------------------------------ *
 * Zone settings — read the limits instead of guessing them
 * ------------------------------------------------------------------ */

export interface ZoneSettings {
  zoneId: string;
  enabled: boolean;
  availableFields: string[];
  maxPageSize: number | null;
  maxNumberOfFields: number | null;
  /** Widest window one query may span, in seconds. */
  maxDuration: number | null;
  /** How far back a query may read, in seconds. This is what disables a date preset. */
  notOlderThan: number | null;
  fetchedAt: string | null;
}

const SETTINGS_QUERY = `query ZoneSettings($zoneTag: string) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      settings {
        ${DATASET} {
          enabled
          availableFields
          maxPageSize
          maxNumberOfFields
          maxDuration
          notOlderThan
        }
      }
    }
  }
}`;

const SETTINGS_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * The zone's own limits, cached for a day. They change when a plan changes, which is
 * rare enough that a day is fine and cheap enough that caching matters against the quota.
 */
export async function zoneSettings(env: Env, zoneId: string): Promise<ZoneSettings> {
  const cached = await env.DB.prepare(
    "SELECT * FROM analytics_settings WHERE zone_id = ?"
  )
    .bind(zoneId)
    .first<any>();

  const fresh =
    cached && Date.now() - Date.parse(`${cached.fetched_at}Z`) < SETTINGS_TTL_MS;

  if (fresh) {
    return {
      zoneId,
      enabled: cached.enabled === 1,
      availableFields: parseFields(cached.available_fields),
      maxPageSize: cached.max_page_size,
      maxNumberOfFields: cached.max_number_of_fields,
      maxDuration: cached.max_duration,
      notOlderThan: cached.not_older_than,
      fetchedAt: cached.fetched_at,
    };
  }

  const data = await graphql(env, SETTINGS_QUERY, { zoneTag: zoneId });
  const node = data?.viewer?.zones?.[0]?.settings?.[DATASET] ?? null;

  const settings: ZoneSettings = {
    zoneId,
    enabled: Boolean(node?.enabled),
    availableFields: Array.isArray(node?.availableFields) ? node.availableFields : [],
    maxPageSize: node?.maxPageSize ?? null,
    maxNumberOfFields: node?.maxNumberOfFields ?? null,
    maxDuration: node?.maxDuration ?? null,
    notOlderThan: node?.notOlderThan ?? null,
    fetchedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
  };

  await env.DB.prepare(
    `INSERT INTO analytics_settings
       (zone_id, dataset, enabled, available_fields, max_page_size, max_number_of_fields, max_duration, not_older_than, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(zone_id) DO UPDATE SET
       dataset = excluded.dataset,
       enabled = excluded.enabled,
       available_fields = excluded.available_fields,
       max_page_size = excluded.max_page_size,
       max_number_of_fields = excluded.max_number_of_fields,
       max_duration = excluded.max_duration,
       not_older_than = excluded.not_older_than,
       fetched_at = excluded.fetched_at`
  )
    .bind(
      settings.zoneId,
      DATASET,
      settings.enabled ? 1 : 0,
      JSON.stringify(settings.availableFields),
      settings.maxPageSize,
      settings.maxNumberOfFields,
      settings.maxDuration,
      settings.notOlderThan,
      settings.fetchedAt
    )
    .run();

  return settings;
}

function parseFields(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Does this zone's plan let us ask for the field? */
function can(settings: ZoneSettings, field: string): boolean {
  // A zone that reported no field list is treated as permissive — better to attempt the
  // query and fail loudly than to silently render an empty tab.
  if (settings.availableFields.length === 0) return true;
  return settings.availableFields.includes(field);
}

/* ------------------------------------------------------------------ *
 * Zone provisioning — one zone per project, in our account (decision 17)
 * ------------------------------------------------------------------ */

/**
 * Find or create the zone for a project's domain. Called when a project goes live; a
 * failure here must never block the launch, so it returns null and the caller moves on.
 */
export async function ensureZone(env: Env, domain: string): Promise<string | null> {
  if (!domain) return null;

  try {
    const existing = await fetch(
      `${base(env)}/zones?name=${encodeURIComponent(domain)}`,
      { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
    );
    if (existing.ok) {
      const body = (await existing.json()) as { result?: { id?: string }[] };
      const found = body.result?.find((z) => z.id)?.id;
      if (found) return found;
    }

    if (!env.CF_ACCOUNT_ID) return null;

    const created = await fetch(`${base(env)}/zones`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain, account: { id: env.CF_ACCOUNT_ID }, type: "full" }),
    });
    if (!created.ok) return null;

    const body = (await created.json()) as { result?: { id?: string } };
    return body.result?.id ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Traffic query
 * ------------------------------------------------------------------ */

export interface TrafficTotals {
  requests: number;
  pageViews: number;
  bytes: number;
  cachedBytes: number;
  cachedRequests: number;
  encryptedBytes: number;
  threats: number;
  uniques: number;
  /** null when the zone doesn't report sampling. > 1 means the figures are estimates. */
  sampleInterval: number | null;
}

export interface TrafficDay {
  date: string;
  requests: number;
  pageViews: number;
  bytes: number;
  cachedBytes: number;
  cachedRequests: number;
  uniques: number;
}

export interface TrafficBreakdown {
  countries: { name: string; requests: number; bytes: number; threats: number }[];
  statuses: { status: number; requests: number }[];
  browsers: { name: string; pageViews: number }[] | null;
}

export interface ZoneTraffic {
  totals: TrafficTotals;
  series: TrafficDay[];
  breakdown: TrafficBreakdown;
}

/**
 * One round trip, three aliased selections:
 *   totals     the whole window as a single row (adaptive groups)
 *   series     one row per day, for the chart
 *   breakdown  the same-window row, carrying the country / status / browser maps
 *
 * The maps are selected inside `totals` rather than as separate queries — they describe
 * the same window, so asking once is both cheaper against the quota and guaranteed to
 * agree with the headline numbers.
 */
export async function zoneTraffic(
  env: Env,
  zoneId: string,
  settings: ZoneSettings,
  window: { since: string; until: string; sinceTime: string; untilTime: string; days: number }
): Promise<ZoneTraffic> {
  const wantsSample = can(settings, "avg_sampleInterval");
  const wantsBrowsers = can(settings, "sum_browserMap") || can(settings, "dimensions_browserMap");
  const wantsCountries = can(settings, "sum_countryMap") || can(settings, "dimensions_countryMap");
  const wantsStatuses = can(settings, "sum_responseStatusMap") || can(settings, "dimensions_responseStatusMap");

  const mapFields = [
    wantsCountries ? "countryMap { bytes requests threats clientCountryName }" : "",
    wantsStatuses ? "responseStatusMap { requests edgeResponseStatus }" : "",
    wantsBrowsers ? "browserMap { pageViews uaBrowserFamily }" : "",
  ]
    .filter(Boolean)
    .join("\n            ");

  const query = `query ZoneTraffic($zoneTag: string, $since: Date, $until: Date, $sinceTime: Time, $untilTime: Time) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      totals: ${ADAPTIVE_DATASET}(limit: 1, filter: { datetime_geq: $sinceTime, datetime_leq: $untilTime }) {
        sum {
          requests
          pageViews
          bytes
          cachedBytes
          cachedRequests
          encryptedBytes
          threats
          ${mapFields}
        }
        uniq { uniques }
        ${wantsSample ? "avg { sampleInterval }" : ""}
      }
      series: ${DATASET}(
        orderBy: [date_ASC]
        limit: ${Math.min(Math.max(window.days, 1), 100)}
        filter: { date_geq: $since, date_leq: $until }
      ) {
        dimensions { date }
        sum { requests pageViews bytes cachedBytes cachedRequests }
        uniq { uniques }
      }
    }
  }
}`;

  const data = await graphql(env, query, {
    zoneTag: zoneId,
    since: window.since,
    until: window.until,
    sinceTime: window.sinceTime,
    untilTime: window.untilTime,
  });

  const zone = data?.viewer?.zones?.[0];
  if (!zone) throw new CloudflareError("That zone isn't visible to this token.");

  const total = zone.totals?.[0];
  const sum = total?.sum ?? {};
  const sampleInterval =
    wantsSample && typeof total?.avg?.sampleInterval === "number"
      ? total.avg.sampleInterval
      : null;

  const totals: TrafficTotals = {
    requests: num(sum.requests),
    pageViews: num(sum.pageViews),
    bytes: num(sum.bytes),
    cachedBytes: num(sum.cachedBytes),
    cachedRequests: num(sum.cachedRequests),
    encryptedBytes: num(sum.encryptedBytes),
    threats: num(sum.threats),
    uniques: num(total?.uniq?.uniques),
    sampleInterval,
  };

  const series: TrafficDay[] = (zone.series ?? []).map((row: any) => ({
    date: row?.dimensions?.date ?? "",
    requests: num(row?.sum?.requests),
    pageViews: num(row?.sum?.pageViews),
    bytes: num(row?.sum?.bytes),
    cachedBytes: num(row?.sum?.cachedBytes),
    cachedRequests: num(row?.sum?.cachedRequests),
    uniques: num(row?.uniq?.uniques),
  }));

  const countries = (Array.isArray(sum.countryMap) ? sum.countryMap : [])
    .map((c: any) => ({
      name: String(c?.clientCountryName ?? "Unknown"),
      requests: num(c?.requests),
      bytes: num(c?.bytes),
      threats: num(c?.threats),
    }))
    .sort((a: any, b: any) => b.requests - a.requests)
    .slice(0, 8);

  const statuses = (Array.isArray(sum.responseStatusMap) ? sum.responseStatusMap : [])
    .map((s: any) => ({ status: num(s?.edgeResponseStatus), requests: num(s?.requests) }))
    .sort((a: any, b: any) => b.requests - a.requests)
    .slice(0, 8);

  // null (not []) when the zone's plan doesn't offer the field — the tab then hides the
  // tile instead of showing an empty one, which would read as "nobody visited".
  const browsers = wantsBrowsers
    ? (Array.isArray(sum.browserMap) ? sum.browserMap : [])
        .map((b: any) => ({
          name: String(b?.uaBrowserFamily ?? "Unknown"),
          pageViews: num(b?.pageViews),
        }))
        .sort((a: any, b: any) => b.pageViews - a.pageViews)
        .slice(0, 6)
    : null;

  return { totals, series, breakdown: { countries, statuses, browsers } };
}

function num(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
