"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import Link from "next/link";

const faqGroups = [
  {
    label: "Getting a Quote",
    id: "getting-a-quote",
    items: [
      {
        id: "quote-process",
        question: "How does the quote process work?",
        answer:
          "You describe your project using our structured intake form. Our AI quoting engine analyzes your requirements and generates a clear, itemized quote. You can proceed to payment or request a human review.",
      },
      {
        id: "quote-binding",
        question: "Is the quote binding?",
        answer:
          "Yes. The price you see on your quote is the price you pay — provided the scope doesn't change after we begin work.",
      },
      {
        id: "no-category",
        question: "What if my project doesn't fit a category?",
        answer:
          "Select 'Not sure — describe my project' on the intake form. We'll review your description and match it to the right service category.",
      },
    ],
  },
  {
    label: "Payment",
    id: "payment",
    items: [
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer:
          "If you're in Nigeria, you pay via Paystack in Naira. International customers pay via Stripe in USD. Your payment method is automatically selected based on your location.",
      },
      {
        id: "discounts",
        question: "Do you offer discounts?",
        answer:
          "We occasionally offer discount codes for specific campaigns. Enter your code at checkout to apply it.",
      },
      {
        id: "refund-policy",
        question: "What's your refund policy?",
        answer:
          "We stand by our work. If we fail to deliver what was quoted, you're eligible for a full refund. Contact us within 14 days of payment to initiate a review.",
      },
    ],
  },
  {
    label: "Migration & Ownership",
    id: "migration-ownership",
    items: [
      {
        id: "who-owns",
        question: "Who owns the final product?",
        answer:
          "You own the front-end code and content of your product. Our proprietary backend infrastructure, AI automation components, and internal tooling remain our property — they're what let us deliver quickly and reliably.",
      },
      {
        id: "can-migrate",
        question: "Can I migrate my project later?",
        answer:
          "Yes. You can request migration files from your dashboard at any time. You'll receive your front-end code and applicable backend files. Proprietary AI components are not portable.",
      },
      {
        id: "domain-handling",
        question: "What happens to my domain?",
        answer:
          "We'll transfer your domain to the registrar or account you specify on request. We don't disclose where the domain was originally registered.",
      },
    ],
  },
  {
    label: "Support",
    id: "support",
    items: [
      {
        id: "after-payment",
        question: "What happens after I pay?",
        answer:
          "You'll receive an invoice by email and your order will appear in your dashboard. We'll begin work according to the timeline quoted.",
      },
      {
        id: "ongoing-support",
        question: "Can I get ongoing support after delivery?",
        answer:
          "Yes. Ongoing management and support can be added as a separate service. Contact us for details.",
      },
      {
        id: "contact",
        question: "How do I contact you?",
        answer:
          "Use the contact form on this page, or email us directly. We typically respond within 24 hours.",
      },
    ],
  },
];

export default function PricingPage() {
  const [initialOpen, setInitialOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setInitialOpen(hash);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-[760px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        How pricing works
      </h1>

      <div className="dimension-line w-full mb-xl">
        <div className="dimension-tick flex-1 flex flex-col items-center">
          <span className="tick-label mt-sm text-sm font-body text-slate">
            Describe
          </span>
        </div>
        <div className="dimension-tick flex-1 flex flex-col items-center active">
          <span className="tick-label mt-sm text-sm font-body text-accent">
            Quote
          </span>
        </div>
        <div className="dimension-tick flex-1 flex flex-col items-center">
          <span className="tick-label mt-sm text-sm font-body text-slate">
            Pay
          </span>
        </div>
        <div className="dimension-tick flex-1 flex flex-col items-center">
          <span className="tick-label mt-sm text-sm font-body text-slate">
            Delivered
          </span>
        </div>
      </div>

      <p className="text-base leading-relaxed text-slate mb-xl">
        Every project is different, so we don&apos;t use fixed price tables. Instead, you
        describe what you need, and our AI generates a precise, itemized quote
        based on your scope. The price you see is the price you pay — no hidden
        fees, no surprises.
      </p>

      <div className="space-y-xl">
        {faqGroups.map((group) => (
          <section key={group.id} id={group.id}>
            <h2 className="font-display text-md font-semibold text-slate mb-md uppercase tracking-wider text-sm">
              {group.label}
            </h2>
            <Accordion
              items={group.items.map((item) => ({
                id: item.id,
                question: item.question,
                answer: item.answer,
              }))}
              initialOpen={initialOpen}
            />
          </section>
        ))}
      </div>

      <div className="mt-xl pt-xl border-t border-line text-center">
        <p className="text-base text-slate mb-md">
          Still have a question?
        </p>
        <Link href="/quote">
          <Button variant="ghost">Contact us</Button>
        </Link>
      </div>
    </div>
  );
}