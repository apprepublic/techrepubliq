"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import Link from "next/link";
import { TIERS, revisionLabel } from "@/lib/product";

/**
 * WP7 policy copy, rewritten to PRD v2.5 answers.
 * This is the one page where the money is spelled out; everywhere else leads with the work.
 */
const faqGroups = [
  {
    label: "How it's worked out",
    id: "how-it-works",
    items: [
      {
        id: "what-makes-the-price",
        question: "What makes up the price?",
        answer:
          "Two things: a one-time development fee to build the project, and the recurring services that keep it running afterwards. Hosting and backend are always included. Domain registration and app-store deployment, if you want them, are one-time extras.",
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
          "Yes, as long as the scope doesn't change after we start. If you add to the scope later, we price the addition before doing the work.",
      },
      {
        id: "do-i-see-a-breakdown",
        question: "Do I see a breakdown?",
        answer:
          "At purchase you see a single total. Once you've paid, your dashboard itemises each recurring service so you can manage them individually.",
      },
      {
        id: "no-category",
        question: "What if my project doesn't fit a category?",
        answer:
          "Pick the closest one and describe it in your own words. Scope is read from what you write, not from the label you choose.",
      },
    ],
  },
  {
    label: "Paying",
    id: "payment",
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
          "Annually by default. Monthly billing is available. Either way, a paid period runs to its end — you can cancel a service and it stops at the next renewal date.",
      },
      {
        id: "payment-methods",
        question: "Which currencies and payment methods?",
        answer:
          "Customers in Nigeria pay in Naira through Paystack. International customers pay in USD by card or with PayPal. Whichever applies is offered to you at checkout, and the rate used to convert a Naira total is shown before you pay and locked onto the order.",
      },
      {
        id: "grace-period",
        question: "What if a payment is missed?",
        answer:
          "There's a 7-day grace period from the due date. The service keeps working while we remind you, and if nothing is paid in those 7 days that specific service is removed from the project — the rest of it is unaffected.",
      },
      {
        id: "refund-policy",
        question: "What's your refund policy?",
        answer:
          "There are no refunds on anything, once payment is made. During the build, the way to get it right is the review rounds included in your project — and if those run out before launch, you can buy more.",
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
    label: "What's included",
    id: "whats-included",
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
    label: "Ownership & moving",
    id: "ownership",
    items: [
      {
        id: "who-owns",
        question: "Who owns what I paid for?",
        answer:
          "You own your front-end code and your content. Our backend infrastructure, AI automation components and internal tooling remain ours — they're what let us deliver and run projects quickly.",
      },
      {
        id: "can-migrate",
        question: "Can I migrate later?",
        answer:
          "Yes, and only the project owner can request it. It's confirmed with a one-time code sent to your account email, then you download a front-end bundle directly. There's no GitHub linking.",
      },
      {
        id: "domain-handling",
        question: "What happens to my domain?",
        answer:
          "Bring your own and it stays yours — we just give you the DNS details. Register through us and we'll transfer it wherever you ask, on request.",
      },
    ],
  },
];

export default function PricingPage() {
  const [initialOpen, setInitialOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setInitialOpen(hash);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-[760px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        How pricing works
      </h1>

      <div className="dimension-line w-full mb-xl">
        {[
          { label: "Describe", active: true },
          { label: "Get Priced", active: false },
          { label: "Build", active: false },
          { label: "Launch", active: false },
        ].map((tick) => (
          <div
            key={tick.label}
            className={`dimension-tick flex-1 flex flex-col items-center ${tick.active ? "active" : ""}`}
          >
            <span
              className={`tick-label mt-sm text-sm font-body ${
                tick.active ? "text-accent" : "text-slate"
              }`}
            >
              {tick.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-base leading-relaxed text-slate mb-xl">
        Every project is built by a real team, scoped before a line of code is written, and run by
        us afterwards. Two things make up the cost: a one-time development fee to build it, and the
        recurring services that keep it running. Both are worked out from your brief — you see one
        number, and it doesn&apos;t move unless the scope does.
      </p>

      <section className="mb-xl">
        <h2 className="font-display text-md font-semibold text-ink mb-sm">
          Project Services tiers
        </h2>
        <p className="text-sm leading-relaxed text-slate mb-md">
          Annual service pricing is the default. Tiers change recurring service headroom and
          included review capacity — never the one-time development-fee math.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-sm p-md ${
                tier.id === "startup" ? "border-accent bg-accent-dim" : "border-line"
              }`}
            >
              <div className="flex items-baseline justify-between gap-sm">
                <p className="font-display text-md font-semibold text-ink">{tier.name}</p>
                <p className="font-mono text-sm text-ink">
                  {tier.monthlyCents === null
                    ? "Contact Sales"
                    : `$${tier.monthlyCents / 100}/mo`}
                </p>
              </div>
              <p className="text-xs text-slate mt-xs">{tier.for}</p>
              <ul className="mt-sm space-y-xs text-xs text-slate">
                <li>
                  {tier.requestsPerDay === null
                    ? "Traffic capacity arranged through Contact Sales"
                    : `${tier.requestsPerDay.toLocaleString()} requests/day`}
                </li>
                <li>
                  {tier.emailPerDay === null
                    ? "Email volume arranged through Contact Sales"
                    : `${tier.emailPerDay.toLocaleString()} emails/day`}
                </li>
                <li>{revisionLabel(tier.id)}</li>
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-md text-xs text-slate">
          At Startup, the standard add-on baselines are $10/month for maps and location services
          and $25/month for Email Center or AI features. Other tiers scale recurring service
          pricing; Enterprise is arranged through Contact Sales.
        </p>
      </section>

      <div className="space-y-xl">
        {faqGroups.map((group) => (
          <section key={group.id} id={group.id}>
            <h2 className="font-display text-md font-semibold text-slate mb-md uppercase tracking-wider text-sm">
              {group.label}
            </h2>
            <Accordion
              items={group.items.map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
              }))}
              initialOpen={initialOpen}
            />
          </section>
        ))}
      </div>

      <div className="mt-xl pt-xl border-t border-line text-center">
        <p className="text-base text-slate mb-md">
          Still have a question? Describe your project and we&apos;ll come back with scope,
          scope and one total.
        </p>
        <Link href="/quote">
          <Button variant="ghost">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
