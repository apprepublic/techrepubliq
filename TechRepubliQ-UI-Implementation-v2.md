# TechRepubliQ — UI Implementation Document (v2.0)

**Companion to:** TechRepubliQ-PRD.md
**Supersedes:** UI Implementation Document v1.0 ("Working Drawing" blueprint direction)
**Purpose:** Developer-ready spec for every screen in the product (not just the marketing site) — tokens, components, states, responsive behavior, edge cases, motion, and accessibility — rebuilt in the visual language of the reference screenshot, animated with the motion system extracted from the reference video.

---

## 0. Design Direction

**v1.0 used a "technical drafting" concept (corner brackets, dimension lines, monospace, sharp corners).** This version replaces that with **"Aurora Studio"**: the dark-hero-plus-light-content structure and soft rounded cards from the reference screenshot, brought to life with the scroll-driven motion vocabulary catalogued from the reference video (staggered reveals, pinned count-ups, a scroll-scrubbed orbit graphic, line-by-line text reveal) — with the primary accent kept red, consistent with the rest of the brand. Precision is now communicated through motion and glow rather than drafting-table metaphors — the product still feels exact, but the visual language is warmer and more premium, matching what the founder is building the marketing site around.

Everything in this document uses the same token set as the marketing-site spec (`TechRepubliQ-Site-Design-Concept-and-Animation-Spec.md`) so the product and the marketing site read as one brand, not two.

### 0.1 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `color-bg-dark` | `#0A0912` | Product hero/intro moments only (Home) — the app itself stays light |
| `color-bg-light` | `#F6F5F9` | Page background for all utility/app screens |
| `color-surface-dark` | `#141220` | Dark cards where used (Home stat panel) |
| `color-surface-light` | `#FFFFFF` | Card/panel surfaces on light background |
| `color-text-primary` | `#14121F` | Primary text on light backgrounds (nearly all app screens) |
| `color-text-on-dark` | `#F7F6FA` | Primary text on dark backgrounds |
| `color-text-secondary` | `#6B6876` | Secondary text, helper copy, captions |
| `color-accent` | `#C8102E` | Primary CTA, links, active states, focus ring |
| `color-accent-soft` | `#FF6B5B` | Gradient end-stop, ring/glow highlight |
| `color-accent-dim` | `#FBE2E4` | Accent-tinted backgrounds (selected states, info banners) — replaces v1.0's `color-accent-dim` |
| `gradient-accent` | `linear-gradient(135deg, #FF5C4D 0%, #C8102E 100%)` | Primary buttons, Signal Panel border, price emphasis |
| `color-success` | `#22C55E` | Paid/delivered status, success toasts |
| `color-amber` | `#B4690E` | Pending/in-progress status, non-blocking warnings |
| `color-error` | `#8C2F1B` | Error states, form validation — kept a distinct rust/maroon so it never reads as a duplicate of the primary red |
| `color-border` | `#E8E6F0` | Hairline borders on light surfaces |
| `color-border-dark` | `#242233` | Hairline borders on dark surfaces |
| `font-display` | Inter Tight, 600–700 | Page titles, section headings |
| `font-body` | Inter, 400–500 | Body copy, form labels, buttons |
| `type-scale-xl` | 40px / 48px / 600 | H1 (page hero) |
| `type-scale-lg` | 28px / 36px / 600 | H2 (section headers) |
| `type-scale-md` | 18px / 28px / 500 | H3, card titles |
| `type-scale-body` | 16px / 26px / 400 | Body text |
| `type-scale-sm` | 14px / 20px / 400 | Helper text, captions |
| `spacing-xs` … `spacing-2xl` | 4 / 8 / 16 / 32 / 64 / 96px | Same scale as v1.0, unchanged |
| `radius-card` | 20px | Cards, panels, modals — replaces v1.0's `radius-none` |
| `radius-pill` | 999px | Buttons, badges, step-track, tabs |
| `radius-input` | 10px | Text inputs, textareas |
| `shadow-card` | `0 1px 2px rgba(20,18,31,0.04), 0 8px 24px rgba(20,18,31,0.06)` | Default resting shadow on light-surface cards — a real (small) shadow is back, since Aurora Studio doesn't share v1.0's shadow-free rule |
| `motion-fast` | 150ms, ease-out | Hover/focus transitions |
| `motion-default` | 220ms, `cubic-bezier(0.22, 1, 0.36, 1)` | Panel reveals, step transitions — matches the marketing site's Lenis easing so the whole product feels like one system |
| `motion-page-load` | 400ms, staggered | Orchestrated hero/panel reveals |

