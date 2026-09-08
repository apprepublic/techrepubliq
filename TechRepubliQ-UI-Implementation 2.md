# TechRepubliQ — UI Implementation Document

**Version:** 1.0
**Companion to:** TechRepubliQ-PRD.md
**Purpose:** Developer-ready spec for every screen: exact tokens, component states, responsive behavior, edge cases, motion, and accessibility. No visual detail is left to guesswork.

---

## 0. Design Direction

TechRepubliQ sells precision: a customer describes a problem, gets an exact scoped quote, and receives a product built to spec. The UI should read like a technical drawing or spec sheet, not a generic SaaS marketing site. Confidence comes from clarity and measurement, not decoration.

**Visual concept: "Working Drawing."** Structural elements borrow from technical drafting: dimension lines instead of soft dividers, corner-bracket frames instead of rounded drop-shadow cards, monospace used deliberately for anything numeric (prices, order IDs, quote references) because those are the things a spec sheet measures. Everything else is quiet: one accent color, no gradients, no card-shadow kit.

Avoid: cream background with terracotta accent, black background with neon accent, uniform rounded SaaS cards with soft grey shadows, tracked-out all-caps eyebrows, em-dash labels, arrow glyphs on buttons.

### 0.1 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `color-ink` | `#12151C` | Primary text, header background on dark sections |
| `color-paper` | `#F5F3EE` | Page background |
| `color-paper-raised` | `#FFFFFF` | Card/panel surfaces on paper background |
| `color-accent` | `#C8102E` | Primary CTA, links, active states, focus ring |
| `color-accent-dim` | `#FBE2E4` | Accent-tinted backgrounds (selected states, info banners) |
| `color-slate` | `#5B6472` | Secondary text, helper copy |
| `color-line` | `#DFDBD3` | Hairline borders, dimension lines |
| `color-success` | `#1F9D66` | Paid/delivered status, success toasts |
| `color-amber` | `#B4690E` | Pending/in-progress status, non-blocking warnings |
| `color-error` | `#8C2F1B` | Error states, form validation |
| `font-display` | Inter Tight, 600–700 weight | Page titles, section headings |
| `font-body` | Inter, 400–500 weight | Body copy, form labels, buttons |
| `font-mono` | JetBrains Mono, 500 weight | Prices, order/quote reference numbers, invoice line items |
| `type-scale-xl` | 40px / 48px line-height / 600 weight | H1 (page hero) |
| `type-scale-lg` | 28px / 36px / 600 | H2 (section headers) |
| `type-scale-md` | 18px / 28px / 500 | H3, card titles |
| `type-scale-body` | 16px / 26px / 400 | Body text |
| `type-scale-sm` | 14px / 20px / 400 | Helper text, captions |
| `spacing-xs` | 4px | Icon-to-label gaps |
| `spacing-sm` | 8px | Inline element gaps |
| `spacing-md` | 16px | Default internal padding |
| `spacing-lg` | 32px | Between related components |
| `spacing-xl` | 64px | Between page sections |
| `spacing-2xl` | 96px | Top/bottom hero padding (desktop) |
| `radius-sm` | 2px | Inputs, buttons (near-square, drafting feel) |
| `radius-none` | 0px | Cards, panels (corner-bracket frame instead of rounding) |
| `shadow-none` | — | No drop shadows used anywhere in the system |
| `motion-fast` | 120ms, ease-out | Hover/focus transitions |
| `motion-default` | 220ms, cubic-bezier(0.2, 0.8, 0.2, 1) | Panel reveals, step transitions |
| `motion-page-load` | 400ms, ease-out, single pass | One orchestrated hero reveal only |

### 0.2 Signature Component: Corner-Bracket Frame

Used for the quote result panel, pricing cards, and invoice summary — the moments where the product is telling the customer "this is the precise spec." Four short corner brackets (12px arms, 1.5px `color-accent` stroke) at each corner of a `radius-none` panel, `color-paper-raised` background, `color-line` 1px border. Not used on every card — reserved for content that represents a measured commitment (a quote, an invoice, an order spec), so it stays meaningful rather than decorative.

---

## 1. Home

### Overview
First impression. Must establish "precision agency" positioning in one scroll and route the visitor to the quote flow within one click.

