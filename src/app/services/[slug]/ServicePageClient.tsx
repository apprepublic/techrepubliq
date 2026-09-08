"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { services } from "@/lib/utils";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { motion } from "motion/react";

export default function ServicePageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const service = services.find((s) => s.slug === slug) ?? services[0];
  const otherServices = services.filter((s) => s.slug !== slug);

  return (
    <div className="mx-auto max-w-[1120px] px-md py-xl">
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 max-w-[700px]">
          <nav className="mb-lg text-sm text-slate">
            <Link href="/" className="hover:text-accent transition-colors duration-150 no-underline">Home</Link>
            <span className="mx-sm">/</span>
            <span className="text-ink">{service.title}</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}>
            <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-md">{service.title}</h1>
            <p className="text-base leading-relaxed text-slate mb-xl">{service.description}</p>
            <h2 className="font-display text-md font-semibold text-ink mb-md">What&apos;s included</h2>
            <ul className="space-y-sm mb-xl">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-sm text-sm text-slate">
                  <span className="text-accent mt-[3px] shrink-0">—</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-xl pt-xl border-t border-line">
              <h3 className="font-display text-md font-semibold text-ink mb-md">Other services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                {otherServices.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`}
                    className="block p-md border border-line text-sm text-slate hover:text-accent hover:border-ink transition-all duration-150 no-underline rounded-sm">
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
            {service.faq.length > 0 && (
              <div className="mt-xl pt-xl border-t border-line">
                <h3 className="font-display text-md font-semibold text-ink mb-md">Frequently asked questions</h3>
                <Accordion items={service.faq.map((f) => ({ question: f.q, answer: f.a }))} />
              </div>
            )}
          </motion.div>
        </div>
        <div className="lg:w-[360px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <CornerBracketFrame className="bg-accent-dim">
              <p className="text-sm text-slate mb-sm">Starting at</p>
              <p className="font-mono text-[28px] leading-[36px] font-medium text-ink mb-lg">
                {service.startingPrice ? `$${service.startingPrice.toLocaleString()}` : "Custom scope"}
              </p>
              <Button className="w-full" onClick={() => router.push(`/quote?category=${service.slug}`)}>
                Request a Quote
              </Button>
              <p className="mt-md text-xs text-slate text-center">Final price based on your specific requirements</p>
            </CornerBracketFrame>
          </div>
        </div>
      </div>
    </div>
  );
}