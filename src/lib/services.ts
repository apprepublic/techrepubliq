/**
 * Service catalogue for the marketing site (WP2).
 *
 * Copy follows PRD v2.5: value first, price as an output of the brief (§4.4 / positioning
 * note), no vendor disclosure (§7), one-time development fee (§4.2), human-in-the-loop
 * pre-launch reviews (§5), hosting and backend always included (§7).
 *
 * `fromCents` is derived from the pricing model's own floor for the category — it is never
 * typed in by hand, so it can't drift from the engine.
 */

import { CATEGORIES, computeDevFeeCents, TIERS, revisionLabel } from "@/lib/product";
import { floorEstimate } from "@/lib/pricing/heuristic";

export type Service = {
  slug: string;
  title: string;
  /** One line, used on cards. */
  short: string;
  /** Two sentences under the H1. */
  hero: string;
  /** What's included in the build. */
  features: string[];
  /** What changes for the business. */
  outcomes: string[];
  /** What we need from you to start. */
  intake: string[];
  /** How it's built. */
  process: string[];
  faq: { q: string; a: string }[];
  /** Cheapest price the engine can produce for this category. */
  fromCents: number;
};

const CONTENT: Omit<Service, "fromCents">[] = [
  {
    slug: "web-development",
    title: "Web Development",
    short: "Websites, web apps and platforms — built, hosted and launched.",
    hero:
      "From a marketing site to a full platform with accounts, dashboards and payments. You describe it, we price it once, and a real team builds and launches it.",
    features: [
      "Responsive, mobile-first build",
      "Front end and back end, including API and database",
      "Hosting and backend included, always",
      "Performance and Core Web Vitals work",
      "SEO-friendly structure",
      "Launch on your own domain, or one we register for you",
    ],
    outcomes: [
      "One team accountable from first sketch to launch",
      "A price agreed before a line of code is written",
      "Nothing to maintain that you didn't ask for",
    ],
    intake: [
      "A short brief describing what the site or app needs to do",
      "Your logo and any brand assets you already have",
      "A domain you own, or ask us to register one",
    ],
    process: [
      "Get Started and pick a tier",
      "Send your brief and assets",
      "Get Priced — one total, no line items",
      "We build, with pre-launch review rounds",
      "Launch, then manage it from your dashboard",
    ],
    faq: [
      {
        q: "How is the price worked out?",
        a: "One development fee computed from your brief — a base fee, plus a rate per page and per component, adjusted for complexity. It's the same math at every tier. You see a single total before you pay.",
      },
      {
        q: "Do I need to arrange hosting?",
        a: "No. Hosting and backend are always provided by TechRepubliQ, whether you bring your own domain or buy one through us.",
      },
      {
        q: "What if the first build isn't right?",
        a: "Every tier includes pre-launch review rounds, and you can buy more before launch if you need them. There are no refunds once payment is made, so the review rounds are the path to getting it right.",
      },
    ],
  },
  {
    slug: "app-development",
    title: "App Development",
    short: "iOS and Android apps — UI/UX preview, APK, store deployment.",
    hero:
      "A real team designs and builds your app, then takes it all the way to the App Store and Play Store. You approve a UI/UX preview before a single build starts.",
    features: [
      "UI/UX preview to approve before the build",
      "iOS and Android from one codebase",
      "Downloadable APK while you're still reviewing",
      "Push notifications and offline behaviour where needed",
      "API integration with your existing systems",
      "App Store and Play Store submission handled",
    ],
    outcomes: [
      "See and approve the interface before it's built",
      "A testable build in your hands early",
      "Submission and review handled end to end",
    ],
    intake: [
      "What the app needs to do, and for whom",
      "Your logo, brand colours and any existing designs",
      "Your Apple Developer and Google Play accounts, if you have them",
    ],
    process: [
      "Get Started and pick a tier",
      "Send your brief and assets",
      "Get Priced — one total, no line items",
      "Approve the UI/UX preview, then download a build",
      "We submit to the App Store and Play Store",
    ],
    faq: [
      {
        q: "Can I see it before it's built?",
        a: "Yes. Mobile projects show a UI/UX preview first. Once you approve it, you get a downloadable APK to test, and then store deployment proceeds.",
      },
      {
        q: "Do I need my own developer accounts?",
        a: "For store deployment, yes — your Apple Developer and Google Play accounts stay yours. We handle the technical submission.",
      },
      {
        q: "Is the fee really one-time?",
        a: "The build is one development fee, payable at once or over 12 monthly payments. There are no tokens that can run out mid-build. Tokens only apply to AI features you keep running after launch.",
      },
    ],
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    short: "Agents and workflows that take manual work off your team.",
    hero:
      "We build the automation your team keeps describing in meetings — document processing, routing, reporting, follow-ups — and run it for you afterwards.",
    features: [
      "Custom agents and workflow pipelines",
      "Document and data processing",
      "Connections to the tools you already use",
      "Monitoring and alerting",
      "Human review where it matters",
      "Ongoing token allowance for AI features",
    ],
    outcomes: [
      "Hours of manual work removed each week",
      "Automations watched, not just switched on",
      "A plain-language explanation of what runs and when",
    ],
    intake: [
      "The task you want taken off your team's plate",
      "Where the inputs come from and where results should go",
      "Any tools it needs to connect to",
    ],
    process: [
      "Get Started and pick a tier",
      "Describe the work you want automated",
      "Get Priced — one total, no line items",
      "We build and test it against your real inputs",
      "Launch, then monitor from your dashboard",
    ],
    faq: [
      {
        q: "Will we know which AI is running it?",
        a: "We don't disclose the underlying vendors — you see and pay for the service as a single line item, and our team handles any issue with it directly.",
      },
      {
        q: "What happens when the included tokens run out?",
        a: "AI features carry a monthly token allowance. If you use more, we'll tell you before anything stops; the build itself is never metered.",
      },
      {
        q: "Can a human check the output?",
        a: "Yes, and for most automations we recommend it. We build the review step in rather than leaving it to chance.",
      },
    ],
  },
  {
    slug: "ai-integration",
    title: "AI Integration",
    short: "Add intelligence to a product you already run.",
    hero:
      "Chat, search, recommendations, generation — added to the product you have today, without rebuilding it from scratch.",
    features: [
      "Chatbots and conversational interfaces",
      "Natural-language search over your own data",
      "Content generation and summarisation",
      "Recommendations and classification",
      "Integration with your current systems",
      "Ongoing token allowance for AI features",
    ],
    outcomes: [
      "New capability without a rewrite",
      "AI features that fit the product you already have",
      "One line item, no vendor juggling",
    ],
    intake: [
      "What the product does today, and what should feel smarter",
      "Where your data lives",
      "Any limits on what the AI should and shouldn't do",
    ],
    process: [
      "Get Started and pick a tier",
      "Describe the product and the capability you want",
      "Get Priced — one total, no line items",
      "We integrate against your existing system",
      "Launch, then tune from your dashboard",
    ],
    faq: [
      {
        q: "Do we have to rebuild our app?",
        a: "No. Integration work is scoped against your current product. If something does need rebuilding, we'll say so in the brief stage, before you pay.",
      },
      {
        q: "Which model do you use?",
        a: "We pick what fits the job and don't disclose vendors. You see the capability and the single line item it costs.",
      },
      {
        q: "How is it priced after launch?",
        a: "AI features are a recurring service with a monthly token allowance. The build itself is a one-time fee.",
      },
    ],
  },
  {
    slug: "training",
    title: "Training",
    short: "Hands-on enablement so your team can run what we build.",
    hero:
      "Sessions built around your product, not a generic syllabus. Your team finishes able to run it, extend it, and know who to call.",
    features: [
      "Role-based sessions — admin, operations, support",
      "Recorded walkthroughs of your own product",
      "Runbooks for everyday operations",
      "Handover of dashboards and analytics",
      "Live Q&A after go-live",
      "Optional refresher sessions",
    ],
    outcomes: [
      "Your team runs the product without waiting on us",
      "Recordings and runbooks that stay with you",
      "Fewer support tickets after handover",
    ],
    intake: [
      "Who needs training, and what each group does day to day",
      "Whether this is for a product we built or one you already run",
      "Roughly how many people per session",
    ],
    process: [
      "Get Started and pick a tier",
      "Tell us who you're training and on what",
      "Get Priced — one total, no line items",
      "We run the sessions and record them",
      "Materials handed over, with a live Q&A",
    ],
    faq: [
      {
        q: "Is this generic training?",
        a: "No. Everything is built around your product — the recordings, the runbooks and the examples all come from what you actually run.",
      },
      {
        q: "Can you train a team on a product you didn't build?",
        a: "Sometimes. We look at the product first and tell you honestly whether we can do it well.",
      },
      {
        q: "Do we keep the materials?",
        a: "Yes. Recordings and runbooks are yours to keep and reuse with new staff.",
      },
    ],
  },
  {
    slug: "optimization",
    title: "Optimization",
    short: "Speed, cost and Core Web Vitals work on something already live.",
    hero:
      "We audit what you have, fix what's slow or expensive, and show you before-and-after numbers you can check yourself.",
    features: [
      "Performance audit with before/after benchmarks",
      "Core Web Vitals improvement",
      "Image and asset optimisation",
      "Caching and CDN configuration",
      "Database and query tuning",
      "Ongoing monitoring setup",
    ],
    outcomes: [
      "Faster pages, measured not asserted",
      "Lower infrastructure spend",
      "Monitoring that tells you before users do",
    ],
    intake: [
      "The URL or product, and what feels slow",
      "Any performance data you already have",
      "Whether you can give us access to the stack",
    ],
    process: [
      "Get Started and pick a tier",
      "Describe what's slow and give us access",
      "Get Priced — one total, no line items",
      "We audit, fix, and benchmark again",
      "Monitoring handed over on your dashboard",
    ],
    faq: [
      {
        q: "How much faster will it be?",
        a: "It depends on what's wrong. We benchmark before and after so the improvement is a number you can check, not a promise.",
      },
      {
        q: "Do you need access to our hosting?",
        a: "For deep work, yes — or we migrate the project onto our own hosting and backend, which is included either way.",
      },
      {
        q: "Do you optimise AI features too?",
        a: "Yes. Inference speed, token usage and response times are all in scope.",
      },
    ],
  },
  {
    slug: "web-app-management",
    title: "Web / App Management",
    short: "Ongoing care for a live product — monitoring, updates, edits.",
    hero:
      "For products already live: monitoring, updates, backups and a monthly allowance of edits handled by the team that knows the codebase.",
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
      "Edits done by people who built it",
      "One place to see what's running and what it costs",
    ],
    intake: [
      "The product, and where it's hosted today",
      "What you want us to handle",
      "Roughly how many changes a month you expect",
    ],
    process: [
      "Get Started and pick a tier",
      "Tell us what's live and what you need handled",
      "Get Priced — one total, no line items",
      "We review the codebase and take it on",
      "Monitoring and edits run from your dashboard",
    ],
    faq: [
      {
        q: "Can you manage a product you didn't build?",
        a: "Sometimes. We review the codebase first and tell you honestly whether we can take it on safely.",
      },
      {
        q: "Is this a retainer?",
        a: "It's a monthly plan tied to your project. It covers monitoring, updates and an allowance of edits each month.",
      },
      {
        q: "Can we cancel it?",
        a: "Yes — each service is cancellable on its own, effective at the next renewal date, with a 7-day grace period if a payment is missed.",
      },
    ],
  },
];

export const services: Service[] = CATEGORIES.map((category) => {
  const content = CONTENT.find((c) => c.slug === category.slug);
  if (!content) throw new Error(`No service copy for ${category.slug}`);
  const floor = floorEstimate(category.slug);
  return {
    ...content,
    fromCents: computeDevFeeCents({ ...floor, complexity: "standard" }),
  };
});

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Tier cards for marketing surfaces — derived from the model, never hand-typed. */
export const projectTiers = TIERS.map((tier) => ({
  name: tier.name,
  for:
    tier.id === "enterprise"
      ? "Large organizations"
      : tier.id === "business"
        ? "Established businesses"
        : tier.id === "startup"
          ? "Funded startups shipping fast"
          : "Solo builders & small teams",
  services: tier.monthlyCents === null ? "Contact Sales" : `$${tier.monthlyCents / 100}/mo`,
  revisions: revisionLabel(tier.id),
}));