### Layout
- Single-column, `max-width: 1120px`, centered, left-aligned text throughout.
- 12-column grid on desktop for the service grid section only; single column below `768px`.

### Design Tokens Used
| Token | Usage |
|---|---|
| `color-paper` | Page background |
| `color-ink` | Headline, body text |
| `color-accent` | Primary CTA, hover underline on nav links |
| `font-display` / `type-scale-xl` | Hero headline |
| `spacing-2xl` | Hero top/bottom padding |

### Sections
1. **Nav bar** — logo left, links (Services, Pricing/FAQ, Terms, Login) right, `color-paper` background, `1px color-line` bottom border, sticky on scroll.
2. **Hero** — H1 stating the value proposition in plain language (not a tagline cliché), one-sentence subhead, single primary CTA button "Request a Quote." No supporting stat row, no gradient — the headline carries the section alone, per the single-bold-move principle.
3. **Process strip** — four steps (Describe → Quote → Pay → Delivered) shown as a horizontal dimension line with tick marks at each step, not numbered circles. This is a real sequence, so a sequential marker is justified — the tick-mark line reinforces the "measured process" concept rather than reusing a generic 01/02/03 badge.
4. **Service grid** — 6 items (Web Development, App Development, Web/UI Design, AI Automation, AI Integration, Optimization), each a corner-bracket-free flat panel (`color-line` border only — brackets are reserved for quote/price moments) with a short description and a text link "View service."
5. **Footer** — legal links (Terms of Service, Privacy), contact, copyright line.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| Button | Primary | `label`, `onClick`, `loading` | `color-accent` fill, white text, `radius-sm`, no icon by default |
| Button | Secondary | `label`, `onClick` | Transparent fill, `1px color-ink` border |
| NavLink | Default/Active | `label`, `href` | Active state: `color-accent` text + 2px underline |
| ServiceCard | Default | `title`, `description`, `href` | Flat panel, no shadow, no bracket frame |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Primary CTA | Hover | Background darkens to `#9C0B23`, `motion-fast` |
| Primary CTA | Focus (keyboard) | 2px `color-accent` outline, 2px offset |
| Primary CTA | Loading | Label replaced with inline spinner, button disabled |
| ServiceCard | Hover | Border transitions from `color-line` to `color-ink`, `motion-fast` |
| Nav bar | Scroll >80px | Border-bottom opacity increases from 0 to 1 |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | 3-column service grid, full hero padding |
| Tablet (768–1024px) | 2-column service grid, hero padding reduced to `spacing-xl` |
| Mobile (<768px) | 1-column service grid, nav collapses to a single menu icon revealing a full-screen link list, process strip becomes vertical dimension line |

### Edge Cases
- **Slow connection:** Hero text renders immediately (no font-swap layout shift — use `font-display: swap` with matched fallback metrics); no hero image/video to block paint.
- **JS not yet loaded:** CTA is a real `<a href>` under the hood so it remains functional pre-hydration.

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Hero headline + subhead + CTA | Page load | Single staggered fade-up (headline, then subhead, then CTA, 60ms stagger) | 400ms | ease-out |
| Service grid | Page load | None (no scroll-triggered fade-ins on each card — avoided deliberately) | — | — |

### Accessibility Notes
- Nav is a `<nav>` landmark; mobile menu button has `aria-expanded` and `aria-controls`.
- Hero H1 is the only `<h1>` on the page.
- Focus order: logo → nav links → hero CTA → process strip (non-interactive, skipped) → service cards → footer links.
- Corner-bracket frames are decorative (`aria-hidden="true"`); never carry meaning alone.

---

## 2. Services (category detail page, one template for all 6)

### Overview
Explains one service category in enough depth to justify price, and routes into the quote flow pre-filtered to that category.

### Layout
Two-column on desktop: content column (`~700px`) left, sticky summary panel (`~360px`) right containing a corner-bracket "Starting at" price indicator and a "Request a Quote" CTA. Single column, summary panel un-stuck, on mobile.

