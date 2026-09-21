"use client";

import { useEffect, useState } from "react";
import { api, type AnalyticsPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * §12 — traffic, straight from the project's Cloudflare zone.
 *
 * Two promises this tab keeps:
 *
 * 1. **It only shows what Cloudflare actually provides.** Bounce rate, session duration,
 *    UTM attribution and live-visitor counts are not in the zone data, so they are
 *    absent rather than approximated. Top pages, referrers and Core Web Vitals need the
 *    RUM beacon, which v1 deliberately doesn't install (decision 13) — they're deferred,
 *    not faked.
 *
 * 2. **It says when a number isn't exact.** If Cloudflare sampled the data, every tile
 *    carries an "Estimated" chip. If the live query failed and these numbers came from
 *    our own nightly roll-up, they're marked stale. A confident wrong number is worse
 *    than an admitted approximation.
 */

function count(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  return value.toLocaleString();
}

function bytes(value: number): string {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size < 10 && unit > 0 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}

function percent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
}

/** Cloudflare returns two-letter country codes; these turn them into names. */
function countryName(code: string): string {
  if (code.length !== 2) return code;
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function shortDate(value: string): string {
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function AnalyticsTab({
  projectId,
  status,
}: {
  projectId: string;
  status: string;
}) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
    api.projects
      .analytics(projectId, range)
      .then(setData)
      .catch(() => setError("Couldn't load traffic for this project."));
  }, [projectId, range]);

  if (error) {
    return (
      <div className="border border-line rounded-sm p-lg">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="h-64 w-full bg-accent-dim rounded-sm animate-pulse" />;

  // A mobile app has no zone. Say so, and show where the build stands instead of
  // rendering an empty chart that reads as "nobody uses your app".
  if (data.mobile) {
    return (
      <div className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-sm">
          No hosted site to measure
        </h2>
        <p className="text-sm text-slate">
          Traffic analytics read a live domain. This project is an app, so there&apos;s no
          zone to query — build progress lives on the Preview tab. If you also have a
          marketing site or an API on this project, its numbers will show up here.
        </p>
        <p className="text-sm text-slate mt-md">
          Build status: <span className="text-ink">{status}</span>
        </p>
      </div>
    );
  }

  if (!data.connected || data.series.length === 0) {
    return (
      <div className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-sm">Traffic</h2>
        <p className="text-sm text-slate">
          {data.reason ?? "No traffic recorded in this period yet."}
        </p>
      </div>
    );
  }

  const peak = Math.max(...data.series.map((day) => day.requests), 1);
  const unavailable = data.ranges.filter((r) => !r.available);

  return (
    <div className="space-y-lg">
      {/* Range picker + honesty chips */}
      <div className="flex items-center justify-between gap-sm flex-wrap">
        <div className="flex border border-line rounded-sm overflow-hidden">
          {data.ranges.map((option) => (
            <button
              key={option.id}
              onClick={() => setRange(option.id)}
              disabled={!option.available}
              title={option.reason ?? undefined}
              className={cn(
                "px-md py-xs text-sm transition-colors duration-150",
                range === option.id ? "bg-accent-dim text-accent" : "text-slate hover:text-ink",
                !option.available && "opacity-40 cursor-not-allowed"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-sm flex-wrap">
          {data.stale && (
            <span className="text-xs font-mono uppercase tracking-wider text-slate border border-line rounded-sm px-sm py-xs">
              Last known figures
            </span>
          )}
          {data.sampled && (
            <span className="text-xs font-mono uppercase tracking-wider text-slate border border-line rounded-sm px-sm py-xs">
              Estimated — sampled data
            </span>
          )}
        </div>
      </div>

      {data.stale && (
        <p className="text-xs text-slate">
          The live reading didn&apos;t respond, so these are the figures from our own nightly
          record. They&apos;re complete, just not up to the minute.
        </p>
      )}

      {unavailable.length > 0 && (
        <p className="text-xs text-slate">
          {unavailable.map((r) => r.reason).filter(Boolean).join(" ")}
        </p>
      )}

      {/* Headline tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-md">
        <Tile label="Requests" value={count(data.totals.requests)} />
        <Tile
          label="Unique visitors"
          value={count(data.totals.uniques)}
          note={data.totals.uniquesAreEstimated ? "daily peak" : undefined}
        />
        <Tile label="Page views" value={count(data.totals.pageViews)} />
        <Tile
          label="Bandwidth"
          value={bytes(data.totals.bytes)}
          note={data.totals.cachedBytes > 0 ? `${bytes(data.totals.cachedBytes)} cached` : undefined}
        />
        <Tile label="Cache hit ratio" value={percent(data.totals.cacheRatio)} />
      </div>

      {/* Traffic over time */}
      <section className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-md">Requests per day</h2>
        <div className="flex items-end gap-[3px] h-[120px]">
          {data.series.map((day) => (
            <div
              key={day.date}
              title={`${shortDate(day.date)} — ${day.requests.toLocaleString()} requests`}
              className="flex-1 bg-accent-dim hover:bg-accent transition-colors duration-150 rounded-t-[2px] min-w-[4px]"
              style={{ height: `${Math.max((day.requests / peak) * 100, 2)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-sm text-xs text-slate font-mono">
          <span>{shortDate(data.series[0]?.date ?? "")}</span>
          <span>peak {count(peak)}/day</span>
          <span>{shortDate(data.series[data.series.length - 1]?.date ?? "")}</span>
        </div>
      </section>

      {/* Tier headroom — a suggestion, never a restriction (decision 15) */}
      {data.tier && (
        <section className="border border-line rounded-sm p-lg">
          <h2 className="text-md font-display font-semibold text-ink mb-sm">Tier headroom</h2>
          {data.tier.requestsPerDay === null ? (
            <p className="text-sm text-slate">
              Your plan has no published traffic ceiling — it&apos;s negotiated. Averaging{" "}
              <span className="font-mono text-ink">
                {data.tier.averagePerDay.toLocaleString()}
              </span>{" "}
              requests a day over this period.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate">
                Averaging{" "}
                <span className="font-mono text-ink">
                  {data.tier.averagePerDay.toLocaleString()}
                </span>{" "}
                of {data.tier.requestsPerDay.toLocaleString()} requests a day on the{" "}
                <span className="capitalize">{data.tier.id}</span> tier.
              </p>
              <div className="mt-sm h-[6px] w-full bg-accent-dim rounded-sm overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-sm transition-all duration-300",
                    (data.tier.ratio ?? 0) >= 1 ? "bg-error" : "bg-accent"
                  )}
                  style={{ width: `${Math.min((data.tier.ratio ?? 0) * 100, 100)}%` }}
                />
              </div>
              {(data.tier.ratio ?? 0) >= 0.8 && (
                <p className="text-xs text-slate mt-sm">
                  Nothing is throttled or switched off when you cross this line — it&apos;s
                  how we know when a bigger tier would give you more room. Upgrades take
                  effect immediately and are never reversed.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <section className="border border-line rounded-sm p-lg">
          <h2 className="text-md font-display font-semibold text-ink mb-md">Top countries</h2>
          {data.countries.length === 0 ? (
            <p className="text-sm text-slate">No country breakdown in this period.</p>
          ) : (
            <ul className="space-y-sm">
              {data.countries.map((country) => (
                <li key={country.name}>
                  <div className="flex justify-between text-sm mb-xs">
                    <span className="text-ink truncate">{countryName(country.name)}</span>
                    <span className="font-mono text-slate">{count(country.requests)}</span>
                  </div>
                  <div className="h-[3px] w-full bg-accent-dim rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{
                        width: `${(country.requests / Math.max(data.countries[0].requests, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-line rounded-sm p-lg">
          <h2 className="text-md font-display font-semibold text-ink mb-md">Response status</h2>
          {data.statuses.length === 0 ? (
            <p className="text-sm text-slate">No status breakdown in this period.</p>
          ) : (
            <ul className="space-y-xs">
              {data.statuses.map((entry) => (
                <li key={entry.status} className="flex justify-between text-sm">
                  <span className="font-mono text-ink">{entry.status}</span>
                  <span className="font-mono text-slate">{count(entry.requests)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* null, not empty, when the zone's plan doesn't offer the field — an empty list
            would read as "nobody visited" rather than "we can't tell you". */}
        {data.browsers !== null && (
          <section className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">Browsers</h2>
            {data.browsers.length === 0 ? (
              <p className="text-sm text-slate">No browser breakdown in this period.</p>
            ) : (
              <ul className="space-y-xs">
                {data.browsers.map((browser) => (
                  <li key={browser.name} className="flex justify-between text-sm">
                    <span className="text-ink truncate">{browser.name}</span>
                    <span className="font-mono text-slate">{count(browser.pageViews)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {data.totals.threats > 0 && (
        <p className="text-xs text-slate">
          {data.totals.threats.toLocaleString()} request
          {data.totals.threats === 1 ? "" : "s"} were stopped by the firewall in this period.
        </p>
      )}
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-line rounded-sm p-md">
      <p className="text-xs text-slate uppercase tracking-wider mb-xs">{label}</p>
      <p className="font-mono text-[20px] leading-[28px] text-ink">{value}</p>
      {note && <p className="text-xs text-slate mt-xs">{note}</p>}
    </div>
  );
}
