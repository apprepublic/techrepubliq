"use client";

import { useEffect, useRef, useState } from "react";
import { useTone } from "@/lib/theme";
import { PageWrap } from "@/components/product-ui";

const clauses = [
  {
    id: "scope-of-delivery",
    heading: "1. Scope of Delivery",
    body: "You are purchasing a functioning product or outcome, not access to the tools, infrastructure, vendors, or methods used to build or run it. Hosting and backend are always provided by TechRepubliQ.",
  },
  {
    id: "functionality-guarantee",
    heading: "2. Duration and Functionality Guarantee",
    body: "Services function as described for the duration paid for. Recurring add-ons run through the paid period; cancellation takes effect at the next renewal boundary, never mid-cycle.",
  },
  {
    id: "confidentiality",
    heading: "3. Confidentiality of Delivery Methods",
    body: "Infrastructure, hosting providers, AI API vendors, email platforms, maps providers, registrars, and internal methods are confidential and not subject to disclosure, before or after payment. You see service line items and your own data only.",
  },
  {
    id: "ownership",
    heading: "4. Ownership on Delivery",
    body: "You own the front-end code and content of your product. Backend structure, the front-end/backend connection, and proprietary automation remain TechRepubliQ’s.",
  },
  {
    id: "migration-rights",
    heading: "5. Migration Rights",
    body: "Only the project owner may request cancellation or migration. An OTP sent to the account email must be confirmed first. Downloadable source is front-end only, delivered as a bundle — never via GitHub. Migration files do not include proprietary AI components or vendor credentials.",
  },
  {
    id: "domain-handling",
    heading: "6. Domain Handling",
    body: "You may buy a domain through TechRepubliQ or point an existing domain with the DNS details we provide. Bringing your own domain does not change hosting or backend coverage. Prior registrar details are not disclosed.",
  },
  {
    id: "no-account-access",
    heading: "7. No Account-Level Access",
    body: "You are not entitled to receipts, credentials, or account access for third-party services used to deliver the product. Issues are handled by TechRepubliQ directly.",
  },
  {
    id: "payment-terms",
    heading: "8. Payment and Refunds",
    body: "There are no refunds, for anything, once payment has been made. The one-time development fee and published projects cannot be cancelled for a refund. During the build, the path is the review/revision system (and extra-review add-ons if the included rounds are exhausted), not a refund. Recurring services have a 7-day grace period after a missed renewal or overage; then that specific service is removed.",
  },
];

export default function TermsPage() {
  const t = useTone();
  const [activeId, setActiveId] = useState(clauses[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    clauses.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <PageWrap>
      <div className="mx-auto max-w-[960px] px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="hidden lg:block w-[220px] shrink-0">
            <nav className="sticky top-24 space-y-2 text-[13px]">
              {clauses.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className={`block no-underline ${activeId === c.id ? "text-[#C8102E]" : t.muted}`}
                >
                  {c.heading}
                </a>
              ))}
            </nav>
          </aside>
          <details className={`lg:hidden rounded-[12px] border ${t.border}`}>
            <summary className="px-4 py-3 text-[14px] cursor-pointer">Jump to section</summary>
            <nav className="px-4 pb-3 space-y-2 text-[13px]">
              {clauses.map((c) => (
                <a key={c.id} href={`#${c.id}`} className={`block no-underline ${t.muted}`}>
                  {c.heading}
                </a>
              ))}
            </nav>
          </details>
          <div className="flex-1">
            <h1 className={`font-display text-[32px] font-semibold ${t.ink}`}>Service Agreement</h1>
            <p className={`mt-2 mb-10 text-[14px] ${t.muted}`}>
              Last updated: September 2026. Governs every TechRepubliQ build and recurring service.
            </p>
            <div className="space-y-10">
              {clauses.map((c) => (
                <section key={c.id} id={c.id}>
                  <h2 className={`font-display text-[18px] font-semibold ${t.ink}`}>{c.heading}</h2>
                  <p className={`mt-2 text-[14px] leading-[1.7] ${t.muted}`}>{c.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