### Design Tokens Used
`color-accent-dim` for the sticky panel background, `font-mono` for the "Starting at $X" figure, `type-scale-lg` for the H1.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StickySummaryPanel | Default | `startingPrice`, `ctaLabel` | Corner-bracket frame, sticks at `top: 96px` on scroll |
| Accordion | FAQ item | `question`, `answer`, `expanded` | Used for category-specific FAQ at page bottom |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Accordion item | Collapsed/Expanded | Chevron rotates 180°, content height animates via `grid-template-rows` trick (no fixed max-height hack), `motion-default` |
| Sticky panel CTA | Click | Routes to Quote Intake with `?category=` pre-filled |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Two-column, sticky panel |
| Tablet/Mobile (<1024px) | Single column; summary panel renders inline after the intro paragraph, not sticky |

### Edge Cases
- **Missing "starting price" data:** panel shows "Custom scope" instead of a broken price field, never shows `$0` or `$NaN`.

### Accessibility Notes
- Accordion buttons use `aria-expanded`; content uses `aria-hidden` when collapsed but remains in the DOM for SEO/reading order.

---

## 3. Quote Intake (multi-step form)

### Overview
The core conversion mechanism. Must feel fast and precise, not like a long survey.

### Layout
Centered single column, `max-width: 640px`, one step visible at a time. Step progress shown as a horizontal dimension line (same visual language as the homepage process strip) with the current tick filled `color-accent`.

### Design Tokens Used
`color-error` for validation, `color-accent` for the active step tick, `spacing-lg` between form groups.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StepProgress | Default | `currentStep`, `totalSteps` | Dimension-line style, not a percentage bar |
| RadioCardGroup | Service category select | `options[]`, `selected` | Used in Step 1; each option is a flat bordered card, not a native radio |
| TextArea | Project description | `value`, `maxLength`, `charCount` | Step 2 free-text field |
| CheckboxList | Feature options | `options[]`, `selectedValues[]` | Step 2, category-specific |
| SelectField | Timeline | `options[]`, `value` | Step 2 |
| RangeSlider | Budget (optional) | `min`, `max`, `value` | Step 2, explicitly labeled "Optional — helps us calibrate" |
| ReviewSummary | Default | `answers` | Step 3, editable — clicking any field jumps back to its step |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| RadioCardGroup option | Selected | Border becomes 2px `color-accent`, background `color-accent-dim` |
| TextArea | Near max length (>90%) | Character counter turns `color-amber` |
| TextArea | At max length | Counter turns `color-error`, further input blocked |
| "Continue" button | Step incomplete | Disabled state, `color-slate` fill, tooltip on hover: "Complete this step to continue" |
| "Generate Quote" (final step) | Click | Button enters loading state, form becomes read-only, transitions to Quote Result screen on success |
| Any step | Back navigation | Answers persist (stored in form state, not re-fetched) |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>768px) | Form column `640px`, generous side padding |
| Mobile (<768px) | Form column full-width minus `spacing-md` gutters, StepProgress tick labels hide (ticks only, current step name shown as text above) |

### Edge Cases
- **User abandons mid-form:** answers persist in local storage keyed to a session id; returning within 24h resumes at the last step with a banner: "Picking up where you left off."
- **Empty free-text description:** blocked at step level with inline error, not deferred to final submit.
- **International/long text in description:** TextArea has no visual truncation; it scrolls internally past a `240px` max-height.
- **Network failure on quote generation:** error state (see below) replaces the loading spinner; answers are not lost.

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Step transition | Continue/Back click | Horizontal slide (24px) + fade | 220ms | `motion-default` |
| RadioCardGroup selection | Click | Border/background transition | 120ms | ease-out |

### Accessibility Notes
- Each step is announced via `aria-live="polite"` region: "Step 2 of 3: Project details."
- RadioCardGroup is implemented as a native `<input type="radio">` set visually styled, not a div with click handlers, so keyboard and screen reader behavior is native.
- Focus moves to the first field of a new step automatically on step transition.
- Error messages are associated to their field via `aria-describedby`.

---

## 4. Quote Result

### Overview
The trust moment. Must make the AI-generated quote feel authoritative and precise, not automated-feeling.

### Layout
Single centered column, `max-width: 560px`. The quote itself is the signature corner-bracket panel.

