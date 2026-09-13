# TechRepubliQ — PRD v2.5: Value-First Platform & Project Dashboard

**Supersedes:** the flow, pricing model, and dashboard sections of TechRepubliQ-PRD.md (v1.0), and this document's own earlier drafts (v2.0's flat-fee-per-category model, v2.1/v2.2's undecided page/component rates and unresolved add-on-selection mechanism — all now replaced below).

**Positioning shift (read this first):** the platform is not built or marketed around price. Pricing is still a core selling point, but the site, the flow, and the messaging lead with TechRepubliQ's actual services and value proposition. Cost is something the customer arrives at as a natural output of describing their project, not the headline.

**The model in one line:** this is a Lovable/Bolt/Replit-style build-and-launch platform, except a human builds the product instead of an autonomous AI agent, and the fee to build it is a one-time price, not a token you can run out of mid-build.

**Note on this document:** assembled from six dictation sessions. Items are flagged **Open** only where a number or rule was explicitly left undecided.

---

## 1. Core Flow: Home → Paid Order

1. **Home → "Get Started."**
2. **Select project category** — Web Development, App Development, AI Automation, AI Integration, Training, etc.
3. **Select project tier** — MVP, Startup, Business, or Enterprise (Section 4.3). Intake also asks expected daily traffic/volume and related metrics, to guide the customer toward the tier that fits their business.
4. **Asset & brief intake** — branches based on category. Collects logo upload, a business brief, and whatever assets are relevant to that category. The customer does **not** manually select feature add-ons at this stage (see Section 3).
5. **Get Priced** (button). Loading state ("Analyzing project…") while the AI pricing engine processes everything submitted (Section 4.2) and, in the same pass, **automatically determines which add-ons the project needs** (Section 3.1).
6. **Price summary** — a single final total (Section 4.4), plus the option to click **"Add additional add-on"** to browse a dropdown of every available add-on and include anything the AI didn't already add (Section 3.2).
7. **Proceed to Payment.** No separate "Generate Invoice" step — this immediately emails the customer an **unpaid invoice** and moves them into payment.
8. **On successful payment:** the customer receives a **paid invoice** by email, and is taken to their **Dashboard**, where recurring services are itemized and individually manageable (Section 4.5).

## 2. Domain Handling (Web / Web App categories only)

- **No domain yet:** customer can purchase a domain directly on TechRepubliQ.
- **Has a domain already:** given DNS details to point it at TechRepubliQ. Bringing your own domain simply means not paying TechRepubliQ for one — hosting and backend are covered either way (Section 6).

## 3. Project Services — Selection Model

"Project Services," not "plugins." Always included, not optional: Domain (if purchased through TechRepubliQ) + Hosting + Backend service.

### 3.1 AI-Determined by Default

The customer does not pick add-ons manually as a required step. After the brief is submitted, the AI pricing engine decides which add-ons the project needs (e.g., a project whose brief implies a map gets a "Map" line item automatically) and includes them in the price with no vendor disclosure to the customer (Section 6).

### 3.2 Manually Adding More

A visible **"Add additional add-on"** button opens a dropdown covering every add-on TechRepubliQ offers — the same catalog whether the customer is adding a feature the AI didn't infer (e.g., AI Live Chat, Blog Agent, Newsletter Agent, AI Chat Agent) or a service like Maps. Available both at the price-summary stage before payment, and later from Project Services in the dashboard (Section 8.2).

Catalog is not final — more add-on types will be added over time.

### 3.3 Add-On Pricing Baseline (Startup tier — see Section 4.3 for tier scaling)

