"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { services } from "@/lib/utils";
import { api } from "@/lib/api";
import { formatMoney, fxLine, PROVIDER_LABEL, type PaymentIntent } from "@/lib/payments/provider";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [params, setParams] = useState({ ref: "", category: "", discountCode: "" });
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [intentError, setIntentError] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      ref: sp.get("ref") ?? "",
      category: sp.get("category") ?? "",
      discountCode: sp.get("discount") ?? "",
    });

    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // The total comes from the server, recomputed from the stored quote. The browser never
  // works out money, and the rate shown is the one locked onto the intent.
  useEffect(() => {
    if (!params.ref) return;
    let cancelled = false;

    api.payments
      .createIntent({
        quoteRef: params.ref,
        email: sessionStorage.getItem("customer_email") || undefined,
        discountCode: params.discountCode || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        if ("intent" in res) setIntent(res.intent);
        else setIntentError(res.error ?? "Could not price this quote");
      })
      .catch(() => {
        if (!cancelled) setIntentError("Could not reach the payment service");
      });

    return () => {
      cancelled = true;
    };
  }, [params.ref, params.discountCode]);

  const service = services.find((s) => s.slug === params.category);
  const total = intent ? formatMoney(intent.amountMinor, intent.currency) : "—";
  const rate = intent ? fxLine(intent.fx, intent.currency) : null;

  const handlePay = async () => {
    if (!intent) return;
    setLoading(true);
    setError("");

    const payload = intent.payload;

    // Stripe and PayPal are hosted: the browser just follows the URL.
    if (payload.kind === "stripe") {
      if (!payload.url) {
        setError("Could not open the card payment page. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = payload.url;
      return;
    }
    if (payload.kind === "paypal") {
      if (!payload.approvalUrl) {
        setError("Could not open PayPal. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = payload.approvalUrl;
      return;
    }

    // Paystack Inline — the key, amount and reference all come from the intent.
    if (!scriptLoaded || !window.PaystackPop) {
      setError("Payment window is still loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: payload.publicKey,
        email: payload.email || sessionStorage.getItem("customer_email") || "customer@example.com",
        amount: payload.amountKobo,
        currency: intent.currency,
        ref: payload.reference,
        accessCode: payload.accessCode ?? undefined,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: sessionStorage.getItem("customer_name") || "Customer",
            },
            {
              display_name: "Service",
              variable_name: "service",
              value: service?.title || "Custom project",
            },
          ],
        },
        callback: () => {
          router.push(`/checkout/confirmation?ref=${params.ref}`);
        },
        onClose: () => {
          setLoading(false);
          setError("Payment window was closed. You can try again.");
        },
      });
      handler.openIframe();
    } catch {
      setError("Could not load Paystack. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[960px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 max-w-[440px]">
          <div className="bg-accent-dim border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">Order summary</h2>
            <div className="space-y-sm text-sm">
              <div className="flex justify-between">
                <span className="text-slate">Service</span>
                <span className="font-mono text-ink">{service?.title ?? "Custom project"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Quote ref</span>
                <span className="font-mono text-ink">{params.ref}</span>
              </div>
              {intent?.discountApplied && (
                <div className="flex justify-between">
                  <span className="text-slate">Discount</span>
                  <span className="font-mono text-success">
                    −{formatMoney(intent.discountAmountCents, "USD")}
                  </span>
                </div>
              )}
              <div className="border-t border-line pt-sm flex justify-between font-medium">
                <span className="text-ink">Total</span>
                <span className="font-mono text-ink text-lg">{total}</span>
              </div>
              {rate && <p className="text-xs text-slate pt-xs">{rate}</p>}
              {intent?.fx?.stale && (
                <p className="text-xs text-warning pt-xs">
                  This rate may be out of date — we&apos;ll confirm the final amount before charging.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[440px]">
          <div className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">Payment</h2>

            <p className="text-xs text-slate mb-md">
              {intent
                ? `Pay securely with ${PROVIDER_LABEL[intent.provider]} (${intent.currency})`
                : "Preparing your payment…"}
            </p>

            <div className="border border-line rounded-sm p-md mb-lg text-sm text-slate bg-paper">
              <p className="text-ink font-medium mb-sm">No refunds</p>
              <p>
                Every project is scoped and priced before work starts, and payment is a commitment to
                the full amount. See the{" "}
                <a href="/terms" target="_blank" className="text-accent hover:text-accent-hover underline">
                  Service Agreement
                </a>{" "}
                for the details.
              </p>
            </div>

            <label className="flex items-start gap-sm text-sm text-slate mb-lg cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-accent" />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-accent hover:text-accent-hover underline">
                  Service Agreement
                </a>
              </span>
            </label>

            {(error || intentError) && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                role="alert"
                className="bg-error/10 border border-error rounded-sm p-md text-sm text-error mb-md"
              >
                {error || intentError}
              </motion.div>
            )}

            <Button
              className="w-full"
              disabled={!agreed || !intent || loading}
              loading={loading || (!intent && !intentError)}
              onClick={handlePay}
            >
              {intent ? `Pay ${total}` : "Preparing…"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
