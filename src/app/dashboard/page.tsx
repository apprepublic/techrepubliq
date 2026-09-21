"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type ProjectRow, type TierNudge } from "@/lib/api";
import { serviceTitle } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { PrimaryLink } from "@/components/product-ui";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const t = useTone();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [nudges, setNudges] = useState<TierNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.projects
      .list()
      .then((response) => {
        setProjects(response.projects);
        setNudges(response.nudges);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Could not load projects.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Projects</h1>
          <p className={`mt-1 text-[14px] ${t.muted}`}>Everything being built or already live.</p>
        </div>
        <PrimaryLink href="/quote" className="!px-4 !py-2 text-[13px]">
          New project
        </PrimaryLink>
      </div>

      {nudges.length > 0 && (
        <div className="mb-5 space-y-2">
          {nudges.map((nudge) => (
            <div key={nudge.projectId} className="rounded-[16px] border border-amber-700/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-800">
              {nudge.name} is nearing its requests-per-day limit. Consider a tier upgrade; nothing is blocked.
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p className={t.muted}>Loading projects…</p>
      ) : error ? (
        <div className={`rounded-[20px] border p-8 text-center ${t.card}`}>
          <p className={t.muted}>{error}</p>
          <PrimaryLink href="/login" className="mt-5">Log in</PrimaryLink>
        </div>
      ) : projects.length === 0 ? (
        <div className={`rounded-[20px] border p-10 text-center ${t.card}`}>
          <p className={t.muted}>No projects yet.</p>
          <PrimaryLink href="/quote" className="mt-5">Get Started</PrimaryLink>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/project?id=${encodeURIComponent(project.id)}`}
              className={`block rounded-[20px] border p-5 no-underline transition-transform hover:-translate-y-0.5 ${t.card}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-[16px] font-semibold ${t.ink}`}>{project.name}</p>
                  <p className={`mt-1 text-[13px] ${t.muted}`}>
                    {serviceTitle(project.category)} · {project.tier_id} · {project.id}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
