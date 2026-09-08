"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

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

  return (
    <footer className="bg-[#0A0912] text-[#F7F6FA] pt-20">
      <div className="mx-auto max-w-[1180px] px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 pb-14">
          <div>
            <Link href="/">
              <Image src="/assets/logo-dark.png" alt="TechRepubliQ" height={28} width={140} className="shrink-0" />
            </Link>
            <p className="text-[14px] text-[#9C99AC] mt-3 max-w-[32ch]">
              Web, app, and AI automation work, scoped and priced before anything is built.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                aria-label="TechRepubliQ on X"
                className="w-9 h-9 rounded-full border border-[#242233] flex items-center justify-center text-[#9C99AC] no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E]"
              >
                𝕏
              </a>
              <a
                href="#"
                aria-label="TechRepubliQ on LinkedIn"
                className="w-9 h-9 rounded-full border border-[#242233] flex items-center justify-center text-[#9C99AC] no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E]"
              >
                in
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-[#9C99AC] mb-4 font-medium">Services</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/services/web-development" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Web Development</Link></li>
              <li><Link href="/services/app-development" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">App Development</Link></li>
              <li><Link href="/services/ai-automation" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">AI Automation</Link></li>
              <li><Link href="/services/ai-integration" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">AI Integration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm text-[#9C99AC] mb-4 font-medium">Company</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/#process" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">How it works</Link></li>
              <li><Link href="/pricing" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Pricing &amp; FAQ</Link></li>
              <li><Link href="/login" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm text-[#9C99AC] mb-4 font-medium">Legal</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/terms" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Terms of Service</Link></li>
              <li><Link href="/pricing" className="text-sm text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div
          ref={footerRef}
          className="relative border-t border-[#242233] py-6 flex justify-between text-[13px] text-[#9C99AC] flex-wrap gap-3 before:content-[''] before:absolute before:top-[-1px] before:left-0 before:h-[2px] before:w-0 before:bg-gradient-to-br before:from-[#FF5C4D] before:to-[#C8102E]"
        >
          <span>© 2026 TechRepubliQ Ltd. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Terms of Service</Link>
            <Link href="/pricing" className="text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <style>{`
        .line-in::before { width: 100% !important; transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </footer>
  );
}