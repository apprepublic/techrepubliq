"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSunburst from "@/components/HeroSunburst";

export default function HomePage() {
  const footerRef = useRef<HTMLDivElement>(null);

  const initAnimations = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);

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
    staggerIn(".testimonial-card", 100);

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
    { title: "Software Development", desc: "Web and mobile products engineered end-to-end, from first sketch to launch.", icon: "layers" },
    { title: "Product Engineering", desc: "Robust, scalable products built with modern stacks and solid engineering practice.", icon: "cpu" },
    { title: "Startup Services", desc: "From idea to launch, we help startups build, grow, and scale with expert support.", icon: "rocket" },
    { title: "Technology Consulting", desc: "Strategic guidance to help you make the right technical calls and stay ahead.", icon: "compass" },
  ];

  const serviceIcons: Record<string, React.ReactNode> = {
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    cpu: <><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" /></>,
    rocket: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>,
    compass: <><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>,
  };

  const testimonials = [
    { name: "Emeka Obi", role: "CEO, NovaTech (Nigeria)", flag: "🇳🇬", quote: "TechRepubliQ transformed our launch — professional, creative, and incredible to work with." },
    { name: "Lukas Weber", role: "Founder, Finovo (Germany)", flag: "🇩🇪", quote: "Their expertise in product development helped us launch faster than we imagined." },
    { name: "Sophie Laurent", role: "CTO, PixelFlow (France)", flag: "🇫🇷", quote: "Working with TechRepubliQ was a game-changer. They delivered a scalable product that exceeded what we asked for." },
    { name: "Daniel Brooks", role: "Product Lead, Zenith (Sweden)", flag: "🇸🇪", quote: "Professional, innovative, and reliable — they helped us build a platform that handles our growth perfectly." },
    { name: "James Wilson", role: "Founder, CloudNest (UK)", flag: "🇬🇧", quote: "A fantastic team with great communication and technical skill. They turned our vision into a powerful product." },
    { name: "Marta Kowalska", role: "CEO, BrightApp (Netherlands)", flag: "🇳🇱", quote: "TechRepubliQ's dedication to quality and innovation is unmatched. A genuinely valuable partner in our journey." },
  ];

  const processSteps = [
    "Planning",
    "Defining the User Experience",
    "The Technical Foundation",
    "Implementation",
    "Repeat the Cycle",
    "The Launch",
  ];

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
        .hp .btn-ghost-dark { background: transparent; color: #F7F6FA; border: 1px solid #242233; }
        .hp .btn-ghost-dark:hover { border-color: #9C99AC; }
        .hp .eyebrow { display: inline-block; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #C8102E; margin-bottom: 12px; }
        .hp .eyebrow.on-dark { color: rgba(255,255,255,0.6); }
        .hp .accent-text { background: linear-gradient(135deg, #FF5C4D, #C8102E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hp .hero { background: #0A0912; color: #F7F6FA; padding: 200px 0 120px; overflow: hidden; position: relative; }
        .hp .hero .wrap { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
        .hp .hero-dots { display: flex; gap: 6px; margin-bottom: 20px; }
        .hp .hero-dots span { width: 8px; height: 8px; border-radius: 50%; }
        .hp .hero-dots span:nth-child(1){ background:#FF5C4D; } .hp .hero-dots span:nth-child(2){ background:#F5B942; }
        .hp .hero-dots span:nth-child(3){ background:#22C55E; } .hp .hero-dots span:nth-child(4){ background:#4A86E8; }
        .hp .hero h1 { margin-bottom: 20px; }
        .hp .hero p.lede { margin-bottom: 32px; color: #9C99AC; }
        .hp .hero-ring-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 860px) { .hp .hero .wrap { grid-template-columns: 1fr; text-align: left; } .hp .hero { padding: 140px 0 64px; } .hp .hero-ring-wrap { order: -1; max-width: 260px; margin: 0 auto 24px; } }
        .hp .panel-section { background: #0A0912; color: #F7F6FA; padding-bottom: 140px; }
        .hp .panel-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; }
        .hp .panel-hero-card { background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 48px; display: flex; flex-direction: column; justify-content: flex-end; min-height: 420px; background-image: radial-gradient(circle at 30% 20%, rgba(200,16,46,0.35), transparent 60%); }
        .hp .panel-hero-card h2 { margin-bottom: 12px; }
        .hp .panel-hero-card p { color: #9C99AC; max-width: 40ch; }
        .hp .stat-stack { display: flex; flex-direction: column; gap: 16px; }
        .hp .stat-top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .hp .info-box { background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; }
        .hp .info-box h3 { color: #F7F6FA; font-size: 18px; margin-bottom: 8px; }
        .hp .info-box p { color: #9C99AC; font-size: 14px; margin-bottom: 16px; flex: 1; }
        .hp .info-icons { display: flex; gap: 8px; }
        .hp .info-icons span { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
        .hp .info-icons svg { width: 16px; height: 16px; stroke: #9C99AC; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .hp .stat-card { background: #141220; border: 1px solid #242233; border-radius: 20px; padding: 28px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .hp .stat-card.featured { background: linear-gradient(135deg, #FF5C4D, #C8102E); border-color: transparent; }
        .hp .stat-value { font-family: 'Inter Tight', sans-serif; font-size: 40px; font-weight: 700; line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .hp .stat-label { color: #9C99AC; font-size: 15px; }
        .hp .stat-card.featured .stat-label { color: rgba(255,255,255,0.85); }
        .hp .stat-cta { display: inline-block; margin-top: 12px; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
        @media (max-width: 860px) { .hp .panel-grid { grid-template-columns: 1fr; } .hp .stat-top-row { grid-template-columns: 1fr; } }
        .hp .section-head { max-width: 640px; margin-bottom: 56px; }
        .hp .section-head h2 { margin-bottom: 12px; }
        .hp .section-head p { color: #6B6876; font-size: 17px; }
        .hp .services { background: #F6F5F9; }
        .hp .services .section-head { margin-left: auto; margin-right: auto; text-align: center; max-width: 720px; }
        .hp .service-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .hp .service-card { background: #fff; border: 1px solid #E8E6F0; border-radius: 20px; padding: 32px; box-shadow: 0 1px 2px rgba(20,18,31,0.04), 0 8px 24px rgba(20,18,31,0.06); transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s cubic-bezier(0.22,1,0.36,1); opacity: 0; transform: translateY(24px); }
        .hp .service-card.in-view { opacity: 1; transform: translateY(0); }
        .hp .service-card:hover { transform: translateY(-4px); box-shadow: 0 4px 8px rgba(20,18,31,0.06), 0 16px 32px rgba(20,18,31,0.1); }
        .hp .service-icon { width: 44px; height: 44px; border-radius: 12px; background: #FBE2E4; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .hp .service-icon svg { width: 22px; height: 22px; stroke: #C8102E; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .hp .service-card h3 { margin-bottom: 8px; }
        .hp .service-card p { color: #6B6876; font-size: 15px; }
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
        .hp .testimonials { background: #F6F5F9; }
        .hp .testimonials .section-head { margin-left: auto; margin-right: auto; text-align: center; max-width: 640px; }
        .hp .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .hp .testimonial-card { background: #fff; border: 1px solid #E8E6F0; border-radius: 20px; padding: 32px; opacity: 0; transform: translateY(24px); transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1); display: flex; flex-direction: column; }
        .hp .testimonial-card.in-view { opacity: 1; transform: translateY(0); }
        .hp .testimonial-quote-mark { font-size: 48px; color: #C8102E; line-height: 1; margin-bottom: 12px; font-family: Georgia, serif; }
        .hp .testimonial-card .quote { color: #6B6876; font-size: 15px; line-height: 1.65; margin-bottom: 24px; flex: 1; }
        .hp .testimonial-person { display: flex; align-items: center; gap: 12px; margin-top: auto; }
        .hp .testimonial-flag { font-size: 24px; }
        .hp .testimonial-name { font-weight: 600; font-size: 15px; color: #14121F; }
        .hp .testimonial-role { font-size: 13px; color: #9C99AC; }
        @media (max-width: 1024px) { .hp .testimonial-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .hp .testimonial-grid { grid-template-columns: 1fr; } }
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
        .hp .mock-card.center { transform: translateY(-10px); z-index: 2; }
        .hp .mock-card.front { transform: translate(90px, 20px) rotate(3deg); }
        .hp .mock-label { font-size: 12px; color: #9C99AC; margin-bottom: 12px; }
        .hp .mock-price { font-family: 'Inter Tight', sans-serif; font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .hp .mock-line { height: 8px; background: #242233; border-radius: 4px; margin-bottom: 10px; }
        .hp .mock-line.short { width: 60%; }
        .hp .mock-btn { margin-top: 16px; padding: 10px 20px; border-radius: 999px; background: linear-gradient(135deg, #FF5C4D, #C8102E); font-size: 13px; width: fit-content; color: #fff; }
        .hp .preview-cta { text-align: center; margin-top: 40px; }
        @media (max-width: 700px) { .hp .preview-stage { height: 380px; } .hp .mock-card { width: 240px; padding: 18px; } .hp .mock-card.back { transform: translate(-40px, -30px) rotate(-4deg); } .hp .mock-card.front { transform: translate(40px, 30px) rotate(3deg); } }
        .hp .cta { background: #F6F5F9; }
        .hp .cta-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; }
        .hp .cta h2 { margin-bottom: 16px; }
        .hp .cta p.lede { margin-bottom: 32px; }
        .hp .cta-graphic { height: 240px; border-radius: 20px; background: #fff; border: 1px solid #E8E6F0; position: relative; overflow: hidden; }
        .hp .cta-graphic svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        @media (max-width: 860px) { .hp .cta-grid { grid-template-columns: 1fr; } .hp .cta-graphic { display: none; } }
        @media (prefers-reduced-motion: reduce) { .hp * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; } }
      `}</style>

      <div className="hp">
        {/* HERO */}
        <section className="hero -mt-20" id="top">
          <div className="wrap">
            <div className="hero-copy">
              <div className="hero-dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
              <h1>Building tomorrow&apos;s software, <span className="accent-text">today.</span></h1>
              <p className="lede">Web, app, and AI automation work — designed, engineered, and shipped by one team who carries it from first sketch to a live, working product.</p>
              <a href="/quote" className="btn btn-primary">Get a Quote</a>
            </div>
            <div className="hero-ring-wrap">
              <HeroSunburst />
            </div>
          </div>
        </section>

        {/* STAT PANEL */}
        <section className="panel-section">
          <div className="wrap panel-grid">
            <div className="panel-hero-card">
              <h2>Design. Develop. Deploy.</h2>
              <p>One team, one thread of accountability, from first sketch to a live, working product that performs the way you imagined it.</p>
            </div>
            <div className="stat-stack">
              <div className="stat-top-row">
                <div className="info-box">
                  <h3>Builds</h3>
                  <p>Modern, scalable software that brings your roadmap to life.</p>
                  <div className="info-icons" aria-hidden="true">
                    <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z"/></svg></span>
                    <span><svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg></span>
                    <span><svg viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg></span>
                  </div>
                </div>
                <div className="stat-card featured">
                  <div className="stat-value"><span data-count="500" data-suffix="+">0+</span></div>
                  <div className="stat-label">Projects</div>
                  <a href="#preview" className="stat-cta">Explore Work &rarr;</a>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><span data-count="15" data-suffix="+">0+</span></div>
                <div className="stat-label">Years of Experience</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><span data-count="1" data-suffix="M+">0M+</span></div>
                <div className="stat-label">Coding Hours</div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="services" id="services">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">What We Do</span>
              <h2>With TechRepubliQ, you build better. Always. It&apos;s our guarantee.</h2>
            </div>
            <div className="service-grid">
              {services.map((s) => (
                <div key={s.title} className="service-card">
                  <div className="service-icon">
                    <svg viewBox="0 0 24 24">
                      {serviceIcons[s.icon]}
                    </svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="process" id="process">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow on-dark">How We Work</span>
              <h2>Our Agile Process</h2>
              <p>We follow an agile approach, ensuring flexibility, transparency, and continuous delivery.</p>
            </div>
            <div className="process-grid">
              {processSteps.map((step, i) => (
                <div key={step} className="process-card">
                  <div className="process-num">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials" id="testimonials">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Why Choose Us</span>
              <h2>Glowing testimonials that speak volumes</h2>
              <p style={{ margin: "0 auto" }}>What our clients say about building software with us, in their own words.</p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((t) => (
                <div key={t.name} className="testimonial-card">
                  <div className="testimonial-quote-mark">&ldquo;</div>
                  <p className="quote">{t.quote}</p>
                  <div className="testimonial-person">
                    <span className="testimonial-flag" aria-hidden="true">{t.flag}</span>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* PRODUCT PREVIEW / CASE STUDIES */}
        <section className="preview" id="preview">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow on-dark">Our Case Studies</span>
              <h2>Real Solutions. Real Impact.</h2>
              <p>Explore how we&apos;ve helped businesses across industries build software that drives growth.</p>
            </div>
            <div className="preview-stage">
              <div className="mock-card back">
                <div className="mock-label">Product Preview</div>
                <div className="mock-line"></div>
                <div className="mock-line short"></div>
              </div>
              <div className="mock-card center">
                <div className="mock-label">Analytics Dashboard</div>
                <div className="mock-line"></div>
                <div className="mock-line short"></div>
                <div className="mock-btn">View Details</div>
              </div>
              <div className="mock-card front">
                <div className="mock-label">Live Metrics</div>
                <div className="mock-price">98%</div>
                <div className="mock-line short"></div>
                <div className="mock-btn">See Case Study</div>
              </div>
            </div>
            <div className="preview-cta">
              <a href="#top" className="btn btn-ghost-dark">View Case Studies</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta" id="quote">
          <div className="wrap cta-grid">
            <div>
              <h2>Connect with us</h2>
              <p className="lede">Having helped clients across industries build, launch, and scale their software, we&apos;d love to do the same for you. Tell us what you&apos;re building and let&apos;s talk it through.</p>
              <a href="/quote" className="btn btn-primary">Get a Quote</a>
            </div>
            <div className="cta-graphic" aria-hidden="true">
              <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF5C4D"/>
                    <stop offset="100%" stopColor="#C8102E"/>
                  </linearGradient>
                </defs>
                <circle cx="200" cy="120" r="70" fill="none" stroke="url(#ringGrad2)" strokeWidth="14" strokeDasharray="6 10" opacity="0.85" />
                <circle cx="200" cy="120" r="95" fill="none" stroke="#C8102E" strokeWidth="1" opacity="0.25" />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