### Design Tokens Used
`font-mono` for the price and scope reference number, corner-bracket frame per Section 0.2.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| QuotePanel | Default | `scopeSummary[]`, `price`, `currency`, `referenceId` | Corner-bracket frame; scope summary as a plain bullet list, not technical jargon |
| DiscountCodeField | Default/Applied/Invalid | `code`, `discountAmount` | Inline field with "Apply" button |
| Button | Primary ("Proceed to Payment") | — | Routes to Checkout |
| Button | Ghost ("Request Human Review") | — | Optional per open decision in PRD; opens a confirmation that a team member will follow up within a stated window |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| DiscountCodeField | Valid code applied | Field border `color-success`, price updates with strikethrough on original price |
| DiscountCodeField | Invalid code | Field border `color-error`, inline message "Code not recognized" |
| "Request Human Review" | Click | Panel replaced with confirmation state; "Proceed to Payment" becomes secondary/disabled until review clears (if this path is enabled) |

### Edge Cases
- **AI quote generation returns a low-confidence/edge-case scope:** panel shows a "Estimated — pending confirmation" tag next to the price rather than presenting an uncertain number as final. (Flag for founder: confidence threshold needs definition.)
- **Very long scope summary (12+ bullets):** list scrolls internally past 5 visible items with a "Show all" expand, so the panel never grows unbounded.

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| QuotePanel | Enters after form submit | Fade + 8px rise, single pass | 220ms | `motion-default` |

### Accessibility Notes
- Price is in a `<data value="...">` element so assistive tech reads the numeric value correctly alongside the mono-styled display text.
- Reference ID is copyable via a button with `aria-label="Copy quote reference"`.

---

## 5. Checkout

### Overview
Payment method is pre-filtered by location; the customer never sees or toggles the other region's option.

### Layout
Two-column on desktop: order summary (left, `~440px`) and payment form (right, `~440px`). Stacks to single column, summary first, on mobile.

### Design Tokens Used
`color-accent-dim` background on the order summary panel, `font-mono` for line-item prices.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| OrderSummaryPanel | Default | `lineItems[]`, `total`, `currency` | Restates the quote scope, not internal features |
| PaymentForm | Stripe / Paystack | `provider` (resolved server-side by geo, not user-toggleable) | Only one provider's fields render; no visible "switch region" control |
| Checkbox | Agreement | `checked`, `label`, `linkHref` | "I agree to the Service Agreement" — required, linked, unchecked by default |
| Button | Primary ("Pay [amount]") | `loading`, `disabled` | Disabled until agreement checkbox is checked |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Agreement checkbox | Unchecked | Pay button disabled, `color-slate` fill |
| Agreement checkbox | Checked | Pay button becomes `color-accent`, enabled |
| Pay button | Click | Loading state, form fields disabled, redirect/confirm per provider flow |
| Payment failure | Returned from provider | Inline error banner above the form: plain statement of what happened and what to do next (retry / different card), no blame language |

### Edge Cases
- **Geo-detection ambiguous (VPN, corporate proxy):** default to Stripe/USD with a small text link "Paying from Nigeria? Switch to Naira" — a manual override exists, but it is not presented as a toggle up front, preserving the "personalized by default" behavior while avoiding a hard dead-end for misdetected users.
- **Discount code carried from Quote Result:** pre-filled and locked (not re-editable at checkout) to avoid mismatched totals.

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Error banner | Payment failure | Slide down from top of form | 220ms | `motion-default` |

### Accessibility Notes
- Payment provider iframe (Stripe Elements / Paystack inline) focus is trapped correctly within its own fields; page focus returns to the error banner heading on failure.
- Total price is announced via `aria-live="polite"` if it changes after a discount code applies at this stage.

---

## 6. Post-Payment Confirmation

### Overview
Brief, reassuring, low-decoration screen confirming the order and that an invoice is on its way.

### Layout
Centered, narrow (`max-width: 480px`), vertically centered in viewport.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| ConfirmationIcon | Success | — | Simple checkmark in a `color-success` circle, not an illustration |
| Button | Secondary ("Go to Dashboard") | — | Primary next action |

### States and Interactions
None (static confirmation state).

### Edge Cases
- **Invoice email delayed:** copy explicitly says "Your invoice is on its way to [email] — it can take a few minutes," so the customer isn't left assuming something failed.

