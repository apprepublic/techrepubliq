"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { api, type ProjectRow, type TierNudge } from "@/lib/api";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

function monthlyTotal(project: ProjectRow): number {
  return (project.services ?? []).reduce((sum, service) => sum + service.monthly_cents, 0);
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [nudges, setNudges] = useState<TierNudge[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.projects
      .list()
      .then((res) => {
        setProjects(res.projects);
        setNudges(res.nudges ?? []);
      })
      .catch(() => {
        setProjects([]);
        setError("Couldn't load your projects. Refresh to try again.");
      });
  }, []);

  if (projects === null) {
    return (
      <div className="space-y-sm">
        <div className="h-8 w-40 bg-accent-dim rounded-sm animate-pulse" />
        <div className="h-24 w-full bg-accent-dim rounded-sm animate-pulse" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
          Projects
        </h1>
        <div className="text-center py-xl border border-line rounded-sm">
          <p className="text-base text-slate mb-md">
            No projects yet. Describe what you need and we&apos;ll scope it.
          </p>
          <Link href="/quote">
            <Button>Get Started</Button>
          </Link>
        </div>
        {error && <p className="text-sm text-error mt-md">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-lg gap-sm flex-wrap">
        <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink">
          Projects
        </h1>
        <Link href="/quote" className="text-sm text-accent hover:text-accent-hover no-underline">
          Start another project →
        </Link>
      </div>

      {/* Decision 15 — a suggestion, never a restriction. Nothing is throttled here. */}
      {nudges.map((nudge) => (
        <div
          key={nudge.projectId}
          className="border border-line rounded-sm p-md mb-lg bg-paper flex items-start justify-between gap-sm flex-wrap"
        >
          <p className="text-sm text-slate">
            <Link
              href={`/dashboard/project?id=${nudge.projectId}`}
              className="text-ink no-underline hover:text-accent"
            >
              {nudge.name}
            </Link>{" "}
            is averaging{" "}
            <span className="font-mono text-ink">{nudge.observed.toLocaleString()}</span> requests a
            day — {nudge.level === "breach" ? "above" : "close to"} its tier&apos;s{" "}
            <span className="font-mono text-ink">{nudge.ceiling.toLocaleString()}</span>. Nothing is
            being slowed down or switched off; a bigger tier just gives it more headroom.
          </p>
          <Link
            href={`/dashboard/project?id=${nudge.projectId}`}
            className="text-sm text-accent hover:text-accent-hover no-underline shrink-0"
          >
            See the numbers →
          </Link>
        </div>
      ))}

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
        {/* Desktop table */}
        <table className="hidden md:table w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-slate uppercase tracking-wider">
              <th className="pb-sm font-medium">Project</th>
              <th className="pb-sm font-medium">Category</th>
              <th className="pb-sm font-medium">Tier</th>
              <th className="pb-sm font-medium">Services</th>
              <th className="pb-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <motion.tr
                key={project.id}
                variants={staggerItem}
                className="border-b border-line hover:bg-accent-dim/40 transition-colors duration-150"
              >
                <td className="py-md">
                  <Link
                    href={`/dashboard/project?id=${project.id}`}
                    className="text-ink no-underline hover:text-accent transition-colors duration-150 block"
                  >
                    {project.name}
                    <span className="block font-mono text-xs text-slate">{project.id}</span>
                  </Link>
                </td>
                <td className="py-md text-slate">{project.category.replace(/-/g, " ")}</td>
                <td className="py-md text-slate capitalize">{project.tier_id}</td>
                <td className="py-md font-mono text-slate">
                  ${(monthlyTotal(project) / 100).toLocaleString()}/mo
                </td>
                <td className="py-md">
                  <StatusBadge status={project.status as ProjectStatus} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden space-y-sm">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/project?id=${project.id}`}
              className="block border border-line rounded-sm p-md no-underline hover:border-ink transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-sm gap-sm">
                <span className="text-sm text-ink">{project.name}</span>
                <StatusBadge status={project.status as ProjectStatus} />
              </div>
              <p className="text-xs text-slate font-mono">{project.id}</p>
              <p className="text-xs text-slate capitalize">
                {project.tier_id} · ${(monthlyTotal(project) / 100).toLocaleString()}/mo
              </p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
