import { cn } from "@/lib/utils";

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
  status: string;
  className?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  Paid: "bg-emerald-500/10 text-emerald-600",
  "In Progress": "bg-amber-500/10 text-amber-700",
  Delivered: "bg-black/10 text-inherit",
  Queued: "bg-amber-500/10 text-amber-700",
  "In preview": "bg-[rgba(200,16,46,0.1)] text-[#C8102E]",
  Live: "bg-emerald-500/10 text-emerald-600",
  Active: "bg-emerald-500/10 text-emerald-600",
  "Cancel at renewal": "bg-amber-500/10 text-amber-700",
  "Grace period": "bg-[#8C2F1B]/10 text-[#8C2F1B]",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium",
        statusColors[status as ProjectStatus] ?? "bg-black/10 text-inherit",
        className
      )}
    >
      {status}
    </span>
  );
}
