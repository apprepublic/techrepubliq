import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteConfig = {
  name: "TechRepubliQ",
  tagline: "Your product, built by a real team. Scoped from your brief.",
  email: "hello@techrepubliq.com",
  copyright: `© ${new Date().getFullYear()} TechRepubliQ. All rights reserved.`,
};

export type ServiceIcon =
  | "globe"
  | "smartphone"
  | "bot"
  | "sparkles"
  | "graduation-cap"
  | "gauge";

export type Service = {
  slug: string;
  title: string;
  icon: ServiceIcon;
  short: string;
  description: string;
  hero: string;
  startingPrice?: number;
  features: string[];
  outcomes: string[];
  intake: string[];
  process: { title: string; body: string }[];
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    icon: "globe",
    short: "Marketing sites to full web apps — designed, built, launched, and hosted by us.",
    description:
      "From a launch-ready marketing site to a full web application, we design, build, and host it. You describe the product. We ship it live — with hosting and backend included.",
    hero: "A real website, built by a real team, launched on your domain.",
    startingPrice: 2500,
    features: [
      "Custom pages and product UI",
      "Hosting and backend included",
      "Domain purchase or DNS setup",
      "Shareable preview subdomain",
      "Analytics after launch",
      "Database view for your records",
    ],
    outcomes: [
      "A production website or web app, not a prototype you have to finish yourself.",
      "Preview on a TechRepubliQ subdomain — shareable, no watermark — then go live on your domain.",
      "Hosting and backend always included, whether you buy a domain through us or bring your own.",
      "After launch, manage add-ons, analytics, and edits from your project dashboard.",
    ],
    intake: [
      "Logo and brand assets",
      "Business brief and goals",
      "Expected traffic and users",
      "Reference sites you like",
      "Existing domain, if you have one",
    ],
    process: [
      {
        title: "Brief, not a feature checklist",
        body: "You send the brief and assets. The pricing engine reads what the project actually needs — pages, data models, complexity — and infers add-ons like maps or email. You don't pick plugins.",
      },
      {
        title: "One price to finish the build",
        body: "You see a single total. No token meter that can run out mid-build. The development fee is one-time; recurring services are itemized later in the dashboard.",
      },
      {
        title: "Human reviews before launch",
        body: "We build a preview, you request changes, and we revise — 3, 5, 10, or unlimited rounds depending on your tier. Then you launch.",
      },
    ],
    faq: [
      {
        q: "Do I need to bring a domain?",
        a: "No. You can purchase a domain on TechRepubliQ, or point an existing one with the DNS details we give you. Hosting and backend are covered either way.",
      },
      {
        q: "Is the price a monthly subscription?",
        a: "The build itself is a one-time development fee. Recurring fees only apply to ongoing services (email, maps, AI features, hosting-related add-ons) and are managed individually after you pay.",
      },
      {
        q: "Can I see a live preview before going live?",
        a: "Yes. Every project in preview gets a TechRepubliQ subdomain you can share. Go Live moves it to your own domain.",
      },
      {
        q: "What if I need changes after launch?",
        a: "Pre-launch revisions are included by tier. After launch, you can pay per edit (priced from complexity) or subscribe to a monthly update plan.",
      },
    ],
  },
  {
    slug: "app-development",
    title: "App Development",
    icon: "smartphone",
    short: "iOS and Android apps, with downloadable builds and app-store deployment.",
    description:
      "We design and build mobile products for iOS and Android. You review a UI/UX preview, approve the build, then receive a downloadable APK — with optional App Store and Play Store deployment.",
    hero: "A mobile product your customers can actually install — scoped from your brief and built to launch.",
    startingPrice: 5000,
    features: [
      "iOS and Android product UI",
      "Preview before a build exists",
      "Downloadable APK on approval",
      "Optional store deployment",
      "Backend and hosting included",
      "Project dashboard after payment",
    ],
    outcomes: [
      "A real mobile app, built by our team to the brief you submit — not an AI agent burning tokens.",
      "UI/UX preview first. Once approved, you get a downloadable APK.",
      "App Store and Play Store deployment as a one-time add-on if you want us to handle submission.",
      "The same dashboard as web projects: services, analytics, and post-launch edits.",
    ],
    intake: [
      "Logo and brand assets",
      "Product brief and core flows",
      "Expected users and daily volume",
      "Whether you need store deployment",
      "Reference apps and must-have screens",
    ],
    process: [
      {
        title: "Scope from the brief",
        body: "Intake captures the product, expected usage, and assets. The engine prices pages, components, and complexity — then attaches the add-ons the app actually needs.",
      },
      {
        title: "Preview, then build",
        body: "You review the UI/UX before a binary exists. Included revision rounds follow your tier. Extra reviews can be purchased in +2 or +3 increments if you need more.",
      },
      {
        title: "Ship to devices",
        body: "After approval you receive a downloadable APK. Store deployment proceeds only if you opted in — a one-time service, not a surprise line item later.",
      },
    ],
    faq: [
      {
        q: "Do you build for both iOS and Android?",
        a: "Yes. The product is scoped for both. You review a UI/UX preview first; once approved, you get a downloadable APK, with store deployment if purchased.",
      },
      {
        q: "Is store submission included?",
        a: "App Store and Play Store deployment is an optional one-time service you can add at pricing or later from Project Services. The core build does not depend on it.",
      },
      {
        q: "Do I run out of build credits?",
        a: "No. Unlike token-based app builders, TechRepubliQ charges one development fee to complete the build as scoped. Tokens apply only to optional AI add-ons after launch.",
      },
    ],
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    icon: "bot",
    short: "Automations that run your repetitive operations around the clock.",
    description:
      "We build automations that take repetitive work off your team — intake, routing, follow-ups, reporting — and keep running after launch. You own the outcome. We operate the infrastructure.",
    hero: "Operations that run themselves, without handing you a pile of tools to wire up.",
    startingPrice: 3000,
    features: [
      "Workflow automation from your brief",
      "AI agents for repetitive operations",
      "Email and notification flows",
      "Dashboard to manage services",
      "Human review before launch",
      "Hosting and backend included",
    ],
    outcomes: [
      "Automations designed around your actual operations, inferred from the brief — not a plugin catalog you have to assemble.",
      "Ongoing AI features billed as flat monthly add-ons after launch, with included token allotments — never metered against the core build.",
      "Full confidentiality of vendors. If something breaks, our team handles it. You never get a vendor login.",
      "Cancel any recurring add-on from the dashboard at the next renewal. The rest of the project stays up.",
    ],
    intake: [
      "The processes you want automated",
      "Tools and data sources involved",
      "Expected volume (jobs, emails, tickets)",
      "Business brief and success criteria",
      "Who on your team will operate it",
    ],
    process: [
      {
        title: "Describe the work, not the stack",
        body: "Tell us what should happen, how often, and who it serves. We determine the automations and any AI add-ons. You can still add more from the catalog before you pay.",
      },
      {
        title: "Priced as a finished system",
        body: "One development fee to build the automation as scoped. Recurring AI add-ons are a separate monthly line after launch, scaled by your project tier.",
      },
      {
        title: "Launch, then tune",
        body: "Pre-launch reviews catch the flows. After go-live, pay-per-edit or a monthly update plan covers new workflows and upgrades.",
      },
    ],
    faq: [
      {
        q: "Will you tell me which AI provider you use?",
        a: "No. Infrastructure and vendors stay confidential. You see and pay for the service — AI automation, email, chat — not the underlying APIs. If there's an issue, we handle it.",
      },
      {
        q: "Do tokens apply to the build?",
        a: "Never. Tokens apply only to ongoing AI feature add-ons after launch. The build is a one-time fee to complete the scoped work.",
      },
      {
        q: "What happens if I exceed usage?",
        a: "There's a 7-day grace period with reminders. If the quota still isn't covered, that specific service is removed — the rest of the project is unaffected.",
      },
    ],
  },
  {
    slug: "ai-integration",
    title: "AI Integration",
    icon: "sparkles",
    short: "Chatbots, agents, and AI wired directly into your product and data.",
    description:
      "Add intelligence to a product you already have — or to one we build — without exposing models, keys, or vendors. Chat, agents, search, and generation become product features, not a science project.",
    hero: "AI inside your product, billed as a service — not a pile of API keys.",
    startingPrice: 2000,
    features: [
      "Chat and conversational agents",
      "AI wired into your product data",
      "Live chat, blog, or newsletter agents",
      "Token allotment on AI add-ons",
      "No vendor disclosure to customers",
      "Manage or cancel from the dashboard",
    ],
    outcomes: [
      "Chatbots, agents, and generation features that feel native to your product.",
      "AI add-ons are inferred from the brief (a support-heavy product gets live chat; a content product may get a blog or newsletter agent).",
      "You can still open “Add additional add-on” and pick anything the engine didn’t include.",
      "After launch, each AI add-on is a cancellable line item with a confirmation prompt.",
    ],
    intake: [
      "Where AI should live in the product",
      "Existing product or net-new build",
      "Data the model should use",
      "Expected conversations or generations per day",
      "Brand voice and guardrails",
    ],
    process: [
      {
        title: "We infer the features",
        body: "You don't assemble a plugin list. The engine reads the brief and attaches the AI services the product needs. You can add more from the full catalog before payment.",
      },
      {
        title: "Build fee vs. running AI",
        body: "Integrating AI into the product is part of the one-time development fee. Running those features after launch is a flat monthly add-on with an included token allotment.",
      },
      {
        title: "Confidential by default",
        body: "Customers never see which model or vendor sits underneath. You see your own data in the Database tab — not our stack.",
      },
    ],
    faq: [
      {
        q: "Can you add AI to a product that already exists?",
        a: "Yes. Describe the existing product and where intelligence should land. We integrate without requiring you to rebuild from scratch.",
      },
      {
        q: "How are AI features priced after launch?",
        a: "AI feature add-ons are recurring services scaled by tier, with an included usage allowance. They are not a token meter on the core build.",
      },
      {
        q: "Can I add a feature later?",
        a: "Yes. Use “Add additional add-on” at the price summary or later from Project Services in the dashboard. The catalog grows over time.",
      },
    ],
  },
  {
    slug: "training",
    title: "Training",
    icon: "graduation-cap",
    short: "Hands-on enablement so your team can run what we build.",
    description:
      "A product only pays off if your people can run it. Training covers the dashboard, Project Services, content, and day-to-day operations — so the team that owns the business can own the product too.",
    hero: "Your team, ready to operate the product we just launched.",
    startingPrice: 1500,
    features: [
      "Hands-on product enablement",
      "Dashboard and services walkthrough",
      "Admin and staff-user training",
      "Operating playbooks for your tier",
      "Recorded sessions you can reuse",
      "Follow-up after launch",
    ],
    outcomes: [
      "Your staff can use the dashboard: preview, services, analytics, database, and email center where it applies.",
      "Admins know how to add or cancel services, request edits, and read usage so upgrades aren't a surprise.",
      "Training is scoped like any other project — brief in, one price, human delivery — not a generic course catalog.",
      "Pairs with any build category, or stands alone if you already have a TechRepubliQ product.",
    ],
    intake: [
      "Who needs training (founders, staff, admins)",
      "Which product or project it covers",
      "Live sessions vs. recorded enablement",
      "Tools your team already uses",
      "Success criteria for the sessions",
    ],
    process: [
      {
        title: "Scoped to your product",
        body: "We train on the actual project — not a generic CMS workshop. The brief names who attends, what they must be able to do, and how many sessions you need.",
      },
      {
        title: "A clear total",
        body: "Training is a one-time engagement with the same Get Priced flow. If you later need more enablement, that's a post-launch edit or a new order — not an open retainer by default.",
      },
      {
        title: "Your team keeps the keys they need",
        body: "They learn the customer-facing dashboard and their own data. They do not receive vendor accounts, backend structure, or GitHub access — by design.",
      },
    ],
    faq: [
      {
        q: "Is training only for new builds?",
        a: "No. It can ship with a new project or as a standalone engagement for a product already on TechRepubliQ.",
      },
      {
        q: "Will you train us on the backend?",
        a: "We train you to operate the product: dashboard, content, services, and data you own. Backend structure, vendors, and infrastructure stay confidential.",
      },
      {
        q: "How many people can attend?",
        a: "Tell us the number of staff and admin users at intake. That also helps pick the right project tier, since tiers consider who needs dashboard access.",
      },
    ],
  },
  {
    slug: "optimization",
    title: "Optimization",
    icon: "gauge",
    short: "Performance, SEO, and speed tuning for products already in the world.",
    description:
      "If the product exists and it isn't fast, found, or converting, we treat optimization as its own project — audit, fix, and re-launch the experience without rebuilding the whole thing.",
    hero: "Make the product you already have faster, clearer, and easier to find.",
    startingPrice: 1000,
    features: [
      "Performance and UX audit",
      "Speed and Core Web Vitals work",
      "SEO and information architecture",
      "Conversion and funnel fixes",
      "Before/after measurement",
      "Optional ongoing update plan",
    ],
    outcomes: [
      "A scoped optimization project with a one-time fee — not an open-ended retainer unless you choose a monthly update plan.",
      "We work on the live product: speed, structure, SEO, and the flows that lose customers.",
      "Hosting and backend stay on TechRepubliQ if it's already our stack; if it isn't, we still deliver the front-end outcome you paid for.",
      "After the engagement, further changes go through pay-per-edit or a monthly site-update plan.",
    ],
    intake: [
      "URL or app to optimize",
      "What's slow, unclear, or underperforming",
      "Analytics or search data you already have",
      "Expected traffic and conversions",
      "Constraints (brand, freeze windows)",
    ],
    process: [
      {
        title: "Measure, then change",
        body: "The brief and any analytics you share drive the scope. Complexity — pages, components, and how deep the work goes — sets the one-time fee.",
      },
      {
        title: "Human review of the result",
        body: "You preview the optimized experience and use your tier's revision rounds before we call it done.",
      },
      {
        title: "Keep improving if you want",
        body: "Optimization can be a single project. If you want a cadence after launch, monthly update plans cover a bundle of edits each month.",
      },
    ],
    faq: [
      {
        q: "Do I need a TechRepubliQ site already?",
        a: "No. Optimization can cover an existing product. If it's already hosted with us, we can go deeper on the live stack without exposing vendors.",
      },
      {
        q: "Is this the same as post-launch edits?",
        a: "Post-launch edits are for products we already built. Optimization is its own category when performance or growth is the project — with the same Get Priced flow.",
      },
      {
        q: "Will you guarantee a ranking or speed number?",
        a: "We commit to the scoped work and measure before/after. Search and traffic depend on more than the build, so we don't sell a guaranteed rank.",
      },
    ],
  },
  {
    slug: "web-app-management",
    title: "Web / App Management",
    icon: "gauge",
    short: "Ongoing care for a live product — monitoring, updates, and edits.",
    description:
      "For products already live: monitoring, updates, backups and a monthly allowance of edits handled by the team that knows the codebase.",
    hero: "Keep the product you already run healthy, current, and moving.",
    features: [
      "Uptime and error monitoring",
      "Security and dependency updates",
      "Scheduled backups",
      "Monthly allowance of edits",
      "Performance reporting",
      "Add-on and renewal handling",
    ],
    outcomes: [
      "Problems caught before you hear about them",
      "Edits done by people who understand the product",
      "One place to see what is running and what it costs",
    ],
    intake: [
      "The product and where it is hosted today",
      "What you want us to handle",
      "Roughly how many changes a month you expect",
    ],
    process: [
      { title: "Review what is live", body: "We assess the current product and the work you want handled before recommending a safe scope." },
      { title: "A clear service scope", body: "Monitoring, updates, backups, and edit capacity are arranged around the product and your operating needs." },
      { title: "Manage from the dashboard", body: "Usage, services, analytics, and requests stay in one place after handover." },
    ],
    faq: [
      { q: "Can you manage a product you did not build?", a: "Sometimes. We review the codebase first and tell you honestly whether we can take it on safely." },
      { q: "Is this a retainer?", a: "It is a monthly plan tied to your project. It covers monitoring, updates, and an allowance of edits each month." },
      { q: "Can we cancel it?", a: "Yes — each service is cancellable on its own, effective at the next renewal date, with a 7-day grace period if a payment is missed." },
    ],
  },
];

export const projectTiers = [
  { name: "MVP", for: "Solo / small team", revisions: "3 pre-launch reviews", services: "Standard recurring services" },
  { name: "Startup", for: "Funded startup", revisions: "5 pre-launch reviews", services: "Expanded recurring services" },
  { name: "Business", for: "Established business", revisions: "10 pre-launch reviews", services: "Higher service headroom" },
  { name: "Enterprise", for: "Large organization", revisions: "Unlimited reviews", services: "Contact sales" },
] as const;

export const orderStatuses = ["Paid", "In Progress", "Delivered"] as const;