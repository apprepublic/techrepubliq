# TechRepubliQ — Landing Page Update Plan (for PRD v2.5)

**Source PRD:** `TechRepubliQ-PRD-v2.md` (on `origin/main`, commit `2593338`) — "PRD v2.5: Value-First Platform & Project Dashboard".
**Scope of this plan:** the **Home / landing page only**. The quote intake, checkout, and dashboard flows are flagged as follow-ups in §8.

---

## 1. What the new PRD changes for the landing page

The v2.5 PRD repositions the whole product. The landing page today is a generic dev-agency page. The new PRD reframes it as a **build-and-launch platform**:

- **Positioning shift (§ intro):** lead with services and value — *not* price. Cost is the natural output of describing a project, not the headline.
- **One-line model (§ intro):** a Lovable/Bolt/Replit-style build-and-launch platform, except a **human** builds the product instead of an autonomous AI agent, and the build fee is a **one-time price**, not a token you can run out of mid-build.
- **Entry CTA (§1):** Home → **"Get Started."** (not "Get a Quote" / "Request a Quote").
- **Categories (§1 step 2):** Web Development, App Development, AI Automation, AI Integration, **Training**, "etc."
- **Tiers (§4.3):** MVP, Startup, Business, Enterprise — a first-class concept that must be explained on the landing page.
- **No token-metering / one-time build fee (§4.6):** an explicit, marketable contrast to Lovable/Bolt/Replit.
- **Human-in-the-loop reviews (§5):** pre-launch revision rounds by tier (3 / 5 / 10 / unlimited).
- **No refunds (§6), hosting/backend always included (§7):** policy facts the footer/ToS links must reflect.

---

## 2. Current landing page inventory (what's there now)

The live page is `public/TechRepubliQ-preview_v7.html` (1.3 MB), embedded in an iframe by `src/app/page.tsx`, which also injects the dark/light theme CSS **by section class name**.

| Section | Anchor | Copy today | Problem vs v2.5 |
|---|---|---|---|
| Nav | `#siteNav` | About / Services / Process / Testimonials / Preview / Pricing / Quote / Login · CTA "Get started" → `#quote` | "Get started" targets the contact form, not the build flow; "Pricing" link is a dead `#` |
| Hero | `#top` | H1 "Building tomorrow's software, today." · lede "Design, engineer, and ship from first sketch to a live, working product." · "Get started" + "Explore Work" | No platform/value-first positioning, no one-time-fee/token contrast |
| Design/Develop/Deploy panel | `.panel-section` | stat cards "**0+** Projects", "**0+** Years", "**0M+** Coding Hours" | Placeholder zeros; panel narrative ("Design/Develop/Deploy") doesn't match new "Describe → Get Priced → Build → Launch" flow |
| Services | `#services` / `#serviceGrid` | 4 generic cards: Software Development, Product Engineering, Startup Services, Technology Consulting | Wrong categories — PRD lists Web Dev, App Dev, AI Automation, AI Integration, Training |
| Process | `#process` | "Our Agile Process" — Planning, UX, Technical Foundation, Implementation, Repeat the Cycle, The Launch | Doesn't reflect the customer journey or pricing model |
| Testimonials | `#testimonials` | 6 testimonials | Fine — keep (social proof) |
| Portfolio | `.preview` | "Real Solutions. Real Impact." mock cards | Optional — keep, low priority |
| CTA | `#quote` | "Connect with us" + contact form (name/email/company/message) | Primary action should be "Get Started" into the build flow, not a contact form |
| Footer | `#footerBottom` | "Privacy Policy" **mislinked to `#pricing`**; Services column lists old categories | Fix links + categories |

---

## 3. Required changes, section by section

### 3.1 Hero — reposition to "value-first build-and-launch platform"

**File:** `public/TechRepubliQ-preview_v7.html` (hero block near `#top`).

- **Eyebrow:** "Build-and-launch platform" (replaces any current eyebrow).
- **H1 (recommended):** *"Your product, built by a real team. Priced once."*
  - Alternative: *"Ship a real product — built by humans, not an AI agent."*
- **Lede (recommended):** *"Describe your project, get one upfront price, and our team designs, builds, and launches it for a single one-time fee. No tokens to run out of mid-build."*
- **Primary CTA:** "Get Started" → **`/quote`** (build-flow entry, §7).
- **Secondary CTA:** "See how it works" → `#process`.
- **Trust chips under the CTAs (optional):** "One-time build fee" · "Human-in-the-loop reviews" · "Hosting & backend always included".

