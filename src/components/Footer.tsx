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
    <footer id="rootFooter" className="relative z-[2] bg-[#0A0912] text-[#F7F6FA] pt-20">
      <div className="mx-auto max-w-[1180px] px-8 max-md:px-5">
        <div className="grid grid-cols-1 min-[421px]:grid-cols-2 min-[641px]:grid-cols-3 min-[1025px]:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_1.1fr] gap-8 pb-14">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/assets/logo-black-bg.png?v=3"
                alt="TechRepubliQ"
                height={30}
                width={150}
                className="h-[30px] w-auto shrink-0"
                unoptimized
              />
            </Link>
            <p className="text-[14px] mt-3 max-w-[32ch] text-[#9C99AC]">
              Building future-ready software — web, app, and AI automation work, one project at a time.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                aria-label="TechRepubliQ on X"
                className="w-9 h-9 rounded-full border border-[#242233] text-[#9C99AC] flex items-center justify-center no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E]"
              >
                𝕏
              </a>
              <a
                href="https://www.linkedin.com/company/techrepubliq/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TechRepubliQ on LinkedIn"
                className="w-9 h-9 rounded-full border border-[#242233] text-[#9C99AC] flex items-center justify-center no-underline transition-colors duration-150 hover:text-[#C8102E] hover:border-[#C8102E]"
              >
                in
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm mb-4 font-medium text-[#9C99AC]">Company</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/#process" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">How it works</Link></li>
              <li><Link href="/terms" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Terms &amp; Conditions</Link></li>
              <li><Link href="/terms" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm mb-4 font-medium text-[#9C99AC]">Services</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/services" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">All services</Link></li>
              <li><Link href="/services/web-development" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Web Development</Link></li>
              <li><Link href="/services/app-development" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">App Development</Link></li>
              <li><Link href="/services/ai-automation" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">AI Automation</Link></li>
              <li><Link href="/services/ai-integration" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">AI Integration</Link></li>
              <li><Link href="/services/training" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Training</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm mb-4 font-medium text-[#9C99AC]">Resources</h4>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li><Link href="/#services" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Blog</Link></li>
              <li><Link href="/" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Case Studies</Link></li>
              <li><Link href="/pricing" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">FAQ</Link></li>
              <li><Link href="/login" className="text-sm no-underline transition-colors duration-150 text-[#9C99AC] hover:text-[#F7F6FA]">Log in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm mb-4 font-medium text-[#9C99AC]">Subscribe</h4>
            <p className="text-[13px] text-[#9C99AC] mb-4">Get the latest updates in your inbox.</p>
            <form
              className="flex bg-[rgba(20,18,32,0.55)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.08)] rounded-full p-1"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                className="flex-1 min-w-0 bg-transparent border-none text-[#F7F6FA] text-[13px] py-2 px-3 outline-none placeholder:text-[#9C99AC]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] text-white border-none flex-shrink-0 flex items-center justify-center"
              >
                &rarr;
              </button>
            </form>
          </div>
        </div>

        <div
          ref={footerRef}
          className="relative border-t border-[#242233] py-6 flex justify-between text-[13px] text-[#9C99AC] flex-wrap gap-3 before:content-[''] before:absolute before:top-[-1px] before:left-0 before:h-[2px] before:w-0 before:bg-gradient-to-br before:from-[#FF5C4D] before:to-[#C8102E]"
        >
          <span>© 2026 TechRepubliQ Ltd. All rights reserved.</span>
          <span>
            Built with <span className="text-[#FF6B5B]">&hearts;</span> for innovators
          </span>
        </div>
      </div>

      <style>{`
        .line-in::before { width: 100% !important; transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </footer>
  );
}
