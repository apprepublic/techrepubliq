"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ghostBtn, primaryBtn, useTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(primaryBtn, className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(primaryBtn, "no-underline", className)}>
      {children}
    </Link>
  );
}

export function GhostLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useTone();
  return (
    <Link
      href={href}
      className={cn(ghostBtn, t.border, t.ink, "no-underline", className)}
    >
      {children}
    </Link>
  );
}

export function SignalPanel({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTone();
  return (
    <div
      className={cn(
        "rounded-[20px] p-[1.5px] shadow-[0_0_0_1px_rgba(200,16,46,0.08),0_12px_32px_rgba(200,16,46,0.12)]",
        className
      )}
      style={{ background: "linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)" }}
    >
      <div className={cn("rounded-[18.5px] p-6", t.surface)}>{children}</div>
    </div>
  );
}

export function StepTrack({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div>
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              i <= current ? "bg-gradient-to-r from-[#FF5C4D] to-[#C8102E]" : "bg-[#E8E6F0] dark:bg-[#242233]"
            )}
            style={i > current ? { background: "var(--border-light, #E8E6F0)" } : undefined}
          />
        ))}
      </div>
      <p className="mt-2 text-[12px] text-[#6B6876]">
        Step {current + 1} of {steps.length}: {steps[current]}
      </p>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const t = useTone();
  return (
    <label className="block">
      <span className={cn("mb-2 block text-[13px] font-medium", t.ink)}>{label}</span>
      {children}
      {hint && <span className={cn("mt-1.5 block text-[12px]", t.muted)}>{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const t = useTone();
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-[10px] border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[#C8102E]",
        t.input,
        props.className
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const t = useTone();
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-[140px] rounded-[10px] border px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#C8102E] resize-y",
        t.input,
        props.className
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const t = useTone();
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-[10px] border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-[#C8102E]",
        t.input,
        props.className
      )}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTone();
  return (
    <div className={cn("rounded-[20px] border p-5", t.card, className)}>{children}</div>
  );
}

export function PageWrap({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTone();
  return <div className={cn(t.page, "min-h-[70vh]", className)}>{children}</div>;
}
