"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProjects, type StoredProject } from "@/lib/store";
import { serviceTitle } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { PrimaryLink } from "@/components/product-ui";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const t = useTone();
  const [projects, setProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Projects</h1>
          <p className={`mt-1 text-[14px] ${t.muted}`}>Everything being built or already live.</p>
        </div>
        <PrimaryLink href="/quote" className="!py-2 !px-4 text-[13px]">
          New project
        </PrimaryLink>
      </div>

      {projects.length === 0 ? (
        <div className={`rounded-[20px] border p-10 text-center ${t.card}`}>
          <p className={t.muted}>No projects yet.</p>
          <PrimaryLink href="/quote" className="mt-5">
            Get Started
          </PrimaryLink>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/project?id=${p.id}`}
              className={`block rounded-[20px] border p-5 no-underline transition-transform hover:-translate-y-0.5 ${t.card}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-[16px] font-semibold ${t.ink}`}>{p.name}</p>
                  <p className={`mt-1 text-[13px] ${t.muted}`}>
                    {serviceTitle(p.category)} · {p.tierId} · {p.id}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
