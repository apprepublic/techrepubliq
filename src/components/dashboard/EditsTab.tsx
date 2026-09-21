"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { computeEditCents } from "@/lib/product";
import { formatUsd } from "@/lib/product";

interface EditsTabProps {
  projectId: string;
  status: string;
}

interface Overview {
  status: string;
  revisions: { included: number; used: number; purchased: number };
  subscription: {
    id: string;
    monthly_cents: number;
    edits_included: number | null;
    edits_remaining: number | null;
    renews_on: string | null;
    status: string;
  } | null;
  requests: {
    id: string;
    description: string;
    price_cents: number;
    billed_via: string;
    status: string;
    created_at: string;
  }[];
  packs: { cents: number; count: number }[];
  plans: { monthlyCents: number; edits: number | null }[];
}

/**
 * Revisions before launch, edits after it (PRD §5, §5A).
 *
 * The two are deliberately separate: extra reviews stop being purchasable the moment a
 * project goes live, because at that point changes are edits rather than revisions of an
 * unlaunched build.
 */
export function EditsTab({ projectId, status }: EditsTabProps) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [description, setDescription] = useState("");
  const [pages, setPages] = useState(0);
  const [components, setComponents] = useState(1);
  const [complexity, setComplexity] = useState<"standard" | "elevated" | "complex">("standard");

  const live = data ? data.revisions.included + data.revisions.purchased : 0;
  const isLive = status === "Live";

  const load = () => {
    api.edits
      .overview(projectId)
      .then(setData)
      .catch(() => setError("Couldn't load edits for this project."));
  };

  useEffect(load, [projectId]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work. Try again.");
    }
    setBusy(false);
  };

  if (!data) return <div className="h-48 w-full bg-accent-dim rounded-sm animate-pulse" />;

  const quoteCents = computeEditCents({ pages, components, complexity });
  const covered =
    data.subscription?.status === "Active" &&
    (data.subscription.edits_included === null || (data.subscription.edits_remaining ?? 0) > 0);

  return (
    <div className="space-y-lg">
      {error && <p className="text-sm text-error">{error}</p>}

      {/* Revisions — the pre-launch cycle */}
      <section className="border border-line rounded-sm p-lg">
        <div className="flex items-start justify-between gap-sm flex-wrap mb-md">
          <div>
            <h2 className="text-md font-display font-semibold text-ink">Pre-launch reviews</h2>
            <p className="text-sm text-slate mt-xs">
              {data.revisions.used} of {live} used
            </p>
          </div>
          <StatusBadge status={isLive ? "Live" : "In preview"} />
        </div>

        {isLive ? (
          <p className="text-sm text-slate">
            This project has launched, so the review cycle no longer applies. Changes from here
            are edits, below.
          </p>
        ) : (
          <div className="flex gap-sm flex-wrap">
            {data.packs.map((pack) => (
              <Button
                key={pack.count}
                variant="secondary"
                loading={busy}
                onClick={() => act(() => api.edits.buyReviews(projectId, pack.count))}
              >
                Buy {pack.count} more — {formatUsd(pack.cents)}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Monthly edit plan */}
      <section className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-sm">Monthly edits</h2>

        {data.subscription ? (
          <div className="mb-md">
            <p className="text-sm text-slate">
              {formatUsd(data.subscription.monthly_cents)}/mo ·{" "}
              {data.subscription.edits_included === null
                ? "unlimited edits"
                : `${data.subscription.edits_remaining ?? 0} of ${data.subscription.edits_included} left this month`}
              {data.subscription.renews_on ? ` · renews ${data.subscription.renews_on}` : ""}
            </p>
            {data.subscription.status === "Cancel at renewal" && (
              <p className="text-xs text-slate mt-xs">
                Ends at the next renewal. You keep whatever edits are left until then.
              </p>
            )}
            <p className="text-xs text-slate mt-xs">
              Unused edits roll over, up to one extra month&apos;s worth.
            </p>
            {data.subscription.status === "Active" && (
              <button
                onClick={() => act(() => api.edits.cancelSubscription(projectId))}
                disabled={busy}
                className="text-xs text-accent hover:text-accent-hover underline mt-sm disabled:opacity-50"
              >
                Cancel at renewal
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate mb-md">
            No plan yet. Edits are priced individually, or take a monthly bundle.
          </p>
        )}

        <div className="grid gap-sm sm:grid-cols-2">
          {data.plans.map((plan) => (
            <div key={plan.monthlyCents} className="border border-line rounded-sm p-md">
              <p className="text-sm text-ink">
                {formatUsd(plan.monthlyCents)}/mo
                <span className="text-slate"> · {plan.edits === null ? "unlimited" : `${plan.edits} edits`}</span>
              </p>
              <Button
                className="mt-sm"
                variant="secondary"
                loading={busy}
                disabled={data.subscription?.monthly_cents === plan.monthlyCents && data.subscription?.status === "Active"}
                onClick={() => act(() => api.edits.subscribe(projectId, plan.monthlyCents))}
              >
                {data.subscription?.monthly_cents === plan.monthlyCents && data.subscription?.status === "Active"
                  ? "Current plan"
                  : "Choose"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Request an edit */}
      <section className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-sm">Request an edit</h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What should change?"
          className="w-full border border-line rounded-sm p-sm text-sm mb-md bg-paper text-ink"
        />

        <div className="grid gap-sm sm:grid-cols-3 mb-md">
          <label className="text-sm text-slate">
            New pages
            <input
              type="number"
              min={0}
              value={pages}
              onChange={(e) => setPages(Math.max(0, Number(e.target.value)))}
              className="block w-full mt-xs border border-line rounded-sm px-sm py-xs text-sm bg-paper text-ink"
            />
          </label>
          <label className="text-sm text-slate">
            New components
            <input
              type="number"
              min={0}
              value={components}
              onChange={(e) => setComponents(Math.max(0, Number(e.target.value)))}
              className="block w-full mt-xs border border-line rounded-sm px-sm py-xs text-sm bg-paper text-ink"
            />
          </label>
          <label className="text-sm text-slate">
            Complexity
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as typeof complexity)}
              className="block w-full mt-xs border border-line rounded-sm px-sm py-xs text-sm bg-paper text-ink"
            >
              <option value="standard">Standard</option>
              <option value="elevated">Elevated</option>
              <option value="complex">Complex</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-sm flex-wrap">
          <p className="text-sm text-slate">
            {covered ? (
              <>
                Covered by your plan —{" "}
                {data.subscription?.edits_included === null
                  ? "unlimited edits"
                  : `${data.subscription?.edits_remaining ?? 0} left`}
              </>
            ) : (
              <>
                <span className="font-mono text-ink">{formatUsd(quoteCents)}</span>, charged to the
                card on file in the currency you paid with
              </>
            )}
          </p>
          <Button
            loading={busy}
            disabled={description.trim().length === 0}
            onClick={() =>
              act(() =>
                api.edits.request(projectId, { description, pages, components, complexity })
              )
            }
          >
            {covered ? "Use an edit" : `Request — ${formatUsd(quoteCents)}`}
          </Button>
        </div>
      </section>

      {/* History */}
      {data.requests.length > 0 && (
        <section className="border border-line rounded-sm p-lg">
          <h2 className="text-md font-display font-semibold text-ink mb-md">Requested</h2>
          <ul className="space-y-sm">
            {data.requests.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-sm flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{item.description}</p>
                  <p className="text-xs text-slate font-mono mt-xs">
                    {item.created_at.slice(0, 10)} ·{" "}
                    {item.billed_via === "subscription" ? "from your plan" : formatUsd(item.price_cents)}
                  </p>
                </div>
                <StatusBadge status={item.status === "Requested" ? "Queued" : "In Progress"} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
