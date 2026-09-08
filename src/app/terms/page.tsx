"use client";

import { useState, useEffect, useRef } from "react";

const clauses = [
  {
    id: "scope-of-delivery",
    heading: "1. Scope of Delivery",
    body: "You are purchasing a functioning product or outcome, not access to the specific tools, infrastructure, or methods used to build or run it. The delivered product will perform as described in your accepted quote.",
  },
  {
    id: "functionality-guarantee",
    heading: "2. Duration and Functionality Guarantee",
    body: "Services purchased will function as described for the duration that was paid for, based on the specifications communicated at the time of payment. Any material deviation from the agreed scope will be corrected at no additional cost.",
  },
  {
    id: "confidentiality",
    heading: "3. Confidentiality of Delivery Methods",
    body: "All infrastructure, hosting providers, vendors, registrars, and internal AI/automation methods used to deliver the service are confidential and not subject to disclosure, before or after payment. These methods constitute our proprietary delivery framework and are not part of the purchased product.",
  },
  {
    id: "ownership",
    heading: "4. Ownership on Delivery",
    body: "You own the front-end code and content of your product. Ownership transfers to you upon full payment and delivery of the completed product as described in your quote.",
  },
  {
    id: "migration-rights",
    heading: "5. Migration Rights",
    body: "You may request migration files (front-end code plus applicable back-end migration files) at any time from your dashboard. Migration excludes proprietary AI automation components, which remain our property and are not portable. Migration files will be provided within a reasonable timeframe.",
  },
  {
    id: "domain-handling",
    heading: "6. Domain Handling",
    body: "We will transfer the domain to a registrar or account you specify on request. The prior registration and hosting details remain confidential and will not be disclosed.",
  },
  {
    id: "no-account-access",
    heading: "7. No Account-Level Access",
    body: "You are not entitled to receipts, credentials, or account access for third-party services purchased on your behalf as part of a bundled service. These accounts are managed by us as part of the delivery infrastructure.",
  },
  {
    id: "payment-terms",
    heading: "8. Payment Terms",
    body: "Discount codes, when applicable, must be applied at checkout. Pricing is localized by geographic location and is non-transferable between regions. Refunds are processed in accordance with our refund policy, which is available on request.",
  },
];

export default function TermsPage() {
  const [activeId, setActiveId] = useState(clauses[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
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
    <div className="mx-auto max-w-[760px] px-md py-xl">
      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Sticky TOC - desktop */}
        <aside className="hidden lg:block w-[200px] shrink-0">
          <nav className="sticky top-24 space-y-sm text-sm">
            {clauses.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className={`block no-underline transition-colors duration-150 ${
                  activeId === c.id ? "text-accent" : "text-slate hover:text-ink"
                }`}
              >
                {c.heading}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile TOC */}
        <details className="lg:hidden mb-lg border border-line rounded-sm">
          <summary className="px-md py-sm text-sm font-body text-ink cursor-pointer">
            Jump to section
          </summary>
          <nav className="px-md pb-sm space-y-sm text-sm">
            {clauses.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="block no-underline text-slate hover:text-ink transition-colors duration-150"
              >
                {c.heading}
              </a>
            ))}
          </nav>
        </details>

        {/* Content */}
        <div className="flex-1">
          <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
            Terms of Service / Service Agreement
          </h1>
          <p className="text-sm text-slate mb-xl">
            Last updated: January 2026. This agreement governs all services
            provided by TechRepubliQ.
          </p>

          <div className="space-y-xl">
            {clauses.map((c) => (
              <section key={c.id} id={c.id}>
                <h2 className="font-display text-md font-semibold text-ink mb-sm">
                  {c.heading}
                </h2>
                <p className="text-sm text-slate leading-relaxed">{c.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}