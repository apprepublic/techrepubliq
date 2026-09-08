"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { services } from "@/lib/utils";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_PUBLIC_KEY = "pk_live_af6dd65a2044289cce39d4a5b910d490c41037e5";

export default function CheckoutPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [params, setParams] = useState({ ref: "", amount: 0, amountCents: 0, category: "", discountCode: "" });

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const amt = Number(sp.get("amount") ?? "0");
    setParams({
      ref: sp.get("ref") ?? "",
      amount: amt,
      amountCents: amt * 100,
      category: sp.get("category") ?? "",
      discountCode: sp.get("discount") ?? "",
    });

    // Load Paystack inline script
    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const service = services.find((s) => s.slug === params.category);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    // Always use Paystack live key
    const email = sessionStorage.getItem("customer_email") || "customer@example.com";
    const customerName = sessionStorage.getItem("customer_name") || "Customer";

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: params.amountCents,
        currency: "NGN",
        ref: params.ref || `QR-${Date.now()}`,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: customerName },
            { display_name: "Service", variable_name: "service", value: service?.title || "Custom project" },
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
    } catch (e) {
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
              {params.discountCode && (
                <div className="flex justify-between">
                  <span className="text-slate">Discount</span>
                  <span className="font-mono text-success">{params.discountCode}</span>
                </div>
              )}
              <div className="border-t border-line pt-sm flex justify-between font-medium">
                <span className="text-ink">Total</span>
                <span className="font-mono text-ink text-lg">₦{(params.amount * 1500).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[440px]">
          <div className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">Payment</h2>

            <p className="text-xs text-slate mb-md">Pay securely with Paystack (NGN)</p>

            <div className="border border-line rounded-sm p-md mb-lg text-sm text-slate bg-paper">
              <p className="text-ink font-medium mb-sm">Paystack checkout</p>
              <p>You will be redirected to Paystack&apos;s secure payment page to complete your transaction using your preferred payment method (card, bank transfer, USSD, or QR).</p>
            </div>

            <label className="flex items-start gap-sm text-sm text-slate mb-lg cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-accent" />
              <span>I agree to the{" "}<a href="/terms" target="_blank" className="text-accent hover:text-accent-hover underline">Service Agreement</a></span>
            </label>

            {error && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} role="alert"
                className="bg-error/10 border border-error rounded-sm p-md text-sm text-error mb-md">
                {error}
              </motion.div>
            )}

            <Button className="w-full" disabled={!agreed} loading={loading} onClick={handlePay}>
              Pay ₦{(params.amount * 1500).toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}