"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Globe,
  Smartphone,
  Bot,
  Sparkles,
  GraduationCap,
  Gauge,
} from "lucide-react";
import ChromeSunburst from "@/components/ChromeSunburst";
import { services, projectTiers, type ServiceIcon } from "@/lib/utils";
import { useTone } from "@/lib/theme";
import { PrimaryLink, GhostLink } from "@/components/product-ui";

const icons: Record<ServiceIcon, typeof Globe> = {
  globe: Globe,
  smartphone: Smartphone,
  bot: Bot,
  sparkles: Sparkles,
  "graduation-cap": GraduationCap,
  gauge: Gauge,
};

const journey = [
  { n: "01", t: "Get Started", d: "Pick a category — web, app, automation, integration, or training." },
  { n: "02", t: "Pick your tier", d: "MVP, Startup, Business, or Enterprise. Tiers scale services, not the build fee." },
  { n: "03", t: "Send the brief", d: "Logo, assets, and what you want built. No plugin shopping." },
  { n: "04", t: "Get Priced", d: "One total. The engine infers add-ons. You can still add more." },
  { n: "05", t: "Pay & we build", d: "A human team builds a preview. Reviews included by tier." },
  { n: "06", t: "Launch & manage", d: "Go live on your domain. Services, analytics, and edits live in the dashboard." },
];

const proofs = [
  { v: "One-time", l: "Build fee — not a token meter" },
  { v: "4 tiers", l: "MVP to Enterprise" },
  { v: "Human", l: "Reviews before launch" },
];

const quotes = [
  { q: "We described the product once. They priced it once. It actually shipped.", n: "Amaka O.", r: "Founder, Lagos" },
  { q: "No one handed us a pile of API keys. The product just works, and they own the stack.", n: "Daniel K.", r: "Ops lead, Accra" },
  { q: "The preview link was enough to raise the next round. Then we hit Go Live.", n: "Priya S.", r: "CEO, London" },
];

