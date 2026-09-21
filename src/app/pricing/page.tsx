"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { PageWrap, PrimaryLink } from "@/components/product-ui";
import { useTone } from "@/lib/theme";
import { TIERS, revisionLabel } from "@/lib/product";

const faqGroups = [
  {
    label: "How it is worked out",
    items: [
      {
        id: "what-makes-the-price",
        question: "What makes up the price?",
        answer:
          "Two things: a one-time development fee to build the project, and recurring services that keep it running afterwards. Hosting and backend are always included. Domain registration and app-store deployment, if you want them, are one-time extras.",
      },
      {
        id: "how-the-fee-is-calculated",
        question: "How is the development fee calculated?",
        answer:
          "A $500 base, plus $3 per page and $3 per component, adjusted for complexity — the same math at every tier. The pages, components and complexity are read from your brief, and you see the result as one total before you pay.",
      },
      {
        id: "is-it-binding",
        question: "Is the price binding?",
        answer:
          "Yes, as long as the scope does not change after we start. If you add to the scope later, we price the addition before doing the work.",
      },
      {
        id: "do-i-see-a-breakdown",
        question: "Do I see a breakdown?",
        answer:
          "At purchase you see a single total. Once you have paid, your dashboard itemises each recurring service so you can manage them individually.",
      },
      {
        id: "no-category",
        question: "What if my project does not fit a category?",
        answer:
          "Pick the closest one and describe it in your own words. Scope is read from what you write, not from the label you choose.",
      },
    ],
  },
  {
    label: "Paying",
    items: [
      {
        id: "fee-options",
        question: "How can I pay the development fee?",
        answer:
          "In one go, or spread across 12 even monthly payments with the first taken at checkout. The installments are just the fee divided by twelve — no interest, no markup. Paying in one go takes 15% off.",
      },
      {
        id: "recurring-cadence",
        question: "How are the recurring services billed?",
        answer:
          "Annually by default. Monthly billing is available for recurring services. Either way, a paid period runs to its end — you can cancel a service and it stops at the next renewal date.",
      },
      {
        id: "payment-methods",
        question: "Which currencies and payment methods?",
        answer:
          "Customers in Nigeria pay in Naira through Paystack. International customers pay in USD by card or with PayPal. Whichever applies is offered at checkout, and the rate used to convert a Naira total is shown before you pay and locked onto the order.",
      },
      {
        id: "grace-period",
        question: "What if a payment is missed?",
        answer:
          "There is a 7-day grace period from the due date. The service keeps working while we remind you, and if nothing is paid in those 7 days that specific service is removed from the project — the rest is unaffected.",
      },
      {
        id: "refund-policy",
        question: "What is your refund policy?",
        answer:
          "There are no refunds on anything once payment is made. During the build, the way to get it right is the review rounds included in your project — and if those run out before launch, you can buy more.",
      },
      {
        id: "discounts",
        question: "Do you offer discounts?",
        answer:
          "The only standing one is 15% off the development fee when you pay it in one go rather than across 12 monthly payments.",
      },
    ],
  },
  {
    label: "What is included",
    items: [
      {
        id: "hosting",
        question: "Is hosting included?",
        answer:
          "Yes. Hosting and backend are always provided by TechRepubliQ, whether you bring your own domain or register one through us.",
      },
      {
        id: "vendors",
        question: "Will you tell me which vendors you use?",
        answer:
          "No — you see and pay for services as single line items, and we handle any vendor issue directly. You can always see your own data in the Database tab.",
      },
      {
        id: "post-launch-changes",
        question: "What if I need changes after launch?",
        answer:
          "Changes can be quoted individually, or covered by a monthly plan: $100 for up to 10 edits, $200 for up to 25, $500 for up to 50, or $1,000 for unlimited edits. Before launch, your review rounds cover them instead.",
      },
      {
        id: "reviews",
        question: "How many review rounds do I get?",
        answer:
          "MVP 3, Startup 5, Business 10, and unlimited on Enterprise. Before launch, extra reviews are exactly $10 for +2 or $15 for +3, and can be purchased again as needed. After launch, changes are quoted per edit or covered by a monthly plan.",
      },
    ],
  },
  {
    label: "Ownership and moving",
    items: [
      {
        id: "who-owns",
        question: "Who owns what I paid for?",
        answer:
          "You own your front-end code and your content. Our backend infrastructure, AI automation components and internal tooling remain ours — they are what let us deliver and run projects quickly.",
      },
      {
        id: "can-migrate",
        question: "Can I migrate later?",
        answer:
          "Yes, and only the project owner can request it. It is confirmed with a one-time code sent to your account email, then you download a front-end bundle directly. There is no GitHub linking.",
      },
      {
        id: "domain-handling",
        question: "What happens to my domain?",
        answer:
          "Bring your own and it stays yours — we just give you the DNS details. Register through us and we will transfer it wherever you ask, on request.",
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
          Every project is scoped from your brief. One development fee builds the product, and recurring services keep it running afterwards. You see one total before you pay.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIERS.map((tier) => (
            <div key={tier.id} className={`rounded-[16px] border p-4 ${t.card}`}>
              <div className="text-[12px] font-semibold text-[#C8102E]">{tier.name}</div>
              <div className={`mt-1 text-[13px] ${t.ink}`}>
                {tier.monthlyCents == null ? "Contact Sales" : `$${tier.monthlyCents / 100}/mo`}
              </div>
              <div className={`mt-1 text-[12px] ${t.muted}`}>{revisionLabel(tier.id)}</div>
            </div>
          ))}
        </div>
        <p className={`mt-3 text-[12px] ${t.muted}`}>
          Tiers change recurring service headroom and review capacity — never the development-fee math. Enterprise is arranged through Contact Sales.
        </p>

        <div className="mt-12 space-y-10">
          {faqGroups.map((group) => (
            <section key={group.label}>
              <h2 className={`mb-3 text-[13px] font-semibold uppercase tracking-wider ${t.muted}`}>{group.label}</h2>
              <Accordion items={group.items} initialOpen={initialOpen} />
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