Numeric fields that need visual alignment (prices, order/quote reference numbers) use `font-body` with `font-variant-numeric: tabular-nums` rather than a separate monospace face — Aurora Studio drops v1.0's mono-for-precision convention in favor of one consistent typeface family across the whole product.

### 0.2 Signature Component: Signal Panel

Replaces v1.0's Corner-Bracket Frame. Same job — marking a "measured commitment" moment (a quote, an invoice, an order spec) — new visual treatment: `radius-card` rounded panel, 1.5px gradient border (`gradient-accent`, applied via a padding-box/border-box double-background technique, not a solid stroke), `color-surface-light` fill, and a soft outer glow (`box-shadow: 0 0 0 1px rgba(200,16,46,0.08), 0 12px 32px rgba(200,16,46,0.12)`). Reserved for the same moments as before: Quote Result, Order Summary at Checkout, invoice display on Order Detail — not used decoratively on ordinary cards.

### 0.3 Motion System (shared with the marketing site)

| Pattern | What it does | Used where in this doc |
|---|---|---|
| **A — Staggered Fade-Up** | Elements enter 24px below final position, fading 0→1, staggered 60–100ms | Service grid, feature cards, order rows on first load |
| **B — Pinned Count-Up Reveal** | Numeric values animate from 0 to target as their card enters view; final value always present in the DOM for a11y | Stat cards on Home, price in Quote Result, totals at Checkout |
| **C — Scroll-Scrubbed Orbit** | The hero's gradient ring rotates/scales in direct proportion to scroll position | Home hero only |
| **D — Line-by-Line Text Reveal** | Paragraph lines ramp from low to full opacity as the section scrolls through view | Home only (short connective copy) |
| **Step-Track transition** | Segmented pill progress, active segment fills with `gradient-accent`, 220ms | Quote Intake, Order Detail status timeline |

App/utility screens (Quote Intake, Checkout, Dashboard, Account Settings) intentionally use only Patterns A and B, and only on first entry into a screen — no scroll-scrubbing or pinning in transactional flows, since a customer filling a form or paying should never feel like the page is fighting their scroll. Patterns C and D are reserved for Home, where a marketing-style first impression is appropriate.

---

## 1. Home

### Overview
First impression and quote-flow entry point, rebuilt directly on the reference screenshot's structure: dark hero with rotating gradient ring, a Design/Develop/Deploy stat panel, a service grid, then a light footer-adjacent CTA.

### Layout
- Hero: two-column, dark background (`color-bg-dark`), left copy + CTA, right gradient ring graphic.
- Stat panel: two-column dark section, left large heading panel, right three stacked stat cards.
- Service grid: light background (`color-bg-light`), 3-column card grid at desktop.
- Closing CTA: light background, single column centered.

### Design Tokens Used
| Token | Usage |
|---|---|
| `color-bg-dark` | Hero, stat panel |
| `color-bg-light` | Service grid, closing CTA |
| `gradient-accent` | Hero CTA, ring graphic, "500+ Projects" stat card fill |
| `font-display` / `type-scale-xl` | Hero headline |

