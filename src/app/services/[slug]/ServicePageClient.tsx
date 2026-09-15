"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { services, serviceBySlug } from "@/lib/services";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { motion } from "motion/react";


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
                How it&apos;s scoped and built
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
                  Scoped, then priced
                </p>
                <p className="text-sm leading-relaxed text-slate mb-sm">
                  We read your brief and work out the pages, the components and the complexity
                  behind it. You get one number before anything starts, and it doesn&apos;t move
                  unless the scope does.
                </p>
                <p className="text-sm leading-relaxed text-slate">
                  It can be paid in one go or spread across 12 monthly payments — the full
                  mechanics are on our{" "}
                  <Link href="/pricing" className="text-accent hover:underline no-underline">
                    pricing page
                  </Link>
                  .
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
              <p className="text-sm text-slate mb-sm">Scoped from your brief</p>
              <p className="font-mono text-[28px] leading-[36px] font-medium text-ink mb-xs">
                One upfront price
              </p>
              <p className="text-xs text-slate mb-lg">
                We work out the pages, components and complexity in your brief and come back with a
                single number before anything starts.
              </p>
              <Button className="w-full" onClick={() => router.push(`/quote?category=${service.slug}`)}>
                Get Started
              </Button>
              <ul className="mt-md space-y-xs text-xs text-slate">
                <li>Hosting &amp; backend included</li>
                <li>Review rounds before launch</li>
                <li>Maintained by the team that built it</li>
              </ul>
            </CornerBracketFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
