# TechRepubliQ — Product Requirements Document

**Version:** 1.0 (Draft for review)
**Prepared for:** TechRepubliQ founder
**Scope:** Website product, user flow, service model, policy structure. Excludes hosting/infrastructure and internal tech stack (already decided).

---

## 1. Executive Summary

TechRepubliQ is a software development and AI automation agency, presented on the web as a premium, self-serve service platform. Customers describe what they need, receive an AI-assisted quote, pay through a localized payment method, and get their project delivered under a Service Agreement that protects TechRepubliQ's delivery methods while guaranteeing the customer full ownership of their front-end code and a path to migrate their back end.

The site must read as a $10K-grade product: confident visual design, clear service architecture, and a checkout experience that feels closer to a SaaS purchase than a freelance quote request.

---

## 2. Business Model Overview

- **Positioning:** Full-service dev/design/AI agency, sold as productized services rather than open-ended freelance contracts.
- **Core services:**
  - Web development
  - App development
  - Web/UI design
  - AI automation systems
  - AI integration (chatbots, agents, API-connected workflows)
  - AI/web performance optimization
- **Delivery model:** TechRepubliQ owns and operates all backend infrastructure, hosting, and AI tooling used to build and run a customer's product. The customer owns the resulting product and its front-end code, but not the underlying delivery infrastructure or proprietary automation components.
- **Monetization:** One-time project fees (quote-generated), with the option to add ongoing management/support as a separate line item later.
- **Geographic pricing:** Pricing and payment method shown are localized by browsing location — Nigerian visitors see Paystack and Naira-denominated pricing; international visitors see Stripe and USD (or other supported currency) pricing. Each group only sees the options relevant to them.

---

## 3. Primary User Personas

| Persona | Description | Primary Goal |
|---|---|---|
| **Founder/SME owner** | Non-technical, needs a website or app built | Get a working product fast, understand cost upfront |
| **Startup technical lead** | Semi-technical, needs AI integration/automation | Wants scoped automation without hiring a full team |
| **Existing client (post-purchase)** | Already paid for a service | Needs invoices, receipts, support requests, or migration |

---

## 4. Core Product Requirements

### 4.1 Public Website
- Home page: positioning, service categories, proof (case studies/portfolio), CTA to "Request a Quote"
- Services page: each service (web dev, app dev, design, AI automation, AI integration, optimization) with a short description and starting-price indicator
- Portfolio/case studies (optional at launch, structured for easy addition later)
- Terms of Service / Service Agreement page (see Section 6)
- Pricing/FAQ page addressing scope, migration policy, and what's included vs. excluded

### 4.2 Quote Request Flow (core differentiator)
1. Customer selects a service category (or "Not sure — describe my project")
2. Customer fills a structured intake form capturing:
   - Project type and goal
   - Key features/requirements (free text + optional checkboxes per service type)
   - Timeline expectation
   - Budget range (optional, for calibration only)
3. Submission is processed by an AI quoting engine that:
   - Parses the requirement text
   - Maps it to a scope and complexity tier
   - Generates a itemized-looking quote (in plain product terms, not technical implementation terms)
4. Customer sees the generated quote on-screen with:
   - A plain-language summary of what will be delivered
   - Price (in their local currency/payment context)
   - Option to apply a discount code
   - "Proceed to Payment" button
5. Optional: customer can request a human review of the AI-generated quote before paying (recommended as a trust feature)

### 4.3 Payment & Checkout
- Location-based payment routing:
  - Nigeria-detected traffic → Paystack, NGN pricing
  - Non-Nigeria traffic → Stripe, USD (or localized currency) pricing
- Discount code field at checkout
- On successful payment:
  - Customer receives an on-screen confirmation
  - Customer receives an emailed **invoice** summarizing the ordered service in product terms (not a breakdown of internal tools/features used)
  - Order is created in the customer's account/dashboard

### 4.4 Customer Dashboard
- Order history (each order = one purchased service)
- Per-order detail page:
  - Invoice/receipt download
  - Order status (in progress, delivered, etc.)
  - "Request Migration" action (see 4.5)
  - Link to the accepted Service Agreement terms for that order
- Account/profile settings

### 4.5 Migration Request Flow
- Customer requests migration from their dashboard
- System (or team) delivers:
  - Full front-end code/files
  - Back-end migration files, where applicable