### Sections
1. **Nav bar** — logo left, links (Services, Pricing/FAQ, Terms, Login) right, transparent over hero, `color-bg-dark` at 80% + blur once scrolled past 80px, sticky.
2. **Hero** — H1 stating the value proposition, one-sentence subhead, primary CTA "Request a Quote," gradient ring graphic right.
3. **Design/Develop/Deploy stat panel** — dark panel + three stat cards (Projects Delivered, Years of Experience, Coding Hours), each count-up animated.
4. **Service grid** — 6 cards (Web Development, App Development, Web/UI Design, AI Automation, AI Integration, Optimization), rounded, `shadow-card`, icon glyph, short description, "View service" link.
5. **Closing CTA** — short heading, one line of body copy, primary CTA button.
6. **Footer** — legal links (Terms of Service, Privacy), contact, copyright.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| Button | Primary | `label`, `onClick`, `loading` | `gradient-accent` fill, white text, `radius-pill` |
| Button | Secondary | `label`, `onClick` | Transparent fill, `1px color-border` (on light) or `color-border-dark` (on dark) |
| NavLink | Default/Active | `label`, `href` | Active state: sliding `color-accent` pill background behind the link (FLIP transform, not layout-triggering) |
| ServiceCard | Default | `title`, `description`, `href` | `radius-card`, `shadow-card`, white surface |
| StatCard | Default | `value`, `label`, `badge?` | Count-up animated value (Pattern B) |
| OrbitRing | Decorative | — | Ambient 40s rotation loop + scroll-scrub acceleration on scroll-out (Pattern C) |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Primary CTA | Hover | Background shifts to darker gradient stop, `motion-fast` |
| Primary CTA | Focus (keyboard) | 2px `color-accent` outline, 2px offset |
| Primary CTA | Loading | Label replaced with inline spinner, button disabled |
| ServiceCard | Hover | `translateY(-4px)`, shadow deepens, `motion-fast` |
| Nav bar | Scroll >80px | Background/blur fade-in per Section 0.3 |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | 3-column service grid, full hero padding, ring at full size |
| Tablet (768–1024px) | 2-column service grid, ring reduced to 80% |
| Mobile (<768px) | 1-column service grid, ring drops below text at 60% size, nav collapses to a menu icon with a full-screen link list, stat panel pin/count-up still runs but without the scroll-pin (see Pattern B note in Section 0.3 — pin disables under 1024px, count-up still triggers on scroll-into-view) |

### Edge Cases
- **Slow connection:** hero text renders immediately (`font-display: swap` with matched fallback metrics); ring graphic is inline SVG, not a heavy asset, so it doesn't block paint.
- **JS not yet loaded:** CTA is a real `<a href>` under the hood so it remains functional pre-hydration; count-up numbers render their final value directly in markup regardless of JS state.

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Hero headline/subhead/CTA | Page load | A | 400ms staggered |
| Ring graphic | Page load, then continuous | Fade+scale in, then ambient loop | 600ms in / 40s loop |
| Ring graphic | Scroll out of hero | C | Scroll-scrubbed |
| Stat cards + count-up | Scroll into view | A + B | 800ms count-up |
| Connective line under stat panel | Scroll through view | D | Scroll-scrubbed |
| Service grid cards | Scroll into view | A | 80ms stagger |

### Accessibility Notes
- Nav is a `<nav>` landmark; mobile menu button has `aria-expanded`/`aria-controls`.
- Hero H1 is the only `<h1>` on the page.
- Ring graphic is `aria-hidden="true"`.
- Count-up stat values are present in the DOM at full value immediately; the animation is purely visual and never delays the accessible value.
- All Pattern A/B/C/D motion disables to instant end-state under `prefers-reduced-motion: reduce`.

---

## 2. Services (category detail page, one template for all 6)

### Overview
Explains one service category in enough depth to justify price, and routes into the quote flow pre-filtered to that category. Unchanged in purpose from v1.0; rebuilt visually.

### Layout
Two-column on desktop: content column (`~700px`) left, sticky Signal Panel (`~360px`) right containing a "Starting at" price and a "Request a Quote" CTA. Single column, panel un-stuck, on mobile.

### Design Tokens Used
Signal Panel (Section 0.2) for the sticky summary; `color-accent-dim` for inline highlight callouts; `type-scale-lg` for the H1.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StickySummaryPanel | Signal Panel | `startingPrice`, `ctaLabel` | Sticks at `top: 96px`; price uses tabular-nums, count-up (Pattern B) on first scroll-into-view |
| Accordion | FAQ item | `question`, `answer`, `expanded` | Chevron rotates 180°, `grid-template-rows` height animation, `motion-default` |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Accordion item | Collapsed/Expanded | Per above |
| Sticky panel CTA | Click | Routes to Quote Intake with `?category=` pre-filled |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Two-column, sticky panel |
| Tablet/Mobile (<1024px) | Single column; panel renders inline after the intro paragraph, not sticky |

### Edge Cases
- **Missing "starting price" data:** panel shows "Custom scope" instead of a broken price field.

### Accessibility Notes
- Accordion buttons use `aria-expanded`; content stays in the DOM for SEO/reading order with `aria-hidden` when collapsed.

---