- **Google-powered services** (e.g., Map): **$10/month** flat.
- **Email service:** **$25/month** flat, includes **50,000 mails/day**.
- **AI feature add-ons:** **$25/month** flat, includes 1,000 tokens (sized against the real underlying model's per-token cost — ~$10 to service, ~$15 margin).
- **Anything not explicitly priced here:** the AI reasons by analogy from the fixed prices above rather than requiring every possible add-on to be pre-priced.

## 4. Pricing Model

### 4.1 Two Components of Every Order

```
Total order price = One-time computed development fee (4.2, same math at every tier)
                   + Sum of recurring add-on service fees (Section 3.3, scaled by tier per 4.3)
                   + One-time services opted into (domain purchase, app store
                     deployment assistance, etc.)
```

### 4.2 One-Time Development Fee — Computed by AI

The AI analyzes: number of pages, number of components/models (data entities implied by the brief), UI complexity, and overall project complexity (e.g., an e-commerce app prices differently from a restaurant app at a similar page count, given what each actually requires underneath).

**Baseline rates, identical across every tier:**
- **$3 per page.**
- **$3 per component/model.**
- **$500 standard base development fee.**

Tier (Section 4.3) changes recurring service pricing, never this development-fee math.

### 4.3 Project Tiers

| Tier | Standard add-on service price | Email included volume |
|---|---|---|
| **MVP** | $5/month | 2,500 mails/day |
| **Startup** | $25/month (baseline) | 50,000 mails/day |
| **Business** | $50/month | 100,000 mails/day |
| **Enterprise** | "Contact Sales" — no price shown | n/a |

**Tiers can only be upgraded, never downgraded.** As usage grows, the customer gets an email and/or an in-dashboard banner suggesting an upgrade to the next tier when a project nears or exceeds its current tier's limits.

**Metrics used to help a customer pick a tier at intake** (beyond expected daily traffic — proposed by TechRepubliQ per founder's direction to fill this in with sound judgment):
- Expected number of registered users.
- Expected daily transactions/orders (for e-commerce or transactional apps).
- Number of staff/admin users who will need dashboard access.
- Current stage of the business (solo/small team, funded startup, established business, large organization) as a simple self-reported anchor alongside the technical metrics above.

### 4.4 Price Presentation

At purchase, the customer sees **one final total**, no line-item breakdown. Post-purchase, the dashboard itemizes recurring services individually (Section 4.5).

### 4.5 Managing, Cancelling & Overage Handling

- Every recurring add-on is individually cancellable from the dashboard, with a confirmation prompt ("You're about to cancel this service — it will no longer be available on your app").
- Cancellation takes effect at the **next renewal boundary**, not immediately — a paid period runs to its end regardless.
- **Overage/non-renewal grace period:** if a service isn't renewed or a usage quota is exceeded, there's a **7-day grace period** from the due date. Service keeps working at the current rate through those 7 days, while the customer gets repeated reminder emails (and calls) about the outstanding payment. If nothing is paid within the 7 days, **that specific service is removed from the project** — the rest of the project is unaffected.
- Neither annual nor monthly subscriptions can be cancelled mid-cycle.

### 4.6 Why the Development Fee Is One-Time, Not Token-Based

The explicit contrast with Lovable/Bolt/Replit-style tools, where included tokens can run out before a project is finished. TechRepubliQ charges **one development fee to complete the build as scoped** (Section 4.2) — payable in full or split into installments — with no token-metering on the build itself. Tokens apply only to ongoing AI feature add-ons after launch (Section 3.3), never the core build.

### 4.7 Recurring Subscription Billing Cadence

- **The computed fee is an annual figure by default.** The price the customer sees from the pricing engine (Section 4.2) is what's owed per year — there is no separate "monthly baseline" that annual is discounted from.
- **Switching to monthly is optional and costs 15% more overall.** If the customer toggles to monthly payment, the annual total is first increased by 15%, then that increased total is divided evenly across 12 monthly payments. Paying annually, upfront, at the original computed figure remains the default and the cheaper path — "15% off for annual" and "15% markup for monthly" are the same single 15% swing described from opposite ends, not two separate percentages.

## 5. Build Process: Human-in-the-Loop Review (Before Launch)

1. Customer submits their brief.
2. TechRepubliQ builds a preview from it.
3. Customer reviews the preview and requests changes.
4. **Standard included revision rounds, by tier:**
   - **MVP:** 3 revisions.
   - **Startup:** 5 revisions.
   - **Business:** 10 revisions.
   - **Enterprise:** unlimited (no cap shown or mentioned to the customer).
5. Once the standard allotment is exhausted (still pre-launch), the customer can purchase **exactly two** extra-review add-ons — no other increments exist:
   - **$10 → +2 extra reviews.**
   - **$15 → +3 extra reviews.**
   - Repeatable (buy again for more, in either increment) for as long as needed before launch.
6. Once launched, this review system no longer applies — post-launch changes go through Section 5A instead.

This is strictly the pre-launch build/revision cycle. It is a separate mechanism from post-launch edits (below), even though both are "requests for change" in plain language.

## 5A. Post-Launch Edits (After Deployment)

Two ways to pay for changes to an already-live project:

**A. Pay-per-edit.** The customer describes the edit; the AI reviews it, judges its complexity (new page, new component, etc.) using the **same page/component/complexity logic as Section 4.2**, and quotes a price for that one edit. **This price is the same regardless of tier** — only complexity affects it, not whether the project is MVP/Startup/Business/Enterprise.

**B. Monthly site-update-and-upgrade subscription.** A flat monthly fee unlocks a bundle of included edits for that month:

| Monthly fee | Included edits/month |
|---|---|
| $100 | up to 10 |
| $200 | up to 25 |
| $500 | up to 50 |
| $1,000 | unlimited |

Either model covers things like a logo swap, a new page, a new component, or any other requested change once the project is live.

## 6. No Refund Policy

There are no refunds, for anything, once payment has been made. A customer cannot cancel the one-time development fee or an already-published project. The only recourse during the build (before launch) is the review/revision system in Section 5 — if the standard reviews are exhausted and the build still isn't right, the path forward is purchasing an extra-review add-on, not a refund.

## 7. Backend, Hosting & Confidentiality

- **Hosting and backend service are always provided by TechRepubliQ**, regardless of whether the customer brought their own domain.
- **Full confidentiality of the underlying stack, including AI-inferred add-ons:** the customer is never told which AI API provider, hosting platform, email platform, or service (e.g., Google Maps) underlies any feature — they see and pay for cumulative service line items only. If an issue arises, TechRepubliQ's team handles it directly rather than exposing the vendor.
- The customer can still **see their own data** through the Database tab (Section 9.4) — confidentiality covers the infrastructure, not the customer's own records.

### Cancellation & Migration (of the whole project)

- Only the **project owner** can request cancellation or migration files.
- Requires an **OTP verification code sent to the account email**; only after confirmation can migration files be downloaded.
- **Downloadable "source code" is front-end only** — never reveals backend structure or the front-end/backend connection.
- **No GitHub linking** — files are downloaded directly as a bundle.
- **Migration files** are a separate, complete download; the customer picks whatever service to migrate to on their own afterward.
- Without a cancellation/migration request, the customer never sees any backend platform detail.

## 8. Dashboard (Account Level)

- **Orders**
  - **Projects** — everything actively built/being built.
  - **Subscriptions** — ongoing/recurring services, with a visible indicator of when the next payment is due.
- **Service Center** — chat or open a ticket regarding any product/project.

## 9. Project Detail Page (Per-Project Dashboard)

### 9.1 Preview / Deploy
- **Not built yet:** "No preview available."
- **Built:** live preview, with a **Launch** action.
- Every project under preview gets a **TechRepubliQ subdomain link**, shareable, no watermark.
- **Go Live / Publish:** moves the project to the customer's own domain (Section 2).

### 9.2 Project Services
Every recurring add-on attached to this project (Section 3), individually manageable/cancellable (Section 4.5), plus the same **"Add additional add-on"** control described in Section 3.2.

### 9.3 Analytics
- **Web projects:** traffic analytics, feeding the quota-monitoring in Section 4.5.
- **Mobile (Android/iOS) projects:** shows a **UI/UX preview** before a build exists; once approved, the customer gets a **downloadable APK**, and App Store/Play Store deployment proceeds if purchased.

### 9.4 Database
Present on every project. Shows underlying records (users, orders, purchases, etc.) where a backend/data model exists; states plainly it doesn't apply where it doesn't (e.g., a marketing-only site).

### 9.5 Email Center
Present only if Email was added (Section 3). Each project with this add-on gets its own dedicated Email Center (inbox, sent, compose, from the project's own domain-based address).

---

## 10. Resolved Decisions (do not re-litigate these)

- No "Generate Invoice" step — Proceed to Payment sends the unpaid invoice directly.
- No watermark on shared previews.
- Add-on selection is **both**: AI auto-determines needed add-ons from the brief (no required manual step), and the customer can additionally add more via an "Add additional add-on" dropdown covering the full catalog.
- Add-on pricing baseline (Startup tier): Google-powered services $10/mo, email $25/mo (50,000 mails/day), AI feature add-ons $25/mo + 1,000 tokens.
- Development fee: $3/page + $3/component + $500 base, identical at every tier, modulated by AI-judged complexity.
- Tiers (MVP $5, Startup $25, Business $50, Enterprise "Contact Sales") scale recurring service pricing only, not the development-fee math.
- No price breakdown at purchase — single total only; dashboard itemizes post-purchase.
- Services cancellable individually, confirmation prompt, effective at next renewal boundary.
- 7-day grace period on any unrenewed/over-quota service, with reminder emails/calls, before that service is removed.
- Tiers can only be upgraded, never downgraded, prompted by usage nearing/exceeding limits.
- Tier-selection metrics beyond daily traffic: expected registered users, expected daily transactions, number of staff/admin users, and current business stage.
- The computed subscription fee is an annual figure by default; switching to monthly adds a 15% markup to the annual total before splitting it across 12 payments (this is the same 15% swing as the earlier "annual discount," now correctly framed as a monthly surcharge rather than two separate percentages).
- Pre-launch revisions: MVP 3, Startup 5, Business 10, Enterprise unlimited; extra reviews cost exactly $10 (+2) or $15 (+3), no other increments.
- Post-launch edits: pay-per-edit (AI-priced by complexity, same price at every tier) or a monthly plan ($100/10 edits, $200/25, $500/50, $1,000/unlimited).
- **No refunds, ever, for anything**, once paid.
- Hosting/backend always TechRepubliQ-provided and never vendor-disclosed, regardless of domain source.
- No GitHub linking for source code — download only, front-end only.
- Migration/cancellation-of-project requests require OTP email verification, owner-only.
- Database tab always exists; shows "not applicable" where irrelevant.

## 11. Open Items for Founder Review

- The AI feature add-on catalog is explicitly expected to grow — not blocking, just not final.

---

*Built from six dictated sessions. Send anything further and I'll keep folding it in.*