### Accessibility Notes
- Page `<title>` updates to "Order Confirmed" for screen reader users navigating by title.
- Success icon has `aria-hidden="true"`; the confirmation message itself carries the meaning in text.

---

## 7. Dashboard — Orders List

### Overview
Returning-customer home base. Must make order status legible at a glance.

### Layout
Left sidebar nav (Orders, Account) fixed at `240px` on desktop; main content area lists orders as rows in a table-like layout (not cards — this is a records view, table language fits the content better than card language).

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| SidebarNav | Default | `activeItem` | Collapses to a bottom tab bar on mobile |
| OrderRow | Default | `serviceTitle`, `date`, `status`, `referenceId` | `font-mono` for reference ID and date |
| StatusBadge | Paid / In Progress / Delivered | `status` | Color-coded per token (`color-success`, `color-amber`, `color-ink`) with a text label, never color alone |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| OrderRow | Hover | Background shifts to `color-accent-dim` at 40% opacity |
| OrderRow | Click | Navigates to Order Detail |
| Orders list | Empty (no orders yet) | Empty state: short message + "Request a Quote" CTA, not a blank table |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Sidebar + table layout |
| Mobile (<1024px) | Sidebar becomes bottom tab bar; OrderRow becomes a stacked card with the same fields, label-value pairs instead of table columns |

### Accessibility Notes
- OrderRow implemented as a `<tr>` with a full-row `<a>` wrapping the primary link target (not a `<div onClick>`).
- StatusBadge always includes visible text, never relies on color alone (colorblind-safe by construction).

---

## 8. Dashboard — Order Detail

### Overview
Where invoices are downloaded and migration is requested. Must clearly separate "what you can get" from "what stays confidential" without ever surfacing that boundary as a broken or missing feature.

### Layout
Single column, `max-width: 720px`. Sections in order: Order Summary → Status Timeline → Actions → Service Agreement Reference.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| StatusTimeline | Default | `steps[]`, `currentStep` | Horizontal dimension-line, same visual language as homepage/quote-intake progress |
| ActionCard | Download Invoice | `href` | Direct PDF download link |
| ActionCard | Request Migration | `onClick` | Opens Migration Request modal |
| Modal | Migration Request | `scopeOptions` (front-end only / front-end + back-end) | Explains in plain language, inline, that proprietary automation components are not included — phrased as "what's included," never as an apology or a denial |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| "Request Migration" | Click | Opens modal; radio choice for scope, confirm button "Send Request" |
| Migration modal | Submitted | Modal closes, ActionCard shows "Request received" state with a timestamp, button becomes disabled until fulfilled |
| Invoice download | Click | Direct download, no modal |

### Edge Cases
- **Order still in progress (no invoice yet... invoice is always available immediately post-payment per PRD, but status may still be "In Progress"):** Migration action is disabled with helper text "Available once your order is delivered."
- **Migration already requested and pending:** re-clicking shows the existing pending state rather than allowing duplicate requests.

### Accessibility Notes
- Modal uses a proper focus trap, returns focus to the triggering button on close, closes on `Escape`.
- Migration scope radio choices are a native fieldset/legend group.

---

## 9. Terms of Service / Service Agreement Page

### Overview
Plain-language legal content. Must be scannable, not a wall of text, since it directly supports the trust model described in the PRD.

### Layout
Single column, `max-width: 760px`, sticky in-page table of contents on the left for desktop (jumps to each clause).

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| TableOfContents | Sticky | `sections[]` | Highlights current section on scroll (`IntersectionObserver`, not scroll-position math) |
| ClauseSection | Default | `heading`, `body` | Each of the 8 clauses from the PRD gets its own anchor-linked section |

### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | TOC visible, sticky |
| Mobile (<1024px) | TOC becomes a collapsible "Jump to section" dropdown above the content |

### Accessibility Notes
- Each clause heading is a real `<h2>` with an `id` for anchor linking; TOC links use those same ids.
- Reading order matches visual order regardless of the sticky TOC's CSS positioning.

---

## 10. Login / Sign Up

### Overview
Gate to the Dashboard for returning customers, and account creation for new customers who've just paid or want to start a quote as a saved session. Low-decoration, high-trust — this is a utility screen, not a marketing moment.

