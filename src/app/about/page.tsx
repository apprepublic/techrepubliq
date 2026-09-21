"use client";

import ChromeSunburst from "@/components/ChromeSunburst";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`${isDark ? "bg-[#0A0912] text-[#F7F6FA]" : "bg-[#F6F5F9] text-[#14121F]"} transition-colors duration-300`}>
      {/* HERO - Theme-aware with gaussian background */}
      <section className={`relative overflow-hidden ${isDark ? "bg-[#0A0912]" : "bg-[#F6F5F9]"} pt-28 pb-16 lg:pt-36 lg:pb-24 transition-colors duration-300`}>
        {/* Gaussian background */}
        <div className="pointer-events-none absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[#0A0912]" />
              <div
                className="absolute inset-[-20px] opacity-90"
                style={{
                  background: `linear-gradient(90deg, rgba(10,9,18,0.72) 0%, rgba(10,9,18,0.35) 45%, rgba(10,9,18,0.15) 100%)`,
                  filter: 'blur(18px)',
                  transform: 'scale(1.08)',
                }}
              />
              <div className="absolute -top-[30%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.18),transparent_60%)] blur-[20px]" />
              <div className="absolute top-[20%] right-[-10%] h-[60%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,92,77,0.12),transparent_65%)] blur-[30px]" />
              <div className="absolute top-[10%] left-[-10%] h-[50%] w-[40%] bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.1),transparent_60%)] blur-[40px]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[#F6F5F9]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(200,16,46,0.06),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(255,92,77,0.04),transparent_50%)]" />
              {/* Light overlay effect for hero images to keep background light */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,245,249,0.9)_0%,rgba(246,245,249,0.6)_45%,rgba(246,245,249,0.3)_100%)]" />
              <div className="absolute -top-[30%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.08),transparent_60%)] blur-[20px]" />
              <div className="absolute top-[20%] right-[-10%] h-[60%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,92,77,0.06),transparent_65%)] blur-[30px]" />
            </>
          )}
        </div>

        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 items-center">
          <div>
            <span className={`inline-flex items-center rounded-full border px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${isDark ? "border-[rgba(200,16,46,0.35)] bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "border-[rgba(200,16,46,0.2)] bg-[#FBE2E4] text-[#C8102E]"}`}>
              About Us
            </span>
            <h1 className="mt-5 font-display text-[36px] lg:text-[56px] font-bold leading-[0.95] tracking-[-0.03em]">
              <span className={`block ${isDark ? "text-white" : "text-[#14121F]"}`}>Ideas. Technology.</span>
              <span className="block text-[#C8102E]">Real Impact.</span>
            </h1>
            <p className={`mt-5 max-w-[48ch] text-[15px] lg:text-[16px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>
              TechRepubliQ is a build-and-launch platform: you describe the product, we scope it from your brief, and a human team designs, builds, and ships it. Hosting and backend stay with us. You own the outcome.
            </p>
            <div className="mt-8">
              <Link
                href="/#preview"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-transform hover:-translate-y-0.5 ${isDark ? "bg-white text-[#0A0912]" : "bg-[#14121F] text-white"}`}
              >
                Our Work
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C8102E] text-white">→</span>
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className={`absolute h-[320px] w-[520px] lg:h-[420px] lg:w-[680px] rounded-[50%] border ${isDark ? "border-[rgba(255,92,77,0.18)]" : "border-[rgba(200,16,46,0.12)]"} [transform:rotateX(68deg)_rotateZ(-18deg)]`} />
              <div className={`absolute h-[360px] w-[560px] lg:h-[480px] lg:w-[740px] rounded-[50%] border ${isDark ? "border-[rgba(200,16,46,0.22)]" : "border-[rgba(200,16,46,0.15)]"} [transform:rotateX(68deg)_rotateZ(28deg)] opacity-60`} />
              <div className={`absolute h-[280px] w-[460px] lg:h-[360px] lg:w-[600px] rounded-[50%] border border-dashed ${isDark ? "border-[rgba(255,255,255,0.08)]" : "border-[rgba(20,18,31,0.08)]"} [transform:rotateX(68deg)]`} />
            </div>
            <div className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px] lg:h-[460px] lg:w-[460px]">
              <div className={`absolute inset-0 rounded-full blur-[18px] ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.25),transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.12),transparent_70%)]"}`} />
              {/* Light mode overlay to keep background light */}
              {!isDark && (
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(246,245,249,0.6),transparent_60%)] pointer-events-none z-10" />
              )}
              <ChromeSunburst />
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className={`${isDark ? "bg-[#14121F] border-[#242233]" : "bg-[#F6F5F9] border-transparent"} py-16 lg:py-28 transition-colors duration-300`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>
              Our Story +
            </span>
            <h2 className={`mt-4 font-display text-[28px] lg:text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>
              Building the Future
              <br />
              with <span className="text-[#C8102E]">Innovation</span>
            </h2>
            <div className={`mt-6 space-y-4 text-[15px] leading-[1.7] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>
              <p>We started with a simple belief — great ideas can change lives. Today, we&apos;re a team of designers, developers and strategists helping brands build powerful digital solutions, from concept to scale.</p>
              <p>From web and mobile apps to complex systems and automation, we combine creativity with technology to deliver products that make an impact.</p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>◍</div>
              <div>
                <div className={`text-[13px] font-semibold ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>Founded in 2021</div>
                <div className={`text-[12px] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Built for a digital-first world.</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className={`relative overflow-hidden rounded-[20px] border backdrop-blur-[16px] shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] ${isDark ? "border-[#242233] bg-[#1A1828]/70" : "border-white/60 bg-white/70"}`}>
              <div className="aspect-[16/10] relative bg-[#0F0E1A]">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,16,46,0.35)] via-transparent to-[rgba(200,16,46,0.15)]" />
                <div className="absolute bottom-0 left-0 right-0 top-[30%] flex items-end gap-2 px-6 pb-6">
                  <div className="h-[55%] w-[28%] rounded-t-lg bg-[#1A1828] border border-[#242233]" />
                  <div className="h-[70%] w-[35%] rounded-t-lg bg-[#1A1828] border border-[#242233] relative">
                    <div className="absolute top-2 left-2 right-2 h-2 rounded-full bg-[#242233]" />
                    <div className="absolute top-6 left-2 right-8 h-16 rounded bg-[#0A0912] border border-[#C8102E]/30" />
                  </div>
                  <div className="h-[50%] w-[25%] rounded-t-lg bg-[#1A1828] border border-[#242233]" />
                </div>
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-[#1E1C2E] bg-[rgba(10,9,18,0.6)] backdrop-blur">
                  <div className="h-1 w-24 rounded-full bg-[#C8102E]/50" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#C8102E]" />
                    <span className="text-[13px] font-bold tracking-wide text-white">TECHRepubliq</span>
                  </div>
                </div>
                <div className="absolute top-[28%] left-0 right-0 h-[2px] bg-[#C8102E] shadow-[0_0_12px_rgba(200,16,46,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR IMPACT */}
      <section className={`relative py-14 lg:py-20 border-y transition-colors duration-300 ${isDark ? "bg-[#0A0912] border-[#242233]" : "bg-[#F6F5F9] border-[#E8E6F0]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-center">
          <div>
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>Our Impact +</span>
            <h2 className={`mt-4 font-display text-[26px] lg:text-[36px] font-semibold leading-[1.05] ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>
              Numbers that
              <br />
              speak for <span className="text-[#C8102E]">themselves.</span>
            </h2>
            <div className="mt-4 h-[2px] w-12 bg-[#C8102E]" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { v: "50+", l: "Projects Delivered" },
              { v: "30+", l: "Happy Clients" },
              { v: "5+", l: "Countries" },
              { v: "100%", l: "Commitment" },
            ].map((s) => (
              <div
                key={s.l}
                className={`rounded-[20px] border backdrop-blur-[16px] p-5 shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] transition-colors duration-300 ${isDark ? "border-[#242233] bg-[#1A1828]/70" : "border-white/60 bg-white/70"}`}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>◫</div>
                <div className={`font-display text-[28px] font-bold leading-none ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>{s.v}</div>
                <div className={`mt-2 text-[12px] leading-[1.3] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className={`${isDark ? "bg-[#0A0912]" : "bg-[#F6F5F9]"} py-12 lg:py-24 transition-colors duration-300`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className={`rounded-[20px] border backdrop-blur-[16px] p-6 lg:p-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-8 shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] transition-colors duration-300 ${isDark ? "border-[#242233] bg-[#1A1828]/70" : "border-white/60 bg-white/70"}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>◎</span>
                <span className={`font-display text-[18px] font-semibold ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>
                  Our Mission & <span className="text-[#C8102E]">Vision</span>
                </span>
              </div>
              <p className={`mt-4 text-[14px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>To create technology that solves real problems, empowers people and builds a better digital future.</p>
              <div className="mt-4 h-[2px] w-10 bg-[#C8102E]" />
            </div>
            <div className={`grid md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x ${isDark ? "divide-[#242233]" : "divide-[#E8E6F0]"}`}>
              <div className="pt-6 md:pt-0 md:pl-6 first:pl-0 first:pt-0">
                <h4 className={`text-[14px] font-semibold ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>Mission</h4>
                <p className={`mt-3 text-[13.5px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Deliver innovative, scalable and user-centered digital solutions that help businesses grow and make a meaningful impact.</p>
              </div>
              <div className="pt-6 md:pt-0 md:pl-6">
                <h4 className={`text-[14px] font-semibold ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>Vision</h4>
                <p className={`mt-3 text-[13.5px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>To be a leading global software studio known for innovation, excellence and transformative technology.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className={`py-12 lg:py-24 border-t transition-colors duration-300 ${isDark ? "bg-[#14121F] border-[#242233]" : "bg-[#F6F5F9] border-[#E8E6F0]"}`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-start">
          <div>
            <span className={`inline-flex rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]"}`}>Our Values +</span>
            <h2 className={`mt-4 font-display text-[26px] lg:text-[36px] font-semibold leading-[1.05] ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>
              What <span className="text-[#C8102E]">drives us.</span>
            </h2>
            <p className={`mt-3 max-w-[32ch] text-[14px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Our values shape how we work, build and create lasting relationships with our clients.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Innovation", d: "We turn bold ideas into real solutions." },
              { t: "Collaboration", d: "Great results happen together." },
              { t: "Excellence", d: "We do the work that sets us apart." },
              { t: "Impact", d: "We build for people, not just for today." },
            ].map((v) => (
              <div key={v.t} className={`rounded-[20px] border backdrop-blur-[16px] p-6 shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] hover:-translate-y-1 transition-all duration-300 ${isDark ? "border-[#242233] bg-[#1A1828]/70" : "border-white/60 bg-white/70"}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${isDark ? "bg-[rgba(200,16,46,0.12)]" : "bg-[#FBE2E4]"}`}>
                  <span className={`text-[16px] ${isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>◍</span>
                </div>
                <div className={`mt-5 text-[15px] font-semibold ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>{v.t}</div>
                <div className={`mt-2 text-[13px] leading-[1.5] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>{v.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LET'S BUILD */}
      <section className={`${isDark ? "bg-[#0A0912]" : "bg-[#F6F5F9]"} py-10 lg:py-16 transition-colors duration-300`}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-[20px] border backdrop-blur-[16px] shadow-[0_1px_2px_rgba(20,18,31,0.04),0_8px_24px_rgba(20,18,31,0.06)] transition-colors duration-300 ${isDark ? "border-[#242233] bg-[#1A1828]/80" : "border-white/60 bg-white/80"}`}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -bottom-20 h-[400px] w-[400px] opacity-30">
                <ChromeSunburst />
              </div>
              <div className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.15),transparent_50%)]" : "bg-[radial-gradient(ellipse_at_10%_50%,rgba(200,16,46,0.08),transparent_50%)]"}`} />
            </div>
            <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-center p-8 lg:p-10">
              <div>
                <h2 className={`font-display text-[24px] lg:text-[32px] font-semibold leading-[1.05] ${isDark ? "text-[#F7F6FA]" : "text-[#14121F]"}`}>
                  Let&apos;s Build
                  <br />
                  Something <span className="text-[#C8102E]">Great</span>
                </h2>
                <p className={`mt-3 max-w-[38ch] text-[14px] leading-[1.6] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Have a project in mind? Let&apos;s turn your ideas into powerful digital solutions.</p>
                <div className="mt-6">
                  <Link href="/quote" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform">
                    Get in Touch
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#C8102E] text-[12px]">→</span>
                  </Link>
                </div>
              </div>
              <div className="relative hidden lg:flex items-center justify-end">
                <div className="relative h-[200px] w-[300px]">
                  <div className={`absolute inset-0 rounded-full blur-[16px] ${isDark ? "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.25),transparent_70%)]" : "bg-[radial-gradient(circle_at_50%_50%,rgba(200,16,46,0.12),transparent_70%)]"}`} />
                  <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[12px] border-[#C8102E] shadow-[0_0_30px_rgba(200,16,46,0.3),inset_0_0_20px_rgba(0,0,0,0.1)] [transform:rotateX(60deg)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