### 3.2 "Design / Develop / Deploy" panel → "Describe / Price / Build / Launch"

**File:** `public/TechRepubliQ-preview_v7.html` (`.panel-section`).

- Repurpose the three-step narrative to the new flow: **Describe → Get Priced → Build & Launch**.
- Replace the placeholder-zero stat cards (`0+ Projects` / `0+ Years` / `0M+ Coding Hours`) with either:
  - **Founder-supplied real numbers**, or
  - **PRD-aligned proof points:** "One-time build fee" · "4 project tiers" · "Unlimited Enterprise revisions" · "7-day renewal grace" (pick 3).
- Keep the `anim.gif` hero card if desired; the panel copy is what matters.

### 3.3 Services grid — replace with the PRD category set

**File:** `public/TechRepubliQ-preview_v7.html` (the `services` JS array, currently lines ~617–620).

Replace the 4 generic cards with the v2.5 categories. Recommended copy + icons:

| Card | Icon | Description |
|---|---|---|
| **Web Development** | globe/layout | "Marketing sites to full web apps — designed, built, launched, and hosted by us." |
| **App Development** | smartphone | "iOS & Android apps, with downloadable builds and app-store deployment." |
| **AI Automation** | bot/zap | "Automations that run your repetitive operations around the clock." |
| **AI Integration** | sparkles/plug | "Chatbots, agents, and AI wired directly into your product and data." |
| **Training** | graduation-cap | "Hands-on enablement so your team can run what we build." |
| **Optimization** | gauge | "Performance, SEO, and speed tuning for existing products." *(kept from v1 — confirm, see §6 open items)* |

- Each card links into the intake flow pre-selecting its category: `/quote?category=web` etc.

### 3.4 NEW — Project tiers section (MVP / Startup / Business / Enterprise)

**File:** `public/TechRepubliQ-preview_v7.html` (new `<section id="tiers">`, placed between Services and Process).

This is the biggest net-new requirement — tiers are now central to the flow (§4.3).

- **Eyebrow:** "Project tiers" · **H2:** "Pick the tier that fits your business."
- Four cards:

| Tier | For | Pre-launch revisions (§5) | Recurring services baseline (§4.3) |
|---|---|---|---|
| **MVP** | solo / small team | 3 | $5/mo |
| **Startup** | funded startup | 5 | $25/mo |
| **Business** | established business | 10 | $50/mo |
| **Enterprise** | large organization | Unlimited | Contact Sales |

- **Footnote:** "Your one-time build fee is computed from your project — the same math at every tier. Tiers scale your recurring services only." (mirrors §4.2 / §4.3)
- **Footnote:** "Tiers upgrade anytime; never downgraded. We'll suggest an upgrade as you near your limits." (§4.3)
- *Note: show only if we decide to surface tier prices publicly — see §6 open items. If price-forward is avoided, show tiers qualitatively and omit the $ column.*

### 3.5 Process section → customer journey + "why we're different"

**File:** `public/TechRepubliQ-preview_v7.html` (`#process`).

- Replace "Our Agile Process" (Planning/UX/Foundation/Implementation/Repeat/Launch) with the **customer journey** from §1:

  1. **Get Started** — pick a category.
  2. **Pick your tier** — MVP, Startup, Business, Enterprise.
  3. **Send your brief & assets** — logo, brief, and category-specific assets.
  4. **Get Priced** — the engine analyzes it and returns **one total** (no line-item breakdown at purchase, §4.4).
  5. **Pay & we build** — human-in-the-loop reviews (3/5/10/unlimited by tier).
  6. **Launch & manage** — dashboard, add-ons, analytics, email center.

- Add a **contrast card** ("No tokens. No metering.") that makes the Lovable/Bolt/Replit differentiation explicit (§4.6):
  > *"Other build tools give you a bucket of tokens that can run out before your project ships. TechRepubliQ charges one development fee to finish the build as scoped. Tokens apply only to optional AI add-ons after launch — never the core build."*

### 3.6 CTA section — "Get Started" is the primary action

**File:** `public/TechRepubliQ-preview_v7.html` (`#quote` / `.cta`).

