"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { services } from "@/lib/services";
import { TIERS, revisionLabel } from "@/lib/product";

const journey = [
  { n: "01", title: "Get Started", body: "Pick a category and a tier." },
  { n: "02", title: "Send your brief", body: "What it does, who it's for, and any assets." },
  { n: "03", title: "Get Priced", body: "One total, computed from your brief. No line items." },
  { n: "04", title: "We build", body: "A real team, with pre-launch review rounds." },
  { n: "05", title: "Launch", body: "On your domain, or one we register for you." },
  { n: "06", title: "Manage", body: "Services, analytics and edits from your dashboard." },
];

const deliveryFaq = [
  {
    question: "How long does it take?",
    answer:
      "It depends on scope. We talk through the work and sequencing before you commit to anything, then keep you informed as the team builds it.",
  },
  {
    question: "Who actually builds it?",
    answer:
      "A real team — designers, engineers and reviewers — not an autonomous agent. Every project includes review rounds before launch, so you sign off on what goes live.",
  },
  {
    question: "Do I have to arrange hosting?",
    answer:
      "No. Hosting and backend are always provided by TechRepubliQ, whether you bring your own domain or register one through us.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Your project stays monitored and maintained. Changes can be quoted individually or covered by a monthly plan, and you can add services from your dashboard.",
  },
  {
    question: "Can I change my tier later?",
    answer:
      "Tiers can be upgraded at any time and are never downgraded. When a project nears its limits we'll tell you in the dashboard and by email.",
  },
];

function formatCount(value: number): string {
  if (value >= 1000000) return `${value / 1000000}M`;
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-md py-xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-sm">
          Services
        </p>
        <h1 className="font-display text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] font-semibold text-ink mb-md">
          From first sketch to a live, working product.
        </h1>
        <p className="text-base leading-relaxed text-slate max-w-[680px] mb-xl">
          Seven ways to start. However you begin, it ends the same way: a real team builds it,
          it ships tested and monitored, and hosting and backend stay handled.
        </p>
      </motion.div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
        {services.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Link
              href={`/services/${service.slug}`}
              className="group h-full flex flex-col p-lg border border-line bg-paper-raised hover:border-ink transition-colors duration-150 no-underline rounded-sm"
            >
              <h2 className="font-display text-md font-semibold text-ink mb-sm">
                {service.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate flex-1">{service.short}</p>
              <span className="mt-md text-sm text-accent group-hover:underline">
                Get Started →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* How pricing works */}
      <section className="mb-xl">
        <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-md">
          How we work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[
            {
              label: "Scoped before we start",
              body: "You describe it, we work out the pages, the components and the complexity, and agree the scope in writing before a line of code is written.",
            },
            {
              label: "Built and reviewed by people",
              body: "A real team designs, builds and reviews your product. Review rounds are included before launch, so what goes live is what you signed off.",
            },
            {
              label: "Run by us afterwards",
              body: "Hosting, backend, monitoring and updates stay with the team that built it. You don't get a vendor login to manage.",
            },
          ].map((card) => (
            <div key={card.label} className="p-lg border border-line rounded-sm">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent mb-sm">
                {card.label}
              </p>
              <p className="text-sm leading-relaxed text-slate">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="mb-xl">
        <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-sm">
          Start where you are
        </h2>
        <p className="text-sm text-slate mb-md max-w-[680px]">
          Every project gets the same team and the same build standards. What changes as you grow
          is headroom — traffic, email volume, and review rounds.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`p-lg border rounded-sm ${
                tier.id === "startup" ? "border-accent bg-accent-dim" : "border-line"
              }`}
            >
              <div className="flex items-baseline justify-between mb-sm">
                <p className="font-display text-md font-semibold text-ink">{tier.name}</p>
                {tier.id === "startup" && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                    Most popular
                  </span>
                )}
              </div>
              <p className="text-sm text-slate mb-md">{tier.for}</p>
              <p className="font-mono text-[24px] leading-[32px] text-ink mb-md">
                {tier.requestsPerDay === null ? (
                  // Decision 14: Enterprise never shows a figure, on any surface. The CTA below
                  // says "Contact Sales", so the number has to say the same thing.
                  "Contact Sales"
                ) : (
                  <>
                    {formatCount(tier.requestsPerDay)}
                    <span className="text-sm text-slate"> requests/day</span>
                  </>
                )}
              </p>
              <ul className="space-y-xs text-sm text-slate">
                <li>{revisionLabel(tier.id)}</li>
                <li>
                  {tier.emailPerDay === null
                    ? "Email volume negotiated"
                    : `${tier.emailPerDay.toLocaleString()} emails/day`}
                </li>
                <li>Hosting, backend &amp; monitoring included</li>
              </ul>
              <div className="mt-md">
                <Link
                  href={`/quote?tier=${tier.id}`}
                  className="text-sm text-accent hover:underline no-underline"
                >
                  {tier.id === "enterprise" ? "Contact Sales →" : "Get Started →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-md text-xs text-slate">
          Every tier includes hosting, backend and monitoring. Tiers can be upgraded at any time
          and are never downgraded.{" "}
          <Link href="/pricing" className="text-accent hover:underline no-underline">
            How tiers work →
          </Link>
        </p>
      </section>

      {/* Journey */}
      <section className="mb-xl pt-xl border-t border-line">
        <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-md">
          How it goes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          {journey.map((step) => (
            <div key={step.n}>
              <p className="font-mono text-xs text-accent mb-xs">{step.n}</p>
              <p className="text-sm font-medium text-ink mb-xs">{step.title}</p>
              <p className="text-sm text-slate leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="mb-xl pt-xl border-t border-line">
        <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-md">
          How it goes
        </h2>
        <Accordion items={deliveryFaq} />
      </section>

      {/* CTA */}
      <CornerBracketFrame className="bg-accent-dim">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
          <div>
            <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-xs">
              Ready to build? Get started.
            </h2>
            <p className="text-sm text-slate">
              Describe your project and we&apos;ll come back with scope and one total.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-sm shrink-0">
            <Link href="/quote" className="no-underline">
              <Button>Get Started</Button>
            </Link>
            <Link
              href="mailto:hello@techrepubliq.com"
              className="no-underline inline-flex items-center justify-center px-md py-sm text-sm font-medium text-ink border border-ink rounded-sm hover:bg-ink/5 transition-colors duration-150"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </CornerBracketFrame>
    </div>
  );
}
