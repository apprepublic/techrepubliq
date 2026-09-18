import { cn } from "@/lib/utils";

/**
 * The status union grew with the project surface (WP5). The shape and the token colours
 * are unchanged — only the set of recognised values.
 */
export type ProjectStatus =
  | "Paid"
  | "In Progress"
  | "Delivered"
  | "Queued"
  | "In preview"
  | "Live"
  | "Active"
  | "Cancel at renewal"
  | "Grace period";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  Paid: "bg-success/10 text-success",
  "In Progress": "bg-amber/10 text-amber",
  Delivered: "bg-ink/10 text-ink",
  Queued: "bg-ink/10 text-ink",
  "In preview": "bg-amber/10 text-amber",
  Live: "bg-success/10 text-success",
  Active: "bg-success/10 text-success",
  "Cancel at renewal": "bg-amber/10 text-amber",
  "Grace period": "bg-error/10 text-error",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-sm py-xs text-sm font-body font-medium rounded-sm whitespace-nowrap",
        statusColors[status] ?? "bg-ink/10 text-ink",
        className
      )}
    >
      {status}
    </span>
  );
}
