"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProjects } from "@/lib/store";
import { formatUsd } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { StatusBadge } from "@/components/StatusBadge";

export default function SubscriptionsPage() {
  const t = useTone();
  const [rows, setRows] = useState<
    { projectId: string; project: string; name: string; monthly: number; renewsOn: string; status: "Active" | "Cancel at renewal" | "Grace period" }[]
  >([]);

  useEffect(() => {
    const list = listProjects().flatMap((p) =>
      p.services.map((s) => ({
        projectId: p.id,
        project: p.name,
        name: s.name,
        monthly: s.monthly,
        renewsOn: s.renewsOn,
        status: s.status,
      }))
    );
    setRows(list);
  }, []);

  return (
    <div>
      <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Subscriptions</h1>
      <p className={`mt-1 mb-8 text-[14px] ${t.muted}`}>
        Recurring project services. Next payment date is on each row. Cancel from the project.
      </p>
      {rows.length === 0 ? (
        <p className={t.muted}>No recurring services yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <Link
              key={`${r.projectId}-${r.name}-${i}`}
              href={`/dashboard/project?id=${r.projectId}&tab=services`}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-[16px] border p-4 no-underline ${t.card}`}
            >
              <div>
                <p className={`text-[14px] font-semibold ${t.ink}`}>{r.name}</p>
                <p className={`text-[12px] ${t.muted}`}>{r.project}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[13px] tabular-nums ${t.muted}`}>
                  {formatUsd(r.monthly)}/mo · renews {r.renewsOn}
                </span>
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
