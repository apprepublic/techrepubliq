# Plan — bring the current head's UX in line with PRD v2.5

**Source of truth:** `TechRepubliQ-PRD-v2.md` (PRD v2.5: *Value-First Platform & Project Dashboard*) + the founder decisions in §9 of this document.
**Base:** current head `2593338`. Nothing is taken from any later commit.
**Updated:** 2026-09-15

---

## 0. Three frozen constraints

| # | Constraint | Where it lives |
|---|---|---|
| 1 | OBJ element: material, position, size, scroll animation unchanged | `public/TechRepubliQ-preview_v7.html` **681–1160** (+ `#ring3d` CSS 128–152, markup 403) |
| 2 | Second section (below hero, the GIF): GIF stays, container layout preserved, **text may change** | `public/TechRepubliQ-preview_v7.html` `.panel-hero-card` CSS **163–168**, markup **413–443** |
| 3 | Styling stays consistent with the current head's UI app-wide | Tailwind tokens (`tailwind.config.ts`), `src/app/globals.css`, existing components; in the landing doc, the v7 custom props + the two injected theme blocks in `src/app/page.tsx` |

---

## 1. Where the landing page actually lives

`/` is **not** a React page. `src/app/page.tsx` renders a full-screen iframe (`#v7-iframe`, line 374) over `/TechRepubliQ-preview_v7.html`, injects dark/light override CSS via `getThemeCSS(theme)`, hides `#rootFooter` and pins `main` to `100vh`.

**All landing content is one file:** `public/TechRepubliQ-preview_v7.html` (1,209 lines).

| Section | Line | Notes |
|---|---|---|
| `header.nav#siteNav` | 371 | hidden by injected CSS; "Get started" CTA at 386/400 → `#quote` |
| `.hero` | 394 | `.hero-copy` + `.hero-ring-wrap > #ring3d` (the OBJ) |
| `.panel-section` | 413 | **the GIF section** |
| `.services#services` | 448 | grid built by JS from `SERVICES` (**616**) + `ICON_PATHS` (**762**) into `#serviceGrid` (454) |
| `.process#process` | 459 | 6 static cards |
| `.testimonials#testimonials` | 478 | from `TESTIMONIALS` |
| `.preview` | 490 | 3 mock cards |
| `.cta#quote` | 523 | copy + contact form |
| footer | ~560 | several broken anchors (§8) |

**Critical for constraint #3:** the v7 doc is light-glass by default and `src/app/page.tsx` overrides it per theme. **Every new section needs a dark block *and* a light block in `getThemeCSS()`**, or it renders light inside a dark app.

---

## 2. Constraint 1 — the OBJ

**Block:** `const CHROME_SUNBURST_OBJ` (681) → `staggerIn('.service-card', 80)` (1160).
**Fingerprint:** `md5 = 99830b943889785e3502ea347cae357f` of `sed -n '681,1160p'`.

| Property | Value |
|---|---|
| Geometry | inline OBJ, 24 extruded radial blades, hollow centre |
| Material | `MeshPhongMaterial { color: 0xC8102E, specular: 0xffffff, shininess: 220, reflectivity: 1 }` |
| Camera | `PerspectiveCamera(40, 1, 0.1, 100)` at `(0,0,7)`, `lookAt(0,0,0)` |
| Lights | ambient `0xffffff` 0.4 · key `0xffffff` 1.1 @ (2,3,4) · rim `0xFF6B5B` 1.2 @ (−3,−2,3) · cool `0xB9C6FF` 0.6 @ (3,−1,−3) |
| Size | `Box3` → `position.sub(center)` → `scale = 4.8 / maxDim` |
| Rest tilt | `rotation.x = 12°`, `rotation.y = 22°` |
| Scroll spin | `targetRotation -= delta * 0.012`; `current += (target − current) * 0.08`; → `spinGroup.rotation.z`; passive listener |
| Renderer | `WebGLRenderer({antialias, alpha})`, pixelRatio ≤ 2, sized from `ring3d.clientWidth/Height` |

**Rules:** never edit 681–1160, the `#ring3d` CSS/markup, or `.hero-ring-wrap` (the renderer sizes itself from that container — a layout change silently resizes the object). Because new hero copy adds a trust-chip row, re-check the ≤860px hero (`min-height:100dvh`, `padding-top: calc(80px + 68px)`, `#ring3d` capped at `max-width:440px`) — the ring must still get a non-zero height and the CTA must stay above the fold.

```bash
s=$(grep -n "const CHROME_SUNBURST_OBJ" public/TechRepubliQ-preview_v7.html | cut -d: -f1)
e=$(grep -n "staggerIn('.service-card'"  public/TechRepubliQ-preview_v7.html | cut -d: -f1)
sed -n "${s},${e}p" public/TechRepubliQ-preview_v7.html | md5sum   # 99830b943889785e3502ea347cae357f
```

---

## 3. Constraint 2 — the GIF panel (layout frozen, text open)

**Preserve verbatim** — `.panel-hero-card` (163–168), `md5 = 21ba8dc790ee7809b96592887a932162`, the file's **only** `anim.gif` reference:
```css
.panel-hero-card { background: url('/assets/anim.gif'); background-size: cover; background-position: center;
  opacity: 1; backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-card); padding: 48px; display: flex; flex-direction: column;
  justify-content: flex-end; min-height: 420px; }
```
**Container structure frozen** (413–443): `.panel-section > .wrap.panel-grid` → `.panel-hero-card > h2.stacked-words (3 spans)` + `.stat-stack` → `.stat-top-row > .info-box (h3 + p + .info-icons ×3)` + `.stat-card.featured (.stat-value/.stat-label/.stat-cta)` → `.stat-card` ×2.

**Allowed text swaps (from PRD v2.5)**
| Element | New copy |
|---|---|
| `.stacked-words` | `Describe.` / `Get Priced.` / `Launch.` (§1) |
| `.info-box h3` | `Human-in-the-loop` |
| `.info-box p` | "A real team designs, builds, and launches your product — with review rounds before it goes live." (§5) |
| featured stat | `4` · `Project tiers — MVP to Enterprise` · CTA `Get Started →` → `/quote` `target="_top"` (§4.3) |
| 2nd stat | `Unlimited` (new `.stat-value.soft`) · `Enterprise pre-launch reviews` (§5.4) |
| 3rd stat | `7` · `Day grace period on renewals` (§4.5) |

**Forbidden:** touching that rule, adding/removing containers, changing `.panel-grid`/`.stat-stack`, replacing the GIF, changing the three `.info-icons` SVGs.
Keep the existing count-up counters (`data-count="4"`, `data-count="7"`) — the script at ~1105 is outside the OBJ block.

---

## 4. Constraint 3 — styling rulebook

| Use | Instead of |
|---|---|
| `text-ink` / `text-slate` / `border-line` / `bg-paper` / `bg-paper-raised` / `text-accent` / `bg-accent-dim` / `text-success` / `text-amber` / `text-error` | hardcoded hex |
| 2px radii (default `rounded-sm`) | `rounded-[20px]`, `rounded-full` |
| spacing `xs sm md lg xl 2xl` | arbitrary px |
| `font-display` (Inter Tight) / `font-body` (Inter) | new font stacks |
| `Button`, `Accordion`, `Modal`, `StatusBadge`, `CornerBracketFrame`, `DimensionLine`, `ChromeSunburst`, `motion` `0.22s ease [0.2,0.8,0.2,1]` | new UI primitives |
| `mx-auto max-w-[1120px] px-md py-xl` page shell (as in `services/[slug]`) | new wrappers |

Landing doc: new CSS uses the existing custom props (`--text-primary`, `--text-secondary`, `--bg-light`, `--surface-light`, `--border-light`, `--text-on-dark`, `--text-on-dark-secondary`, `--accent`, `--accent-dim`, `--gradient-accent`, `--radius-card`, `--radius-pill`, `--shadow-card`, `--ease`) **and** gets mirrored overrides in both branches of `getThemeCSS()`.

---

## 5. Gap analysis: PRD v2.5 → this head

