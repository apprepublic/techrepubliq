"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { api, type ProjectRow, type ServiceRow } from "@/lib/api";
import { formatMoney } from "@/lib/payments/provider";
import { cn } from "@/lib/utils";
import { EditsTab } from "@/components/dashboard/EditsTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { EmailTab } from "@/components/dashboard/EmailTab";
import { ADDON_CATALOG } from "@/lib/product";

type Tab = "preview" | "services" | "edits" | "analytics" | "database" | "email";

const TABS: { id: Tab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "services", label: "Services" },
  { id: "edits", label: "Edits" },
  { id: "analytics", label: "Analytics" },
  { id: "database", label: "Database" },
];

/** §13 — the Email Center only exists for projects paying for the add-on. */
const EMAIL_TAB: { id: Tab; label: string } = { id: "email", label: "Email" };

interface Detail {
  project: ProjectRow;
  services: ServiceRow[];
  revisions: { included: number; used: number; purchased: number };
  installments: {
    planId: string;
    paid: number;
    count: number;
    currency: string;
    nextDueAt: string | null;
    nextAmountMinor: number | null;
    nextSeq: number | null;
    status: string;
  } | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ProjectPage() {
  // Read from the URL rather than useSearchParams: this page is statically exported, and
  // useSearchParams would demand a Suspense boundary for no benefit here.
  const [id, setId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("preview");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [migrationNote, setMigrationNote] = useState("");
  /** PRD §4.5 — cancelling a service needs a confirmation step, not one click. */
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  const load = () => {
    if (!id) return;
    api.projects
      .get(id)
      .then((res) => setDetail(res as Detail))
      .catch(() => setError("Couldn't load this project."));
  };

  useEffect(load, [id]);

  const launch = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      await api.projects.launch(detail.project.id);
      load();
    } catch {
      setError("Couldn't launch just now. Try again in a moment.");
    }
    setBusy(false);
  };

  const toggleService = async (service: ServiceRow) => {
    if (!detail) return;
    setBusy(true);
    try {
      if (service.status === "Active") await api.projects.cancelService(detail.project.id, service.id);
      else await api.projects.restoreService(detail.project.id, service.id);
      setConfirmingCancel(null);
      load();
    } catch {
      setError("Couldn't update that service.");
    }
    setBusy(false);
  };