export default function HomePage() {
  const t = useTone();

  return (
    <div className={t.page}>
      <section className="relative overflow-hidden pt-16 pb-16 lg:pt-28 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          {t.isDark ? (
            <>
              <div className="absolute -top-[30%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.18),transparent_60%)] blur-[20px]" />
              <div className="absolute top-[20%] right-[-10%] h-[60%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,92,77,0.12),transparent_65%)] blur-[30px]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(200,16,46,0.06),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(255,92,77,0.04),transparent_50%)]" />
          )}
        </div>
        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <span className={`inline-flex items-center rounded-full border px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${t.chip}`}>
              Build-and-launch platform
            </span>
            <h1 className="mt-5 font-display text-[36px] lg:text-[56px] font-bold leading-[0.95] tracking-[-0.03em]">
              <span className={`block ${t.ink}`}>Your product, built by a real team.</span>
              <span className="block text-[#C8102E]">Priced once.</span>
            </h1>
            <p className={`mt-5 max-w-[48ch] text-[16px] leading-[1.65] ${t.muted}`}>
              Describe your project, get one upfront price, and our team designs, builds, and launches it for a single one-time fee. No tokens to run out of mid-build.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink href="/quote">
                Get Started <span>→</span>
              </PrimaryLink>
              <GhostLink href="#process">See how it works</GhostLink>
            </div>
            <div className={`mt-8 flex flex-wrap gap-2 text-[12px] ${t.muted}`}>
              {["One-time build fee", "Human-in-the-loop reviews", "Hosting & backend included"].map((x) => (
                <span key={x} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${t.border}`}>
                  <Check size={12} className="text-[#C8102E]" />
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative h-[400px] w-[400px]">
              <div className={`absolute inset-0 rounded-full blur-[18px] ${t.isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.25),transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.12),transparent_70%)]"}`} />
              <ChromeSunburst />
            </div>
          </div>
        </div>
      </section>

      <section className={`py-12 lg:py-16 border-y ${t.border}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8 grid md:grid-cols-3 gap-4">
          {proofs.map((p) => (
            <div key={p.l} className={`rounded-[20px] border p-6 ${t.card}`}>
              <div className={`font-display text-[24px] font-bold ${t.ink}`}>{p.v}</div>
              <div className={`mt-1 text-[14px] ${t.muted}`}>{p.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${t.chip}`}>
            What we build
          </span>
          <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold ${t.ink}`}>
            Services, not a token bucket.
          </h2>
          <p className={`mt-3 max-w-[50ch] text-[15px] ${t.muted}`}>
            Pick a category. We price the project from your brief. A human team ships it.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => {
              const Icon = icons[s.icon];
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/services/${s.slug}`}
                    className={`group flex h-full flex-col rounded-[20px] border p-6 no-underline hover:-translate-y-1 transition-all ${t.card}`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${t.iconBox}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className={`mt-5 text-[17px] font-semibold ${t.ink}`}>{s.title}</h3>
                    <p className={`mt-2 text-[14px] leading-[1.55] flex-1 ${t.muted}`}>{s.short}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-[#C8102E]">
                      View service <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="tiers" className={`py-16 lg:py-24 border-t ${t.border}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${t.chip}`}>
            Project tiers
          </span>
          <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold ${t.ink}`}>
            Pick the tier that fits your business.
          </h2>
          <p className={`mt-3 max-w-[54ch] text-[15px] ${t.muted}`}>
            Your one-time build fee is computed from the project — the same math at every tier. Tiers scale recurring services and included reviews only.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectTiers.map((tier) => (
              <div key={tier.name} className={`rounded-[20px] border p-6 ${t.card} ${tier.name === "Startup" ? "ring-1 ring-[#C8102E]/40" : ""}`}>
                <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#C8102E]">{tier.name}</div>
                <div className={`mt-2 text-[16px] font-semibold ${t.ink}`}>{tier.for}</div>
                <ul className={`mt-4 space-y-2 text-[13px] ${t.muted}`}>
                  <li className="flex gap-2"><Check size={14} className="mt-0.5 text-[#C8102E] shrink-0" />{tier.revisions}</li>
                  <li className="flex gap-2"><Check size={14} className="mt-0.5 text-[#C8102E] shrink-0" />{tier.services}</li>
                </ul>
              </div>
            ))}
          </div>
          <p className={`mt-5 text-[13px] ${t.muted}`}>Tiers upgrade anytime; they are never downgraded. We’ll suggest an upgrade as you near your limits.</p>
        </div>
      </section>

      <section id="process" className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${t.chip}`}>
            How it works
          </span>
          <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold ${t.ink}`}>
            Describe. Price. Build. Launch.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journey.map((step) => (
              <div key={step.n} className={`rounded-[20px] border p-6 ${t.card}`}>
                <div className="font-display text-[13px] font-semibold tracking-wider text-[#C8102E]">{step.n}</div>
                <h3 className={`mt-2 text-[16px] font-semibold ${t.ink}`}>{step.t}</h3>
                <p className={`mt-2 text-[14px] leading-[1.55] ${t.muted}`}>{step.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[20px] p-[1.5px]" style={{ background: "linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)" }}>
            <div className={`rounded-[18.5px] p-6 lg:p-8 ${t.surface}`}>
              <h3 className={`font-display text-[20px] font-semibold ${t.ink}`}>No tokens. No metering.</h3>
              <p className={`mt-2 max-w-[72ch] text-[14px] leading-[1.65] ${t.muted}`}>
                Other build tools give you a bucket of tokens that can run out before your project ships. TechRepubliQ charges one development fee to finish the build as scoped. Tokens apply only to optional AI add-ons after launch — never the core build.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`py-16 lg:py-24 border-t ${t.border}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <h2 className={`font-display text-[28px] lg:text-[40px] font-semibold ${t.ink}`}>Teams who shipped.</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {quotes.map((item) => (
              <div key={item.n} className={`rounded-[20px] border p-6 ${t.card}`}>
                <p className={`text-[15px] leading-[1.6] ${t.ink}`}>“{item.q}”</p>
                <p className={`mt-5 text-[13px] font-semibold ${t.ink}`}>{item.n}</p>
                <p className={`text-[12px] ${t.muted}`}>{item.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="preview" className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <h2 className={`font-display text-[28px] lg:text-[40px] font-semibold ${t.ink}`}>
            Preview on us. Go live on you.
          </h2>
          <p className={`mt-3 max-w-[50ch] text-[15px] ${t.muted}`}>
            Every project in preview gets a TechRepubliQ subdomain — shareable, no watermark. Publish moves it to your domain. Hosting and backend stay with us.
          </p>
          <div className={`mt-8 rounded-[20px] border p-6 lg:p-10 ${t.card}`}>
            <div className="text-[12px] uppercase tracking-wider text-[#C8102E]">Preview</div>
            <div className={`mt-2 font-display text-[22px] ${t.ink}`}>your-project.techrepubliq.app</div>
            <div className={`mt-6 h-2 w-24 rounded-full bg-[#C8102E]`} />
            <div className="mt-6 grid gap-2">
              {[72, 54, 88].map((w) => (
                <div key={w} className={`h-3 rounded-full ${t.isDark ? "bg-[#242233]" : "bg-[#E8E6F0]"}`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="quote" className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-[20px] border ${t.card}`}>
            <div className={`pointer-events-none absolute inset-0 ${t.isDark ? "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.15),transparent_50%)]" : "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.08),transparent_50%)]"}`} />
            <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className={`font-display text-[24px] lg:text-[32px] font-semibold ${t.ink}`}>
                  Ready to build? <span className="text-[#C8102E]">Get started.</span>
                </h2>
                <p className={`mt-3 max-w-[42ch] text-[14px] ${t.muted}`}>
                  Describe the project. Get one upfront price. We design, build, and launch it.
                </p>
              </div>
              <PrimaryLink href="/quote">
                Get Started <span>→</span>
              </PrimaryLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
