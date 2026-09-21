"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type ProjectRow, type ServiceRow } from "@/lib/api";
import { formatUsd } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { StatusBadge } from "@/components/StatusBadge";

export default function SubscriptionsPage() {
  const t = useTone();
  const [rows, setRows] = useState<{ project: ProjectRow; service: ServiceRow }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.projects
      .list()
      .then(({ projects }) => {
        setRows(
          projects.flatMap((project) =>
            (project.services ?? [])
              .filter((service) => service.kind === "addon")
              .map((service) => ({ project, service }))
          )
        );
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load subscriptions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Subscriptions</h1>
      <p className={`mb-8 mt-1 text-[14px] ${t.muted}`}>
        Recurring project services. Each service renews separately and can be cancelled from its project.
      </p>
      {loading ? (
        <p className={t.muted}>Loading subscriptions…</p>
      ) : error ? (
        <p className={t.muted}>{error}</p>
      ) : rows.length === 0 ? (
        <p className={t.muted}>No recurring services yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ project, service }) => (
            <Link
              key={service.id}
              href={`/dashboard/project?id=${encodeURIComponent(project.id)}&tab=services`}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-[16px] border p-4 no-underline ${t.card}`}
            >
              <div>
                <p className={`text-[14px] font-semibold ${t.ink}`}>{service.name}</p>
                <p className={`text-[12px] ${t.muted}`}>{project.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[13px] tabular-nums ${t.muted}`}>
                  {formatUsd(service.monthly_cents)}/mo{service.renews_on ? ` · renews ${service.renews_on}` : ""}
                </span>
                <StatusBadge status={service.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