## 3. Quote Intake (multi-step form)

### Overview
Core conversion mechanism. Must feel fast and precise — motion stays restrained here (Pattern A only, no pin/scrub) per the Section 0.3 rule for transactional flows.

### Layout
Centered single column, `max-width: 640px`, one step visible at a time. Step progress shown as a segmented pill Step-Track (replaces v1.0's dimension-line): a row of short rounded segments, the active and completed segments filled `gradient-accent`, upcoming segments `color-border`.

### Design Tokens Used
`color-error` for validation, `gradient-accent` for the Step-Track fill, `spacing-lg` between form groups, `radius-input` for all fields.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StepTrack | Default | `currentStep`, `totalSteps` | Segmented pill, not a percentage bar |
| RadioCardGroup | Service category select | `options[]`, `selected` | Rounded `radius-card` bordered cards, not native-look radios |
| TextArea | Project description | `value`, `maxLength`, `charCount` | `radius-input` |
| CheckboxList | Feature options | `options[]`, `selectedValues[]` | Category-specific |
| SelectField | Timeline | `options[]`, `value` | — |
| RangeSlider | Budget (optional) | `min`, `max`, `value` | Track fill uses `gradient-accent`, labeled "Optional — helps us calibrate" |
| ReviewSummary | Default | `answers` | Editable — clicking any field jumps back to its step |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| RadioCardGroup option | Selected | Border becomes 2px `color-accent`, background `color-accent-dim` |
| TextArea | Near max length (>90%) | Character counter turns `color-amber` |
| TextArea | At max length | Counter turns `color-error`, further input blocked |
| "Continue" button | Step incomplete | Disabled state, `color-text-secondary`-tinted fill, tooltip "Complete this step to continue" |
| "Generate Quote" (final step) | Click | Loading state, form read-only, transitions to Quote Result on success |
| Any step | Back navigation | Answers persist in form state |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>768px) | Form column `640px` |
| Mobile (<768px) | Full-width minus `spacing-md` gutters, StepTrack segment labels hide (segments only, current step name shown as text above) |

### Edge Cases
- **User abandons mid-form:** answers persist in local storage keyed to a session id; returning within 24h resumes at the last step with a banner: "Picking up where you left off."
- **Empty free-text description:** blocked at step level, not deferred to final submit.
- **Network failure on quote generation:** error state replaces the loading spinner; answers are not lost.

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Step transition | Continue/Back click | Horizontal slide (24px) + fade | 220ms |
| StepTrack segment fill | Step change | Width/color transition | 220ms |
| RadioCardGroup selection | Click | Border/background transition | 150ms |

### Accessibility Notes
- Each step announced via `aria-live="polite"`: "Step 2 of 3: Project details."
- RadioCardGroup uses native `<input type="radio">`, visually styled.
- Focus moves to the first field of a new step automatically.
- Errors associated to fields via `aria-describedby`.

---

## 4. Quote Result

### Overview
The trust moment — now visually reinforced by the Signal Panel and a count-up price reveal, which reads as more "alive" than v1.0's static corner-bracket panel while staying calm enough not to undercut trust.

### Layout
Single centered column, `max-width: 560px`. The quote is a Signal Panel (Section 0.2).

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| QuotePanel | Signal Panel | `scopeSummary[]`, `price`, `currency`, `referenceId` | Plain-language bullet list; price count-up animates 0→value over 700ms on panel entry (Pattern B) |
| DiscountCodeField | Default/Applied/Invalid | `code`, `discountAmount` | Inline field with "Apply" button |
| Button | Primary ("Proceed to Payment") | — | Routes to Checkout |
| Button | Ghost ("Request Human Review") | — | Optional per PRD open item |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| DiscountCodeField | Valid code applied | Border `color-success`, price re-runs a short count-down/count-up to the new total, strikethrough on original |
| DiscountCodeField | Invalid code | Border `color-error`, inline message "Code not recognized" |
| "Request Human Review" | Click | Panel replaced with confirmation state; "Proceed to Payment" becomes secondary/disabled until review clears |

### Edge Cases
- **Low-confidence AI quote:** panel shows an "Estimated — pending confirmation" tag next to the price rather than presenting an uncertain number as final. (Open item: confidence threshold still needs definition.)
- **Long scope summary (12+ bullets):** list scrolls internally past 5 visible items with a "Show all" expand.

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| QuotePanel | Enters after form submit | Fade + 8px rise | 220ms |
| Price value | Panel entry | B (count-up) | 700ms |

