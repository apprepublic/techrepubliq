import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CornerBracketFrameProps {
  children: ReactNode;
  className?: string;
}

export function CornerBracketFrame({
  children,
  className,
}: CornerBracketFrameProps) {
  return (
    <div
      className={cn(
        "corner-bracket relative bg-paper-raised border border-line p-lg",
        className
      )}
    >
      <div className="cb-tr" aria-hidden="true" />
      <div className="cb-tr-v" aria-hidden="true" />
      <div className="cb-br" aria-hidden="true" />
      <div className="cb-br-v" aria-hidden="true" />
      <div className="cb-bl" aria-hidden="true" />
      <div className="cb-bl-v" aria-hidden="true" />
      {children}
    </div>
  );
}