| PRD § | Requirement | This head today | Change |
|---|---|---|---|
| §1.1 | Home → **"Get Started"** | Nav has "Get started" → `/quote` (345/417); landing hero CTA → `#quote`; service detail says "Request a Quote" | Unify label/target; add `target="_top"` inside the iframe |
| §1.2 | Categories: Web, App, AI Automation, AI Integration, Training, … | `utils.ts`: web-development, app-development, **web-ui-design**, ai-automation, ai-integration, optimization. Landing `SERVICES` = 4 different items | → final 7 (§9.5); retire `web-ui-design` |
| §1.3 | Tier + scale metrics | No tiers anywhere; quote = Category → Details → Review | New tier step + 5 metrics |
| §1.4 | Brief + logo/assets; no manual add-on step | Quote collects `description`, `features[]`, `timeline`, `budget`. No uploads | New brief/assets step → R2 (`ASSETS` binding exists) |
| §1.5 | **Get Priced** + "Analyzing project…" + AI infers add-ons | Submit → `api.quotes.generate` → result page | Loading state + inference (heuristic v1) |
| §1.6 | One total + "Add additional add-on" | Result page lists 5 scope lines + `isEstimated` + human-review toggle | Single total; add-on dropdown; drop the detour |
| §1.7 | Proceed to Payment → **unpaid invoice** email; no "Generate Invoice" | Checkout takes amount + discount; `sendInvoiceEmail` already exists in `workers/api/src/email.ts` | Wire invoices |
| §1.8 | Paid invoice + dashboard itemization | Confirmation page; dashboard = hardcoded `orders` array | Real projects/subscriptions |
| §2 | Buy domain or point DNS; hosting always included | Not modelled | Domain step + `DOMAIN_FEE` |
| §3 | Project Services (domain+hosting+backend) + AI-inferred add-ons + manual "Add additional add-on" | None | Add-on model + catalog |
| §3.3 | Google $10/mo · Email $25/mo (50k/day) · AI $25/mo + 1,000 tokens | None | Constants + tier scaling |
| §4.2 | Dev fee = $3/page + $3/component + $500 base | `quotes.ts` = category base × text-length factor | Rewrite |
| §4.3 | Tiers MVP $5 / Startup $25 / Business $50 / Enterprise "Contact Sales"; upgrade-only | None | Tier model + nudge |
| §4.4 | One total at purchase | Result itemizes | Invert |
| §4.5 | Per-service cancel (prompt, next renewal), 7-day grace, reminders | None | Lifecycle + statuses |
| §4.6 | One-time fee; installments allowed | N/A | **In scope (§11)** |
| §4.7 | Annual default; monthly = annual × 1.15 ÷ 12 | None | Cadence toggle |
| §5 | Revisions 3/5/10/∞; extras $10 (+2) / $15 (+3) | None | Counters + purchase |
| §5A | Pay-per-edit or monthly plans $100/$200/$500/$1,000 | None | Edit requests + plans |
| §6 | **No refunds, ever** | Terms has a refund clause; checkout has a terms checkbox | Rewrite copy + explicit acknowledgement |
| §7 | Hosting/backend always ours; vendor confidentiality; OTP-gated migration; front-end-only bundle; no GitHub | `migrations.request({orderId, scope})`, no OTP | OTP + copy |
| §8 | Orders → **Projects** + **Subscriptions** + **Service Center** | Sidebar: Orders / Account; hardcoded rows | New IA + real data |
| §9 | Project page: Preview/Deploy · Services · Analytics · Database · Email | `dashboard/orders/[id]` only | New project page (§9.6 — capabilities confirmed) |

---

## 6. Work packages

### WP0 — Domain model + pricing engine (heuristic v1, pluggable seam)

**New `src/lib/product.ts`** (typed, no UI):
- `TIERS`: `mvp` $5/mo · email 2,500/day · revisions 3 | `startup` $25/mo · 50,000/day · 5 | `business` $50/mo · 100,000/day · 10 | `enterprise` "Contact Sales" · revisions `null`
- `ADDON_CATALOG` typed `kind: "google" | "email" | "ai"` — google $10, email $25, ai $25 (+1,000 tokens); catalog open-ended (PRD §11)
- `BASE_DEV_FEE = 500`, `RATE_PER_PAGE = 3`, `RATE_PER_COMPONENT = 3`, `MONTHLY_MARKUP = 0.15`, `DOMAIN_FEE`, `STORE_DEPLOY_FEE`
- `EXTRA_REVIEWS = [{price:10,count:2},{price:15,count:3}]`; `EDIT_PLANS = [100→10, 200→25, 500→50, 1000→∞]`
- `CATEGORIES` — the final 7 (§9.5)
- `computePrice({category,tierId,pages,components,complexity,addons,oneTime,cadence,installments})`; monthly ⇒ `annual × 1.15 ÷ 12`
- **Seam:** `interface PricingEngine { estimate(brief, category): {pages, components, complexity}; inferAddons(brief, category): AddonId[] }` → `heuristicEngine` (v1, deterministic, keyword + structure based) and later `aiEngine`; the app only ever calls `getPricingEngine()` from `@/lib/pricing-engine`
- `revisionLabel`, `formatUsd`, `serviceTitle`

**Mirror** in `workers/api/src/lib/pricing.ts` — the server recomputes every total; the client never sends money.
**Edit** `src/lib/utils.ts` — tagline → "Your product, built by a real team. Priced once."; categories → final 7; add `PROJECT_TIERS`.
**Edit** `workers/api/src/routes/quotes.ts` — same slug set (its hardcoded list must match `utils.ts`).

---

### WP1 — Landing page (frontend only, no backend)

**Files:** `public/TechRepubliQ-preview_v7.html` · `src/app/page.tsx` (theme CSS **only**) · `src/components/Nav.tsx` · `src/components/Footer.tsx`.

1. **Hero (394–411)** — H1 *"Your product, built by a real team. Priced once."*; lede *"Describe your project, get one upfront price, and our team designs, builds, and launches it — one one-time build fee, no tokens to run out of mid-build."*; `.hero-cta` = **Get Started → `/quote`** (`target="_top"`) + **See how it works → `#process`**; `.hero-trust` chips `One-time build fee` · `Human-in-the-loop reviews` · `Hosting & backend included`.
2. **Panel section** — text only, per §3.
3. **Services** — heading *"From first sketch to a live, working product."*; `SERVICES` → the 7 categories with `href="/quote?category=<slug>"`, grid 4 → 3 cols, `.service-link` on each card.
4. **NEW `<section class="tiers" id="tiers">`** — MVP / Startup (badge "Most popular") / Business / Enterprise "Contact Sales", monthly service price, revisions per tier, footnotes *"Your one-time build fee is computed from your project — the same math at every tier. Tiers scale your recurring services only."* and *"Tiers can be upgraded anytime, never downgraded."*; register `staggerIn('.tier-card', 80)`.
5. **Process** — 01 Get Started · 02 Pick your tier · 03 Send your brief · 04 Get Priced · 05 We build (human review rounds) · 06 Launch & manage, each with a one-line `<p>`; `.process-contrast` band **"No tokens. No metering."**
6. **CTA** — eyebrow "Get Started", H2 *"Ready to build? Get started."*, `.cta-actions` (Get Started + `mailto:hello@techrepubliq.com`).
7. **`src/app/page.tsx`** — add to **both** branches: `.service-link`, `.hero-trust span`, `.hero .btn-ghost-dark`, `.cta/.preview .btn-ghost-light`, and a `/* TIERS */` block (`.tiers`, `.tier-card`, `.tier-card.featured`, `.tier-name`, `.tier-for`, `.tier-price`, `.tier-rev`, `.tier-note`, `.process-card p`) in the same dark palette (`rgba(26,24,40,0.8)`, `#F7F6FA`, `#9C99AC`, `#FF8A80`) and light palette (`rgba(255,255,255,0.85)`, `#14121F`, `#6B6876`, `#C8102E`). **Nothing else in this file.**
8. **Nav/Footer** — Nav: `Services → /services`, add `Pricing → /pricing`, fix `Blog → /#testimonials`, keep the "Get started" CTA. Footer: tagline; `Privacy Policy → /terms`; Services column = the 7 real `/services/<slug>` links.

---

### WP2 — Services IA

- **New** `src/app/services/page.tsx` (hero + 7 category cards + tier table + journey + CTA) and `src/app/services/layout.tsx` (metadata).
- **Rewrite** `src/app/services/[slug]/ServicePageClient.tsx` — hero line, outcomes, what's included, what we need from you (intake), how it's priced & built, FAQ; sidebar `CornerBracketFrame` with starting-at + **Get Started** (not "Request a Quote"); add `generateMetadata`.
- Extend service records with `icon`, `short`, `hero`, `outcomes[]`, `intake[]`, `process[]` and PRD-accurate FAQs.
- Add a **redirect** `/services/web-ui-design → /services/web-development` (retired slug).

---

### WP3 — Quote / "Get Priced" (5 steps)