### Accessibility Notes
- Price is in a `<data value="...">` element; final value present immediately regardless of the count-up animation, per the Section 0.3 rule.
- Reference ID copyable via a button with `aria-label="Copy quote reference"`.

---

## 5. Checkout

### Overview
Payment method pre-filtered by location; unchanged logic from v1.0, rebuilt visually.

### Layout
Two-column on desktop: order summary (left, `~440px`, Signal Panel treatment) and payment form (right, `~440px`, plain `radius-card` panel). Stacks to single column, summary first, on mobile.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| OrderSummaryPanel | Signal Panel | `lineItems[]`, `total`, `currency` | Restates the quote scope, not internal features; total uses tabular-nums |
| PaymentForm | Stripe / Paystack | `provider` (resolved server-side by geo) | Only one provider's fields render, no toggle |
| Checkbox | Agreement | `checked`, `label`, `linkHref` | "I agree to the Service Agreement" — required, linked, unchecked by default |
| Button | Primary ("Pay [amount]") | `loading`, `disabled` | Disabled until agreement checkbox is checked |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Agreement checkbox | Unchecked | Pay button disabled |
| Agreement checkbox | Checked | Pay button becomes `gradient-accent`, enabled |
| Pay button | Click | Loading state, fields disabled, redirect/confirm per provider flow |
| Payment failure | Returned from provider | Inline error banner above the form, plain statement + next step |

### Edge Cases
- **Geo-detection ambiguous:** defaults to Stripe/USD with a small text link "Paying from Nigeria? Switch to Naira" — manual override exists but isn't presented as a front-facing toggle.
- **Discount code carried from Quote Result:** pre-filled and locked at checkout.

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Error banner | Payment failure | Slide down from top of form | 220ms |
| OrderSummaryPanel total | Panel entry | B (count-up) | 600ms |

### Accessibility Notes
- Payment provider iframe focus is trapped correctly; page focus returns to the error banner heading on failure.
- Total price announced via `aria-live="polite"` if it changes after a discount code applies.

---

## 6. Post-Payment Confirmation

### Overview
Brief, reassuring screen. One small brand moment added: a soft pulse ring around the success icon, echoing the hero's ring graphic without reusing its complexity.

### Layout
Centered, narrow (`max-width: 480px`), vertically centered.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| ConfirmationIcon | Success | — | Checkmark in a `color-success` circle, with a single soft `color-accent-soft` pulse ring animating outward once on load |
| Button | Secondary ("Go to Dashboard") | — | Primary next action |

### Edge Cases
- **Invoice email delayed:** copy states plainly, "Your invoice is on its way to [email] — it can take a few minutes."

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Pulse ring | Page load | Scale 1→1.6, fade 1→0, single pass | 900ms |

### Accessibility Notes
- Page `<title>` updates to "Order Confirmed."
- Success icon and pulse ring are `aria-hidden="true"`; the confirmation text carries the meaning.
- Pulse animation skipped under `prefers-reduced-motion`.

---

## 7. Dashboard — Orders List

### Overview
Returning-customer home base. Unchanged in purpose; visual system updated.

### Layout
Left sidebar nav (Orders, Account) fixed at `240px` on desktop, `color-bg-light` main content area, orders listed as table rows.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| SidebarNav | Default | `activeItem` | Collapses to a bottom tab bar on mobile |
| OrderRow | Default | `serviceTitle`, `date`, `status`, `referenceId` | Tabular-nums for reference ID and date |
| StatusBadge | Paid / In Progress / Delivered | `status` | `color-success` / `color-amber` / `color-text-primary`, always paired with a text label |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| OrderRow | Hover | Background shifts to `color-accent-dim` at 50% opacity |
| OrderRow | Click | Navigates to Order Detail |
| Orders list | Empty | Empty state: short message + "Request a Quote" CTA |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Sidebar + table layout |
| Mobile (<1024px) | Sidebar becomes bottom tab bar; OrderRow becomes a stacked `radius-card` card |

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Order rows | First page load | A | 60ms stagger |

