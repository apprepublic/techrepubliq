import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Paid" | "In Progress" | "Delivered";
  className?: string;
}

const statusColors: Record<StatusBadgeProps["status"], string> = {
  Paid: "bg-success/10 text-success",
  "In Progress": "bg-amber/10 text-amber",
  Delivered: "bg-ink/10 text-ink",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-sm py-xs text-sm font-body font-medium rounded-sm",
        statusColors[status],
        className
      )}
    >
      {status}
    </span>
  );
}