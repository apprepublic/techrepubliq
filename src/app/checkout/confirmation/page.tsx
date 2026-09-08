"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { CheckCircle } from "lucide-react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";

  useEffect(() => {
    document.title = "Order Confirmed — TechRepubliQ";
  }, []);

  return (
    <div className="mx-auto max-w-[480px] px-md min-h-[60vh] flex flex-col items-center justify-center text-center">
      <CheckCircle
        size={48}
        className="text-success mb-md"
        aria-hidden="true"
      />
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">
        Order confirmed
      </h1>
      <p className="text-sm text-slate mb-lg">
        Thank you for your order. Your invoice is on its way to your email — it
        can take a few minutes.
      </p>
      {ref && (
        <p className="font-mono text-xs text-slate mb-lg">
          Reference: {ref}
        </p>
      )}
      <Link href="/dashboard">
        <Button variant="secondary">Go to Dashboard</Button>
      </Link>
    </div>
  );
}