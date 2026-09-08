# Site Design Concept & Scroll-Animation Implementation Doc

**Version:** 1.0
**Purpose:** Single source of truth for building a marketing site that matches the reference screenshot's layout and colors, with the scroll-driven motion system extracted from the reference video applied on top.

**Assumption stated up front:** the reference screenshot is a software/product-agency landing page, which lines up with TechRepubliQ's business, so this doc is written as TechRepubliQ's marketing site. If this is for a different brand, only Section 1 (copy) and the logo mark need to change — the layout, tokens, and animation system all carry over unchanged.

**"Keeping the colours consistent" — how this doc interprets that instruction:** the two references have different palettes (reference screenshot: near-black + violet/purple + a blue gradient section; reference video: near-black + teal/mint + blue-violet). This doc takes the **layout from the screenshot** and takes **only the motion behavior** from the video — none of the video's teal/mint is used. The accent hue itself is overridden to red, TechRepubliQ's established primary color, in place of the screenshot's violet — everything else (structure, gradients-as-a-technique, the blue process-section band) carries over from the screenshot.

---

## 1. Design Tokens (sourced from the reference screenshot)

| Token | Value | Usage |
|---|---|---|
| `color-bg-dark` | `#0A0912` | Hero, case-study section, footer background |
| `color-bg-light` | `#F6F5F9` | Content sections between hero and footer |
| `color-surface-dark` | `#141220` | Dark cards/panels (Design/Develop/Deploy panel, stat cards) |
| `color-surface-light` | `#FFFFFF` | Light cards on `color-bg-light` |
| `color-text-on-dark` | `#F7F6FA` | Primary text on dark backgrounds |
| `color-text-on-dark-secondary` | `#9C99AC` | Secondary text on dark backgrounds |
| `color-text-on-light` | `#14121F` | Primary text on light backgrounds |
| `color-text-on-light-secondary` | `#6B6876` | Secondary text on light backgrounds |
| `color-accent` | `#C8102E` | Primary CTA, active nav pill, ring graphic, badges |
| `color-accent-soft` | `#FF6B5B` | Ring graphic highlight, gradient end stop |
| `gradient-accent` | `linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)` | Primary buttons, "500+" stat card fill |
| `gradient-section-blue` | `linear-gradient(180deg, #0B57F5 0%, #2EA8F5 100%)` | Full-bleed "Our Agile Process" section |
| `color-success` | `#22C55E` | "Delivered" status dot |
| `color-border-light` | `#E8E6F0` | Card borders on light background |
| `color-border-dark` | `#242233` | Card borders on dark background |
| `font-display` | Inter Tight, 600–700 | H1/H2 |
| `font-body` | Inter, 400–500 | Body copy, nav, buttons |
| `type-scale-xl` | 56px / 64px / 600 | Hero H1 |
| `type-scale-lg` | 36px / 44px / 600 | Section H2 |
| `type-scale-md` | 20px / 28px / 600 | Card titles |
| `type-scale-body` | 16px / 26px / 400 | Body copy |
| `type-scale-sm` | 14px / 20px / 400 | Captions, nav links |
| `radius-card` | 20px | All card/panel corners (soft, matches screenshot's rounded style — deliberately different from any previous sharp/corner-bracket system) |
| `radius-pill` | 999px | Buttons, badges, nav pills |
| `spacing-section` | 120px desktop / 64px mobile | Vertical gap between major sections |

---

## 2. Motion System (extracted from the reference video)

The video demonstrates a consistent set of six reusable scroll-driven patterns. Every animated moment on the new site should map to one of these six — no ad hoc one-off effects, so the motion reads as one coherent system rather than a pile of individual tricks.

**Recommended implementation stack:** GSAP + ScrollTrigger for all scroll-bound animation, Lenis (or GSAP ScrollSmoother) for the smooth/eased scroll feel visible throughout the video, native CSS `@keyframes` for the ambient (non-scroll-tied) ring rotation. All scroll-triggered timelines pause and jump to their end state under `prefers-reduced-motion: reduce`.

| Pattern name | What it does | Where it appeared in the video | Where it's used on this site |
|---|---|---|---|
| **A. Staggered Fade-Up** | Elements enter at 24px below final position, 0 opacity → 1, staggered 60–100ms apart | Bento feature grid, hero headline | "What We Do" cards, "Our Agile Process" cards, testimonial cards |
| **B. Pinned Reveal** | Section pins in the viewport while its internal content animates (numbers count up, bars grow, chart lines draw) before releasing scroll | Hero → dashboard mockup transition | "Design Develop Deploy" stat panel |
| **C. Scroll-Scrubbed Orbit** | A circular graphic rotates and orbiting tags/elements move in direct proportion to scroll position (not time-based) | Central glowing orb with floating tag pills | Hero ring graphic, on scroll-out |
| **D. Line-by-Line Text Reveal** | A paragraph's lines individually ramp from low to full opacity as the section scrolls through the viewport | "As your trusted data partner..." paragraph | Section transition copy between "Design Develop Deploy" and "What We Do" (new short line added for this purpose, see Section 4.3) |
| **E. Active-State Cross-fade** | A left-side list of items and a right-side content panel; selecting/hovering an item cross-fades the panel content | "What is Projexion?" accordion | Not used on this layout (screenshot has no accordion+panel section) — noted for future use if one is added |
| **F. Draw-In Connectors** | SVG lines animate via `stroke-dashoffset` to look hand-drawn/connecting, in sync with icon reveals | Icon row with branching lines | Optional accent on "What We Do" section icons (see 4.4) |

---

## 3. Global Behavior

| Element | Spec |
|---|---|
| Scroll feel | Lenis smooth scroll, duration 1.1, `easing: cubic-bezier(0.22, 1, 0.36, 1)` |
| Nav bar | Sticky, transparent over hero; on scroll past 80px, background fades to `color-bg-dark` at 80% opacity with backdrop-blur(12px) and a 1px `color-border-dark` bottom edge |
| Nav active-link | Pattern A component reused: a `color-accent` pill background slides (via FLIP-style `transform`, not layout-triggering `left`) beneath the active/hovered link, 200ms ease-out |
| Cursor-tied motion | Hero ring graphic (Section 4.2) tilts up to 6° on mouse-move relative to viewport center, spring-eased back to rest on mouse-leave — subtle, desktop only |
| Reduced motion | All Pattern A/B/C/D/F animations swap to instant end-state application; Lenis smooth scroll disables in favor of native scroll |

---

## 4. Section-by-Section Spec

### 4.1 Navigation
- Logo mark left, center nav links (Who we are / What we do / Blog / Pages), pill CTA button "Let's Connect" right.
- Motion: none on load (nav is present instantly, not animated in) — matches the screenshot's static nav and avoids delaying interactivity.
- Scroll behavior: background/blur fade per Section 3.

### 4.2 Hero — "Crafting Future Software Today!"
**Layout:** two-column, dark background. Left: eyebrow dot row, H1 (two lines), subhead, primary CTA. Right: rotating ring graphic (concentric blade/petal shapes in `gradient-accent` tones).

**Content entrance (page load):**
| Element | Animation | Delay | Duration |
|---|---|---|---|
| Eyebrow dots | Fade-up (Pattern A) | 0ms | 400ms |
| H1 line 1 | Fade-up | 100ms | 500ms |
| H1 line 2 | Fade-up | 180ms | 500ms |
| Subhead | Fade-up | 300ms | 400ms |
| CTA button | Fade-up + scale from 0.96 | 380ms | 400ms |
| Ring graphic | Fade + scale from 0.9, then continuous ambient rotation begins (360° / 40s linear loop) | 200ms | 600ms in, then infinite |

**Scroll-out behavior (Pattern C — Scroll-Scrubbed Orbit):** as the user scrolls from the hero into the next section, the ring's rotation accelerates in direct proportion to scroll delta (not just continuing its ambient loop) and scales down to 70% while fading to 40% opacity, pinned in place briefly so the effect reads as scroll-driven rather than incidental. This is the direct translation of the video's orbiting-ring behavior onto the screenshot's actual hero graphic.

**Responsive:** ring graphic drops to 60% size and moves below the text on mobile (<768px); ambient rotation continues, scroll-scrub orbit behavior is disabled on touch devices (mapped to a simple fade-out instead, since scroll deltas on mobile are too abrupt for a smooth scrub).

**Accessibility:** ring graphic is `aria-hidden="true"`; H1 is the page's only `<h1>`.

### 4.3 Design / Develop / Deploy Panel
**Layout:** dark section, left large panel with background image/video and overlaid "Design Develop Deploy" heading; right column stacks three stat cards (Web services card with 500+ Projects badge, 15+ Years, 1M+ Coding Hours).

**Motion (Pattern B — Pinned Reveal):** when this section reaches the top of the viewport, it pins for the duration of a short scroll-driven timeline:
1. Left panel heading fades/slides in (Pattern A).
2. Stat cards reveal left-to-right, staggered 120ms.
3. Each numeric stat (`500+`, `15+`, `1M+`) count-up-animates from 0 to its target value over 800ms, easing `power2.out`, synced to its card's reveal.
4. "Delivered" status badge on the 500+ card fades in last with a small check-icon draw-in (Pattern F, single short stroke).
5. Section unpins and normal scroll resumes.

**Line-by-Line Text Reveal (Pattern D):** add one short connecting line beneath this panel before "What We Do" begins — e.g. "One team. Every stage. From first sketch to production deploy." — rendered as 1–2 lines that ramp from 30% to 100% opacity per line as the section scrolls through the middle third of the viewport. This gives the video's signature line-reveal moment a natural home in a layout that otherwise has no long paragraph to use it on.

**Responsive:** pin behavior disables under 1024px (mobile scroll-jacking a full pin is unreliable on touch); cards instead use standard Pattern A stagger without the pin, count-up animation still runs on scroll-into-view.

**Accessibility:** count-up numbers render their final value in the DOM immediately (`aria-live="off"`, value present at all times) with the animation purely visual, so screen readers and reduced-motion users always get the correct number without waiting on an animation.

### 4.4 "What We Do" (4-card feature grid)
**Layout:** light background, centered eyebrow pill + H2, 4-column card grid (Talent Augmentation, Product Engineering, Startup Services, Technology Consulting), each with an icon glyph, title, short description.

**Motion:** Pattern A, staggered 80ms left to right, triggered at 20% card visibility.

**Icon hover (optional, Pattern F):** on hover, each icon's outline redraws via `stroke-dashoffset` over 400ms — a small, deliberate use of the draw-in pattern so it doesn't feel bolted on.

**Responsive:** 4 → 2 → 1 columns at 1024px / 640px breakpoints; stagger direction switches to top-to-bottom on single column.

### 4.5 "Our Agile Process" (full-bleed blue gradient, 6 cards)
**Layout:** full-width section using `gradient-section-blue`, eyebrow pill "How We Work", H2 "Our Agile Process", subhead, 6 cards in a 3×2 grid (Planning, Defining the User Experience, The Technical Foundations, Implementation, Repeat the cycle, The Launch), each showing a step number and small glyph icon.

**Motion:** Pattern A, two-row stagger — row 1 (3 cards) reveals first (80ms stagger), then row 2 begins 150ms after row 1 completes, reinforcing the step-by-step reading order rather than all six populating at once.

**Background detail:** the gradient itself gets a very subtle slow diagonal drift (`background-position` animated over 20s, looping) so the section doesn't feel static against the more kinetic hero/panel sections above it — restrained enough that it reads as ambient, not distracting.

**Responsive:** 3×2 → 2×3 → 1×6 grid at 1024px / 640px.

### 4.6 "Glowing Testimonials" (2×3 grid)
**Layout:** light background, eyebrow "Why Choose Us", H2, 6 testimonial cards with avatar, quote, name, company, and a flag icon.

**Motion:** Pattern A, staggered 100ms, grid reveal (not a carousel — the screenshot shows a static grid, so no auto-rotation is added here to avoid contradicting the reference layout).

**Card hover:** subtle lift (`translateY(-4px)`) with a soft shadow introduced only on hover (cards are flat/borderless at rest, consistent with the screenshot's minimal card style).

**Responsive:** 3 → 2 → 1 columns at 1024px / 640px.

### 4.7 Partner Logo Strip
**Layout:** full-width `color-accent` band, logos in a single row.

**Motion:** logos fade in on first scroll-into-view (Pattern A, fast 40ms stagger), then the row converts to a continuous infinite horizontal marquee (loop duration 30s, linear, pause-on-hover) — this matches the video's row-by-row logo reveal (frame 3) while adding the continuous-scroll treatment implied by a single-row logo strip at this width.

**Accessibility:** marquee pauses entirely under `prefers-reduced-motion`; logo list is still present as static content in the DOM (marquee is a visual duplication of the same list, not the only copy).

### 4.8 Case Study Preview (dark, two device mockups)
**Layout:** dark background, two overlapping device/dashboard mockup images, centered "View Case Studies" pill button.

**Motion (parallax):** as the section scrolls through the viewport, the two mockups move at different vertical speeds (back mockup 0.6× scroll speed, front mockup 1× — i.e., the back one appears to drift slower, adding depth) — a restrained parallax rather than the video's more elaborate pin/scale treatment, since this section's job is a quiet visual pause before the CTA, not another feature showcase.

**CTA button:** magnetic hover — button shifts up to 8px toward the cursor within a 60px radius, springs back on leave.

**Responsive:** parallax offset reduces to 0.3×/1× on tablet, disables entirely under 768px (mockups stack, no parallax).

### 4.9 "Connect with Us" CTA
**Layout:** light background, left column heading + body copy + CTA button, right column currently blank in the screenshot.

**Motion:** Pattern A on the text column. For the right column, add a small echo of the hero's flowing-line graphic (see video frame pattern: the closing CTA section reuses the hero's visual motif) at low opacity, animating in with a slow horizontal drift — this creates a visual bookend between the site's opening and closing CTA without introducing a new graphic language. Flagged as a suggested addition since the screenshot itself leaves this column empty (see Section 6).

**Responsive:** right-column graphic hidden below 768px.

### 4.10 Footer
**Layout:** dark background, logo + social icons left, four link columns right, bottom bar with copyright and legal links, thin `color-accent` top border on the very bottom bar.

**Motion:** no scroll-triggered animation (footer content should be immediately available/scannable). Social icons: fill color transitions from `color-text-on-dark-secondary` to `color-accent` on hover, 150ms.

**Load-in detail:** the bottom red accent line animates from 0 → 100% width once, the first time the footer enters the viewport (a small closing flourish, Pattern A applied to a 2px bar instead of a content block).

---

## 5. Component Inventory

| Component | Used In | Notes |
|---|---|---|
| Button (Primary/Pill) | Nav, Hero, CTA sections | `gradient-accent` fill, `radius-pill`, magnetic hover only on the two CTA-section instances (4.8, 4.9) |
| StatCard | Design/Develop/Deploy panel | Count-up number, optional status badge |
| FeatureCard | What We Do, Testimonials | Flat, borderless at rest, `radius-card` |
| ProcessCard | Our Agile Process | Numbered, glyph icon, on-gradient surface (semi-transparent white overlay `rgba(255,255,255,0.08)`) |
| EyebrowPill | Section headers | `color-accent-soft` text on `color-accent` at 12% opacity background |
| OrbitRing | Hero | Ambient rotation + scroll-scrub orbit (Pattern C) |
| LogoMarquee | Partner strip | Infinite loop, pause-on-hover, pause on reduced-motion |

---

## 6. Open Items to Confirm Before Build

- Confirm this is TechRepubliQ's site (stated as the working assumption) and get final copy for all headings/card labels — this doc reuses the screenshot's placeholder copy ("Crafting Future Software Today!", "Talent Augmentation," etc.) which will need to be replaced with TechRepubliQ's actual service names to match the object list already registered with CAC.
- The screenshot's right column in "Connect with Us" (4.9) is blank — confirm whether to leave it empty (simplest, matches reference exactly) or add the suggested echo-graphic.
- Confirm whether testimonials are real client quotes or placeholder — screenshot testimonials appear to be template content.
- Brand accent confirmed as red (`#C8102E`), overriding the screenshot's violet — resolved, no longer an open item.
- Confirm animation library choice (GSAP is assumed here as the closest match to the video's scrub/pin precision; a lighter Framer Motion + native `IntersectionObserver` approach is possible if bundle size is a priority, at the cost of losing true scroll-scrubbing on Patterns B and C).