### Layout
Centered single column, `max-width: 400px`, vertically centered in viewport. No sidebar, no marketing copy alongside the form.

### Design Tokens Used
| Token | Usage |
|---|---|
| `color-paper-raised` | Form panel background |
| `color-line` | Form panel border (flat, `radius-sm`, no corner-bracket — this isn't a measured-commitment moment) |
| `color-accent` | Primary submit button, "Forgot password" link |
| `type-scale-md` | Form heading ("Log in" / "Create account") |

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| TextField | Email | `value`, `error` | Standard input, `radius-sm` |
| TextField | Password | `value`, `error`, `showToggle` | Includes a show/hide toggle icon, not a separate checkbox |
| Button | Primary ("Log in" / "Create account") | `loading` | Full-width within the form panel |
| TabSwitch | Log in / Sign up | `active` | Two plain text tabs above the form, underline indicates active, no pill/segmented-control styling |
| Link | "Forgot password?" | `href` | Below password field, `color-accent`, no underline until hover |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| TextField | Invalid on submit | Red-brown (`color-error`) border, inline message below field |
| Password field | Toggle clicked | Input type switches `password`/`text`, icon swaps eye/eye-off |
| Submit button | Click | Loading state, fields disabled |
| Submit button | Auth failure | Inline banner above the form: plain statement ("That email and password don't match") — never says which field was wrong, for security |
| TabSwitch | Click | Form fields swap (sign-up adds a name field) with a quick cross-fade, no full page reload |

### Edge Cases
- **New customer arriving straight from a completed Checkout:** account is auto-created from the checkout email; this screen is skipped entirely on that path — first login only applies to a customer returning later without a session, or one who wants to log in before ordering.
- **Existing email, sign-up attempted:** inline message directs to the Log in tab rather than throwing a generic server error.

### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Tab switch | Click | Cross-fade between field sets | 160ms | ease-out |

### Accessibility Notes
- Tabs are implemented with `role="tablist"`/`role="tab"`/`aria-selected`, not plain buttons with manual styling.
- Password visibility toggle has `aria-label` that updates ("Show password" / "Hide password").
- Auth failure banner is `role="alert"` so it's announced immediately.

---

## 11. Pricing / FAQ

### Overview
Standalone page distinct from the per-category FAQ accordion on each Services page. This page answers cross-cutting questions that don't belong to one service: how the quote engine works, payment methods by region, the migration/confidentiality model, and refund terms. It exists to reduce quote-intake abandonment by pre-answering trust objections.

### Layout
Single column, `max-width: 760px`. Two content blocks in order: a short "How pricing works" explainer (not a price table — pricing is scope-dependent, so a fixed table would misrepresent the model), then a FAQ accordion list grouped under plain-language headers (Getting a Quote, Payment, Migration & Ownership, Support).

### Design Tokens Used
`color-slate` for group headers, `font-body` throughout — no `font-mono` on this page, since there are no prices or reference numbers to render.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| ExplainerBlock | Default | `heading`, `body` | Plain text, no illustration — reuses the process strip's dimension-line motif in miniature if a visual anchor is wanted |
| FAQGroup | Default | `groupLabel`, `items[]` | Groups accordion items under a `type-scale-md` label |
| Accordion | FAQ item | `question`, `answer`, `expanded` | Same component as used on Services pages (Section 2), reused for consistency |
| Button | Ghost ("Still have a question? Contact us") | — | Footer of the page, routes to a contact channel (email/form — to be confirmed with founder) |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Accordion item | Collapsed/Expanded | Same behavior as Section 2: `grid-template-rows` height animation, chevron rotation, `motion-default` |
| FAQGroup label | — | Non-interactive, purely structural |

### Edge Cases
- **Direct link to a specific FAQ item (e.g. shared support link):** page supports a `#anchor` per question that auto-expands that item and scrolls it into view on load.
- **Migration/confidentiality question specifically:** answer here must stay consistent, word-for-word in substance, with the Service Agreement clause (Section 9) — this page paraphrases in plain language but must not contradict the legal text.

### Accessibility Notes
- FAQGroup labels are real `<h2>` elements so the page has a proper outline for screen reader navigation.
- Auto-expand-on-anchor still respects `prefers-reduced-motion` (instant expand, no scroll animation, if set).

---

## 12. Account Settings

### Overview
Low-frequency utility screen. Customer manages contact/login details here; this is not where service/order data lives (that's the Dashboard Orders area).

### Layout
Same shell as the Dashboard (Section 7/8): sidebar nav with "Account" active, single-column form content, `max-width: 560px`.

### Design Tokens Used
Same as Login (flat `radius-sm` fields, `color-accent` for primary actions), plus `color-error` for the destructive action below.

### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| FormSection | "Contact details" | `fields[]` | Name, email |
| FormSection | "Password" | `fields[]` | Current password, new password, confirm |
| Button | Primary ("Save changes") | `loading` | Per-section save, not one page-wide save button — reduces the chance of an unrelated field's error blocking an unrelated save |
| Button | Destructive ("Delete account") | — | `color-error` text on transparent, opens a confirmation modal, never a single-click destructive action |
| Modal | Confirm account deletion | `onConfirm` | Requires typing the account email to confirm, states plainly what happens to existing orders/invoices (they remain accessible via emailed copies even after account deletion) |

### States and Interactions
| Element | State | Behavior |
|---|---|---|
| "Save changes" (per section) | Click | Loading state scoped to that section only; other sections remain interactive |
| Save success | — | Inline confirmation text appears next to that section's save button for 3s, not a page-wide toast, since the change is localized |
| "Delete account" | Click | Opens confirmation modal; destructive button inside modal stays disabled until the email is typed correctly |

### Edge Cases
- **Password change with incorrect current password:** inline error on that field only, other fields retain their values.
- **Account deletion attempted with an order still "In Progress":** modal surfaces a plain warning that in-progress work will stop, and asks for a second explicit confirmation rather than blocking outright (business rule to confirm with founder).

### Accessibility Notes
- Each FormSection is a `<fieldset>` with its own `<legend>`.
- Deletion confirmation modal traps focus and requires the typed-email match before the destructive action's `disabled` attribute is removed — never relies on a timer or a single checkbox for a destructive action.

---

## 13. Global Components Reference

| Component | Used On | Notes |
|---|---|---|
| Button (Primary/Secondary/Ghost) | All screens | Single button system, three variants only — no per-page one-off styles |
| StatusBadge | Orders List, Order Detail | Color + text, never color alone |
| Corner-Bracket Panel | Quote Result, pricing summary on Services page, Order Summary at Checkout | Reserved for "measured commitment" moments only |
| Progress/Dimension-Line | Home process strip, Quote Intake steps, Order Detail status timeline | One consistent visual metaphor reused across the whole product |
| Toast | Global | Bottom-center, `color-ink` background, white text, auto-dismiss 4s, pausable on hover/focus |
| Accordion | Services FAQ, Pricing/FAQ | Shared component, single implementation, reused rather than rebuilt per page |
| Modal | Order Detail (migration), Account Settings (deletion) | Focus-trapped, `Escape`-to-close, returns focus to trigger on close |
| Destructive Button | Account Settings | `color-error` text on transparent fill, always gated behind a confirmation modal, never a single click |

---

## 14. Global Accessibility Baseline

- Color contrast: body text on `color-paper` is `#12151C` on `#F5F3EE`, ratio well above WCAG AA for normal text; `color-accent` on white passes AA for large text and UI components, not relied on for small body text.
- All interactive elements have a visible focus ring (`2px color-accent`, `2px offset`) — never `outline: none` without a replacement.
- `prefers-reduced-motion: reduce` disables the hero stagger, step-transition slide, and modal transitions, replacing them with instant state changes.
- Minimum tap target size: `44x44px` on all mobile interactive elements, including StepProgress ticks if made tappable for back-navigation.
- Form errors are never conveyed by border color alone — always paired with inline text.

---

## 15. Open Items for Founder Review

- Confirm whether "Request Human Review" ships at launch (affects Quote Result component set).
- Confirm the exact confidence-threshold behavior for AI-generated quotes flagged as "Estimated."
- Confirm real typefaces to license (Inter Tight / Inter / JetBrains Mono used here as placeholders consistent with the token system; swap is low-risk since roles are defined by token, not by name).
- Confirm geo-detection fallback UX (manual currency override wording) with legal/compliance before implementation.