- System explicitly withholds:
  - Any proprietary AI automation components built into the product
  - Hosting/infrastructure details and credentials
  - Vendor/registrar information
- Domain handling: customer requests a transfer target; TechRepubliQ initiates the domain transfer to the customer-specified registrar/account, without disclosing where the domain was originally registered/hosted

### 4.6 AI Quoting Engine (product behavior, not implementation)
- Input: free-text + structured requirement fields
- Output: a customer-facing quote (price + scope summary), consistent and defensible across similar requests
- Must avoid ever surfacing internal reasoning, tool names, or infrastructure details in the customer-facing quote or invoice

---

## 5. Service Agreement / Terms of Service — Required Clauses

This is the legal/policy backbone that makes the confidentiality model enforceable. It should be presented in plain language on the ToS page and explicitly agreed to (checkbox) before checkout.

1. **Scope of delivery:** Defines that the customer is purchasing a functioning product/outcome, not access to the specific tools, infrastructure, or methods used to build or run it.
2. **Duration and functionality guarantee:** Services purchased will function as described for the duration that was paid for, based on what was communicated at time of payment.
3. **Confidentiality of delivery methods:** All infrastructure, hosting providers, vendors, registrars, and internal AI/automation methods used to deliver the service are confidential and not subject to disclosure, before or after payment.
4. **Ownership on delivery:** Customer owns the front-end code and content of their product.
5. **Migration rights:** Customer may request migration files (front-end + applicable back-end) at any time. Migration excludes proprietary AI/automation components, which remain TechRepubliQ property and are not portable.
6. **Domain handling:** TechRepubliQ will transfer the domain to a customer-specified registrar/account on request, without disclosing prior registration/hosting details.
7. **No account-level access:** Customer is not entitled to receipts, credentials, or account access for third-party services purchased on their behalf as part of a bundled service.
8. **Discount/payment terms:** Standard terms for discount code use, refund policy (to be defined), and accepted payment methods by region.

---

## 6. UI/UX Flow

### 6.1 Site Map
```
Home
├── Services
│   ├── Web Development
│   ├── App Development
│   ├── Web/UI Design
│   ├── AI Automation
│   ├── AI Integration
│   └── Optimization
├── Request a Quote (intake form)
│   └── Generated Quote → Checkout
├── Pricing/FAQ
├── Terms of Service / Service Agreement
├── Login / Dashboard
│   ├── Orders
│   │   └── Order Detail (invoice, status, migration request)
│   └── Account Settings
```

### 6.2 Key Screens

**Home**
- Hero: strong value statement, single primary CTA ("Get a Quote")
- Service category grid (6 cards: the 6 core services)
- Trust section (process overview: Request → Quote → Pay → Delivered)
- Footer with ToS/legal links

**Request a Quote (Intake Form)**
- Step 1: Select service category
- Step 2: Structured questions (varies by category) + free-text project description
- Step 3: Review answers → "Generate Quote"
- Progress indicator across steps to reduce drop-off

**Quote Result**
- Plain-language scope summary (bullet list of what's included)
- Price, clearly localized to currency/region
- Discount code field
- Primary CTA: "Proceed to Payment"
- Secondary option: "Request Human Review" (builds trust, optional at launch)

**Checkout**
- Payment method shown is pre-filtered by detected location (Paystack for Nigeria, Stripe otherwise) — no toggle shown to switch regions
- Order summary restated
- Checkbox: "I agree to the Service Agreement" (linked, required)
- Pay button

**Post-Payment Confirmation**
- On-screen thank-you + order reference
- Confirmation that invoice has been emailed

**Dashboard → Orders**
- List of past/active orders, each with status
- Click into an order for invoice download, status, and migration request action

**Order Detail**
- Order summary (as originally quoted, in product terms)
- Invoice download (PDF)
- Status tracker
- "Request Migration" button → opens a request form (front-end only / front-end + back-end)
- Link to the specific Service Agreement version accepted for this order

---

## 7. Explicitly Out of Scope for This Document
- Infrastructure/hosting architecture (already decided)
- Internal tech stack selection (already decided)
- Legal review/finalization of the Service Agreement wording (recommend a lawyer pass before publishing)

---

## 8. Open Decisions for Founder Review
- Whether "Request Human Review" is included at launch or added later
- Refund policy terms (not yet defined)
- Whether case studies/portfolio ships at launch or is added post-launch
- Discount code system: single global codes vs. per-customer codes
