"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { Button } from "@/components/Button";
import { services } from "@/lib/utils";
import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

// Mock quote generation
function generateQuote(
  category: string,
  description: string,
  timeline: string
) {
  const service = services.find((s) => s.slug === category);
  const basePrice = service?.startingPrice ?? 2000;
  const descLength = description.length;
  const complexity = descLength > 200 ? 1.5 : descLength > 100 ? 1.2 : 1;
  const price = Math.round(basePrice * complexity);
  const isCustom = category === "other";
  const ref = `QR-${Date.now().toString(36).toUpperCase()}`;

  return {
    referenceId: ref,
    price,
    currency: "USD",
    scopeSummary: [
      isCustom
        ? "Custom scoping based on your description"
        : `${service?.title} — full project delivery`,
      "Responsive, production-ready build",
      "Performance optimization & SEO basics",
      "Deployment & hosting configuration",
      "30-day post-delivery support",
    ],
    isEstimated: complexity > 1.3,
    timeline:
      timeline === "asap"
        ? "2–3 weeks"
        : timeline === "1-2 weeks"
          ? "1–3 weeks"
          : timeline === "3-4 weeks"
            ? "3–5 weeks"
            : timeline === "1-2 months"
              ? "4–8 weeks"
              : "To be confirmed",
  };
}

export default function QuoteResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAllScope, setShowAllScope] = useState(false);
  const [humanReview, setHumanReview] = useState(false);

  const category = searchParams.get("category") ?? "";
  const description = searchParams.get("desc") ?? "";
  const timeline = searchParams.get("timeline") ?? "";

  const quote = generateQuote(category, description, timeline);
  const scopeItems = quote.scopeSummary;

  const [copied, setCopied] = useState(false);
  const copyRef = () => {
    navigator.clipboard.writeText(quote.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[560px] px-md py-xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <CornerBracketFrame>
          {/* Header */}
          <div className="flex items-start justify-between mb-lg">
            <div>
              <p className="text-xs text-slate mb-xs">Quote reference</p>
              <p className="font-mono text-sm text-ink">
                {quote.referenceId}
              </p>
            </div>
            <button
              onClick={copyRef}
              className="text-xs text-accent hover:text-accent-hover transition-colors duration-150"
              aria-label="Copy quote reference"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Status tag */}
          {quote.isEstimated && !humanReview && (
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-amber/10 text-amber text-xs rounded-sm mb-lg">
              <Clock size={12} />
              Estimated — pending confirmation
            </div>
          )}

          <AnimatePresence mode="wait">
            {humanReview ? (
              <motion.div
                key="review-confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="py-lg text-center"
              >
                <CheckCircle2
                  size={40}
                  className="mx-auto text-success mb-md"
                  aria-hidden="true"
                />
                <h2 className="text-md font-display font-semibold text-ink mb-sm">
                  Review requested
                </h2>
                <p className="text-sm text-slate mb-lg">
                  A team member will follow up within 24 hours to review your
                  quote. You&apos;ll be able to proceed to payment once the
                  review is confirmed.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setHumanReview(false)}
                >
                  Back to quote
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="quote-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {/* What's included */}
                <h2 className="text-md font-display font-semibold text-ink mb-md">
                  What&apos;s included
                </h2>
                <ul className="space-y-sm mb-lg">
                  {(showAllScope ? scopeItems : scopeItems.slice(0, 5)).map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-sm text-sm text-slate"
                      >
                        <span className="text-accent mt-[3px] shrink-0">—</span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
                {scopeItems.length > 5 && (
                  <button
                    onClick={() => setShowAllScope(!showAllScope)}
                    className="text-xs text-accent hover:text-accent-hover transition-colors duration-150 mb-lg"
                  >
                    {showAllScope ? "Show less" : `Show all (${scopeItems.length})`}
                  </button>
                )}

                {/* Timeline */}
                <div className="pb-lg border-b border-line mb-lg">
                  <p className="text-xs text-slate mb-xs">Estimated timeline</p>
                  <p className="font-mono text-sm text-ink">{quote.timeline}</p>
                </div>

                {/* Price */}
                <div className="mb-lg">
                  <p className="text-xs text-slate mb-xs">Total</p>
                  <p className="font-mono text-[28px] leading-[36px] font-medium text-ink">
                    <data value={quote.price.toString()}>
                      ${quote.price.toLocaleString()} {quote.currency}
                    </data>
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-sm">
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/checkout?ref=${quote.referenceId}&amount=${quote.price}&category=${category}`
                      )
                    }
                  >
                    Proceed to Payment
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setHumanReview(true)}
                  >
                    Request Human Review
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CornerBracketFrame>
      </motion.div>
    </div>
  );
}