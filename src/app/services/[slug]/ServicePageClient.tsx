"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Smartphone,
  Bot,
  Sparkles,
  GraduationCap,
  Gauge,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { projectTiers, services, type ServiceIcon } from "@/lib/legacy-utils";

const icons: Record<ServiceIcon, typeof Globe> = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  gauge: Gauge,
};

export default function ServicePageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const service = services.find((s) => s.slug === slug) ?? services[0];
  const otherServices = services.filter((s) => s.slug !== service.slug);
  const Icon = icons[service.icon];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const page = isDark ? "bg-[#0A0912] text-[#F7F6FA]" : "bg-[#F6F5F9] text-[#14121F]";
  const muted = isDark ? "text-[#9C99AC]" : "text-[#6B6876]";
  const ink = isDark ? "text-[#F7F6FA]" : "text-[#14121F]";
  const card = isDark
    ? "border-[#242233] bg-[#1A1828]/70"
    : "border-white/60 bg-white/70";
  const chip = isDark
    ? "border-[rgba(200,16,46,0.35)] bg-[rgba(200,16,46,0.12)] text-[#FF8A80]"
    : "border-[rgba(200,16,46,0.2)] bg-[#FBE2E4] text-[#C8102E]";
  const iconBox = isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]";
  const quoteHref = `/quote?category=${service.slug}`;

  return (
    <div className={`${page} transition-colors duration-300`}>
      <section className="relative overflow-hidden pt-10 pb-8 lg:pt-16 lg:pb-10">
        <div className="pointer-events-none absolute inset-0">
          {isDark ? (
            <div className="absolute -top-[40%] left-1/3 h-[70%] w-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.16),transparent_60%)] blur-[24px]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(200,16,46,0.06),transparent_50%)]" />
          )}
        </div>

        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
          <nav className={`mb-6 text-[13px] ${muted}`} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#C8102E] transition-colors no-underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/services" className="hover:text-[#C8102E] transition-colors no-underline">
              Services
            </Link>
            <span className="mx-2">/</span>
            <span className={ink}>{service.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="flex-1 min-w-0 max-w-[720px]">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${chip}`}>
                  <Icon size={12} />
                  {service.title}
                </span>
                <h1 className="mt-5 font-display text-[32px] lg:text-[48px] font-bold leading-[1.05] tracking-[-0.03em]">
                  {service.hero}
                </h1>
                <p className={`mt-5 text-[16px] leading-[1.7] ${muted}`}>{service.description}</p>

                <div className="mt-8 lg:hidden">
                  <StartPanel
                    isDark={isDark}
                    ink={ink}
                    muted={muted}
                    onStart={() => router.push(quoteHref)}
                    title={service.title}
                  />
                </div>

                <h2 className={`mt-12 font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                  What you walk away with
                </h2>
                <ul className="mt-5 space-y-3">
                  {service.outcomes.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-[1.6]">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconBox}`}>
                        <Check size={12} />
                      </span>
                      <span className={muted}>{item}</span>
                    </li>
                  ))}
                </ul>

                <h2 className={`mt-12 font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                  Always included
                </h2>
                <p className={`mt-2 text-[14px] ${muted}`}>
                  Domain (if purchased through us), hosting, and backend — on every build. Add-ons are inferred from your brief; you can still add more before you pay.
                </p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((f) => (
                    <div key={f} className={`rounded-[16px] border px-4 py-3 text-[14px] ${card} ${ink}`}>
                      {f}
                    </div>
                  ))}
                </div>

                <h2 className={`mt-12 font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                  How this category is delivered
                </h2>
                <div className="mt-5 space-y-4">
                  {service.process.map((step, i) => (
                    <div key={step.title} className={`rounded-[20px] border p-5 ${card}`}>
                      <div className="text-[12px] font-semibold tracking-wider text-[#C8102E]">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className={`mt-1 text-[16px] font-semibold ${ink}`}>{step.title}</h3>
                      <p className={`mt-2 text-[14px] leading-[1.6] ${muted}`}>{step.body}</p>
                    </div>
                  ))}
                </div>

                <h2 className={`mt-12 font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                  What we collect at intake
                </h2>
                <p className={`mt-2 text-[14px] ${muted}`}>
                  The customer does not manually select feature add-ons as a required step. After the brief, the pricing engine decides what the project needs.
                </p>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.intake.map((item) => (
                    <li key={item} className={`flex items-center gap-2 text-[14px] ${muted}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h2 className={`mt-12 font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                  Tiers for this build
                </h2>
                <p className={`mt-2 text-[14px] ${muted}`}>
                  Recurring services and review rounds scale by tier. The development-fee math does not.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {projectTiers.map((tier) => (
                    <div key={tier.name} className={`rounded-[16px] border p-4 ${card}`}>
                      <div className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
                        {tier.name}
                      </div>
                      <div className={`mt-1 text-[13px] ${ink}`}>{tier.revisions}</div>
                      <div className={`mt-1 text-[12px] ${muted}`}>{tier.for}</div>
                    </div>
                  ))}
                </div>

                {service.faq.length > 0 && (
                  <div className="mt-12">
                    <h2 className={`font-display text-[22px] lg:text-[26px] font-semibold ${ink}`}>
                      Frequently asked questions
                    </h2>
                    <div className={`mt-5 divide-y rounded-[20px] border ${isDark ? "divide-[#242233] border-[#242233]" : "divide-[#E8E6F0] border-[#E8E6F0]"}`}>
                      {service.faq.map((item, i) => {
                        const open = openFaq === i;
                        return (
                          <div key={item.q}>
                            <button
                              type="button"
                              onClick={() => setOpenFaq(open ? null : i)}
                              aria-expanded={open}
                              className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium ${ink}`}
                            >
                              {item.q}
                              <ChevronDown
                                size={18}
                                className={`shrink-0 transition-transform duration-200 ${muted} ${open ? "rotate-180" : ""}`}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <p className={`px-5 pb-4 text-[14px] leading-[1.65] ${muted}`}>{item.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-10 border-t border-current/10">
                  <h3 className={`font-display text-[18px] font-semibold mb-4 ${ink}`}>Other services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherServices.map((s) => {
                      const OtherIcon = icons[s.icon];
                      return (
                        <Link
                          key={s.slug}
                          href={`/services/${s.slug}`}
                          className={`group flex items-start gap-3 rounded-[16px] border p-4 no-underline transition-all hover:-translate-y-0.5 ${card}`}
                        >
                          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${iconBox}`}>
                            <OtherIcon size={16} />
                          </span>
                          <span>
                            <span className={`block text-[14px] font-semibold ${ink}`}>{s.title}</span>
                            <span className={`mt-1 block text-[12px] leading-[1.45] ${muted}`}>{s.short}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            <aside className="hidden lg:block w-[360px] shrink-0">
              <div className="sticky top-24">
                <StartPanel
                  isDark={isDark}
                  ink={ink}
                  muted={muted}
                  onStart={() => router.push(quoteHref)}
                  title={service.title}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-[20px] border ${card}`}>
            <div className={`pointer-events-none absolute inset-0 ${isDark ? "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.15),transparent_50%)]" : "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.08),transparent_50%)]"}`} />
            <div className="relative p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <h2 className={`font-display text-[22px] font-semibold ${ink}`}>
                  Start a {service.title.toLowerCase()} project
                </h2>
                <p className={`mt-1 text-[14px] ${muted}`}>Get Started — we’ll price it from your brief.</p>
              </div>
              <Link
                href={quoteHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StartPanel({
  isDark,
  ink,
  muted,
  onStart,
  title,
}: {
  isDark: boolean;
  ink: string;
  muted: string;
  onStart: () => void;
  title: string;
}) {
  return (
    <div
      className="rounded-[20px] p-[1.5px] shadow-[0_0_0_1px_rgba(200,16,46,0.08),0_12px_32px_rgba(200,16,46,0.12)]"
      style={{ background: "linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)" }}
    >
      <div className={`rounded-[18.5px] p-6 ${isDark ? "bg-[#141220]" : "bg-white"}`}>
        <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
          {title}
        </p>
        <h2 className={`mt-2 font-display text-[22px] font-semibold leading-[1.2] ${ink}`}>
          One price to finish the build.
        </h2>
        <p className={`mt-3 text-[14px] leading-[1.6] ${muted}`}>
          Describe the project. We compute a single total — hosting and backend included. No line-item shopping at purchase.
        </p>
        <ul className={`mt-5 space-y-2 text-[13px] ${muted}`}>
          {[
            "Human team, not an AI agent",
            "Reviews included by tier",
            "Add-ons inferred from your brief",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <Check size={14} className="mt-0.5 shrink-0 text-[#C8102E]" />
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-5 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform"
        >
          Get Started
          <ArrowRight size={16} />
        </button>
        <p className={`mt-3 text-center text-[12px] ${muted}`}>
          Final total from your brief — same development math at every tier.
        </p>
      </div>
    </div>
  );
}
