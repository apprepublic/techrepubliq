"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HomePage() {
  const ringGroupRef = useRef<SVGGElement>(null);
  const connectiveRef = useRef<HTMLParagraphElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const initAnimations = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    /* Hero ring petals */
    const ringGroup = ringGroupRef.current;
    if (ringGroup) {
      const petalCount = 28;
      const cx = 200, cy = 200, rOuter = 150, rInner = 60;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * rInner;
        const y1 = cy + Math.sin(angle) * rInner;
        const x2 = cx + Math.cos(angle) * rOuter;
        const y2 = cy + Math.sin(angle) * rOuter;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(x1)); line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2)); line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", "url(#ringGrad)");
        line.setAttribute("stroke-width", "10");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", String((0.4 + (i % 5) * 0.12).toFixed(2)));
        ringGroup.appendChild(line);
      }
      ringGroup.setAttribute("transform-origin", "200px 200px");
    }

    if (!reduced) {
      gsap.to("#ringGroup", { rotation: 360, transformOrigin: "200px 200px", duration: 40, repeat: -1, ease: "none" });
      gsap.to("#ringGroup", { rotation: "+=220", transformOrigin: "200px 200px", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
      gsap.to(".hero-ring-wrap", { scale: 0.72, opacity: 0.35, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    }

    /* Count-up stats */
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const suffix = el.getAttribute("data-suffix") || "";
      if (reduced) { el.textContent = target + suffix; return; }
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 0.9, ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      });
    });

    /* Stagger cards */
    function staggerIn(selector: string, staggerMs: number) {
      const items = document.querySelectorAll(selector);
      if (reduced) { items.forEach((i) => i.classList.add("in-view")); return; }
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add("in-view"), idx * staggerMs); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.2 });
      items.forEach((i) => obs.observe(i));
    }
    staggerIn(".service-card", 80);
    staggerIn(".trust-card", 100);

    /* Process cards two-row stagger */
    const processCards = document.querySelectorAll(".process-card");
    if (processCards.length) {
      if (reduced) { processCards.forEach((c) => c.classList.add("in-view")); }
      else {
        const obs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            processCards.forEach((c, i) => setTimeout(() => c.classList.add("in-view"), i < 3 ? i * 80 : 230 + (i - 3) * 80));
            obs.unobserve(entries[0].target);
          }
        }, { threshold: 0.15 });
        obs.observe(processCards[0]);
      }
    }

    /* Connective text reveal */
    const cLines = connectiveRef.current?.querySelectorAll("span");
    if (cLines?.length) {
      if (reduced) { cLines.forEach((l) => l.classList.add("revealed")); }
      else {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("revealed");
            else entry.target.classList.remove("revealed");
          });
        }, { threshold: 0.6 });
        cLines.forEach((l) => obs.observe(l));
      }
    }

    /* Footer accent line */
    const fEl = footerRef.current;
    if (fEl) {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { fEl.classList.add("line-in"); obs.disconnect(); }
      }, { threshold: 0.3 });
      obs.observe(fEl);
    }
  }, []);

  useEffect(() => {
    initAnimations();
  }, [initAnimations]);

  const services = [
    { title: "Web Development", desc: "Marketing sites and web apps built on a modern stack, from landing page to full platform.", icon: "code" },
    { title: "App Development", desc: "iOS, Android, and cross-platform apps, scoped around what your users actually do.", icon: "smartphone" },
    { title: "Web & UI Design", desc: "Interfaces designed around your product's real flows, not a generic template.", icon: "palette" },
    { title: "AI Automation", desc: "Custom automations that take repetitive work off your team's plate.", icon: "cpu" },
    { title: "AI Integration", desc: "Chatbots, agents, and API-connected workflows built into your existing product.", icon: "grid" },
    { title: "Optimization", desc: "Speed, SEO, and infrastructure audits that make an existing product faster and cheaper to run.", icon: "clock" },
  ];

  const serviceIcons: Record<string, React.ReactNode> = {
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    smartphone: <><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></>,
    palette: <><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8z" /></>,
    cpu: <><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></>,
    grid: <><path d="M9 2v4" /><path d="M15 2v4" /><path d="M9 18v4" /><path d="M15 18v4" /><path d="M2 9h4" /><path d="M2 15h4" /><path d="M18 9h4" /><path d="M18 15h4" /><rect x="6" y="6" width="12" height="12" rx="2" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  };

  return (
    <>
      <style>{`
        .hp * { box-sizing: border-box; margin: 0; padding: 0; }
        .hp { font-family: 'Inter', sans-serif; color: #14121F; background: #F6F5F9; line-height: 1.5; -webkit-font-smoothing: antialiased; }
        .hp img, .hp svg { display: block; max-width: 100%; }
        .hp a { color: inherit; text-decoration: none; }
        .hp ul { list-style: none; }
        .hp button { font: inherit; cursor: pointer; }
        .hp .wrap { max-width: 1180px; margin: 0 auto; padding: 0 32px; }
        .hp section { padding: 120px 0; }
        @media (max-width: 768px) { .hp .wrap { padding: 0 20px; } .hp section { padding: 64px 0; } }
        .hp h1, .hp h2, .hp h3 { font-family: 'Inter Tight', sans-serif; font-weight: 600; letter-spacing: -0.01em; }
        .hp h1 { font-size: 56px; line-height: 1.08; }
        .hp h2 { font-size: 36px; line-height: 1.15; }
        .hp h3 { font-size: 20px; line-height: 1.3; }
        .hp p.lede { font-size: 18px; line-height: 1.6; color: #6B6876; max-width: 60ch; }
        @media (max-width: 768px) { .hp h1 { font-size: 36px; } .hp h2 { font-size: 28px; } }
        .hp .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 999px; font-weight: 500; font-size: 15px; border: none; transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s cubic-bezier(0.22,1,0.36,1); }
        .hp .btn-primary { background: linear-gradient(135deg, #FF5C4D, #C8102E); color: #fff; box-shadow: 0 8px 24px rgba(200,16,46,0.28); }
        .hp .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(200,16,46,0.36); }
        .hp .btn-primary:focus-visible { outline: 2px solid #C8102E; outline-offset: 3px; }

        .hp .hero { background: #0A0912; color: #F7F6FA; padding: 200px 0 120px; overflow: hidden; position: relative; }
        .hp .hero .wrap { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
        .hp .hero-dots { display: flex; gap: 6px; margin-bottom: 20px; }
        .hp .hero-dots span { width: 8px; height: 8px; border-radius: 50%; }
        .hp .hero-dots span:nth-child(1){ background:#FF5C4D; } .hp .hero-dots span:nth-child(2){ background:#F5B942; }
        .hp .hero-dots span:nth-child(3){ background:#22C55E; } .hp .hero-dots span:nth-child(4){ background:#4A86E8; }
        .hp .hero h1 { margin-bottom: 20px; }
        .hp .hero p.lede { margin-bottom: 32px; color: #9C99AC; }
        .hp .hero-ring-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        #hero-ring { width: 100%; max-width: 420px; }
        @media (max-width: 860px) { .hp .hero .wrap { grid-template-columns: 1fr; text-align: left; } .hp .hero { padding: 140px 0 64px; } .hp .hero-ring-wrap { order: -1; max-width: 260px; margin: 0 auto 24px; } }

        .hp .panel-section { background: #0A0912; color: #F7F6FA; padding-bottom: 140px; }
        .hp .panel-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; }
        .hp .panel-hero-card { background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 48px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 420px; background-image: radial-gradient(circle at 30% 20%, rgba(200,16,46,0.35), transparent 60%); }
        .hp .panel-hero-card h2 { margin-bottom: 12px; }
        .hp .panel-hero-card p { color: #9C99AC; max-width: 40ch; }
        .hp .stat-stack { display: flex; flex-direction: column; gap: 16px; }
        .hp .stat-card { background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 28px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .hp .stat-card.featured { background: linear-gradient(135deg, #FF5C4D, #C8102E); border-color: transparent; }
        .hp .stat-value { font-family: 'Inter Tight', sans-serif; font-size: 40px; font-weight: 700; line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .hp .stat-label { color: #9C99AC; font-size: 15px; }
        .hp .stat-card.featured .stat-label { color: rgba(255,255,255,0.85); }
        .hp .stat-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: rgba(255,255,255,0.16); color: #fff; font-size: 13px; padding: 5px 12px; border-radius: 999px; width: fit-content; }
        .hp .stat-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #22C55E; }
        @media (max-width: 860px) { .hp .panel-grid { grid-template-columns: 1fr; } }

        .hp .connective { background: #0A0912; padding: 0 0 100px; }
        .hp .connective p { font-size: 22px; line-height: 1.6; color: #9C99AC; max-width: 46ch; }
        .hp .connective p span { display: block; opacity: 0.25; transition: opacity 0.4s cubic-bezier(0.22,1,0.36,1); }
        .hp .connective p span.revealed { opacity: 1; color: #F7F6FA; }

        .hp .section-head { max-width: 640px; margin-bottom: 56px; }
        .hp .section-head h2 { margin-bottom: 12px; }
        .hp .section-head p { color: #6B6876; font-size: 17px; }

        .hp .services { background: #F6F5F9; }
        .hp .service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .hp .service-card { background: #fff; border: 1px solid #E8E6F0; border-radius: 20px; padding: 32px; box-shadow: 0 1px 2px rgba(20,18,31,0.04), 0 8px 24px rgba(20,18,31,0.06); transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s cubic-bezier(0.22,1,0.36,1); opacity: 0; transform: translateY(24px); }
        .hp .service-card.in-view { opacity: 1; transform: translateY(0); }
        .hp .service-card:hover { transform: translateY(-4px); box-shadow: 0 4px 8px rgba(20,18,31,0.06), 0 16px 32px rgba(20,18,31,0.1); }
        .hp .service-icon { width: 44px; height: 44px; border-radius: 12px; background: #FBE2E4; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .hp .service-icon svg { width: 22px; height: 22px; stroke: #C8102E; }
        .hp .service-card h3 { margin-bottom: 8px; }
        .hp .service-card p { color: #6B6876; font-size: 15px; margin-bottom: 16px; }
        .hp .service-link { font-size: 14px; font-weight: 500; color: #C8102E; }
        @media (max-width: 1024px) { .hp .service-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .hp .service-grid { grid-template-columns: 1fr; } }

        .hp .process { background: linear-gradient(180deg, #0B57F5, #2EA8F5); color: #fff; }
        .hp .process .section-head p { color: rgba(255,255,255,0.82); }
        .hp .process .section-head h2 { color: #fff; }
        .hp .process-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .hp .process-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 20px; padding: 28px; opacity: 0; transform: translateY(24px); transition: none; }
        .hp .process-card.in-view { opacity: 1; transform: translateY(0); transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1); }
        .hp .process-num { font-family: 'Inter Tight', sans-serif; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 24px; }
        .hp .process-card h3 { color: #fff; }
        @media (max-width: 860px) { .hp .process-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .hp .process-grid { grid-template-columns: 1fr; } }

        .hp .trust { background: #F6F5F9; }
        .hp .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .hp .trust-card { background: #fff; border: 1px solid #E8E6F0; border-radius: 20px; padding: 32px; opacity: 0; transform: translateY(24px); }
        .hp .trust-card.in-view { opacity: 1; transform: translateY(0); }
        .hp .trust-card h3 { margin-bottom: 10px; }
        .hp .trust-card p { color: #6B6876; font-size: 15px; }
        @media (max-width: 860px) { .hp .trust-grid { grid-template-columns: 1fr; } }

        .hp .built-on { background: #F6F5F9; padding: 0 0 120px; }
        .hp .built-on-label { text-align: center; font-size: 13px; color: #6B6876; margin-bottom: 28px; }
        .hp .built-on-row { display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap; opacity: 0.7; }
        .hp .built-on-row span { font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 17px; color: #6B6876; }

        .hp .preview { background: #0A0912; color: #F7F6FA; overflow: hidden; }
        .hp .preview .section-head { margin: 0 auto 56px; text-align: center; max-width: 560px; }
        .hp .preview .section-head p { color: #9C99AC; }
        .hp .preview-stage { position: relative; height: 480px; display: flex; align-items: center; justify-content: center; }
        .hp .mock-card { position: absolute; width: 340px; background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.4); }
        .hp .mock-card.back { transform: translate(-90px, -20px) rotate(-4deg); opacity: 0.7; }
        .hp .mock-card.front { transform: translate(90px, 20px) rotate(3deg); }
        .hp .mock-label { font-size: 12px; color: #9C99AC; margin-bottom: 12px; }
        .hp .mock-price { font-family: 'Inter Tight', sans-serif; font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .hp .mock-line { height: 8px; background: #242233; border-radius: 4px; margin-bottom: 10px; }
        .hp .mock-line.short { width: 60%; }
        .hp .mock-btn { margin-top: 16px; padding: 10px 20px; border-radius: 999px; background: linear-gradient(135deg, #FF5C4D, #C8102E); font-size: 13px; width: fit-content; }
        .hp .preview-cta { text-align: center; margin-top: 40px; }
        @media (max-width: 700px) { .hp .preview-stage { height: 380px; } .hp .mock-card { width: 240px; padding: 18px; } .hp .mock-card.back { transform: translate(-40px, -30px) rotate(-4deg); } .hp .mock-card.front { transform: translate(40px, 30px) rotate(3deg); } }

        .hp .cta { background: #F6F5F9; }
        .hp .cta-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
        .hp .cta h2 { margin-bottom: 16px; }
        .hp .cta p.lede { margin-bottom: 32px; }
        .hp .cta-graphic { height: 240px; border-radius: 20px; background: #fff; border: 1px solid #E8E6F0; position: relative; overflow: hidden; }
        .hp .cta-graphic svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        @media (max-width: 860px) { .hp .cta-grid { grid-template-columns: 1fr; } .hp .cta-graphic { display: none; } }

        .hp .footer-bottom { border-top: 1px solid #242233; padding: 24px 0; display: flex; justify-content: space-between; font-size: 13px; color: #9C99AC; flex-wrap: wrap; gap: 12px; position: relative; }
        .hp .footer-bottom::before { content: ''; position: absolute; top: -1px; left: 0; height: 2px; width: 0; background: linear-gradient(135deg, #FF5C4D, #C8102E); }
        .hp .footer-bottom.line-in::before { width: 100%; transition: width 0.7s cubic-bezier(0.22,1,0.36,1); }

        @media (prefers-reduced-motion: reduce) { .hp * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; } }
      `}</style>

      <div className="hp">
        {/* HERO */}
        <section className="hero -mt-20" id="top">
          <div className="wrap">
            <div className="hero-copy">
              <div className="hero-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
              <h1>From brief to build, priced before you commit.</h1>
              <p className="lede">Web, app, and AI automation work, scoped from what you describe and quoted before any code is written. One team carries it from first sketch to a live product.</p>
              <a href="/quote" className="btn btn-primary">Get a Quote</a>
            </div>
            <div className="hero-ring-wrap">
              <svg id="hero-ring" viewBox="0 0 400 400" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF5C4D"/>
                    <stop offset="100%" stopColor="#8C102E"/>
                  </linearGradient>
                </defs>
                <g id="ringGroup" ref={ringGroupRef} />
              </svg>
            </div>
          </div>
        </section>

        {/* STAT PANEL */}
        <section className="panel-section">
          <div className="wrap panel-grid">
            <div className="panel-hero-card">
              <h2>Design. Develop. Deploy.</h2>
              <p>One team carries your project from first sketch to a live, working product, with a scoped price agreed before anything is built.</p>
            </div>
            <div className="stat-stack">
              <div className="stat-card featured">
                <div className="stat-value"><span data-count="100" data-suffix="%">0%</span></div>
                <div className="stat-label">Scope confirmed before you pay</div>
                <div className="stat-badge">Fixed price</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><span data-count="24" data-suffix="h">0h</span></div>
                <div className="stat-label">From brief to your first quote</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><span data-count="1">0</span></div>
                <div className="stat-label">Team, start to finish — no handoffs</div>
              </div>
            </div>
          </div>
        </section>

        {/* CONNECTIVE LINE */}
        <div className="connective">
          <div className="wrap">
            <p id="connectiveText" ref={connectiveRef}>
              <span>As your build partner, we take the guesswork out of pricing software work.</span>
              <span>You describe the project, we scope and price it, and you approve before anything starts.</span>
            </p>
          </div>
        </div>

        {/* SERVICES */}
        <section className="services" id="services">
          <div className="wrap">
            <div className="section-head">
              <h2>What we build</h2>
              <p>Six services, one intake form. Pick what fits, or describe your project and let the quote engine work out the rest.</p>
            </div>
            <div className="service-grid">
              {services.map((s) => (
                <div key={s.title} className="service-card">
                  <div className="service-icon">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {serviceIcons[s.icon]}
                    </svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="service-link">View service</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="process" id="process">
          <div className="wrap">
            <div className="section-head">
              <h2>How a quote becomes a product</h2>
              <p>Six steps, the same for every project, whatever size.</p>
            </div>
            <div className="process-grid">
              {["Describe your project", "Get an instant quote", "Approve & pay", "We design & build", "Review together", "Launch & handover"].map((step, i) => (
                <div key={step} className="process-card">
                  <div className="process-num">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section className="trust">
          <div className="wrap">
            <div className="section-head">
              <h2>Why TechRepubliQ</h2>
              <p>The parts of the model that are different from a typical freelance engagement.</p>
            </div>
            <div className="trust-grid">
              <div className="trust-card"><h3>Priced before you commit</h3><p>A real scoped price before any work starts. No open-ended hourly billing.</p></div>
              <div className="trust-card"><h3>Yours to keep</h3><p>Full front-end ownership and migration files, available whenever you need them.</p></div>
              <div className="trust-card"><h3>One point of contact</h3><p>You work directly with the person building your product, start to finish.</p></div>
            </div>
          </div>
        </section>

        {/* BUILT ON */}
        <div className="built-on">
          <div className="wrap">
            <p className="built-on-label">Built on</p>
            <div className="built-on-row">
              <span>Stripe</span><span>Paystack</span><span>Cloudflare</span><span>Supabase</span>
            </div>
          </div>
        </div>

        {/* PRODUCT PREVIEW */}
        <section className="preview">
          <div className="wrap">
            <div className="section-head">
              <h2>See how a quote becomes a product</h2>
              <p>Every project starts in the same place: a plain-language scope and a fixed price, before anything is built.</p>
            </div>
            <div className="preview-stage">
              <div className="mock-card back">
                <div className="mock-label">Order — Web Development</div>
                <div className="mock-line"></div>
                <div className="mock-line short"></div>
                <div className="mock-line"></div>
                <div className="mock-btn">View invoice</div>
              </div>
              <div className="mock-card front">
                <div className="mock-label">Your quote</div>
                <div className="mock-price">$4,200</div>
                <div className="mock-line short"></div>
                <div className="mock-line"></div>
                <div className="mock-btn">Proceed to payment</div>
              </div>
            </div>
            <div className="preview-cta">
              <a href="/pricing" className="btn btn-primary">See how pricing works</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="quote">
          <div className="wrap cta-grid">
            <div>
              <h2>Have a project in mind?</h2>
              <p className="lede">Tell us what you're building. You'll get a scoped, priced quote back, usually within a day, and you decide from there.</p>
              <a href="/quote" className="btn btn-primary">Start Your Quote</a>
            </div>
            <div className="cta-graphic" aria-hidden="true">
              <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FF5C4D" /><stop offset="100%" stopColor="#C8102E" /></linearGradient>
                <path d="M0,200 C80,140 120,220 200,150 C280,80 320,180 400,120" stroke="url(#ringGrad)" strokeWidth="2" fill="none" opacity="0.5"/>
                <path d="M0,220 C80,170 120,230 200,180 C280,120 320,200 400,150" stroke="#C8102E" strokeWidth="1.5" fill="none" opacity="0.3"/>
              </svg>
            </div>
          </div>
        </section>

        <div className="wrap pt-10 pb-20">
          <div className="footer-bottom" id="footerBottom" ref={footerRef}>
            <span>© 2026 TechRepubliQ Ltd. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="/terms" className="text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Terms of Service</a>
              <a href="/pricing" className="text-[#9C99AC] no-underline hover:text-[#F7F6FA] transition-colors duration-150">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}