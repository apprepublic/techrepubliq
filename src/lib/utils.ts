import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteConfig = {
  name: "TechRepubliQ",
  tagline: "Your product, built by a real team. Priced once.",
  email: "hello@techrepubliq.com",
  copyright: `© ${new Date().getFullYear()} TechRepubliQ. All rights reserved.`,
};

export const services = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Full-stack web applications, landing pages, and web platforms built with modern frameworks and optimized for performance.",
    startingPrice: 2500,
    features: [
      "Responsive, mobile-first design",
      "Custom front-end development",
      "Back-end API & database setup",
      "Performance optimization",
      "SEO-friendly architecture",
      "Deployment & hosting setup",
    ],
    faq: [
      {
        q: "What kind of websites do you build?",
        a: "Everything from marketing landing pages to full SaaS platforms, e-commerce stores, and internal dashboards.",
      },
      {
        q: "Do you use templates?",
        a: "No. Every project is custom-built from the ground up to match your specific requirements and brand.",
      },
      {
        q: "How long does a typical web project take?",
        a: "A standard website takes 2–4 weeks. Complex web applications range from 4–12 weeks depending on scope.",
      },
    ],
  },
  {
    slug: "app-development",
    title: "App Development",
    description:
      "Cross-platform mobile and desktop applications built with React Native, Flutter, or native frameworks for iOS and Android.",
    startingPrice: 5000,
    features: [
      "iOS & Android support",
      "Cross-platform or native build",
      "Push notification integration",
      "Offline mode & data sync",
      "API integration",
      "App store submission support",
    ],
    faq: [
      {
        q: "Do you build for both iOS and Android?",
        a: "Yes. We build cross-platform apps that run on both platforms, or native apps if your requirements demand it.",
      },
      {
        q: "Can you publish my app to the App Store?",
        a: "We handle the technical submission process, but you need your own Apple Developer and Google Play accounts.",
      },
    ],
  },
  {
    slug: "training",
    title: "Training",
    description:
      "Hands-on enablement for your team — how to run, maintain, and extend the product we build, in plain language.",
    startingPrice: 1500,
    features: [
      "Role-based sessions (admin, ops, support)",
      "Recorded walkthroughs of your product",
      "Runbooks for everyday operations",
      "Handover of dashboards and analytics",
      "Q&A session after go-live",
      "Optional refresher sessions",
    ],
    faq: [
      {
        q: "Who is the training for?",
        a: "Anyone on your team who runs the product day to day — admins, operations, support, or marketing. Sessions are split by role.",
      },
      {
        q: "Do we get materials to keep?",
        a: "Yes. Recordings and runbooks stay with you, and they cover your product specifically — not generic material.",
      },
    ],
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    description:
      "Custom AI agents, workflow automation, and intelligent systems that reduce manual work and increase efficiency.",
    startingPrice: 3000,
    features: [
      "Custom AI agent development",
      "Workflow automation pipelines",
      "Data processing & analysis",
      "Third-party API integration",
      "Monitoring & alerting",
      "Scalable deployment",
    ],
    faq: [
      {
        q: "What can AI automation do for my business?",
        a: "Automate repetitive tasks, process documents, handle customer inquiries, generate reports, and connect your tools together.",
      },
      {
        q: "Do I need technical knowledge to use it?",
        a: "No. We build systems that are designed for non-technical users to operate and manage.",
      },
    ],
  },
  {
    slug: "ai-integration",
    title: "AI Integration",
    description:
      "Add intelligence to your existing products — chatbots, recommendation engines, content generation, and API-connected AI workflows.",
    startingPrice: 2000,
    features: [
      "Chatbot & conversational AI",
      "Content generation tools",
      "Recommendation engines",
      "Natural language search",
      "Image & data analysis",
      "Existing system integration",
    ],
    faq: [
      {
        q: "Can you add AI to my existing app?",
        a: "Yes. We integrate AI capabilities into your current product without rebuilding it from scratch.",
      },
      {
        q: "What AI models do you use?",
        a: "We evaluate and select the best model for each use case — OpenAI, Anthropic, open-source models, or custom fine-tuned models.",
      },
    ],
  },
  {
    slug: "optimization",
    title: "Optimization",
    description:
      "Speed up your website, reduce infrastructure costs, and improve user experience through performance auditing and optimization.",
    startingPrice: 1000,
    features: [
      "Performance audit & report",
      "Core Web Vitals improvement",
      "Image & asset optimization",
      "Caching & CDN configuration",
      "Database query optimization",
      "Ongoing monitoring setup",
    ],
    faq: [
      {
        q: "How much faster can you make my site?",
        a: "Most sites see 40–60% improvement in load times after optimization. We provide before/after benchmarks.",
      },
      {
        q: "Do you optimize AI models too?",
        a: "Yes. We optimize model inference speed, reduce token usage, and improve response times for AI-powered features.",
      },
    ],
  },
  {
    slug: "web-app-management",
    title: "Web / App Management",
    description:
      "Ongoing care for a live product — monitoring, updates, backups, and a monthly allowance of edits handled by our team.",
    startingPrice: 500,
    features: [
      "Uptime & error monitoring",
      "Security and dependency updates",
      "Scheduled backups",
      "Monthly edit allowance",
      "Performance reporting",
      "Add-on and renewal handling",
    ],
    faq: [
      {
        q: "Is this a retainer?",
        a: "It is a monthly plan tied to your project. It covers monitoring, updates, and an allowance of edits each month.",
      },
      {
        q: "Can you manage a product you did not build?",
        a: "Sometimes. We review the codebase first and tell you honestly whether we can take it on safely.",
      },
    ],
  },
];

export const projectTiers = [
  { name: "MVP", for: "Solo builders & small teams", services: "$5/mo", revisions: "3 pre-launch reviews" },
  { name: "Startup", for: "Funded startups shipping fast", services: "$25/mo", revisions: "5 pre-launch reviews" },
  { name: "Business", for: "Established businesses", services: "$50/mo", revisions: "10 pre-launch reviews" },
  { name: "Enterprise", for: "Large organizations", services: "Contact Sales", revisions: "Unlimited pre-launch reviews" },
] as const;

export const orderStatuses = ["Paid", "In Progress", "Delivered"] as const;