Rewrite `src/app/quote/page.tsx` (keep `DimensionLine`, motion curve, `localStorage` key `techrepubliq-quote-session`):
1. **Category** (7 cards) → 2. **Tier & scale** (4 tier cards + the 5 PRD metrics, used only to recommend) → 3. **Brief & assets** (business brief, logo + category assets → R2; domain choice for web/app) → 4. **Get Priced** (loading *"Analyzing project…"*, heuristic engine infers add-ons) → 5. **Price summary** (one total, no line items; annual default / monthly = ×1.15÷12; **Add additional add-on** dropdown; one-time services; **Proceed to Payment**).
- **Enterprise** short-circuits to the Contact Sales form (§14), never a price.
- `src/app/quote/result/page.tsx` → **deleted**; the price summary is step 5 of `/quote`, which keeps the flow in one place.
- **New** `POST /api/uploads` → R2 (`ASSETS` binding, 10 MB cap, key `intake/<id>/<file>`); intake stores keys.
- **Rewrite** `quotes.generate()` → `{category, tierId, brief, pages, components, complexity, metrics, assets, domainOption, cadence, devFeeMode, addons, oneTimeServices}`; the server clamps the estimate, filters unknown ids, recomputes every amount, and returns **the four option totals** (`onceAnnual`, `onceMonthly`, `installAnnual`, `installMonthly`) — never a per-unit breakdown (§4.4).

**Shipped in PR 3 — notes for later**
- The summary screen composes its displayed total **locally** from the same model, so the fee/cadence and add-on toggles are instant. The server is the authority at payment time (PR 4 recomputes against the stored reference). Verified: client and server produce identical figures.
- If the API is unreachable the flow still prices on-device and labels it *"Priced on this device — we'll confirm the total when you pay."* That keeps the funnel alive; it is not a payment path.
- `?category=` (from every service page) and `?tier=` (from the landing tier cards) pre-select the first two steps — the loose end from PR 1 is closed.
- **R2 is provisioned (2026-09-15):** bucket `techrepubliq-assets`, Standard class, bound in `wrangler.toml` as `ASSETS` (the binding alias is ours; only `bucket_name` must match the bucket). It is private — intake assets are readable only through the Worker, which is what §7's confidentiality rule wants. Revisit the storage class if intake volume grows; Infrequent Access suits write-once assets but isn't worth it at current volume.

---

### WP4 — Payments: Paystack-NGN + Stripe-USD + PayPal-USD, and installments

See §10 (architecture) and §11 (installments). Summary of edits:
- `workers/api/src/routes/payments.ts` — replace geo-only provider pick with a `PaymentProvider` interface + `resolveProvider(country, currency)`; recompute amount server-side; return NGN amount converted server-side.
- **Fix the FX hack:** `src/app/checkout/page.tsx` renders `₦{amount * 1500}` from a client-side constant. Money is computed once, in **USD cents**, and converted with a server-supplied rate — never a hardcoded 1500.
- **FX cron (decision 10):** a Cron Worker pulls USD→NGN once a day (≈06:00 UTC) from an FX API and upserts `fx_rates(base, quote, rate, fetched_at)`. Checkout reads the newest row, **locks it onto the payment intent** (`fx_rate_used`) so invoices reconcile later, and displays *"converted at ₦X = $1 (rate as of <date>)"*. If the fetch fails we keep the last known rate; if it is older than 48h the cron alerts `admin@techrepubliq.com` and the UI shows a "rate may be stale" note. Provider choice is made at implementation time — anything with a USD→NGN endpoint works, the point is that it is never hardcoded.
- New `Env` secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `CF_API_TOKEN`, `CF_ACCOUNT_TAG`; keep `PAYSTACK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `SEND_EMAIL`, `FROM_EMAIL`.
- New webhook `POST /api/webhooks/paypal` alongside the existing Paystack/Stripe ones; verify signatures (the Stripe one is currently a TODO at `payments.ts:90`).
- Invoices: reuse `sendInvoiceEmail` — unpaid on intent creation, paid on webhook success; store `invoice_url`.
- Checkout UX: one total, cadence selector, **installment selector** (§11), terms + explicit no-refund acknowledgement (§6).

---

### WP5 — Dashboard: Projects / Subscriptions / Service Center + project tabs

**DB** — new `workers/api/migrations/0005_projects.sql` (fresh tables; historical `orders`/`quotes` untouched, §15):
`projects(id, customer_id, name, category, tier_id, status ∈ {Queued, In preview, Live}, zone_id, rum_site_tag, preview_url, custom_domain, launch_at, dev_fee_cents, cadence)` ·
`project_services(id, project_id, name, kind, monthly_cents, status ∈ {Active, Cancel at renewal, Grace period}, renews_on, grace_until)` ·
`revisions(project_id, included, used, purchased)` ·
`otp_codes(id, customer_id, purpose, code_hash, expires_at, consumed_at)` ·
`email_messages(id, project_id, direction, from_addr, to_addr, subject, body, sent_at)` ·
`analytics_daily(project_id, date, requests, pageviews, uniques, bytes, cached_requests, sample_interval)` ·
`edit_requests` · `review_purchases` · `installment_plans` + `installments` · `fx_rates` · `contact_sales_leads`.

**Routes** — `/api/projects` · `/api/projects/:id` · `/api/projects/:id/services` (add / cancel→next renewal) · `/api/projects/:id/launch` · `/api/projects/:id/analytics` (§12) · `/api/projects/:id/database` · `/api/projects/:id/migration` (OTP) · `/api/projects/:id/email` · `/api/service-center` · `/api/contact-sales`.

**UI** (existing tokens/components only):
- `dashboard/layout.tsx` — sidebar **Projects / Subscriptions / Service Center / Account** (+ "Past orders" legacy view, §15).
- `dashboard/page.tsx` — replace the hardcoded array with `api.projects.list()`; rows show name · category · tier · id + `StatusBadge`.
- **New** `dashboard/project/page.tsx` — tabs **Preview** (subdomain link, no watermark; "No preview available." until built; **Launch** / **Go Live**; mobile → UI/UX preview → downloadable APK → store deployment if purchased) · **Services** (each add-on, cancellable with confirmation, effective at next renewal; "Add additional add-on"; grace badge + countdown) · **Analytics** (§12) · **Database** (records, or explicit "not applicable") · **Email Center** (§13, only with the Email add-on).
- **New** `dashboard/subscriptions/page.tsx` (next-due dates + statuses) and `dashboard/support/page.tsx` ("we handle vendors — you never get a third-party login").
- `StatusBadge` — extend the **status union only** (`Queued`, `In preview`, `Live`, `Active`, `Cancel at renewal`, `Grace period`) using the existing shape and token colours.
- `dashboard/orders/[id]` stays for historical orders.

---

### WP6 — Revisions, post-launch edits, installments UI

- Revision counter `used / included`; **Buy extra reviews** $10 (+2) / $15 (+3), repeatable, pre-launch only; disabled after launch.
- **Request an edit** → priced by the same page/component/complexity logic, identical at every tier → pay-per-edit; or subscribe to a monthly plan ($100/10, $200/25, $500/50, $1,000/∞).
- Installments: schedule + next-due card on the project, reminder emails, 7-day grace, then dunning (§11).

---

### WP7 — Policy & trust surfaces

**Landed in PR 7b.** `/terms` went from 8 clauses to 12, keeping the sticky-TOC layout. The substantive change: clause 8 previously promised refunds "in accordance with our refund policy, which is available on request" — a policy that does not exist. It is now **"No Refunds"**, stating that all payments are final and pointing at the fix-it guarantee instead. Added: hosting/backend always TechRepubliQ and never transferable; the migration bundle is front-end only with no GitHub access; cancellation and migration are OTP-gated and owner-only; and a grace-period clause spelling out seven days of service followed by add-on removal, with the project itself never deleted for non-payment.


- `terms/page.tsx` — no refunds ever; 7-day grace then service removal; hosting/backend always TechRepubliQ; vendor confidentiality; OTP-gated cancellation/migration, owner-only; front-end-only bundle; no GitHub. Keep the current sticky-TOC layout.
- `pricing/page.tsx` — FAQ rewritten to PRD answers; lead with services/value, not price.
- Checkout + project page — surface hosting/backend inclusion and the no-refund acknowledgement.

---

### WP8 — Terminology & link pass

- "Get Started" everywhere (service detail still says "Request a Quote").
- Vocabulary: **Get Priced**, **one-time development fee**, **Project Services** (never "plugins"), **pre-launch reviews**, **grace period**.
- Fix: v7 footer `#terms` / `#pricing` (Privacy) → `/terms`; v7 footer "Blog" → `/#services`; `Footer.tsx` Privacy → `/terms`; Nav "Blog" → `/#testimonials`.

