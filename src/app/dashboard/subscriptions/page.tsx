"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { api, type ProjectRow } from "@/lib/api";
import { formatMoney } from "@/lib/payments/provider";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Everything that renews, in one place: Project Services and any fee being spread. */
export default function SubscriptionsPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);

  useEffect(() => {
    api.projects
      .list()
      .then((res) => setProjects(res.projects))
      .catch(() => setProjects([]));
  }, []);

  if (projects === null) return <div className="h-48 w-full bg-accent-dim rounded-sm animate-pulse" />;

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
          Subscriptions
        </h1>
        <div className="text-center py-xl border border-line rounded-sm">
          <p className="text-base text-slate mb-md">Nothing renewing yet.</p>
          <Link href="/quote" className="text-sm text-accent hover:text-accent-hover no-underline">
            Start a project →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Subscriptions
      </h1>

      <div className="space-y-lg">
        {projects.map((project) => {
          const monthly = (project.services ?? []).reduce(
            (sum, service) => sum + (service.status === "Active" ? service.monthly_cents : 0),
            0
          );

          return (
            <section key={project.id} className="border border-line rounded-sm">
              <header className="flex items-center justify-between gap-sm flex-wrap p-md border-b border-line">
                <div>
                  <Link
                    href={`/dashboard/project?id=${project.id}`}
                    className="text-sm text-ink no-underline hover:text-accent"
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs text-slate font-mono mt-xs">
                    {project.cadence === "monthly" ? "Monthly" : "Annual"} billing · $
                    {(monthly / 100).toLocaleString()}/mo
                  </p>
                </div>
                <StatusBadge status={project.status as ProjectStatus} />
              </header>

              <ul className="divide-y divide-line">
                {(project.services ?? []).map((service) => (
                  <li key={service.id} className="p-md flex items-center justify-between gap-sm flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{service.name}</p>
                      <p className="text-xs text-slate font-mono mt-xs">
                        ${(service.monthly_cents / 100).toLocaleString()}/mo · renews{" "}
                        {formatDate(service.renews_on)}
                      </p>
                    </div>
                    <StatusBadge status={service.status as ProjectStatus} />
                  </li>
                ))}

                {project.installments && (
                  <li className="p-md flex items-center justify-between gap-sm flex-wrap bg-paper">
                    <div>
                      <p className="text-sm text-ink">Development fee</p>
                      <p className="text-xs text-slate font-mono mt-xs">
                        {project.installments.paid} of {project.installments.count} paid
                        {project.installments.nextDueAt && project.installments.nextAmountMinor !== null && (
                          <>
                            {" · next "}
                            {formatMoney(project.installments.nextAmountMinor, project.installments.currency)}
                            {" on "}
                            {formatDate(project.installments.nextDueAt)}
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        project.installments.status === "Completed"
                          ? "Paid"
                          : project.installments.status === "Defaulted"
                            ? "Grace period"
                            : "Active"
                      }
                    />
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
