"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { services, serviceBySlug } from "@/lib/services";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { motion } from "motion/react";
import {
  BASE_DEV_FEE_CENTS,
  RATE_PER_COMPONENT_CENTS,
  RATE_PER_PAGE_CENTS,
  formatUsd,
} from "@/lib/product";

export default function ServicePageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const service = serviceBySlug(slug) ?? services[0];
  const otherServices = services.filter((s) => s.slug !== slug);

  return (
    <div className="mx-auto max-w-[1120px] px-md py-xl">
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 max-w-[700px]">
          <nav className="mb-lg text-sm text-slate">
            <Link href="/" className="hover:text-accent transition-colors duration-150 no-underline">
              Home
            </Link>
            <span className="mx-sm">/</span>
            <Link
              href="/services"
              className="hover:text-accent transition-colors duration-150 no-underline"
            >
              Services
            </Link>
            <span className="mx-sm">/</span>
            <span className="text-ink">{service.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-[28px] leading-[36px] sm:text-[34px] sm:leading-[42px] font-semibold text-ink mb-md">
              {service.title}
            </h1>
            <p className="text-base leading-relaxed text-slate mb-xl">{service.hero}</p>

            <h2 className="font-display text-md font-semibold text-ink mb-md">
              What you get
            </h2>
            <ul className="space-y-sm mb-xl">
              {service.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-sm text-sm text-slate">
                  <span className="text-accent mt-[3px] shrink-0">—</span>
                  {o}
                </li>
              ))}
            </ul>

            <h2 className="font-display text-md font-semibold text-ink mb-md">
              What&apos;s included
            </h2>
            <ul className="space-y-sm mb-xl">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-sm text-sm text-slate">
                  <span className="text-accent mt-[3px] shrink-0">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-xl pt-xl border-t border-line">
              <h3 className="font-display text-md font-semibold text-ink mb-md">
                What we need from you
              </h3>
              <ul className="space-y-sm mb-xl">
                {service.intake.map((i) => (
                  <li key={i} className="flex items-start gap-sm text-sm text-slate">
                    <span className="font-mono text-xs text-accent mt-[3px] shrink-0">→</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-xl pt-xl border-t border-line">
              <h3 className="font-display text-md font-semibold text-ink mb-md">
                How it&apos;s priced and built
              </h3>
              <ol className="space-y-sm mb-lg">
                {service.process.map((step, i) => (
                  <li key={step} className="flex items-start gap-sm text-sm text-slate">
                    <span className="font-mono text-xs text-accent mt-[3px] shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="p-lg border border-line rounded-sm">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent mb-sm">
                  One-time development fee
                </p>
                <p className="text-sm leading-relaxed text-slate mb-sm">
                  {formatUsd(BASE_DEV_FEE_CENTS)} base, plus {formatUsd(RATE_PER_PAGE_CENTS)} per
                  page and {formatUsd(RATE_PER_COMPONENT_CENTS)} per component, adjusted for
                  complexity. The same math at every tier — you see one total, not a breakdown.
                </p>
                <p className="text-sm leading-relaxed text-slate">
                  Pay it in one go and take 15% off, or spread it across 12 even monthly
                  payments. Hosting and backend are included either way.
                </p>
              </div>
            </div>

            <div className="mt-xl pt-xl border-t border-line">
              <h3 className="font-display text-md font-semibold text-ink mb-md">
                Other services
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    className="block p-md border border-line text-sm text-slate hover:text-accent hover:border-ink transition-all duration-150 no-underline rounded-sm"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>

            {service.faq.length > 0 && (
              <div className="mt-xl pt-xl border-t border-line">
                <h3 className="font-display text-md font-semibold text-ink mb-md">
                  Frequently asked questions
                </h3>
                <Accordion items={service.faq.map((f) => ({ question: f.q, answer: f.a }))} />
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:w-[360px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <CornerBracketFrame className="bg-accent-dim">
              <p className="text-sm text-slate mb-sm">Priced from your brief</p>
              <p className="font-mono text-[28px] leading-[36px] font-medium text-ink mb-xs">
                From {formatUsd(service.fromCents)}
              </p>
              <p className="text-xs text-slate mb-lg">
                One-time development fee. Your price is computed from your brief — pages,
                components and complexity.
              </p>
              <Button className="w-full" onClick={() => router.push(`/quote?category=${service.slug}`)}>
                Get Started
              </Button>
              <ul className="mt-md space-y-xs text-xs text-slate">
                <li>Hosting &amp; backend included</li>
                <li>12 monthly payments, or 15% off paid once</li>
                <li>Pre-launch review rounds included</li>
              </ul>
            </CornerBracketFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
