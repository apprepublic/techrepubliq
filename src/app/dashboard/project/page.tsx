"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, type AnalyticsPayload, type ProjectRow, type ServiceRow } from "@/lib/api";
import { ADDON_CATALOG, formatUsd, revisionLabel, tierById } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { Card, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/product-ui";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";

const tabs = ["Preview", "Services", "Analytics", "Database", "Email", "Migration"] as const;
type Tab = (typeof tabs)[number];

export default function ProjectPage() {
  const t = useTone();
  const [id, setId] = useState("");
  const [tab, setTab] = useState<Tab>("Preview");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [revisions, setRevisions] = useState({ included: 0, used: 0, purchased: 0 });
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [database, setDatabase] = useState<{ applicable: boolean; message?: string; records?: Record<string, number>; note?: string } | null>(null);
  const [emailCenter, setEmailCenter] = useState<{ mailbox: string | null; messages: { id: string; direction: "inbound" | "outbound"; from_addr: string; subject: string; body: string; sent_at: string; read_at: string | null }[]; unread: number } | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [addonOpen, setAddonOpen] = useState(false);
  const [migrationSent, setMigrationSent] = useState(false);
  const [migrationCode, setMigrationCode] = useState("");
  const [migrationOk, setMigrationOk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const pid = search.get("id") ?? "";
    const requestedTab = search.get("tab");
    setId(pid);
    if (requestedTab && tabs.some((item) => item.toLowerCase() === requestedTab)) {
      setTab(tabs.find((item) => item.toLowerCase() === requestedTab) ?? "Preview");
    }
    if (!pid) return;
    api.projects
      .get(pid)
      .then((response) => {
        setProject(response.project);
        setServices(response.services);
        setRevisions(response.revisions);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load project."));
  }, []);

  useEffect(() => {
    if (!id || !project) return;
    if (tab === "Analytics") {
      api.projects.analytics(id, "7d").then(setAnalytics).catch(() => setAnalytics(null));
    }
    if (tab === "Database") {
      api.projects.database(id).then(setDatabase).catch(() => setDatabase(null));
    }
    if (tab === "Email") {
      api.projects.email.list(id, "inbound").then(setEmailCenter).catch(() => setEmailCenter(null));
    }
  }, [id, project, tab]);

  const visibleTabs = useMemo(
    () => (services.some((service) => service.service_key === "email") ? tabs : tabs.filter((item) => item !== "Email")),
    [services]
  );

  const updateService = (service: ServiceRow) => {
    setServices((current) => current.map((item) => (item.id === service.id ? service : item)));
  };

  const launch = async () => {
    try {
      const response = await api.projects.launch(id);
      setProject(response.project);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not publish project.");
    }
  };

  const buyReviews = async (count: number) => {
    try {
      const response = await api.edits.buyReviews(id, count);
      setRevisions(response.revisions);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not purchase reviews.");
    }
  };

  if (!project) {
    return (
      <div>
        <p className={t.muted}>{error || "Loading project…"}</p>
        {error && <Link href="/dashboard" className="text-[14px] text-[#C8102E]">Back to projects</Link>}
      </div>
    );
  }

  const tier = tierById(project.tier_id);
  const isMobile = project.category === "app-development";
  const hasEmail = services.some((service) => service.service_key === "email");

  return (
    <div>
      <nav className={`mb-4 text-[13px] ${t.muted}`}>
        <Link href="/dashboard" className="no-underline hover:text-[#C8102E]">Projects</Link>
        <span className="mx-2">/</span>
        <span className={t.ink}>{project.name}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>{project.name}</h1>
          <p className={`mt-1 text-[13px] ${t.muted}`}>{project.category} · {tier?.name ?? project.tier_id} · {project.id}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className={`mb-6 flex gap-1 overflow-x-auto border-b ${t.border}`}>
        {visibleTabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`px-3 pb-3 text-[13px] font-medium ${tab === item ? "border-b-2 border-[#C8102E] text-[#C8102E]" : t.muted}`}>
            {item}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 text-[13px] text-[#8C2F1B]">{error}</p>}

      {tab === "Preview" && (
        <div className="space-y-4">
          <Card>
            {!project.preview_url ? (
              <>
                <p className={`text-[16px] font-semibold ${t.ink}`}>No preview available.</p>
                <p className={`mt-2 text-[14px] ${t.muted}`}>You&apos;ll get a TechRepubliQ subdomain — shareable, no watermark — when the first preview is ready.</p>
              </>
            ) : (
              <>
                <p className="text-[12px] uppercase tracking-wider text-[#C8102E]">Preview</p>
                <a href={project.preview_url} target="_blank" rel="noreferrer" className={`mt-2 block text-[16px] ${t.ink}`}>{project.preview_url}</a>
                {!project.launch_at && <PrimaryButton className="mt-5" onClick={launch}>Go Live / Publish</PrimaryButton>}
                {project.launch_at && <p className={`mt-4 text-[13px] ${t.ink}`}>Live{project.custom_domain ? ` on ${project.custom_domain}` : ""}.</p>}
              </>
            )}
          </Card>
          {isMobile && <Card><p className={`font-semibold ${t.ink}`}>Mobile</p><p className={`mt-2 text-[14px] ${t.muted}`}>UI/UX preview appears here before a build exists. After approval you&apos;ll receive a downloadable APK and optional store deployment.</p></Card>}
          {!project.launch_at && revisions.included + revisions.purchased - revisions.used > 0 && (
            <Card>
              <p className={`font-semibold ${t.ink}`}>Pre-launch reviews</p>
              <p className={`mt-2 text-[14px] ${t.muted}`}>{revisions.included + revisions.purchased - revisions.used} included reviews remaining on {tier?.name ?? project.tier_id}. Extra reviews are $10 for +2 or $15 for +3.</p>
              <div className="mt-3 flex gap-2">
                <button className={`rounded-full border px-3 py-1.5 text-[12px] ${t.border} ${t.ink}`} onClick={() => buyReviews(2)}>$10 → +2</button>
                <button className={`rounded-full border px-3 py-1.5 text-[12px] ${t.border} ${t.ink}`} onClick={() => buyReviews(3)}>$15 → +3</button>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "Services" && (
        <div className="space-y-3">
          <p className={`text-[14px] ${t.muted}`}>Hosting and backend are always included. Recurring add-ons cancel at the next renewal — never mid-cycle. A 7-day grace period applies if a quota lapses.</p>
          {services.map((service) => (
            <Card key={service.id} className="flex flex-wrap items-center justify-between gap-3">
              <div><p className={`font-semibold ${t.ink}`}>{service.name}</p><p className={`text-[12px] ${t.muted}`}>{formatUsd(service.monthly_cents)}/mo{service.renews_on ? ` · renews ${service.renews_on}` : ""}</p></div>
              <div className="flex items-center gap-2"><StatusBadge status={service.status} />{service.kind === "addon" && service.status === "Active" && <button className="text-[13px] text-[#8C2F1B]" onClick={() => setCancelId(service.id)}>Cancel</button>}</div>
            </Card>
          ))}
          <PrimaryButton onClick={() => setAddonOpen(true)}>Add additional add-on</PrimaryButton>
        </div>
      )}

      {tab === "Analytics" && (
        <Card>
          {!analytics ? <p className={t.muted}>Loading traffic analytics…</p> : analytics.connected ? (
            <div><p className={`font-semibold ${t.ink}`}>Last 7 days</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Requests", analytics.totals.requests], ["Page views", analytics.totals.pageViews], ["Bytes", analytics.totals.bytes], ["Unique visitors", analytics.totals.uniques]].map(([label, value]) => <div key={String(label)} className={`rounded-[12px] border p-3 ${t.border}`}><p className={`text-[12px] ${t.muted}`}>{label}</p><p className={`mt-1 text-[18px] font-semibold ${t.ink}`}>{Number(value).toLocaleString()}</p></div>)}</div></div>
          ) : <p className={t.muted}>{analytics.reason ?? "Analytics are not connected yet."}</p>}
        </Card>
      )}

      {tab === "Database" && (
        <Card>{!database ? <p className={t.muted}>Loading database…</p> : database.applicable ? <><p className={`font-semibold ${t.ink}`}>Your records</p><p className={`mt-1 text-[13px] ${t.muted}`}>{database.note ?? "This is your data — not our infrastructure."}</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{Object.entries(database.records ?? {}).map(([key, value]) => <div key={key} className={`rounded-[12px] border p-3 ${t.border}`}><p className={`text-[12px] ${t.muted}`}>{key}</p><p className={`mt-1 font-semibold ${t.ink}`}>{value}</p></div>)}</div></> : <p className={t.muted}>{database.message ?? "Database does not apply to this project."}</p>}</Card>
      )}

      {tab === "Email" && hasEmail && (
        <Card>{!emailCenter ? <p className={t.muted}>Loading Email Center…</p> : <><p className={`font-semibold ${t.ink}`}>Email Center</p><p className={`mt-1 text-[13px] ${t.muted}`}>{emailCenter.mailbox ?? "Mailbox pending domain setup."} · {emailCenter.unread} unread</p><div className="mt-4 space-y-2">{emailCenter.messages.map((message) => <div key={message.id} className={`rounded-[12px] border p-3 ${t.border}`}><p className={`text-[13px] font-medium ${t.ink}`}>{message.subject}</p><p className={`mt-1 text-[12px] ${t.muted}`}>{message.from_addr} · {message.body}</p></div>)}</div></>}</Card>
      )}

      {tab === "Migration" && (
        <Card>
          <p className={`font-semibold ${t.ink}`}>Cancel or migrate</p>
          <p className={`mt-2 text-[14px] leading-[1.6] ${t.muted}`}>Only the project owner can request this. We&apos;ll email an OTP to the account. Downloadable source is front-end only — never the backend or how it connects. No GitHub linking.</p>
          {!migrationSent && <PrimaryButton className="mt-4" onClick={async () => { try { await api.projects.requestMigration(id); setMigrationSent(true); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not send OTP."); } }}>Email me an OTP</PrimaryButton>}
          {migrationSent && !migrationOk && <div className="mt-4 space-y-3"><p className={`text-[13px] ${t.muted}`}>Enter the code we sent.</p><TextInput value={migrationCode} onChange={(event) => setMigrationCode(event.target.value)} placeholder="6-digit code" /><PrimaryButton disabled={migrationCode.length < 4} onClick={async () => { try { await api.projects.confirmMigration(id, migrationCode); setMigrationOk(true); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "That code is not valid."); } }}>Verify</PrimaryButton></div>}
          {migrationOk && <p className={`mt-4 text-[13px] ${t.ink}`}>Verified. The front-end bundle is ready to request from the team.</p>}
        </Card>
      )}

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel this service?">
        <p className={`text-[14px] ${t.muted}`}>Cancellation takes effect at the next renewal, not immediately.</p>
        <div className="mt-5 flex justify-end gap-2"><button className={t.muted} onClick={() => setCancelId(null)}>Keep it</button><PrimaryButton onClick={async () => { if (!cancelId) return; try { const response = await api.projects.cancelService(id, cancelId); updateService(response.service); setCancelId(null); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not cancel service."); } }}>Confirm cancel</PrimaryButton></div>
      </Modal>

      <Modal isOpen={addonOpen} onClose={() => setAddonOpen(false)} title="Add additional add-on">
        <div className="space-y-2">{ADDON_CATALOG.filter((addon) => !services.some((service) => service.service_key === addon.id)).map((addon) => <button key={addon.id} className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${t.border}`} onClick={async () => { try { const response = await api.projects.addService(id, addon.id); updateService(response.service); setAddonOpen(false); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not add service."); } }}><span><span className={`block text-[14px] font-medium ${t.ink}`}>{addon.label}</span><span className={`block text-[12px] ${t.muted}`}>{addon.example}</span></span><span className="text-[13px] text-[#C8102E]">Add</span></button>)}</div>
      </Modal>
    </div>
  );
}
