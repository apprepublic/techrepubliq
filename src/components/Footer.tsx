"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add("line-in");
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const logoSrc = isDark ? "/assets/logo-black-bg.png?v=3" : "/assets/logo-white-bg.png?v=3";

  return (
    <footer
      id="rootFooter"
      className={`pt-20 transition-colors duration-300 ${
        isDark ? "bg-[#0A0912] text-[#F7F6FA]" : "bg-[#F6F5F9] text-[#14121F] border-t border-[#E8E6F0]"
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 pb-14">
          <div>
            <Link href="/">
              <Image src={logoSrc} alt="TechRepubliQ" height={28} width={140} className="shrink-0" unoptimized />
            </Link>
            <p className={`text-[14px] mt-3 max-w-[32ch] ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>
              Web, app, and AI automation work, scoped and priced before anything is built.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                aria-label="TechRepubliQ on X"
                className={`w-9 h-9 rounded-full border flex items-center justify-center no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E] ${
                  isDark ? "border-[#242233] text-[#9C99AC]" : "border-[#E8E6F0] text-[#6B6876] bg-white/60"
                }`}
              >
                𝕏
              </a>
              <a
                href="https://www.linkedin.com/company/techrepubliq/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TechRepubliQ on LinkedIn"
                className={`w-9 h-9 rounded-full border flex items-center justify-center no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E] ${
                  isDark ? "border-[#242233] text-[#9C99AC]" : "border-[#E8E6F0] text-[#6B6876] bg-white/60"
                }`}
              >
                in
              </a>
            </div>
          </div>

          <div>
            <h4 className={`text-sm mb-4 font-medium ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Services</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/services/web-development" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Web Development</Link></li>
              <li><Link href="/services/app-development" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>App Development</Link></li>
              <li><Link href="/services/ai-automation" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>AI Automation</Link></li>
              <li><Link href="/services/ai-integration" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>AI Integration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`text-sm mb-4 font-medium ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Company</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/#process" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>How it works</Link></li>
              <li><Link href="/pricing" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Pricing & FAQ</Link></li>
              <li><Link href="/login" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={`text-sm mb-4 font-medium ${isDark ? "text-[#9C99AC]" : "text-[#6B6876]"}`}>Legal</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/terms" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Terms of Service</Link></li>
              <li><Link href="/pricing" className={`text-sm no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div
          ref={footerRef}
          className={`relative border-t py-6 flex justify-between text-[13px] flex-wrap gap-3 before:content-[''] before:absolute before:top-[-1px] before:left-0 before:h-[2px] before:w-0 before:bg-gradient-to-br before:from-[#FF5C4D] before:to-[#C8102E] transition-colors duration-300 ${
            isDark ? "border-[#242233] text-[#9C99AC]" : "border-[#E8E6F0] text-[#6B6876]"
          }`}
        >
          <span>© 2026 TechRepubliQ Ltd. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/terms" className={`no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Terms of Service</Link>
            <Link href="/pricing" className={`no-underline transition-colors duration-150 ${isDark ? "text-[#9C99AC] hover:text-[#F7F6FA]" : "text-[#6B6876] hover:text-[#14121F]"}`}>Privacy Policy</Link>
          </div>
        </div>
      </div>

      <style>{`
        .line-in::before { width: 100% !important; transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </footer>
  );
}
