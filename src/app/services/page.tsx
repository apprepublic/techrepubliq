"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Globe,
  Smartphone,
  Bot,
  Sparkles,
  GraduationCap,
  Gauge,
  ArrowRight,
  Check,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ChromeSunburst from "@/components/ChromeSunburst";
import { projectTiers, services, type ServiceIcon } from "@/lib/legacy-utils";

const icons: Record<ServiceIcon, typeof Globe> = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  gauge: Gauge,
};

const journey = [
  { n: "01", t: "Get Started", d: "Pick the category that matches what you want built." },
  { n: "02", t: "Pick your tier", d: "MVP, Startup, Business, or Enterprise — based on how you operate." },
  { n: "03", t: "Send the brief", d: "Logo, assets, and a business brief. No plugin shopping." },
  { n: "04", t: "Get Priced", d: "One total. The engine infers add-ons. You can still add more." },
  { n: "05", t: "Pay & we build", d: "A human team builds it. Reviews included by tier." },
  { n: "06", t: "Launch & manage", d: "Dashboard, services, analytics — on your domain." },
];

export default function ServicesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  return (
    <div className={`${page} transition-colors duration-300`}>
      <section className={`relative overflow-hidden pt-16 pb-16 lg:pt-24 lg:pb-24`}>
        <div className="pointer-events-none absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[#0A0912]" />
              <div className="absolute -top-[30%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.18),transparent_60%)] blur-[20px]" />
              <div className="absolute top-[20%] right-[-10%] h-[60%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,92,77,0.12),transparent_65%)] blur-[30px]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#F6F5F9]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(200,16,46,0.06),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(255,92,77,0.04),transparent_50%)]" />
            </>
          )}
        </div>

        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <span className={`inline-flex items-center rounded-full border px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${chip}`}>
              Services
            </span>
            <h1 className="mt-5 font-display text-[36px] lg:text-[56px] font-bold leading-[0.95] tracking-[-0.03em]">
              <span className={`block ${ink}`}>Built by humans.</span>
              <span className="block text-[#C8102E]">Scoped from your brief.</span>
            </h1>
            <p className={`mt-5 max-w-[48ch] text-[15px] lg:text-[16px] leading-[1.6] ${muted}`}>
              TechRepubliQ is a build-and-launch platform. You describe the product, we price it as a single total, and a real team designs, builds, and launches it. No tokens to run out of mid-build.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform"
              >
                Get Started
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#C8102E] text-[12px]">→</span>
              </Link>
              <Link
                href="#categories"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium border transition-transform hover:-translate-y-0.5 ${isDark ? "border-[#242233] text-[#F7F6FA]" : "border-[#E8E6F0] text-[#14121F]"}`}
              >
                Browse categories
              </Link>
            </div>
            <div className={`mt-8 flex flex-wrap gap-2 text-[12px] ${muted}`}>
              {["One-time build fee", "Human-in-the-loop reviews", "Hosting & backend included"].map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${isDark ? "border-[#242233]" : "border-[#E8E6F0]"}`}
                >
                  <Check size={12} className="text-[#C8102E]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative h-[380px] w-[380px]">
              <div className={`absolute inset-0 rounded-full blur-[18px] ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.25),transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.12),transparent_70%)]"}`} />
              <ChromeSunburst />
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className={`py-16 lg:py-24 border-t ${isDark ? "border-[#242233]" : "border-[#E8E6F0]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className="mb-10 max-w-[46ch]">
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>
              Categories
            </span>
            <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] ${ink}`}>
              What we <span className="text-[#C8102E]">build.</span>
            </h2>
            <p className={`mt-3 text-[15px] leading-[1.6] ${muted}`}>
              Pick a category to see how we deliver it. Every path starts the same: Get Started, get priced, we build it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => {
              const Icon = icons[s.icon];
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/services/${s.slug}`}
                    className={`group flex h-full flex-col rounded-[20px] border backdrop-blur-[16px] p-6 no-underline shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] hover:-translate-y-1 transition-all duration-200 ${card}`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${iconBox}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className={`mt-5 text-[17px] font-semibold ${ink}`}>{s.title}</h3>
                    <p className={`mt-2 text-[14px] leading-[1.55] flex-1 ${muted}`}>{s.short}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-[#C8102E]">
                      View service
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`py-16 lg:py-24 ${isDark ? "bg-[#14121F]" : "bg-[#F6F5F9]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className="mb-10">
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>
              How it works
            </span>
            <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold leading-[1.05] ${ink}`}>
              Describe. Price. <span className="text-[#C8102E]">Build. Launch.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journey.map((step) => (
              <div key={step.n} className={`rounded-[20px] border backdrop-blur-[16px] p-6 ${card}`}>
                <div className="font-display text-[13px] font-semibold tracking-wider text-[#C8102E]">{step.n}</div>
                <h3 className={`mt-2 text-[16px] font-semibold ${ink}`}>{step.t}</h3>
                <p className={`mt-2 text-[14px] leading-[1.55] ${muted}`}>{step.d}</p>
              </div>
            ))}
          </div>
          <div
            className="mt-6 rounded-[20px] p-[1.5px]"
            style={{ background: "linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)" }}
          >
            <div className={`rounded-[18.5px] p-6 lg:p-8 ${isDark ? "bg-[#141220]" : "bg-white"}`}>
              <h3 className={`font-display text-[20px] font-semibold ${ink}`}>No tokens. No metering.</h3>
              <p className={`mt-2 max-w-[72ch] text-[14px] leading-[1.65] ${muted}`}>
                Other build tools give you a bucket of tokens that can run out before the project ships. TechRepubliQ charges one development fee to finish the build as scoped. Tokens apply only to optional AI add-ons after launch — never the core build.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`py-16 lg:py-24 border-t ${isDark ? "border-[#242233] bg-[#0A0912]" : "border-[#E8E6F0]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className="mb-10 max-w-[50ch]">
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>
              Project tiers
            </span>
            <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold leading-[1.05] ${ink}`}>
              Pick the tier that fits <span className="text-[#C8102E]">your business.</span>
            </h2>
            <p className={`mt-3 text-[15px] leading-[1.6] ${muted}`}>
              Your one-time build fee is computed from the project — the same math at every tier. Tiers scale recurring services and included reviews, never the development-fee formula.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectTiers.map((tier) => (
              <div key={tier.name} className={`rounded-[20px] border backdrop-blur-[16px] p-6 ${card}`}>
                <div className={`text-[13px] font-semibold uppercase tracking-[0.06em] ${isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
                  {tier.name}
                </div>
                <div className={`mt-2 text-[16px] font-semibold ${ink}`}>{tier.for}</div>
                <ul className={`mt-4 space-y-2 text-[13px] ${muted}`}>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#C8102E]" />
                    {tier.revisions}
                  </li>
                  <li className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#C8102E]" />
                    {tier.services}
                  </li>
                </ul>
              </div>
            ))}
          </div>
          <p className={`mt-5 text-[13px] ${muted}`}>
            Tiers upgrade anytime; they are never downgraded. We suggest an upgrade as you near your limits.
          </p>
        </div>
      </section>

      <section className={`pb-16 lg:pb-24 ${isDark ? "bg-[#0A0912]" : "bg-[#F6F5F9]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-[20px] border backdrop-blur-[16px] ${card}`}>
            <div className={`pointer-events-none absolute inset-0 ${isDark ? "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.15),transparent_50%)]" : "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.08),transparent_50%)]"}`} />
            <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className={`font-display text-[24px] lg:text-[32px] font-semibold leading-[1.05] ${ink}`}>
                  Ready to build? <span className="text-[#C8102E]">Get started.</span>
                </h2>
                <p className={`mt-3 max-w-[42ch] text-[14px] leading-[1.6] ${muted}`}>
                  Describe the project. Get one upfront price. We design, build, and launch it.
                </p>
              </div>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform"
              >
                Get Started
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#C8102E] text-[12px]">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
