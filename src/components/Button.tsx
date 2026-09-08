"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-slate disabled:text-white/60",
  secondary:
    "bg-transparent text-ink border border-ink hover:bg-ink/5 disabled:border-slate disabled:text-slate",
  ghost:
    "bg-transparent text-ink hover:text-accent disabled:text-slate",
  destructive:
    "bg-transparent text-error hover:text-error/80 disabled:text-slate",
};

export function Button({
  variant = "primary",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-xs px-md py-sm text-sm font-body font-medium",
        "rounded-sm transition-[background,color,border] duration-150 ease-out",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed",
        variantStyles[variant],
        loading && "cursor-wait",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}