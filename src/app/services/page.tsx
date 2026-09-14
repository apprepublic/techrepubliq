"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { services } from "@/lib/services";
import {
  BASE_DEV_FEE_CENTS,
  RATE_PER_COMPONENT_CENTS,
  RATE_PER_PAGE_CENTS,
  TIERS,
  formatUsd,
  revisionLabel,
} from "@/lib/product";

const journey = [
  { n: "01", title: "Get Started", body: "Pick a category and a tier." },
  { n: "02", title: "Send your brief", body: "What it does, who it's for, and any assets." },
  { n: "03", title: "Get Priced", body: "One total, computed from your brief. No line items." },
  { n: "04", title: "We build", body: "A real team, with pre-launch review rounds." },
  { n: "05", title: "Launch", body: "On your domain, or one we register for you." },
  { n: "06", title: "Manage", body: "Services, analytics and edits from your dashboard." },
];

const pricingFaq = [
  {
    question: "How is the one-time development fee worked out?",
    answer: `${formatUsd(BASE_DEV_FEE_CENTS)} base, plus ${formatUsd(RATE_PER_PAGE_CENTS)} per page and ${formatUsd(
      RATE_PER_COMPONENT_CENTS
    )} per component, adjusted for complexity. It is the same math at every tier — tiers scale the recurring services, never the build fee.`,
  },
  {
    question: "Can I pay the fee over time?",
    answer:
      "Yes. The fee splits into 12 even monthly payments, with the first taken at checkout. Paying it in one go takes 15% off.",
  },
  {
    question: "What is included that I don't have to arrange?",
    answer:
      "Hosting and backend are always provided by TechRepubliQ, whether you bring your own domain or buy one through us. Domain registration is optional and priced as a one-time service.",
  },
  {
    question: "Can I change my tier later?",
    answer:
      "Tiers can be upgraded at any time and are never downgraded. When a project nears its tier's limits we'll tell you in the dashboard and by email.",
  },
];

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
          Seven ways to start. Every one of them ends the same way: a real team builds it,
          you get one price before anything starts, and hosting and backend are included.
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
              <p className="mt-md font-mono text-xs text-slate">
                From {formatUsd(service.fromCents)}
              </p>
              <span className="mt-sm text-sm text-accent group-hover:underline">
                Get Started →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* How pricing works */}
      <section className="mb-xl">
        <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-md">
          How the price is worked out
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[
            {
              label: "One development fee",
              body: `${formatUsd(BASE_DEV_FEE_CENTS)} base + ${formatUsd(RATE_PER_PAGE_CENTS)} per page + ${formatUsd(
                RATE_PER_COMPONENT_CENTS
              )} per component, adjusted for complexity. Same math at every tier.`,
            },
            {
              label: "Recurring services",
              body: "Priced by your tier and billed annually by default. Monthly is available and costs 15% more.",
            },
            {
              label: "Hosting & backend included",
              body: "Always ours to run, whether you bring your own domain or buy one through us. No vendor juggling.",
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
          Project tiers
        </h2>
        <p className="text-sm text-slate mb-md max-w-[680px]">
          Tiers scale your recurring services — never the one-time build fee. They can be
          upgraded at any time and are never downgraded.
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
                {tier.monthlyCents === null ? "Contact Sales" : `$${tier.monthlyCents / 100}/mo`}
              </p>
              <ul className="space-y-xs text-sm text-slate">
                <li>{revisionLabel(tier.id)}</li>
                <li>
                  {tier.requestsPerDay === null
                    ? "Traffic limits negotiated"
                    : `Up to ${(tier.requestsPerDay / 1000).toLocaleString()}k requests/day`}
                </li>
                <li>
                  {tier.emailPerDay === null
                    ? "Email volume negotiated"
                    : `${tier.emailPerDay.toLocaleString()} emails/day`}
                </li>
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
          Every tier includes hosting and backend. Enterprise pricing is scoped with you — no
          figure is shown online.
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
          Pricing questions
        </h2>
        <Accordion items={pricingFaq} />
      </section>

      {/* CTA */}
      <CornerBracketFrame className="bg-accent-dim">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
          <div>
            <h2 className="font-display text-[22px] leading-[30px] font-semibold text-ink mb-xs">
              Ready to build? Get started.
            </h2>
            <p className="text-sm text-slate">
              Describe your project and get one upfront price. No tokens, no metering.
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