- Change H2 from "Connect with us" → **"Ready to build? Get started."**
- Add primary button **"Get Started" → `/quote`**.
- Keep the contact form as a secondary "or talk to us first" option (demote, don't delete — it still serves the "request human review" trust need from v1).

### 3.7 Nav + Footer fixes

- **Iframe nav** (`#siteNav` in `preview_v7.html`): "Get started" href `#quote` → **`/quote`**. Fix dead "Pricing" link.
- **Outer nav** (`src/components/Nav.tsx`): labels are mismatched to targets ("Blog" → `/#testimonials`). Add a prominent **"Get Started"** button → `/quote`; consider a "Pricing" link → new `#tiers`/`#process`.
- **Footer** (`#footerBottom`): "Privacy Policy" currently links to `#pricing` — fix to a real privacy page/URL. Update the Services column to the new category list. Keep "How it works" → `#process` and "Terms" → `#terms`.

---

## 4. Technical constraint: theme CSS must be updated in lock-step

`src/app/page.tsx` injects dark/light theme CSS **by class name** for every section (`.hero`, `.panel-section`, `.services`, `.service-card`, `.process`, `.process-card`, `.testimonials`, `.preview`, `.mock-card`, `.cta`, `.contact-form`, `.stat-card`, …).

**Any new section or renamed class on the landing page must also be added to BOTH the dark and light CSS templates in `src/app/page.tsx`**, or the new sections will be unreadable in dark mode. Budget this into every change in §3.

---

## 5. Prioritized work breakdown

| # | Task | File(s) | Size | Priority |
|---|---|---|---|---|
| 1 | Hero copy + CTA → `/quote` | `preview_v7.html` | S | P0 |
| 2 | Services grid → 6 PRD categories | `preview_v7.html` (services array) | S | P0 |
| 3 | New tiers section + theme CSS | `preview_v7.html` + `src/app/page.tsx` | M | P0 |
| 4 | Process → customer journey + token-contrast card | `preview_v7.html` | M | P0 |
| 5 | Panel stat cards → real numbers or PRD proof points | `preview_v7.html` | S | P1 |
| 6 | CTA section: "Get Started" primary, form secondary | `preview_v7.html` | S | P1 |
| 7 | Nav + footer link/category fixes | `preview_v7.html` + `src/components/Nav.tsx` | S | P1 |

---

## 6. Open items for founder decision

1. **Full category list** — v2.5 names 5 ("Web, App, AI Automation, AI Integration, Training, etc."). Is **Optimization** still in? Any others?
2. **Show tier prices on the landing page?** v2.5 says lead with value, not price. Options: (a) tiers with $ column, (b) tiers qualitative only, (c) "from $X/mo" hint.
3. **Stat numbers** — "0+ Projects / 0+ Years / 0M+ Coding Hours" are placeholders. Real numbers, or switch to PRD proof points?
4. **Testimonials** — keep as-is, or do they conflict with the "no vendor disclosure / confidentiality" posture (real client names + countries are fine, but confirm)?
5. **Hero headline** — pick one of the two recommendations in §3.1, or supply brand copy.

---

## 7. Landing-page CTA target (implementation note)

The hero CTA should land on `/quote`. Today `src/app/quote/page.tsx` implements the **old v1 flow** (Service → Details → Review, with budget/timeline). It does **not** yet have the v2.5 steps (category → **tier** → brief/assets → "Get Priced" → single-total summary → payment). The landing page can link there immediately (page exists), but the flow itself is a downstream build.

---

## 8. Explicitly out of scope for this plan (follow-ups)

These are required by PRD v2.5 but are **not** landing-page work:

1. **Quote intake flow** — add the tier step, asset/brief intake, "Get Priced" → "Analyzing project…" → single-total summary + "Add additional add-on" dropdown. (`src/app/quote/*`)
2. **Checkout** — Proceed to Payment → unpaid invoice email → Paystack/Stripe. (`src/app/checkout/*`)
3. **Dashboard** — Projects, Subscriptions (renewal indicators), Service Center, per-project Preview/Deploy, Project Services, Analytics, Database, Email Center. (`src/app/dashboard/*`, `workers/api/*`)
4. **No-refund policy + ToS** — update Terms to §6 (no refunds), §7 (confidentiality, migration OTP, front-end-only source).
5. **Pricing engine** — §4.2 math ($3/page + $3/component + $500 base) in the worker API.

---

## 9. Suggested first PR

All of §5 items 1–4 in one landing-page PR (hero + services + tiers + process + theme CSS), followed by a second PR for nav/footer/polish (§5 items 5–7). Then a separate PR for the quote-flow tier step (§8.1).