### Accessibility Notes
- OrderRow implemented as a `<tr>` with a full-row `<a>`, not a `<div onClick>`.
- StatusBadge never relies on color alone.

---

## 8. Dashboard — Order Detail

### Overview
Where invoices are downloaded and migration is requested. Confidentiality boundary framed as "what's included," never as a denial — unchanged principle from v1.0.

### Layout
Single column, `max-width: 720px`. Order Summary (Signal Panel) → Status Timeline → Actions → Service Agreement Reference.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StatusTimeline | Step-Track | `steps[]`, `currentStep` | Same segmented-pill component as Quote Intake's StepTrack, reused for consistency |
| ActionCard | Download Invoice | `href` | Direct PDF download link, `radius-card` |
| ActionCard | Request Migration | `onClick` | Opens Migration Request modal |
| Modal | Migration Request | `scopeOptions` | Explains plainly, inline, that proprietary automation components aren't included |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| "Request Migration" | Click | Opens modal; radio choice for scope, confirm button "Send Request" |
| Migration modal | Submitted | Modal closes, ActionCard shows "Request received" with a timestamp, disabled until fulfilled |
| Invoice download | Click | Direct download, no modal |

### Edge Cases
- **Order still "In Progress":** Migration action disabled with helper text "Available once your order is delivered."
- **Migration already pending:** re-clicking shows the existing pending state, no duplicate requests.

### Accessibility Notes
- Modal focus-trapped, returns focus to trigger on close, closes on `Escape`.
- Migration scope radio choices are a native fieldset/legend group.

---

## 9. Terms of Service / Service Agreement Page

### Overview
Plain-language legal content, scannable. Unchanged in structure.

### Layout
Single column, `max-width: 760px`, sticky in-page table of contents on desktop.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| TableOfContents | Sticky | `sections[]` | Highlights current section via `IntersectionObserver` |
| ClauseSection | Default | `heading`, `body` | Each of the 8 clauses gets its own anchor-linked section |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | TOC visible, sticky |
| Mobile (<1024px) | TOC becomes a collapsible "Jump to section" dropdown |

### Accessibility Notes
- Each clause heading is a real `<h2>` with an `id`; reading order matches visual order.

---

## 10. Login / Sign Up

### Overview
Low-decoration, high-trust utility screen. Unchanged in purpose.

