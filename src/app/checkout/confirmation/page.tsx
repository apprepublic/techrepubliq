"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useTone } from "@/lib/theme";
import { PageWrap, PrimaryLink } from "@/components/product-ui";

export default function ConfirmationPage() {
  const t = useTone();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Order Confirmed — TechRepubliQ";
    setRef(new URLSearchParams(window.location.search).get("ref") ?? "");
    setEmail(sessionStorage.getItem("customer_email") || "your inbox");
  }, []);

  return (
    <PageWrap>
      <div className="mx-auto max-w-[480px] px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <CheckCircle size={48} className="text-[#22C55E]" aria-hidden="true" />
        </div>
        <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Paid. The build is queued.</h1>
        <p className={`mt-3 text-[14px] leading-[1.6] ${t.muted}`}>
          A paid invoice is on its way to {email}. Recurring services are now itemized in your dashboard. There are no refunds.
        </p>
        {ref && <p className={`mt-4 text-[12px] tabular-nums ${t.muted}`}>Reference {ref}</p>}
        <PrimaryLink href="/dashboard" className="mt-8">
          Go to Dashboard
        </PrimaryLink>
      </div>
    </PageWrap>
  );
}
