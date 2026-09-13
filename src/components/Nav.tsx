"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#tiers" },
  { label: "Work", href: "/#preview" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#quote" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isHome = window.location.pathname === "/";
    if (open && !isHome) {
      document.body.style.overflow = "hidden";
    } else if (!isHome) {
      document.body.style.overflow = "";
    }
    return () => {
      if (!isHome) document.body.style.overflow = "";
    };
  }, [open]);

  const handleHashClick = (e: React.MouseEvent, href: string) => {
    if (pathname !== "/" || !href.includes("#")) return;
    const hash = href.split("#")[1];
    if (!hash) return;
    e.preventDefault();
    setOpen(false);
    const iframe = document.getElementById("v7-iframe") as HTMLIFrameElement | null;
    if (iframe?.contentDocument) {
      const target = iframe.contentDocument.getElementById(hash) || iframe.contentDocument.querySelector(`[id="${hash}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        history.pushState(null, "", `/#${hash}`);
        return;
      }
    }
    const outerTarget = document.getElementById(hash);
    if (outerTarget) {
      outerTarget.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", `/#${hash}`);
    } else {
      window.location.href = href;
    }
  };

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/assets/logo-black-bg.png?v=3" : "/assets/logo-white-bg.png?v=3";

  return (
    <>
      <style>{`
        :root {
          --bg-dark: #0A0912;
          --bg-light: #F6F5F9;
          --text-on-dark: #F7F6FA;
          --text-on-dark-secondary: #9C99AC;
          --text-on-light: #14121F;
          --text-on-light-secondary: #6B6876;
          --accent: #C8102E;
          --accent-soft: #FF6B5B;
          --border-dark: #242233;
          --border-light: #E8E6F0;
          --radius-pill: 999px;
          --radius-card: 20px;
          --gradient-accent: linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%);
          --font-display: 'Inter Tight', 'Inter', sans-serif;
          --font-body: 'Inter', sans-serif;
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        /* Light mode header */
        html[data-theme="light"] header.nav {
          background: rgba(246,245,249,0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(232,230,240,0.8);
          box-shadow: 0 1px 0 rgba(255,255,255,0.8), 0 8px 32px rgba(20,18,31,0.08);
        }
        html[data-theme="light"] header.nav::before {
          background: radial-gradient(ellipse at 20% 50%, rgba(200,16,46,0.04), transparent 50%),
                      radial-gradient(ellipse at 80% 50%, rgba(255,92,77,0.03), transparent 50%);
        }
        html[data-theme="light"] header.nav.scrolled {
          background: rgba(246,245,249,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-color: rgba(232,230,240,1);
          box-shadow: 0 1px 0 rgba(255,255,255,0.9), 0 12px 40px rgba(20,18,31,0.12);
        }
        html[data-theme="light"] .nav-links a {
          color: var(--text-on-light-secondary);
        }
        html[data-theme="light"] .nav-links a:hover,
        html[data-theme="light"] .nav-links a.active {
          color: var(--text-on-light);
        }
        html[data-theme="light"] .nav-login {
          color: var(--text-on-light-secondary);
        }
        html[data-theme="light"] .nav-login:hover {
          color: var(--text-on-light);
        }
        html[data-theme="light"] .nav-toggle {
          color: var(--text-on-light);
          border-color: var(--border-light);
          background: rgba(255,255,255,0.6);
        }
        html[data-theme="light"] .mobile-menu {
          background: rgba(246,245,249,0.96);
          border-color: var(--border-light);
        }
        html[data-theme="light"] .mobile-menu a.m-link {
          color: var(--text-on-light-secondary);
        }
        html[data-theme="light"] .mobile-menu a.m-link.active {
          background: rgba(200,16,46,0.08);
          color: var(--text-on-light);
          border-color: rgba(200,16,46,0.15);
        }
        html[data-theme="light"] .mobile-menu a.m-link:hover {
          background: rgba(0,0,0,0.04);
          color: var(--text-on-light);
        }

        /* Dark mode header - restored dark gaussian background */
        html[data-theme="dark"] header.nav {
          background: rgba(10,9,18,0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(36,34,51,0.5);
          box-shadow: 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.24);
        }
        html[data-theme="dark"] header.nav::before {
          background: radial-gradient(ellipse at 20% 50%, rgba(200,16,46,0.08), transparent 50%),
                      radial-gradient(ellipse at 80% 50%, rgba(255,92,77,0.06), transparent 50%);
          filter: blur(12px);
          opacity: 0.8;
        }
        html[data-theme="dark"] header.nav.scrolled {
          background: rgba(10,9,18,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-color: var(--border-dark);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.32);
        }

        header.nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 16px 0; 
          transition: background 300ms var(--ease), backdrop-filter 300ms var(--ease), border-color 300ms var(--ease), box-shadow 300ms var(--ease);
        }
        header.nav::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          transition: opacity 300ms var(--ease);
        }
        .wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 768px) { .wrap { padding: 0 20px; } }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; font-size: 18px; text-decoration: none; }
        .logo-img { height: 32px; width: auto; display: block; object-fit: contain; transition: filter 300ms var(--ease); }
        .nav-links { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0; }
        .nav-links a {
          position: relative; padding: 8px 16px; border-radius: var(--radius-pill);
          font-size: 15px; text-decoration: none; transition: color 150ms var(--ease);
          font-family: var(--font-body);
        }
        .nav-links a.active::after {
          content: ''; position: absolute; bottom: -2px; left: 16px; right: 16px; height: 2px; background: var(--accent); border-radius: 1px;
        }
        .nav-cta { display: flex; align-items: center; gap: 12px; }
        .nav-login { font-size: 15px; font-weight: 500; padding: 8px 16px; text-decoration: none; transition: color 150ms var(--ease); font-family: var(--font-body); }
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px; border-radius: var(--radius-pill);
          font-weight: 500; font-size: 14px; border: none; text-decoration: none;
          transition: transform 150ms var(--ease), box-shadow 150ms var(--ease), background 150ms var(--ease);
          font-family: var(--font-body);
        }
        .btn-primary { background: var(--gradient-accent); color: #fff; box-shadow: 0 8px 24px rgba(200,16,46,0.28); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(200,16,46,0.36); }
        
        /* Theme toggle */
        .theme-toggle {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid;
          cursor: pointer;
          transition: all 220ms var(--ease);
          font-size: 16px;
          background: transparent;
        }
        html[data-theme="light"] .theme-toggle {
          border-color: var(--border-light);
          background: rgba(255,255,255,0.6);
          color: var(--text-on-light);
        }
        html[data-theme="light"] .theme-toggle:hover {
          background: rgba(255,255,255,0.9);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }
        html[data-theme="dark"] .theme-toggle {
          border-color: var(--border-dark);
          background: rgba(20,18,32,0.6);
          color: var(--text-on-dark);
        }
        html[data-theme="dark"] .theme-toggle:hover {
          background: rgba(20,18,32,0.9);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }

        .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid; }
        @media (max-width: 960px) {
          .nav-links { display: none; }
          .nav-cta .nav-login, .nav-cta .btn-primary { display: none; }
          .nav-toggle { display: flex; }
        }
        /* Mobile menu */
        .mobile-menu {
          position: absolute; top: 100%; left: 0; right: 0;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 20px 32px 24px;
          display: flex; flex-direction: column; gap: 4px;
          transform-origin: top; transition: all 220ms var(--ease);
          border-bottom: 1px solid;
        }
        html[data-theme="dark"] .mobile-menu {
          background: rgba(8,7,16,0.96);
          border-color: #1E1C2E;
        }
        html[data-theme="light"] .mobile-menu {
          background: rgba(246,245,249,0.96);
          border-color: var(--border-light);
        }
        .mobile-menu.hidden { opacity: 0; transform: translateY(-8px) scaleY(0.98); pointer-events: none; max-height: 0; overflow: hidden; padding: 0 32px; }
        .mobile-menu.visible { opacity: 1; transform: translateY(0) scaleY(1); max-height: 480px; }
        .mobile-menu a.m-link {
          padding: 12px 16px; border-radius: 12px; text-decoration: none; font-size: 15px; display: flex; justify-content: space-between; align-items: center;
          transition: all 150ms var(--ease);
        }
        @media (max-width: 768px) { .mobile-menu { padding: 20px 20px 24px; } .mobile-menu.hidden { padding: 0 20px; } }
      `}</style>

      <header className={`nav ${scrolled ? "scrolled" : ""}`} id="rootNav" data-theme={theme}>
        <div className="wrap nav-inner">
          <Link href="/" className="logo" aria-label="TechRepubliQ Home">
            <Image
              src={logoSrc}
              alt="TechRepubliQ"
              width={180}
              height={32}
              className="logo-img"
              priority
              unoptimized
            />
          </Link>

          <nav aria-label="Primary">
            <ul className="nav-links">
              {links.map((l) => {
                const isAboutActive = l.href === "/about" && pathname === "/about";
                const isHomeActive = l.href === "/" && pathname === "/";
                const activeClass = (l.href === "/about" ? isAboutActive : l.href === "/" ? isHomeActive : false) ? "active" : "";
                if (l.href.startsWith("/#")) {
                  return (
                    <li key={l.label}>
                      <a href={l.href} className={activeClass} onClick={(e) => handleHashClick(e, l.href)}>
                        {l.label}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={l.label}>
                    <Link href={l.href} className={activeClass}>
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="nav-cta">
            <button
              className="theme-toggle"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              {isDark ? (
                // Sun icon - solid, plain vector for light mode
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" fill="currentColor" />
                  <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </g>
                </svg>
              ) : (
                // Moon icon - solid, plain vector for dark mode
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link href="/login" className="nav-login">
              Log in
            </Link>
            <Link href="/quote" className="btn btn-primary">
              Get started <span>→</span>
            </Link>
            <button className="nav-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${open ? "visible" : "hidden"}`}>
          {links.map((l) => {
            const active = l.href === "/about" ? pathname === "/about" : l.href === "/" ? pathname === "/" : false;
            if (l.href.startsWith("/#")) {
              return (
                <a
                  key={l.label}
                  href={l.href}
                  className={`m-link ${active ? "active" : ""}`}
                  onClick={(e) => handleHashClick(e, l.href)}
                >
                  {l.label}
                  {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8102E", display: "inline-block" }} />}
                </a>
              );
            }
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`m-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
                {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8102E", display: "inline-block" }} />}
              </Link>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 16, borderTop: `1px solid ${isDark ? "#1E1C2E" : "#E8E6F0"}`, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className="m-link"
              style={{ justifyContent: "center", border: `1px solid ${isDark ? "#1E1C2E" : "#E8E6F0"}`, width: "100%", cursor: "pointer", background: "transparent", gap: "8px" }}
              onClick={toggleTheme}
            >
              {isDark ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </g>
                  </svg>
                  Light mode
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark mode
                </>
              )}
            </button>
            <Link href="/login" className="m-link" style={{ justifyContent: "center", border: `1px solid ${isDark ? "#1E1C2E" : "#E8E6F0"}` }} onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link href="/quote" className="btn btn-primary" style={{ justifyContent: "center", width: "100%" }} onClick={() => setOpen(false)}>
              Get started <span>→</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