  const addAddon = async (addonId: string) => {
    if (!detail || !addonId) return;
    setBusy(true);
    setError("");
    try {
      await api.projects.addService(detail.project.id, addonId);
      load();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("402")
          ? "Add-on pricing on your tier is arranged through Contact Sales."
          : "Couldn't add that add-on just now."
      );
    }
    setBusy(false);
  };

  const requestMigration = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      await api.projects.requestMigration(detail.project.id);
      setOtpSent(true);
    } catch {
      setError("Couldn't send the code.");
    }
    setBusy(false);
  };

  const confirmMigration = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const res = await api.projects.confirmMigration(detail.project.id, otpCode);
      setMigrationNote(res.bundle?.note ?? "Migration ready.");
      setOtpSent(false);
      setOtpCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code wasn't accepted.");
    }
    setBusy(false);
  };

  if (id === null) return <div className="h-64 w-full bg-accent-dim rounded-sm animate-pulse" />;

  if (!id) {
    return (
      <div className="text-center py-xl border border-line rounded-sm">
        <p className="text-base text-slate mb-md">Pick a project to open.</p>
        <Link href="/dashboard">
          <Button>Back to projects</Button>
        </Link>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="text-center py-xl border border-line rounded-sm">
        <p className="text-base text-error mb-md">{error}</p>
        <Link href="/dashboard">
          <Button>Back to projects</Button>
        </Link>
      </div>
    );
  }

  if (!detail) return <div className="h-64 w-full bg-accent-dim rounded-sm animate-pulse" />;

  const { project, services, revisions, installments } = detail;
  const isMobile = project.category === "app-development";
  const hasEmail = services.some((s) => s.service_key === "email" && s.status === "Active");

  // PRD §3.2 — the dropdown offers what isn't already on the project. Re-adding an
  // existing one restores it, so a cancelled add-on is offered again rather than hidden.
  const installedAddons = new Set(
    services
      .filter((s) => s.kind === "addon" && s.service_key && s.status === "Active")
      .map((s) => s.service_key as string)
  );
  const availableAddons = ADDON_CATALOG.filter((a) => !installedAddons.has(a.id));
  const tabs = hasEmail ? [...TABS, EMAIL_TAB] : TABS;

  return (
    <div>
      <Link
        href="/dashboard"
        className="text-sm text-slate hover:text-accent no-underline inline-block mb-sm"
      >
        ← Projects
      </Link>

      <div className="flex items-baseline justify-between gap-sm flex-wrap mb-lg">
        <div>
          <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink">
            {project.name}
          </h1>
          <p className="font-mono text-xs text-slate mt-xs">
            {project.id} · {project.tier_id} · {project.category.replace(/-/g, " ")}
          </p>
        </div>
        <StatusBadge status={project.status as ProjectStatus} />
      </div>

      {installments && (
        <div className="border border-line rounded-sm p-md mb-lg bg-paper">
          <p className="text-sm text-ink">
            Development fee: {installments.paid} of {installments.count} paid
            {installments.nextDueAt && installments.nextAmountMinor !== null && (
              <>
                {" · next "}
                <span className="font-mono">
                  {formatMoney(installments.nextAmountMinor, installments.currency)}
                </span>
                {" on "}
                {formatDate(installments.nextDueAt)}
              </>
            )}
          </p>
          {installments.status === "Defaulted" && (
            <p className="text-sm text-error mt-xs">
              This plan is in default — we&apos;ll be in touch about settling the balance.
            </p>
          )}
        </div>
      )}

      <nav className="flex border-b border-line mb-lg flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "px-md pb-sm text-sm font-body transition-colors duration-150",
              tab === item.id
                ? "text-accent border-b-2 border-accent"
                : "text-slate hover:text-ink"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error && <p className="text-sm text-error mb-md">{error}</p>}

      {tab === "preview" && (
        <div className="space-y-lg">
          <div className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-sm">Preview</h2>
            {project.preview_url ? (
              <p className="text-sm text-slate mb-md">
                <a
                  href={project.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-hover underline font-mono"
                >
                  {project.preview_url}
                </a>
              </p>
            ) : (
              <p className="text-sm text-slate mb-md">
                {project.status === "Queued"
                  ? "No preview available. You'll get a link here the moment the build starts."
                  : "No preview available."}
              </p>
            )}

            <div className="flex gap-sm flex-wrap">
              {project.status !== "Live" && (
                <Button onClick={launch} loading={busy}>
                  {project.status === "Queued" ? "Start build" : "Go live"}
                </Button>
              )}
              {project.status === "Live" && project.custom_domain && (
                <span className="text-sm text-slate font-mono">{project.custom_domain}</span>
              )}
            </div>

            {project.launch_at && (
              <p className="text-xs text-slate mt-md">Launched {formatDate(project.launch_at)}</p>
            )}
          </div>

          {isMobile && (
            <div className="border border-line rounded-sm p-lg">
              <h2 className="text-md font-display font-semibold text-ink mb-sm">Mobile build</h2>
              <p className="text-sm text-slate">
                UI/UX preview first, then a downloadable APK, then store deployment — each step shows
                up here as it&apos;s ready.
              </p>
            </div>
          )}

          <div className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-sm">Pre-launch reviews</h2>
            <p className="text-sm text-slate">
              {revisions.used} of {revisions.included + revisions.purchased} used ·{" "}
              <button
                onClick={() => setTab("edits")}
                className="text-accent hover:text-accent-hover underline"
              >
                {project.status === "Live" ? "request an edit" : "buy more"}
              </button>
            </p>
          </div>
        </div>
      )}

      {tab === "edits" && <EditsTab projectId={project.id} status={project.status} />}

      {tab === "services" && (
        <div className="space-y-md">
          {services.length === 0 && <p className="text-sm text-slate">No services on this project.</p>}

          {services.map((service) => (
            <div key={service.id} className="border border-line rounded-sm p-md">
              <div className="flex items-start justify-between gap-sm flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{service.name}</p>
                  <p className="text-xs text-slate font-mono mt-xs">
                    ${(service.monthly_cents / 100).toLocaleString()}/mo
                    {service.renews_on ? ` · renews ${formatDate(service.renews_on)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <StatusBadge status={service.status as ProjectStatus} />
                  {service.kind === "addon" && (
                    <button
                      onClick={() =>
                        service.status === "Active"
                          ? // PRD §4.5 — cancelling asks first; restoring is safe to do directly.
                            setConfirmingCancel(service.id)
                          : toggleService(service)
                      }
                      disabled={busy}
                      className="text-xs text-accent hover:text-accent-hover underline disabled:opacity-50"
                    >
                      {service.status === "Active" ? "Cancel" : "Keep it"}
                    </button>
                  )}
                </div>
              </div>

              {/* PRD §4.5 — the confirmation prompt, before anything is cancelled. */}
              {confirmingCancel === service.id && (
                <div className="mt-sm p-sm border border-error rounded-sm">
                  <p className="text-xs text-ink mb-sm">
                    You&apos;re about to cancel {service.name} — it will no longer be available on
                    your app.
                    {service.renews_on
                      ? ` It keeps running until ${formatDate(service.renews_on)}, and nothing changes until then.`
                      : ""}
                  </p>
                  <div className="flex items-center gap-sm">
                    <button
                      onClick={() => toggleService(service)}
                      disabled={busy}
                      className="text-xs font-medium text-white bg-error hover:opacity-90 px-sm py-xs rounded-sm disabled:opacity-50"
                    >
                      Cancel this service
                    </button>
                    <button
                      onClick={() => setConfirmingCancel(null)}
                      disabled={busy}
                      className="text-xs text-slate hover:text-ink underline disabled:opacity-50"
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              )}

              {service.status === "Cancel at renewal" && (
                <p className="text-xs text-slate mt-sm">
                  Runs until {formatDate(service.renews_on)}, then stops. Nothing changes until then.
                </p>
              )}
              {service.status === "Grace period" && (
                <p className="text-xs text-error mt-sm">
                  Payment overdue — service continues until {formatDate(service.grace_until ?? null)}.
                </p>
              )}
            </div>
          ))}

          {/* PRD §3.2 / §9.2 — the same "Add additional add-on" control the quote page
              offers, still available once the project is live. */}
          <div className="border border-line rounded-sm p-md bg-paper">
            <p className="text-sm text-slate mb-sm">
              Hosting, backend and monitoring are always included. Anything else you switch on
              here joins the project straight away and bills from your next renewal.
            </p>
            <select
              value=""
              onChange={(e) => e.target.value && addAddon(e.target.value)}
              disabled={busy || availableAddons.length === 0}
              className="w-full max-w-[340px] border border-line rounded-sm bg-canvas px-sm py-xs text-sm text-ink disabled:opacity-50"
              aria-label="Add additional add-on"
            >
              <option value="">
                {availableAddons.length === 0
                  ? "Every add-on is already on this project"
                  : "Add additional add-on…"}
              </option>
              {availableAddons.map((addon) => (
                <option key={addon.id} value={addon.id}>
                  {addon.label} — {addon.example}
                </option>
              ))}
            </select>
          </div>

          <div className="border border-line rounded-sm p-md">
            <h3 className="text-sm font-display font-semibold text-ink mb-sm">Move this project</h3>
            <p className="text-xs text-slate mb-md">
              Owner-only and verified by email. You get the front-end bundle; hosting, backend and
              database stay with us.
            </p>
            {migrationNote ? (
              <p className="text-sm text-ink">{migrationNote}</p>
            ) : otpSent ? (
              <div className="flex gap-sm flex-wrap items-center">
                <input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  inputMode="numeric"
                  placeholder="6-digit code"
                  className="border border-line rounded-sm px-sm py-xs text-sm font-mono w-[140px]"
                />
                <Button onClick={confirmMigration} loading={busy}>
                  Confirm
                </Button>
              </div>
            ) : (
              <Button onClick={requestMigration} loading={busy}>
                Email me a code
              </Button>
            )}
          </div>
        </div>
      )}

      {tab === "analytics" && <AnalyticsTab projectId={project.id} status={project.status} />}

      {tab === "database" && <DatabaseTab projectId={project.id} />}

      {tab === "email" && hasEmail && <EmailTab projectId={project.id} />}
    </div>
  );
}

function DatabaseTab({ projectId }: { projectId: string }) {
  const [state, setState] = useState<
    { applicable: boolean; message?: string; records?: Record<string, number>; note?: string } | null
  >(null);

  useEffect(() => {
    api.projects
      .database(projectId)
      .then(setState)
      .catch(() => setState(null));
  }, [projectId]);

  if (!state) return <div className="h-24 w-full bg-accent-dim rounded-sm animate-pulse" />;

  if (!state.applicable) {
    return (
      <div className="border border-line rounded-sm p-lg">
        <p className="text-sm text-slate">{state.message ?? "Not applicable to this project."}</p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-sm p-lg">
      <h2 className="text-md font-display font-semibold text-ink mb-sm">Database</h2>
      <ul className="space-y-xs text-sm text-slate">
        {Object.entries(state.records ?? {}).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
            <span className="font-mono text-ink">{value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {state.note && <p className="text-xs text-slate mt-md">{state.note}</p>}
    </div>
  );
}