### Layout
Centered single column, `max-width: 400px`, vertically centered. Form panel is a plain `radius-card` white surface (not a Signal Panel — this isn't a measured-commitment moment).

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| TextField | Email | `value`, `error` | `radius-input` |
| TextField | Password | `value`, `error`, `showToggle` | Show/hide toggle icon |
| Button | Primary ("Log in" / "Create account") | `loading` | Full-width, `gradient-accent` |
| TabSwitch | Log in / Sign up | `active` | Two text tabs, sliding `color-accent` underline |
| Link | "Forgot password?" | `href` | `color-accent`, no underline until hover |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| TextField | Invalid on submit | `color-error` border, inline message below field |
| Password field | Toggle clicked | Input type switches, icon swaps eye/eye-off |
| Submit button | Auth failure | Inline banner: "That email and password don't match" — never specifies which field, for security |
| TabSwitch | Click | Field set cross-fades, no reload |

### Edge Cases
- **New customer from completed Checkout:** account auto-created from checkout email; this screen is skipped on that path.
- **Existing email, sign-up attempted:** inline message directs to the Log in tab.

### Animation / Motion
| Element | Trigger | Pattern | Duration |
|---|---|---|---|
| Tab switch | Click | Cross-fade | 160ms |

### Accessibility Notes
- Tabs use `role="tablist"`/`role="tab"`/`aria-selected`.
- Password toggle has an updating `aria-label`.
- Auth failure banner is `role="alert"`.

---

## 11. Pricing / FAQ

### Overview
Standalone cross-cutting FAQ, distinct from per-category FAQs on Services pages.

### Layout
Single column, `max-width: 760px`. "How pricing works" explainer, then grouped FAQ accordions (Getting a Quote, Payment, Migration & Ownership, Support).

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| ExplainerBlock | Default | `heading`, `body` | Plain text; a short `gradient-accent` rule (2px, 48px wide) under the heading as a small brand anchor, replacing v1.0's dimension-line motif |
| FAQGroup | Default | `groupLabel`, `items[]` | Groups accordion items under a `type-scale-md` label |
| Accordion | FAQ item | `question`, `answer`, `expanded` | Same shared component as Services pages |
| Button | Ghost ("Still have a question? Contact us") | — | Routes to a contact channel |

### Edge Cases
- **Direct link to a specific FAQ item:** page supports a `#anchor` per question that auto-expands and scrolls it into view.
- **Migration/confidentiality question:** must stay consistent in substance with the Service Agreement clause (Section 9).

### Accessibility Notes
- FAQGroup labels are real `<h2>` elements.
- Auto-expand-on-anchor respects `prefers-reduced-motion` (instant expand, no scroll animation).

---

## 12. Account Settings

### Overview
Low-frequency utility screen for contact/login details.

### Layout
Dashboard shell, sidebar nav with "Account" active, single-column form content, `max-width: 560px`.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| FormSection | "Contact details" | `fields[]` | `radius-card` panel per section |
| FormSection | "Password" | `fields[]` | Current password, new password, confirm |
| Button | Primary ("Save changes") | `loading` | Per-section save, not one page-wide save |
| Button | Destructive ("Delete account") | — | `color-error` text on transparent, gated behind a confirmation modal |
| Modal | Confirm account deletion | `onConfirm` | Requires typing the account email to confirm |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| "Save changes" (per section) | Click | Loading state scoped to that section only |
| Save success | — | Inline confirmation text next to that section's save button for 3s |
| "Delete account" | Click | Modal opens; destructive button stays disabled until email typed correctly |

### Edge Cases
- **Password change with incorrect current password:** inline error on that field only.
- **Deletion attempted with an order "In Progress":** modal warns plainly, requires a second explicit confirmation.

### Accessibility Notes
- Each FormSection is a `<fieldset>` with its own `<legend>`.
- Deletion modal traps focus, requires typed-email match before the destructive action enables.

---

## 13. Global Components Reference

| Component | Used On | Notes |
|---|---|---|
| Button (Primary/Secondary/Ghost) | All screens | Single button system, three variants, `gradient-accent` on Primary |
| StatusBadge | Orders List, Order Detail | Color + text, never color alone |
| Signal Panel | Quote Result, Order Summary at Checkout, sticky panel on Services | Reserved for "measured commitment" moments only |
| Step-Track | Quote Intake, Order Detail status timeline | One consistent progress metaphor across the product |
| OrbitRing | Home hero only | Not reused elsewhere — kept special to the first impression |
| Toast | Global | Bottom-center, `color-bg-dark` background, white text, auto-dismiss 4s, pausable |
| Accordion | Services FAQ, Pricing/FAQ | Shared component, single implementation |
| Modal | Order Detail (migration), Account Settings (deletion) | Focus-trapped, `Escape`-to-close |
| Destructive Button | Account Settings | Always gated behind a confirmation modal |

---

## 14. Global Accessibility Baseline

- Color contrast: `color-text-primary` (`#14121F`) on `color-bg-light` (`#F6F5F9`) is well above WCAG AA for normal text; `color-accent` (`#C8102E`) on white passes AA for large text/UI components, not relied on for small body text — pair with icon/text where used for status.
- All interactive elements have a visible focus ring (`2px color-accent`, `2px offset`) — never `outline: none` without a replacement.
- `prefers-reduced-motion: reduce` disables all Pattern A/B/C/D motion (Section 0.3), replacing with instant end-states; count-up values always render final value in the DOM regardless.
- Minimum tap target size: `44x44px` on all mobile interactive elements, including Step-Track segments if made tappable.
- Form errors are never conveyed by border color alone — always paired with inline text.

---

## 15. Open Items for Founder Review

- Confirm whether "Request Human Review" ships at launch (affects Quote Result component set).
- Confirm the exact confidence-threshold behavior for AI-generated quotes flagged as "Estimated."
- Confirm the OrbitRing's scroll-scrub behavior (Pattern C) is acceptable on the product's own Home page, not just the standalone marketing site — same asset, same animation, reused here for brand consistency.
- Confirm geo-detection fallback UX (manual currency override wording) with legal/compliance before implementation.
- Confirm `shadow-card` (a real, if subtle, drop shadow) is acceptable — this is a deliberate departure from v1.0's shadow-free rule and worth a sign-off since it changes how "flat" the product feels.
