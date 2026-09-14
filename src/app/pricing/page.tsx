"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { useTone } from "@/lib/theme";
import { PageWrap, PrimaryLink } from "@/components/product-ui";
import { BASE_DEV_FEE, RATE_PER_PAGE, RATE_PER_COMPONENT, tiers, revisionLabel } from "@/lib/product";

const groups = [
  {
    label: "Getting priced",
    items: [
      {
        id: "how-priced",
        question: "How does Get Priced work?",
        answer:
          "You pick a category and tier, send a brief and assets, then hit Get Priced. The engine estimates pages, components, and complexity, infers add-ons, and returns one total. You can add more add-ons before you pay. There is no separate Generate Invoice step.",
      },
      {
        id: "breakdown",
        question: "Will I see a line-item breakdown?",
        answer:
          "Not at purchase. You see one final total. After payment, the dashboard itemizes recurring services so you can manage them individually.",
      },
      {
        id: "dev-fee",
        question: "How is the development fee calculated?",
        answer: `A $3 per page rate, $3 per component/model, and a $${BASE_DEV_FEE} base — identical at every tier — adjusted by the complexity of what you described. Tiers never change this math.`,
      },
    ],
  },
  {
    label: "Tiers & billing",
    items: [
      {
        id: "tiers",
        question: "What do tiers change?",
        answer:
          "Recurring service prices, email volume, and included pre-launch reviews. Not the development-fee formula. Tiers can only be upgraded, never downgraded.",
      },
      {
        id: "annual",
        question: "Annual or monthly?",
        answer:
          "The subscription figure is annual by default. Switching to monthly adds a 15% markup to that annual total, then splits it across 12 payments.",
      },
      {
        id: "cancel",
        question: "Can I cancel a service?",
        answer:
          "Yes, each recurring add-on is cancellable from the dashboard with a confirmation prompt. It ends at the next renewal, not mid-cycle. A 7-day grace period applies if a quota lapses; after that, only that service is removed.",
      },
    ],
  },
  {
    label: "Build, edits, refunds",
    items: [
      {
        id: "reviews",
        question: "How many revisions do I get?",
        answer:
          "MVP 3, Startup 5, Business 10, Enterprise unlimited — before launch. Extra reviews are $10 for +2 or $15 for +3, repeatable. After launch, use pay-per-edit or a monthly update plan.",
      },
      {
        id: "refunds",
        question: "What’s the refund policy?",
        answer:
          "There are no refunds, for anything, once payment has been made. During the build, the path is reviews — not a refund.",
      },
      {
        id: "tokens",
        question: "Do I run out of tokens mid-build?",
        answer:
          "No. The build is a one-time fee to complete the scoped work. Tokens apply only to optional AI feature add-ons after launch.",
      },
    ],
  },
  {
    label: "Ownership & migration",
    items: [
      {
        id: "stack",
        question: "Will you tell me which vendors you use?",
        answer:
          "No. Hosting, backend, email, maps, and AI providers stay confidential. You see service line items and your own data. If something breaks, we handle it.",
      },
      {
        id: "migrate",
        question: "Can I take the project elsewhere?",
        answer:
          "The owner can request migration after an OTP to the account email. You download a front-end bundle — never backend structure or the connection. No GitHub linking.",
      },
    ],
  },
];

export default function PricingPage() {
  const t = useTone();
  const [initialOpen, setInitialOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setInitialOpen(hash);
    }
  }, []);

  return (
    <PageWrap>
      <div className="mx-auto max-w-[760px] px-6 py-12 lg:py-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C8102E]">Pricing</p>
        <h1 className={`mt-2 font-display text-[32px] font-semibold ${t.ink}`}>How pricing works</h1>
        <p className={`mt-3 text-[15px] leading-[1.7] ${t.muted}`}>
          Cost is the output of describing your project — not the headline. One development fee
          (${RATE_PER_PAGE}/page + ${RATE_PER_COMPONENT}/component + ${BASE_DEV_FEE} base) plus recurring
          services scaled by tier.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tiers.map((tier) => (
            <div key={tier.id} className={`rounded-[16px] border p-4 ${t.card}`}>
              <div className="text-[12px] font-semibold text-[#C8102E]">{tier.name}</div>
              <div className={`mt-1 text-[13px] ${t.ink}`}>
                {tier.serviceMonthly == null ? "Contact sales" : `From $${tier.serviceMonthly}/mo`}
              </div>
              <div className={`mt-1 text-[12px] ${t.muted}`}>{revisionLabel(tier)}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-10">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className={`mb-3 text-[13px] font-semibold uppercase tracking-wider ${t.muted}`}>{g.label}</h2>
              <Accordion items={g.items} initialOpen={initialOpen} />
            </section>
          ))}
        </div>

        <div className={`mt-12 rounded-[20px] border p-6 text-center ${t.card}`}>
          <p className={t.muted}>Ready to see a number for your project?</p>
          <PrimaryLink href="/quote" className="mt-4">
            Get Started
          </PrimaryLink>
        </div>
      </div>
    </PageWrap>
  );
}
