"use client";

import { useEffect, useRef, useState } from "react";
import SunburstRing from "@/components/landing/SunburstRing";
import { SERVICES, SERVICE_ICONS, TESTIMONIALS } from "@/lib/landing-content";
import "./landing.css";

/**
 * Home page — a native React port of the v7 preview document
 * (ASSET/TechRepubliQ-preview_v7.html).
 *
 * This used to render that document inside a full-bleed <iframe> and inject a
 * per-theme stylesheet into it, which kept the two copies of the design from
 * drifting only at the cost of a nested scroll container, a duplicated nav and
 * footer, and a footer that had to be hidden. Here the same markup, stylesheet and
 * behaviours live in the page: `src/app/layout.tsx` supplies the shared <Nav /> and
 * <Footer />, `src/app/landing.css` carries the design system (generated from the
 * document, scoped under `.v7`), and light/dark come from the `data-theme`
 * attribute the layout already sets.
 *
 * Section order, copy and assets are carried over unchanged: the sunburst
 * backdrop image, the anim.gif panel card and the 3D OBJ ring all render from
 * real files under public/assets.
 */
export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  /*
   * Scroll reveals and the stat count-ups, mirroring the document's script:
   * grids fade up in 80ms/100ms steps, the process cards animate as two rows,
   * and each [data-count] ticks to its target once it is 60% on screen. Scoped to
   * this page's root so nothing outside the landing is observed.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const timers: number[] = [];
    const observers: IntersectionObserver[] = [];
    const rafIds: number[] = [];

    const staggerIn = (selector: string, staggerMs: number) => {
      const items = root.querySelectorAll<HTMLElement>(selector);
      if (!items.length) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, idx) => {
            if (!entry.isIntersecting) return;
            timers.push(
              window.setTimeout(() => entry.target.classList.add("in-view"), idx * staggerMs)
            );
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );
      items.forEach((item) => obs.observe(item));
      observers.push(obs);
    };

    staggerIn(".service-card", 80);
    staggerIn(".testimonial-card", 100);

    // Process cards: two rows, second row waits for the first to land.
    const processCards = root.querySelectorAll<HTMLElement>(".process-card");
    if (processCards.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          processCards.forEach((card, i) => {
            const rowDelay = i < 3 ? i * 80 : 230 + (i - 3) * 80;
            timers.push(window.setTimeout(() => card.classList.add("in-view"), rowDelay));
          });
          obs.unobserve(entries[0].target);
        },
        { threshold: 0.15 }
      );
      obs.observe(processCards[0]);
      observers.push(obs);
    }

    // Count-up stats: ease-out cubic over 900ms, then stop on the target value.
    root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const suffix = el.getAttribute("data-suffix") || "";
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const start = performance.now();
            const duration = 900;
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const value = target * (1 - Math.pow(1 - p, 3));
              el.textContent = Math.round(value) + suffix;
              if (p < 1) rafIds.push(requestAnimationFrame(tick));
            };
            rafIds.push(requestAnimationFrame(tick));
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
      timers.forEach((t) => window.clearTimeout(t));
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  /**
   * Same fake round-trip the document shipped: "Sending..." → "Sent ✓" → reset.
   * The real intake flow is /quote; this form is a contact note, and wiring it to
   * an endpoint is out of scope for a visual port.
   */
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendState !== "idle") return;
    setSendState("sending");
    window.setTimeout(() => {
      setSendState("sent");
      window.setTimeout(() => {
        setSendState("idle");
        formRef.current?.reset();
      }, 1200);
    }, 600);
  };

  return (
    <div className="v7" id="top" ref={rootRef}>
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <div className="hero-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h1>
              Building tomorrow&apos;s software, <span className="accent-text">today.</span>
            </h1>
            <p className="lede">
              Designe, engineer, and ship from first sketch to a live, working product.
            </p>
            <a href="#quote" className="btn btn-primary">
              Get started
            </a>
          </div>
          <div className="hero-ring-wrap">
            <SunburstRing />
            <div className="scroll-cue" aria-hidden="true">
              <span>Scroll</span>
              <div className="line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STAT PANEL */}
      <section className="panel-section">
        <div className="wrap panel-grid">
          <div className="panel-hero-card">
            <h2 className="stacked-words">
              <span>Design.</span>
              <span>Develop.</span>
              <span>Deploy.</span>
            </h2>
          </div>
          <div className="stat-stack">
            <div className="stat-top-row">
              <div className="info-box">
                <h3>Builds</h3>
                <p>Modern, scalable software that brings your roadmap to life.</p>
                <div className="info-icons" aria-hidden="true">
                  <span>
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
                    </svg>
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24">
                      <rect x="7" y="2" width="10" height="20" rx="2" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="stat-card featured">
                <div className="stat-value">
                  <span data-count="500" data-suffix="+">
                    0+
                  </span>
                </div>
                <div className="stat-label">Projects</div>
                <a href="#preview" className="stat-cta">
                  Explore Work &rarr;
                </a>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                <span data-count="15" data-suffix="+">
                  0+
                </span>
              </div>
              <div className="stat-label">Years of Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                <span data-count="1" data-suffix="M+">
                  0M+
                </span>
              </div>
              <div className="stat-label">Coding Hours</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="wrap">
          <div
            className="section-head"
            style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center", maxWidth: 720 }}
          >
            <span className="eyebrow">What We Do</span>
            <h2>With TechRepubliQ, you build better. Always. It&apos;s our guarantee.</h2>
          </div>
          <div className="service-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <div className="service-icon">
                  {/* icon markup is a verbatim copy of ICON_PATHS in the source document */}
                  <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: SERVICE_ICONS[s.icon] }} />
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
            <span className="eyebrow">How We Work</span>
            <h2>Our Agile Process</h2>
            <p>We follow an agile approach, ensuring flexibility, transparency, and continuous delivery.</p>
          </div>
          <div className="process-grid">
            {[
              ["01", "Planning"],
              ["02", "Defining the User Experience"],
              ["03", "The Technical Foundation"],
              ["04", "Implementation"],
              ["05", "Repeat the Cycle"],
              ["06", "The Launch"],
            ].map(([num, title]) => (
              <div className="process-card" key={num}>
                <div className="process-num">{num}</div>
                <h3>{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div className="wrap">
          <div className="section-head" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            <span className="eyebrow">Why Choose Us</span>
            <h2>Glowing testimonials that speak volumes</h2>
            <p style={{ margin: "0 auto" }}>
              What our clients say about building software with us, in their own words.
            </p>
          </div>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-quote-mark">&ldquo;</div>
                <p className="quote">{t.quote}</p>
                <div className="testimonial-person">
                  <span className="testimonial-flag" aria-hidden="true">
                    {t.flag}
                  </span>
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

      {/* PRODUCT PREVIEW */}
      <section className="preview" id="preview">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Our Case Studies</span>
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
            <a href="#top" className="btn btn-ghost-light">
              View Case Studies
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="quote">
        <div className="wrap cta-grid">
          <div className="cta-copy">
            <span className="eyebrow">Contact</span>
            <h2>Connect with us</h2>
            <p className="lede">
              Having helped clients across industries build, launch, and scale their software, we&apos;d love to do
              the same for you. Tell us what you&apos;re building and let&apos;s talk it through.
            </p>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  &#9993;
                </span>
                hello@techrepubliq.com
              </div>
            </div>
          </div>
          <form className="contact-form" ref={formRef} onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="c-name">Name</label>
                <input id="c-name" name="name" type="text" placeholder="Jane Doe" required />
              </div>
              <div className="form-field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" name="email" type="email" placeholder="jane@company.com" required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="c-company">Company</label>
              <input id="c-company" name="company" type="text" placeholder="Your company (optional)" />
            </div>
            <div className="form-field">
              <label htmlFor="c-message">Message</label>
              <textarea id="c-message" name="message" placeholder="Tell us what you're building..." required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              {sendState === "sending" ? "Sending..." : sendState === "sent" ? "Sent \u2713" : "Send Message"}
            </button>
            <p className="form-meta">
              We reply within 24 hours. No spam, just a quick conversation about your project.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