---

## 9. Locked decisions (founder, 2026-09-15)

| # | Decision | Consequence in the plan |
|---|---|---|
| 1 | **Heuristic pricing engine v1 behind a pluggable seam** | `PricingEngine` interface in `@/lib/pricing-engine`; `heuristicEngine` ships now (deterministic, unit-tested); `aiEngine` drops in later with no call-site changes |
| 2 | **Keep Paystack-NGN and add Stripe + PayPal for USD/international** | Three providers behind one `PaymentProvider` interface; country+currency resolver; PayPal webhook added (§10) |
| 3 | **Installments on the one-time fee — in scope now** | `installment_plans`/`installments` tables, cron dunning, checkout selector, 7-day grace (§11) |
| 4 | **Enterprise "Contact Sales" = form** | Lead form + `contact_sales_leads` + email; Enterprise never shows a number anywhere (§14) |
| 5 | **Final categories = 7:** Web Development, App Development, AI Automation, AI Integration, Training, Optimization, **Web/App Management**; `web-ui-design` **retired** | Slug set updated in `utils.ts`, `workers/api/src/routes/quotes.ts`, nav/footer, landing `SERVICES`; redirect for the retired slug |
| 6 | **Subdomain previews, APK builds, App Store/Play deployment are real capabilities** | Build the §9 UI for real: Preview/Launch/Go Live, mobile UI-UX preview → APK → store deployment |
| 7 | **Leave historical data; start fresh** | New `0005_projects.sql` tables (0004 taken by `contact_sales` in PR 3); old `orders`/`quotes` remain readable; dashboard keeps a "Past orders" view (§15) |
| 8 | **Per-project Email Center is deliverable now** | Email tab ships for real (inbox/sent/compose on the project's domain address) (§13) |
| 9 | **Analytics from Cloudflare** (all sites deployed/managed there) | Analytics tab reads Cloudflare GraphQL only — designed against what Cloudflare actually exposes (§12) |
| 10 | **FX: an API on a cron** (not an admin-set rate) | Cron Worker pulls USD→NGN into `fx_rates`; checkout locks the rate it used (§10) |
| 11 | **Installments = 12 even monthly payments** | Fee split into 12 equal monthly payments, first taken at checkout (§11) |
| 12 | **One Cloudflare plan for every hosted project zone** | Standardised zone plan + one retention window for all customers (§12.5) |
| 13 | **No Web Analytics/RUM snippet in v1** | Zone HTTP analytics covers everything the PRD asks for; no JS injected into customer sites (§12.6) |
| 14 | **Contact Sales → admin@techrepubliq.com** | Lead form posts to `contact_sales_leads` and mails the full submission to that inbox (§14) |
| 15 | **Tier limits measured in requests/day** | Ladder 10k / 100k / 1M requests per day; nudge only, never enforce (§12.7) |
| 16 | **No markup on installments — the 15% is a discount for paying the fee in one go** | Fee = 12 even payments of `total ÷ 12`, no interest; paying in one go takes 15% off (§11) |
| 17 | **Customer domains are zones in OUR Cloudflare account** | We own and pay for the zone, query analytics with one token, and need an offboarding path (§12.5) |
| 18 | **Keep PRD §4.2's rates — don't renegotiate them** | Fees land in the $500–$2,000 band; the cheaper positioning is deliberate, not an accident |
| 19 | **Lead with the work, not the price** | Browsing surfaces sell speed, reliability, scalability and functionality; money is spelled out on `/pricing` and at checkout only (§19) |
| 20 | **Post-launch edits are priced on the rates alone — no $500 base — with a $25 floor** | §5A says edits use §4.2's logic, but §4.2's base is a *project* engagement fee; carrying it into an edit made one change $506 beside a $100/mo plan covering ten |
| 21 | **Unused monthly edits roll over, capped at one extra month's allowance** | Generous without letting anyone hoard; the cap is `EDIT_ROLLOVER_CAP_MONTHS` |
| 22 | **FX source is open.er-api.com** | Already configured in `wrangler.toml`, needs no key, and has been refreshed daily throughout. The rate is cached and locked onto each intent, so a missed refresh costs accuracy, not correctness — we can swap providers without touching the money path |
| 23 | **Project zones are Free by default, Business sold per project** | Free keeps 30 days of traffic history — more than Pro's 7 — and costs nothing against a $5/mo tier. Business (~$200–250/mo) is a paid upgrade a customer asks for, never something we absorb. Pro is avoided: strictly worse on retention and it costs money (§12.5) |
| 24 | **The upgrade nudge watches requests/day only** | Bandwidth stays a display-only figure on the Analytics tab. One metric, one conversation — a customer nudged about two numbers at once just gets confused |

---

## 10. Payments architecture (three rails, one interface)

```
src/lib/payments/provider.ts        interface PaymentProvider {
                                      id: "paystack" | "stripe" | "paypal"
                                      currencies: string[]
                                      startIntent(input): Promise<{ redirect|clientSecret }>
                                      saveMethod(customer, token): Promise<SavedMethod>   // reuse for installments/renewals
                                      chargeSaved(SavedMethod, amountCents, currency): Promise<ChargeResult>
                                      parseWebhook(req): Promise<NormalizedEvent>
                                    }
workers/api/src/payments/{paystack,stripe,paypal}.ts
workers/api/src/payments/resolve.ts  resolveProvider(country, currency)
```

| Rail | Region | One-time | Save for later | Recurring |
|---|---|---|---|---|
| **Paystack** | NGN (NG) | Inline (already wired) | `authorization_code` from `charge.success` | `POST /transaction/charge_authorization` on our schedule — variable amounts; Paystack's own Subscriptions API only charges a fixed plan amount, so we drive it ourselves [1](https://www.mctaba.com/learn/paystack/paystack-subscriptions-and-recurring-billing-complete-guide) [2](https://paystack.com/docs/payments/recurring-charges/) |
| **Stripe** | USD/international | PaymentIntent | `setup_future_usage=off_session` on the PaymentIntent, or a SetupIntent, to collect a reusable method [3](https://docs.stripe.com/payments/payment-intents) [4](https://docs.stripe.com/api/setup_intents) | Off-session PaymentIntent against the saved method (or a Subscription for equal splits) |
| **PayPal** | USD/international | Orders v2 | Vault / setup token | Subscriptions (product + plan); renewals arrive as `PAYMENT.SALE.COMPLETED` carrying `billing_agreement_id`; lifecycle via `BILLING.SUBSCRIPTION.*` [5](https://developer.paypal.com/api/rest/webhooks/event-names) |

**Hard rules**
- The **server** recomputes every amount from `{tierId, pages, components, complexity, addons, cadence, installments}`; the client never sends money.
- One canonical currency of record (**USD cents**); NGN is a *presentation* conversion using a stored `fx_rates` row — this replaces the hardcoded `amount * 1500` in `src/app/checkout/page.tsx`.
- Every webhook is signature-verified (Stripe verification is currently a stub at `payments.ts:90`).
- Idempotency: `provider_event_id` unique index; replay-safe handlers.
- One `payments` ledger table per charge (provider, amount, currency, status, project_id, installment_id).

---

## 11. Installments on the one-time development fee (PRD §4.6)

**Status: implemented** — `workers/api/src/lib/installments.ts` plus migration `0007_installments.sql`. A plan is written when an installment purchase succeeds; the daily Cron Worker duns whatever is due; and the project page shows "Development fee: 2 of 12 paid · next ₦… on 12 Oct" with the plan's status.

**Model:** the fee is a debt schedule, not a subscription.
- `installment_plans(project_id, total_cents, currency, count, interval, started_at, status)`; `installments(id, plan_id, seq, due_at, amount_cents, status ∈ {Scheduled, Paid, Due, Grace, Failed}, attempts, paid_at)`.
- **Decision 11 — twelve even monthly payments.** The one-time development fee splits into **12 equal monthly payments**; payment 1 is taken at checkout, the remaining 11 on monthly anniversaries. Splitting rule in integer cents: `base = floor(totalCents / 12)`, and the first `totalCents − 12 × base` payments get **+1 cent** so the twelve sum to the fee exactly.
- **Decision 16 — the discount sits on the one-time payment, not as interest on the installments.** The engine's figure *is* the 12-month total; paying the fee in one go takes **15% off** (`ONE_TIME_DISCOUNT`), and the 12 payments stay at `total ÷ 12` with nothing added. No deposit, no first-payment premium.
  - **Money bug fixed 2026-09-15 (found testing the payment path):** `servicesAnnualCents()` summed add-ons and **never added the tier's own `monthlyCents`**, so any project with no add-ons was quoted ₦0 for its first year of Project Services — a Startup project was under-quoted by $300/yr and a Business one by $600/yr. Both mirrors now start the reduce from `tier.monthlyCents`. The mirror check's sample order moved $689.63 → $989.63, which is exactly the Startup tier's 12 × $25.
  - **Arithmetic (settled 2026-09-15):** the discount is taken off the installment total, so the two figures differ by **1 ÷ 0.85 ≈ 17.6%** when read the other way round. That is a consequence of the discount, not a markup on the installments — there is no "15% more for splitting" price, and no such line anywhere in the product or the UI. The only customer-facing number is **15% off when you pay once**.
- Cadence selector (annual/monthly +15%) stays on the **services** part of the order summary, clearly separated from the fee schedule.
- First installment is charged at checkout through the customer's rail; the rest are charged from the **saved method** on due dates by a **Cron Worker** (`chargeSaved`).
- **Grace:** on failure → status `Grace`, service continues 7 days, reminder emails on days 1/3/5/7 (PRD §4.5), then dunning: the affected **add-on services** are removed — the project itself is never deleted mid-build.
- **No refunds:** the UI must say plainly that installments are a commitment to pay the full fee; cancelling is not an option once paid (§6).
- Project page shows "Development fee: 2 of 3 paid · next ₦… on 12 Oct" with a pay-now button.

---

## 12. Analytics — what Cloudflare actually exposes, and the matching UI

### 12.1 Datasets and fields

**A. Zone HTTP analytics** (zone-scoped, `viewer.zones`) — `httpRequests1dGroups` / `httpRequests1hGroups` / `httpRequestsAdaptiveGroups`:
- `sum`: `requests`, `pageViews`, `bytes`, `cachedBytes`, `cachedRequests`, `encryptedBytes`, `threats`
- `uniq`: `uniques`
- `dimensions`: `date`, `datetime`, `datetimeHour`, `datetimeFiveMinutes`, `clientCountryName`, `edgeResponseStatus`, plus maps — `browserMap{pageViews, uaBrowserFamily}`, `countryMap{bytes, requests, threats, clientCountryName}`, `responseStatusMap{requests, edgeResponseStatus}`, `contentTypeMap`, `ipClassMap`, `threatPathingMap`, `clientSSLMap`
[6](https://developers.cloudflare.com/analytics/graphql-api/migration-guides/zone-analytics/) [7](https://reintech.io/blog/monitoring-web-traffic-with-cloudflare-analytics)

**B. RUM / Web Analytics** (account-scoped, `viewer.accounts`) — `rumPageloadEventsAdaptiveGroups`:
- `count` (pageviews), `sum { visits }`, `avg { sampleInterval }`
- `dimensions`: `requestPath`, `requestHost`, `refererHost`, `refererPath`, `userAgentBrowser`, `userAgentOS`, `deviceType`, `countryName`, `date`, `datetimeMinute`, `bot`
[8](https://boehs.org/node/notes-on-the-cloudflare-web-analytics-api)
- companion `rumPerformanceEventsAdaptiveGroups` for Core Web Vitals (field names to confirm via introspection before building the CWV tiles)

### 12.2 Limits that shape the design

| Limit | Value | Impact |
|---|---|---|
| Query quota | **300 GraphQL queries / 5-min window** (≈1/s sustained, or a 300 burst) [9](https://developers.cloudflare.com/analytics/graphql-api/limits/) | Never query from the browser; cache aggressively; cron-rollup |
| Account-based rate limiting | opt in for per-account/per-zone budgets [9](https://developers.cloudflare.com/analytics/graphql-api/limits/) | **Enable it** — we query many customer zones |
| Scope | ≤10 zones per zone-scoped query, 1 account per account-scoped query [9](https://developers.cloudflare.com/analytics/graphql-api/limits/) | Batch ≤10 zones per request |
| Per-dataset limits | `enabled`, `availableFields`, `maxPageSize`, `maxNumberOfFields`, `notOlderThan`, `maxDuration` — discoverable at runtime via the **`settings`** node (example: `maxDuration 259200`, `notOlderThan 2678400`, `maxPageSize 10000`) [10](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/) | **Read `notOlderThan` per zone** and disable out-of-range date presets instead of hardcoding retention |
| Retention | varies by plan/dataset (published figures range from ~7 days on Free to ~30 days on Pro/Business and ~365 days on Enterprise) [11](https://www.metrickeeper.com/blog/how-long-does-cloudflare-keep-analytics-data-and-how-to-extend-it) | Same as above + nightly roll-up into `analytics_daily` for history we control |
| RUM sampling | `avg { sampleInterval }` — 1 = raw, 10 = 1-in-10 multiplied back; recent days raw, older data sampled [12](https://dev.to/robertcasschdot/your-cloudflare-analytics-are-rounded-to-the-nearest-10-and-the-api-will-tell-you-so-10nn) | Always select `sampleInterval`; show an "estimated" chip when > 1 |

### 12.3 Architecture

- `projects.zone_id` (and `rum_site_tag`, unused in v1) set at Launch; a single `CF_API_TOKEN` in Worker secrets; **Cloudflare is only ever called from the Worker**, never the browser.
- `GET /api/projects/:id/analytics?range=7d|30d` → builds the GraphQL query, reads `settings.notOlderThan` for that zone (cached daily), returns normalized JSON.
- **Caching:** 15 min for live tiles; **Cron Worker** nightly writes the previous day into `analytics_daily` → history beyond Cloudflare retention, at zero query cost per dashboard view.
- Cap zones per cron run and rely on account-based rate limiting; 429 → exponential backoff, serve last-known rollup.

**Two implementation calls made while building it**

- **The tile cache lives in D1 (`analytics_cache`), not KV.** KV would need a new binding and a namespace id that only exists on the deployed account, so the local copy and production would have been configured differently. A table behaves identically in both, and a 15-minute cache is read-heavy but tiny.
- **The zone is attached at launch, and a failure there is swallowed.** Launch is the moment the customer paid for; it must not depend on Cloudflare answering. If the zone can't be found or created the project still goes live and the tab says hosting is connecting — `attachZone` logs and returns null.
- **Yesterday is the last day in every window.** Today's numbers are still being written, so including them made every chart look like traffic was collapsing.

### 12.4 Analytics tab — widget↔field mapping

| Widget | Source | Notes |
|---|---|---|
| Requests | `sum.requests` | |
| Unique visitors | `uniq.uniques` | daily granularity only |
| Page views | `sum.pageViews` | |
| Bandwidth | `sum.bytes` (+ `cachedBytes`) | |
| Cache hit ratio | `cachedRequests / requests` | derived, ours to compute |
| Traffic over time | `httpRequests1dGroups` by `date` | line/area, 7/30-day presets |
| Top countries | `countryMap` / `clientCountryName` | bars |
| Response status mix | `responseStatusMap` | donut |
| Browsers | `browserMap` | list — verify against the zone's `availableFields` |
| "Estimated" chip | `avg.sampleInterval > 1` | honesty about sampling |

**v1 ships only the rows above.** These are RUM-dependent and therefore deferred to v2 (§12.6): top pages, referrers, device split, Core Web Vitals. They are dropped, not faked.

**Deliberately NOT shown** (Cloudflare doesn't provide them): bounce rate, session/visit duration, UTM/campaign attribution, goal/funnel conversion, real-time live visitors [13](https://markosaric.com/cloudflare-analytics-review/). If we ever want them, the route is **Workers Analytics Engine** custom events — also the cleanest way to get product events like "Get Priced clicked".

**Link to PRD §4.3/§4.5:** `analytics_daily` (requests + bandwidth) drives the tier-limit monitor → in-dashboard banner *"You're nearing your tier's limit — upgrade"* (upgrade-only), and the intake metrics collected at quote time become the baseline those thresholds are measured against.

**Mobile projects** have no zone: the Analytics tab instead shows build status, UI/UX preview, APK download and store-deployment state.

### 12.5 Which Cloudflare plan each project zone sits on (decision 12)

**What a zone is:** every hosted project ends up as a domain or subdomain on Cloudflare. A *zone* is one registered domain (with its subdomains) — so `client.com` is a zone and `preview.client.com` rides on it for free. One customer project on its own domain = one zone. **The plan is bought per zone, not per account**, and it is the plan that decides how much history we can query.

**Official traffic-analytics retention by plan** [14](https://developers.cloudflare.com/plans/):

| Plan | Traffic analytics retention | Cache analytics retention | Rough list price |
|---|---|---|---|
| Free | **30 days** | not available | $0 |
| Pro | **7 days** | 7 days | ≈$20–25 / zone / month |
| Business | **30 days** | 30 days | ≈$200–250 / zone / month |
| Enterprise | **30 days** | 30 days | custom |

Note the trap: **Pro keeps less traffic history (7 days) than Free (30 days)**. If we put a paying customer's project on Pro because it "sounds like the paid tier", their Analytics tab would show a *shorter* window than a free site's.

**Why it matters to us**
1. **How far back a customer can look.** Whatever the plan, that is the ceiling for any live query; our own roll-up is the only thing that extends it.
2. **Cost scales with project count.** 25 projects on Business ≈ $5–6k/month at list. That is a real per-customer unit cost and needs to sit inside the tier pricing.
3. **Consistency.** If zones sit on different plans, every customer's dashboard has a different "how far back" and we inherit the support burden of explaining it.

**Decision 17 — the zones are ours.** Customer domains (and the preview subdomains) are zones **in TechRepubliQ's Cloudflare account**. That buys simplicity and costs us money:

| Consequence | What it means for us |
|---|---|
| One API token | We query every project's analytics with a single `CF_API_TOKEN` — no per-customer credentials, no OAuth dance |
| We own DNS/SSL/WAF | We can provision, fix and secure a project without waiting on the customer |
| **We pay the plan fee** | Every zone's plan is a COGS line inside the $5/$25/$50 tiers — see the cost reality check below |
| Zone ownership | The customer's registrar still points at us; we need an offboarding path (NS hand-back / zone export) and a contract clause so a customer can't silently repoint nameservers and break their own site |
| Blast radius | Abuse or an L3/L4 attack on one project hits our account — baseline WAF/rate-limiting everywhere, and Enterprise isolation only if a customer pays for it |

**Cost reality check — this decides the plan more than retention does.** A Business zone is ~$200–250/month. An MVP customer pays **$5/month**. A per-project Business zone is therefore ~40× the revenue of the cheapest tier, and even Pro (~$20–25) is 5× it. Retention does not justify that, and our own nightly roll-up already solves long-term history — so:

**Recommendation — Free zones by default, Business as a paid upgrade, avoid Pro**
- **Default every hosted project zone to Free ($0).** Free has the *best* traffic retention of any self-serve plan (30 days, more than Pro's 7), universal SSL, and full DNS control including the apex domain. Infra (Workers/D1/R2) sits in free tiers at MVP volumes, so a $5/month project stays viable.
- **Sell Business per project** (~$200–250/mo) only where the customer needs its actual features: 100% uptime SLA, custom certificate upload, stronger WAF, prioritised support — and price that into their plan, don't absorb it.
- **Avoid Pro**: 7-day traffic retention and a real bill. Strictly worse on both counts for us.
- **At scale (≈100+ projects), move to Cloudflare for SaaS (custom hostnames)** on one Business parent: 100 hostnames included on Free/Pro/Business, then $0.10/hostname/month [15](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/). Caveat: apex proxying (customer's bare domain, not a subdomain) and hostname webhooks are Enterprise-only [15](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/), so standalone Free zones remain the simplest way to serve `client.com` itself.
- **Enterprise only** when a customer pays for Logpush-scale log export or contractual terms.

**What makes this decision low-risk:** the nightly roll-up into `analytics_daily` means our dashboards own the long-term history regardless of plan. Cloudflare retention only bounds (a) backfilling a project before roll-ups begin and (b) the live-query fallback if a roll-up fails. So pick the plan on commercial/feature grounds, and let the UI keep reading `settings.notOlderThan` per zone at runtime (§12.3) instead of hardcoding any window.

### 12.6 No Web Analytics snippet in v1 (decision 13)

PRD §9.3 asks for **traffic analytics feeding quota monitoring** — that is exactly `sum.requests` / `uniq.uniques` / `sum.bytes` from zone-level HTTP analytics, which needs **no JavaScript on the customer's site**. Adding the RUM/Web Analytics beacon would buy top pages, referrers, device split and Core Web Vitals, but it means injecting a script into every site we ship, and on low-traffic sites its numbers come back sampled 1-in-10 [12](https://dev.to/robertcasschdot/your-cloudflare-analytics-are-rounded-to-the-nearest-10-and-the-api-will-tell-you-so-10nn). It is also one more third-party surface on a customer property, which sits badly with the confidentiality posture in §7.

**Decision:** v1 ships **zone analytics only** — no snippet, no beacon. Consequence: the v1 Analytics tab shows requests, unique visitors, bandwidth, cache ratio, timeseries, top countries, status mix and (where the zone's `availableFields` permit) browsers — and **omits** top pages, referrers and Core Web Vitals. Revisit as an **opt-in per project** in v2; the tab is built so those three tiles can be added later without restructuring.

### 12.7 Tier limits and the upgrade nudge (decision 15)

Metric: **requests/day**, read from `sum.requests` in `httpRequests1dGroups` (the same feed as §12.4), using a **7-day trailing average** so one launch-day spike does not trigger a nudge.

| Tier | Requests/day ceiling | ≈ per month | Bandwidth shown (informational only) |
|---|---|---|---|
| **MVP** | 10,000 | ~300k | 150 GB |
| **Startup** | 100,000 | ~3M | 1.5 TB |
| **Business** | 1,000,000 | ~30M | 15 TB |
| **Enterprise** | no published cap | negotiated | negotiated |

Rules
- **Nudge, never enforce.** ≥80% of the ceiling for 3 consecutive days → dashboard banner + email; ≥100% for 3 consecutive days → persistent banner + weekly email. Nothing is throttled or removed: PRD §4.3 says *suggest* an upgrade, and only §4.5's unpaid add-ons ever get removed (after the 7-day grace).
- **Upgrade-only**, immediate and prorated; never downgraded, so a quiet month does not bounce anyone down a tier.
- **Enterprise shows no number** — "Contact Sales" everywhere (§14).
- The intake metrics collected at quote time (PRD §1.3) recommend the starting tier; these measured thresholds decide when to suggest the next one.
- Bot traffic is included in `sum.requests`. If that skews the numbers we can add bot filtering later with Logpush or the RUM `bot` dimension.

---

## 13. Email Center (per-project inbox)

- Inbound: Cloudflare **Email Routing** → Worker → store in `email_messages`; outbound via the mail provider behind `SEND_EMAIL`/`FROM_EMAIL`.
- Tab appears **only** when the Email add-on is active; address is on the project's own domain.
- UI: inbox / sent / compose (existing tokens + `Button`, `Modal`); the vendor is never named (§7).

**As built (PR 7b).** One address per project, `hello@<project domain>`, used for both directions so replies land back in the same inbox.

- **The add-on is the entitlement, not the tab's visibility.** Every route re-checks for an active `email` service; hiding a tab is a convenience, not a control. Mail addressed to a domain whose project has no active add-on is rejected rather than stored somewhere nobody can read it — the sender gets a bounce instead of silence.
- **Outbound is sent as the project's own address.** If the provider refuses, the send fails with a message about the domain not being set up yet. It is deliberately *not* quietly rerouted through our own address: the recipient would see a different sender than the one sitting in the customer's Sent folder.
- **`project_services.service_key`** was added because "is the Email add-on active?" was otherwise a string comparison against the add-on's display label — copy that belongs to the marketing side. Existing rows are backfilled from the label they were created with.
- **The MIME parser is minimal on purpose** — enough to fill an inbox: RFC 2047 encoded subjects, quoted-printable and base64 bodies, multipart with a preference for the `text/plain` part, and an HTML→text fallback. Each part carries its own `Content-Type` and `Content-Transfer-Encoding`; reading those from the outer message instead was the bug that left bodies sitting there still base64'd.
- **Not yet wired:** inbound needs an **Email Routing rule per project domain**, created in the Cloudflare dashboard. The Worker's `email()` handler exists and typechecks, but nothing delivers to it until that rule is configured. Should be provisioned alongside the zone at launch rather than by hand.

---

## 14. Enterprise "Contact Sales"

- Tier card shows **"Contact Sales"** with no figure; selecting it opens a form (name, company email, company, business stage, expected scale, notes) → `POST /api/contact-sales` → row in `contact_sales_leads` **and** an email with every submitted field to **admin@techrepubliq.com** (decision 14), plus a short auto-acknowledgement to the customer. Same inbox receives Enterprise leads from the landing `#tiers` card and `/quote?tier=enterprise`.
- Every price surface (landing tiers, quote summary, checkout, pricing page) shows "Contact Sales" for Enterprise — never a number, never a "Get Priced" result.
- **Shipped in PR 3:** `workers/api/src/routes/contactSales.ts` (`POST /api/contact-sales`) → `contact_sales_leads` (migration `0004_contact_sales.sql`) → `sendContactSalesEmail` to admin@techrepubliq.com with every submitted field + `sendContactSalesAck` to the customer. `src/components/ContactSalesForm.tsx` is reused by the Enterprise short-circuit in `/quote` and by `/quote?tier=enterprise`. The route never returns a price; for the Enterprise tier the pricing response carries `contactSales: true` and null totals.

---

## 15. Historical data stance

**Fixed in PR 7b.** `/dashboard/orders` lists real orders from `GET /api/orders`, but `/dashboard/orders/[id]` rendered a **hardcoded sample order** for every id — "ORD-001", "$3,500", "In Progress". A customer clicking any past order was shown someone else's figures.

The route needed `generateStaticParams` because the site builds with `output: "export"`, and the only ids it could declare were the sample's own — which is how the fabrication survived. It now follows the same pattern `/dashboard/project` already uses: a static route at `/dashboard/orders/detail` reading `?id=` from the URL.

That exposed a second problem: orders were being **created with no detail at all**. The insert after payment wrote a fixed `"TechRepubliQ project"`, the placeholder slug `custom-project` (via a ternary whose branches were identical), and a description of `"Payment via <provider>"`. It now carries the quote's own service, description, scope and timeline, and records the amount in the minor units of the order's currency — `amount_cents` is always USD-based, which would have made a naira order read as a few hundred naira.

The migration modal on that page also offered "Front-end + back-end migration files". The server has only ever produced the front-end bundle, and the Service Agreement now says so; the option is gone and the copy matches what is actually delivered.



- Ship `0005_projects.sql` as **new tables**; do not migrate or reshape existing `orders`/`quotes`/`migration_requests` rows.
- Dashboard "Orders" splits into **Projects** (new model) and **Past orders** (read-only, existing `api.orders.list()` / `/dashboard/orders/[id]`).
- Quote references (`QR-…`) remain valid for historical lookups; new intakes use the same `QR-` prefix so nothing looks foreign.

---

## 16. Delivery order

| PR | Content | Depends | Risk |
|---|---|---|---|
| **1** | WP1 landing (frontend only) | — | Low; constraints verified by md5 | ✅ **Landed — `9acc338`** (hero, panel text, 7 categories, tiers section, journey + "No tokens" band, CTA, footer/nav; both md5 fingerprints unchanged; `tsc` + `next build` clean) |
| **2** | WP0 model + heuristic engine + WP2 services IA + WP8 | — | Low–medium (slug change) | ✅ **Landed — `7291e85`** (`src/lib/product.ts` + `PricingEngine` seam + heuristic; server mirror in `workers/api/src/lib/pricing.ts` with `scripts/check-pricing-mirror.mjs` drift guard; `/services` index, 7 detail pages, retired-slug page; "Request a Quote" retired. One open item: fee calibration, §17.1) |
| **3** | WP3 quote/intake + uploads + enterprise form | WP0, WP2 | Medium | ✅ **Landed — `b6ea079`** (5-step `/quote` with the §4.3 metrics and tier recommendation, `POST /api/uploads` → R2, `POST /api/contact-sales` → admin@techrepubliq.com + ack, server-side quote pricing with clamped estimates, `/quote/result` deleted, `?category=`/`?tier=` wired. Client and server totals verified identical; routes exercised locally. R2 bucket provisioned) |
| **4** | WP4 payments: provider interface, PayPal rail, FX fix, invoices, signature verification | WP3 | Medium (money path) | ✅ **Landed** — part 1: provider seam, three rails, FX cron + locked rate, verified webhooks, server-side recompute, checkout conversion (§10, §20). Part 2: installments (§11). The "2 of 12 paid · next ₦… on <date>" widget landed with PR 5, which built the project surface it needed |
| **5** | WP5 dashboard + project tabs (Preview/Services/Database) | WP0, DB | Medium–high | ✅ **Landed** — `0005_projects.sql`; projects are created from a paid order; `/api/projects` (+ services/cancel/restore, launch, database, OTP migration, service-center); dashboard nav Projects·Subscriptions·Service Center·Account·Past orders; project page with Preview/Services/Database tabs and the installment card; historical orders moved to `/dashboard/orders`. Analytics and Email Center tabs arrive with PR 7 |
| **6** | WP6 installments + reviews + post-launch edits | WP4, WP5 | Medium | ✅ **Landed** — review counter with $10/+2 and $15/+3 packs, refusable after launch; post-launch edits priced per-edit (rates only, $25 floor) or drawn from a monthly plan ($100/10, $200/25, $500/50, $1,000/∞) with capped rollover; all purchases charge the card saved at checkout. Installments were already done in PR 4 part 2 |
| **7** | §12 Analytics (Cloudflare) + §13 Email Center + WP7 policy copy | WP5 | Medium (external APIs) |
| **7a** | §12 Analytics | WP5 | Medium | ✅ **Landed** — `0009_analytics.sql`; `workers/api/src/lib/cloudflare.ts` (GraphQL client, settings discovery, 429 backoff) + `lib/analytics.ts` (read, nightly roll-up, tier nudge); `GET /api/projects/:id/analytics`; Analytics tab; nudge banner on the projects list. Zones are attached at launch. Verified end to end against `scripts/mock-cloudflare.py` |
| **7b** | §13 Email Center + WP7 policy copy | WP5, 7a | Medium | ✅ **Landed** — `0010_email.sql` (`service_key` on services, `read_at` on messages); `workers/api/src/lib/emailInbound.ts` (MIME parsing + the `email()` entry point) + `routes/email.ts` (list / send / mark read); Email tab for projects with the add-on; `/terms` rewritten to WP7. Verified end to end: entitlement gating, compose sending as the project's domain address, inbox/sent, read state, and 16 MIME parsing cases |

PRs 1 and 2 are independent. None touches the OBJ or GIF-panel code.

---

## 17. Remaining open items

1. ~~**Which FX API** for the USD→NGN cron (§10).~~ **Settled as decision 22 — open.er-api.com.**
2. ~~**Zone plan sign-off** (§12.5).~~ **Settled as decision 23 — Free by default, Business as a per-project paid upgrade.** Still open: the offboarding clause for customer-owned registrars, which needs a contract rather than code.
3. ~~**Does the upgrade nudge need a bandwidth half?**~~ **Settled as decision 24 — requests/day only.**
4. **`FROM_EMAIL` is an unset secret in local dev** — outbound mail no-ops with a logged error until it's set. Pre-existing, but it means the Contact Sales emails are untested against a real inbox.
5. **A real off-session charge has never run against a live provider.** The sandbox has no network, so charges were verified against `scripts/mock-paypal.py` (PayPal's base URL is configurable, which makes this possible). Test with Stripe test keys and a real card before taking installments or one-click purchases live.
6. **PayPal customers can't one-click buy edits yet.** A one-time PayPal capture yields no reusable method — that needs a Vault setup token in `startIntent` and the `VAULT.PAYMENT-TOKEN.CREATED` / `BILLING.SUBSCRIPTION.ACTIVATED` handlers. Until then a PayPal customer buying a review pack gets the "no card on file" answer and is routed to the Service Center.
6. **New secrets to set before deploy:** `PAYSTACK_PUBLIC_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`. `FX_API_URL` is already set in `wrangler.toml` to open.er-api.com (no key); swap it if you pick a provider with one.
7. **Analytics needs two secrets before it does anything:** `CF_API_TOKEN` (zone-scoped read on every project zone) and `CF_ACCOUNT_ID` (only to provision a new zone at launch). Without a token every project renders "Traffic analytics connect when your project's hosting goes live" rather than an error, so analytics can ship turned off.
8. **Inbound email needs an operator step.** Each project domain needs a Cloudflare Email Routing rule pointing at this Worker before any inbox receives anything, and the domain needs to be authorised to send before compose works. Both should be provisioned at launch alongside the zone, not configured by hand per customer.
9. **No zone plan has been chosen for real** (§12.5). The code reads `notOlderThan` per zone at runtime and disables whichever date preset the plan can't serve, so the Free-vs-Business call doesn't block shipping — but it does decide how far back customers can look.
10. ~~**`next@15.1.7` has a published security vulnerability** (CVE-2025-66478).~~ **Resolved — upgraded to 15.5.25**, the latest 15.x. Verified: all 30 routes still prerender under `output: "export"`, every page returns 200, the three.js chunk is still in the `/about` bundle, and the guardrail fingerprints on the OBJ script and GIF panel are unchanged.
11. **Remote D1 migrations are unverified.** All ten files (`0001`–`0010_email`) apply cleanly to a local database; nobody has confirmed whether any of them were ever applied to the production database `632bb22e…`. Check with `wrangler d1 migrations list techrepubliq --remote` before deploy.

Everything else from the first round is resolved in §9.

---

## 18. QA checklist

```bash
# Constraints 1 & 2 — one script, marker-based (line numbers drift, markers don't)
python3 scripts/check-guardrails.py
#   obj_script      7d963ae7ecfa437bb50d06911dcd8b00   <script> block: three.js scene, material, loader, scroll animation
#   panel_card_rule e265b1948bcf3038113988436a6e76a3   .panel-hero-card { ... } — the GIF container
#   anim.gif 1 · ring3d 11
# (The two 9acc338-era md5s in earlier notes used pre-PR-1 line offsets; this script replaces them.)

# Pricing model — client and server must agree on their constants
npm run check:mirror

# Money math — the outputs must keep their promises (installments sum exactly, etc.)
npm run check:money

# Constraint 3 — no hex drift outside the landing theme injector
grep -rnE "#[0-9A-Fa-f]{6}" src/ --include=*.tsx --include=*.ts | grep -v "src/app/page.tsx" | grep -v ThemeProvider
```
- [ ] Dark + light: hero, panel section, services, **tiers**, process + contrast band, testimonials, preview, CTA, footer
- [ ] ≤860px hero (ring visible, CTA above the fold); ≤640px grids
- [ ] OBJ spins on scroll, settles, never drifts; GIF still renders in the panel
- [x] Every cross-page link inside the iframe has `target="_top"` — one `/login` nav link didn't, against 20 that did, so the preview silently navigated inside the frame instead of breaking out. Fixed, and `check-guardrails.py` now enforces it (a page link without `target="_top"` fails with its line number). In-page anchors are deliberately exempt: `target="_top"` on a `#hash` link reloads the page instead of scrolling.
- [x] Client and server totals agree; monthly = annual × 1.15 ÷ 12 to the cent; Enterprise shows no number
- [x] 12 installments sum to the fee exactly; one-time = 15% off — **`npm run check:money`**, 188 assertions across 12 fee values and both copies. The mirror check only proves the two models agree on their *constants*; this proves the outputs keep their promises. Verified it actually fails: swapping `floor()` for `round()` when splitting the fee over-charges by up to 4¢ (12 payments of 11 sum to 12), and a 13% discount is caught immediately.
- [ ] `/services` and every `/services/<slug>` render in dark and light
- [ ] Paystack + Stripe + PayPal happy paths and webhook signature verification (incl. `charge_authorization` for installments)
- [x] Analytics: 429/backoff path, `notOlderThan`-driven date presets, "estimated" chip when `sampleInterval > 1`
      — all three exercised against the mock: two 429s then success (2.9s, live figures); a permanent 429 falls back to the roll-up marked stale; a 7-day-retention zone refuses 30d with the reason and still serves 7d
- [x] `npm ci && npx tsc --noEmit && npm run lint && npm run build` — **lint had never run**: there was no ESLint config, so `next lint` dropped into an interactive setup prompt and CI would have sailed past it. `eslint@8` + `eslint-config-next@15.1.7` are now devDependencies with `.eslintrc.json` extending `next/core-web-vitals`. Two real errors surfaced immediately (unescaped apostrophes in the order detail page). Lint is also part of `next build`, so until this was configured the build was passing without it.

---

## 19. Messaging rule (decision 19)

**Browsing surfaces lead with the work. The money is explained where someone is deciding to pay.**

The old copy leaned on being cheap — "Priced once", a one-time-fee trust chip, tier prices on the landing, "No tokens. No metering." That put the pitch on price instead of on what the customer actually buys. PRD v2.5's positioning note says the same thing: *cost is something the customer arrives at as a natural output of describing their project, not the headline.*

**Where value leads (efficiency · speed · reliability · scalability · functionality)**
- Landing: hero, trust chips, services, the reworked stages section, the process band, CTA, footer.
- `/services` and every `/services/<slug>`: outcomes, what's included, how it's scoped and built.
- No "from $X" figures on browsing pages, and no rate card ($500 + $3/page + $3/component) outside `/pricing`.
- Stage cards show **capability** (10k / 100k / 1M requests a day), not monthly prices.

**Where the money is spelled out — deliberately**
- `/pricing`: the fee formula, payment options, cadence, grace period, and the no-refunds policy.
- The `/quote` summary and checkout: totals, fee option, cadence, one-time services, add-ons.
- In-app nudges: renewal dates, grace-period countdowns, upgrade suggestions.

**Copy rules**
1. Say what it does before what it costs.
2. Never promise a timeline, an SLA or a vendor we can't honour.
3. Don't disclose vendors (§7) — cumulative line items only.
4. "Priced once" is dead as a headline. Use it only where the *mechanic* is being explained.
5. Terminology stays: Get Started · Get Priced · one-time development fee · Project Services · pre-launch reviews · grace period.

---

## 20. Worker config & commands

**One config: `workers/api/wrangler.toml`.** The repository root also carried a `wrangler.toml`, tracked since the base commit, that was a stale duplicate of it:

| Problem | Effect |
| --- | --- |
| `[[migrations]] directory = "migrations"` | The reported `migrations[0].tag is required`. `[[migrations]]` is **Durable Objects** config and needs a `tag` + `new_classes`; D1 SQL migrations are `migrations_dir`, a *string* on the `[[d1_databases]]` binding |
| `main = "src/index.ts"` | No such file at the root — the worker entry is `workers/api/src/index.ts` |
| `[[env.production.d1_databases]]` with `database_id = ""` | Invalid empty ID |

Patching the tag alone would have left a config where `wrangler deploy` from the root uploads the Next.js app directory as the Worker. Deleted instead; nothing referenced it (no CI, and `workers/api/package.json` owns every wrangler script).

**Run wrangler from `workers/api`**, or use the root shortcuts added to the root `package.json`:

| Command | Does |
| --- | --- |
| `npm run api:setup` | installs worker deps and creates `.dev.vars` from `.dev.vars.example` (dummy test values) if it's missing — run this first in a fresh checkout |
| `npm run api:mock-paypal` | runs `scripts/mock-paypal.py` on :8788 — set `PAYPAL_API_BASE=http://127.0.0.1:8788` in `.dev.vars` and the PayPal rail, including off-session charges, works with no network |
| `npm run api:mock-cloudflare` | runs `scripts/mock-cloudflare.py` on :8789 — set `CF_API_BASE=http://127.0.0.1:8789` (plus any `CF_API_TOKEN` / `CF_ACCOUNT_ID`) in `.dev.vars` and the whole analytics path runs with no network. `POST /__mock/config` sets daily volume, retention, sampling and how many 429s to serve first |
| `npm run api:dev` | `wrangler dev` — pass `--compatibility-date 2026-05-03`; local workerd is older than the committed `2026-08-01` and rejects it |
| `npm run api:deploy` | deploys the Worker |
| `npm run api:migrate` | `wrangler d1 migrations apply techrepubliq` — **remote**. Append `-- --local` to rehearse against a local copy |

`migrations_dir = "migrations"` is now explicit on the D1 binding, so `d1 migrations` resolves no matter which directory it's invoked from.

**Verified 2026-09-15:** four migrations apply to a local database, 14 commands, no errors — tables: `customers`, `orders`, `quotes`, `sessions`, `contact_sales_leads`, `discount_codes`, `migration_requests`. `node_modules` does not survive between sessions in this sandbox; run `npm ci` first.

**R2:** bucket `techrepubliq-assets`, Standard class, private. Only `bucket_name` in the config has to match — the binding alias is ours, and the code uses `ASSETS`.

**Local D1 is disposable.** `.wrangler/` is not persisted between sessions, so a fresh checkout needs `npm run api:setup`, `wrangler d1 migrations apply techrepubliq --local`, and a seeded `fx_rates` row — without one, NGN checkout returns 503 "Exchange rate unavailable". Crons never fire on their own locally: `curl "http://127.0.0.1:8787/cdn-cgi/handler/scheduled"` triggers one.
