"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProject, saveProject, type StoredProject } from "@/lib/store";
import { addonCatalog, addonMonthly, extraReviews, formatUsd, serviceTitle, tiers } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { Card, PrimaryButton, TextArea, TextInput } from "@/components/product-ui";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";

const tabs = ["Preview", "Services", "Analytics", "Database", "Email", "Migration"] as const;
type Tab = (typeof tabs)[number];

export default function ProjectPage() {
  const t = useTone();
  const [id, setId] = useState("");
  const [tab, setTab] = useState<Tab>("Preview");
  const [project, setProject] = useState<StoredProject | undefined>();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [addonOpen, setAddonOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpOk, setOtpOk] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [editQuote, setEditQuote] = useState<number | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pid = sp.get("id") ?? "";
    const t0 = sp.get("tab");
    setId(pid);
    if (t0 && tabs.map((x) => x.toLowerCase()).includes(t0)) {
      setTab((tabs.find((x) => x.toLowerCase() === t0) as Tab) ?? "Preview");
    }
    setProject(getProject(pid));
  }, []);

  const persist = (next: StoredProject) => {
    saveProject(next);
    setProject(next);
  };

  const visibleTabs = useMemo(() => {
    if (!project) return tabs;
    return tabs.filter((x) => (x === "Email" ? project.hasEmail : true));
  }, [project]);

  if (!project) {
    return (
      <div>
        <p className={t.muted}>Project not found.</p>
        <Link href="/dashboard" className="text-[#C8102E] text-[14px]">
          Back to projects
        </Link>
      </div>
    );
  }

  const tier = tiers.find((x) => x.id === project.tierId) ?? tiers[1];

  return (
    <div>
      <nav className={`mb-4 text-[13px] ${t.muted}`}>
        <Link href="/dashboard" className="no-underline hover:text-[#C8102E]">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className={t.ink}>{project.name}</span>
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>{project.name}</h1>
          <p className={`mt-1 text-[13px] ${t.muted}`}>
            {serviceTitle(project.category)} · {tier.name} · {project.id}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className={`flex gap-1 overflow-x-auto mb-6 border-b ${t.border}`}>
        {visibleTabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-3 pb-3 text-[13px] font-medium ${tab === item ? "text-[#C8102E] border-b-2 border-[#C8102E]" : t.muted}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Preview" && (
        <div className="space-y-4">
          {!project.previewUrl ? (
            <Card>
              <p className={`text-[16px] font-semibold ${t.ink}`}>No preview available.</p>
              <p className={`mt-2 text-[14px] ${t.muted}`}>
                We haven’t built this yet. You’ll get a TechRepubliQ subdomain — shareable, no watermark — when the first preview is ready.
              </p>
            </Card>
          ) : (
            <Card>
              <p className={`text-[12px] uppercase tracking-wider text-[#C8102E]`}>Preview</p>
              <a href={project.previewUrl} className={`mt-2 block text-[16px] ${t.ink}`} target="_blank" rel="noreferrer">
                {project.previewUrl}
              </a>
              <p className={`mt-2 text-[13px] ${t.muted}`}>No watermark. Share it with anyone.</p>
              {!project.launched && (
                <PrimaryButton
                  className="mt-5"
                  onClick={() => persist({ ...project, launched: true, status: "Live" })}
                >
                  Go Live / Publish
                </PrimaryButton>
              )}
              {project.launched && (
                <p className={`mt-4 text-[13px] ${t.ink}`}>Live{project.customDomain ? ` on ${project.customDomain}` : ""}.</p>
              )}
            </Card>
          )}
          {project.isMobile && (
            <Card>
              <p className={`font-semibold ${t.ink}`}>Mobile</p>
              <p className={`mt-2 text-[14px] ${t.muted}`}>
                {project.previewUrl
                  ? "UI/UX preview is ready. After approval you’ll get a downloadable APK. Store deployment proceeds if purchased."
                  : "UI/UX preview appears here before a build exists."}
              </p>
              {project.previewUrl && (
                <PrimaryButton className="mt-4" onClick={() => undefined}>
                  Download APK
                </PrimaryButton>
              )}
            </Card>
          )}
          {!project.launched && project.revisionsLeft != null && (
            <Card>
              <p className={`font-semibold ${t.ink}`}>Pre-launch reviews</p>
              <p className={`mt-2 text-[14px] ${t.muted}`}>
                {project.revisionsLeft} included reviews remaining on {tier.name}. Extra reviews: $10 for +2 or $15 for +3.
              </p>
              <div className="mt-3 flex gap-2">
                {extraReviews.map((x) => (
                  <button
                    key={x.id}
                    className={`rounded-full border px-3 py-1.5 text-[12px] ${t.border} ${t.ink}`}
                    onClick={() =>
                      persist({ ...project, revisionsLeft: (project.revisionsLeft ?? 0) + x.extra })
                    }
                  >
                    ${x.price} → +{x.extra}
                  </button>
                ))}
              </div>
            </Card>
          )}
          {project.launched && (
            <Card>
              <p className={`font-semibold ${t.ink}`}>Post-launch edit</p>
              <p className={`mt-1 text-[13px] ${t.muted}`}>
                Pay-per-edit uses the same page/component math as the original build — price does not change by tier.
              </p>
              <TextArea
                className="mt-3"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Describe the change…"
              />
              <PrimaryButton
                className="mt-3"
                disabled={editNote.trim().length < 8}
                onClick={() => setEditQuote(500 + editNote.length)}
              >
                Price this edit
              </PrimaryButton>
              {editQuote != null && (
                <p className={`mt-3 text-[14px] ${t.ink}`}>Quoted {formatUsd(editQuote)} for this edit.</p>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === "Services" && (
        <div className="space-y-3">
          <p className={`text-[14px] ${t.muted}`}>
            Hosting and backend are always included. Recurring add-ons cancel at the next renewal — never mid-cycle. 7-day grace if a quota lapses.
          </p>
          {project.services.length === 0 && <p className={t.muted}>No extra services on this project.</p>}
          {project.services.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`font-semibold ${t.ink}`}>{s.name}</p>
                <p className={`text-[12px] ${t.muted}`}>
                  {formatUsd(s.monthly)}/mo · renews {s.renewsOn}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={s.status} />
                {s.status === "Active" && (
                  <button className="text-[13px] text-[#8C2F1B]" onClick={() => setCancelId(s.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </Card>
          ))}
          <PrimaryButton onClick={() => setAddonOpen(true)}>Add additional add-on</PrimaryButton>
        </div>
      )}

      {tab === "Analytics" && (
        <Card>
          {project.isMobile ? (
            <p className={t.muted}>
              Mobile analytics appear after a build exists. Until then, use the UI/UX preview on the Preview tab.
            </p>
          ) : project.status === "Queued" ? (
            <p className={t.muted}>Traffic analytics start after the preview is live.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Visits / 7d", "12,404"],
                ["Quota used", "18%"],
                ["Next check", "Daily"],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className={`text-[12px] ${t.muted}`}>{l}</p>
                  <p className={`mt-1 font-display text-[22px] ${t.ink}`}>{v}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "Database" && (
        <Card>
          {project.hasDatabase ? (
            <div>
              <p className={`font-semibold ${t.ink}`}>Your records</p>
              <p className={`mt-1 text-[13px] ${t.muted}`}>
                This is your data — not our infrastructure. Vendors stay confidential.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className={`text-left ${t.muted}`}>
                      <th className="pb-2">Record</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["usr_18", "User", "Today"],
                      ["ord_04", "Order", "Yesterday"],
                    ].map((row) => (
                      <tr key={row[0]} className={t.border}>
                        {row.map((c) => (
                          <td key={c} className={`py-2 border-t ${t.border} ${t.ink}`}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className={t.muted}>Database doesn’t apply to this project (no backend data model).</p>
          )}
        </Card>
      )}

      {tab === "Email" && project.hasEmail && (
        <Card>
          <p className={`font-semibold ${t.ink}`}>Email Center</p>
          <p className={`mt-1 text-[13px] ${t.muted}`}>
            Inbox, sent, and compose from this project’s domain address. The mail platform stays confidential.
          </p>
          <div className={`mt-4 rounded-[12px] border p-3 text-[13px] ${t.border} ${t.muted}`}>
            From: hello@{project.customDomain || "project.techrepubliq.app"}
          </div>
        </Card>
      )}

      {tab === "Migration" && (
        <Card>
          <p className={`font-semibold ${t.ink}`}>Cancel or migrate</p>
          <p className={`mt-2 text-[14px] leading-[1.6] ${t.muted}`}>
            Only the project owner can request this. We’ll email an OTP to the account. Downloadable source is front-end only — never the backend or how it connects. No GitHub linking; files download as a bundle.
          </p>
          {!otpSent && (
            <PrimaryButton className="mt-4" onClick={() => setOtpSent(true)}>
              Email me an OTP
            </PrimaryButton>
          )}
          {otpSent && !otpOk && (
            <div className="mt-4 space-y-3">
              <p className={`text-[13px] ${t.muted}`}>Enter the code we sent (use 123456 in this preview).</p>
              <TextInput value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
              <PrimaryButton disabled={otp.length < 4} onClick={() => setOtpOk(otp === "123456" || otp.length === 6)}>
                Verify
              </PrimaryButton>
            </div>
          )}
          {otpOk && (
            <PrimaryButton className="mt-4" onClick={() => undefined}>
              Download front-end bundle
            </PrimaryButton>
          )}
        </Card>
      )}

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel this service?">
        <p className={`text-[14px] ${t.muted}`}>
          You’re about to cancel this service — it will no longer be available on your app. Cancellation takes effect at the next renewal, not immediately.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className={t.muted} onClick={() => setCancelId(null)}>
            Keep it
          </button>
          <PrimaryButton
            onClick={() => {
              persist({
                ...project,
                services: project.services.map((s) =>
                  s.id === cancelId ? { ...s, status: "Cancel at renewal" } : s
                ),
              });
              setCancelId(null);
            }}
          >
            Confirm cancel
          </PrimaryButton>
        </div>
      </Modal>

      <Modal isOpen={addonOpen} onClose={() => setAddonOpen(false)} title="Add additional add-on">
        <div className="space-y-2">
          {addonCatalog
            .filter((a) => !project.services.some((s) => s.id === a.id))
            .map((a) => (
              <button
                key={a.id}
                className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-3 text-left ${t.border}`}
                onClick={() => {
                  persist({
                    ...project,
                    services: [
                      ...project.services,
                      {
                        id: a.id,
                        name: a.name,
                        monthly: addonMonthly(a, tier),
                        status: "Active",
                        renewsOn: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                      },
                    ],
                    hasEmail: project.hasEmail || a.id === "email",
                  });
                  setAddonOpen(false);
                }}
              >
                <span>
                  <span className={`block text-[14px] font-medium ${t.ink}`}>{a.name}</span>
                  <span className={`block text-[12px] ${t.muted}`}>{a.blurb}</span>
                </span>
                <span className="text-[13px] text-[#C8102E]">{formatUsd(addonMonthly(a, tier))}/mo</span>
              </button>
            ))}
        </div>
      </Modal>
    </div>
  );
}
