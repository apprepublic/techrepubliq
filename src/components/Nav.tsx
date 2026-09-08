"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/services/web-development" },
  { label: "Process", href: "/#process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Log in", href: "/login" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] py-5 transition-all duration-220 border-b border-transparent ${
        scrolled ? "bg-[rgba(10,9,18,0.82)] backdrop-blur-[12px] border-[#242233]" : ""
      }`}
    >
      <div className="mx-auto max-w-[1180px] px-8 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center"
        >
          <Image src={scrolled ? "/assets/logo-dark.png" : "/assets/logo-light.png"} alt="TechRepubliQ" height={28} width={140} className="shrink-0" />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-[#9C99AC] text-[15px] no-underline transition-colors duration-150 ${
                    scrolled ? "hover:text-[#F7F6FA]" : "hover:text-[#C8102E]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/quote"
            className="hidden md:inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium text-white no-underline bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] shadow-[0_8px_24px_rgba(200,16,46,0.28)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(200,16,46,0.36)]"
          >
            Get a Quote
          </Link>
          <button
            className="md:hidden bg-none border-none text-[#F7F6FA] text-[22px] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-0 bg-[#0A0912] z-50 flex flex-col items-center justify-center gap-8"
        >
          <button
            className="absolute top-5 right-8 bg-none border-none text-[#F7F6FA] text-[22px] cursor-pointer"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-xl text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/quote"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium text-white no-underline bg-gradient-to-br from-[#FF5C4D] to-[#C8102E]"
          >
            Get a Quote
          </Link>
        </div>
      )}
    </header>
  );
}