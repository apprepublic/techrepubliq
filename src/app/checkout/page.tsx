"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/Button";
import { services } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoOverride, setGeoOverride] = useState(false);
  const [params, setParams] = useState({ ref: "", amount: 0, category: "", discountCode: "" });

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      ref: sp.get("ref") ?? "",
      amount: Number(sp.get("amount") ?? "0"),
      category: sp.get("category") ?? "",
      discountCode: sp.get("discount") ?? "",
    });
  }, []);

  const service = services.find((s) => s.slug === params.category);
  const [isNigeria, setIsNigeria] = useState(false);

  useEffect(() => {
    setIsNigeria(geoOverride);
  }, [geoOverride]);

  const handlePay = async () => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1500));
    router.push(`/checkout/confirmation?ref=${params.ref}`);
  };

  return (
    <div className="mx-auto max-w-[960px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Checkout
      </h1>
      <div className="flex flex-col lg:flex-row gap-xl">
        <div className="flex-1 max-w-[440px]">
          <div className="bg-accent-dim border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">
              Order summary
            </h2>
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
                <span className="font-mono text-ink text-lg">
                  {isNigeria ? "₦" : "$"}{isNigeria ? (params.amount * 1500).toLocaleString() : params.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-[440px]">
          <div className="border border-line rounded-sm p-lg">
            <h2 className="text-md font-display font-semibold text-ink mb-md">
              Payment
            </h2>
            <p className="text-xs text-slate mb-md">
              Pay with {isNigeria ? "Paystack (NGN)" : "Stripe (USD)"}
            </p>
            {!isNigeria && (
              <button onClick={() => setGeoOverride(true)} className="block mb-md text-xs text-accent hover:text-accent-hover underline">
                Paying from Nigeria? Switch to Naira
              </button>
            )}
            {isNigeria && geoOverride && (
              <button onClick={() => setGeoOverride(false)} className="block mb-md text-xs text-accent hover:text-accent-hover underline">
                Paying internationally? Switch to USD
              </button>
            )}
            <div className="border border-line rounded-sm p-md mb-lg text-sm text-slate">
              <p className="mb-sm font-medium text-ink">Card details</p>
              <div className="space-y-sm">
                <div className="h-10 bg-paper border border-line rounded-sm px-sm flex items-center text-slate">Card number</div>
                <div className="flex gap-sm">
                  <div className="h-10 bg-paper border border-line rounded-sm px-sm flex items-center text-slate flex-1">MM/YY</div>
                  <div className="h-10 bg-paper border border-line rounded-sm px-sm flex items-center text-slate flex-1">CVC</div>
                </div>
              </div>
            </div>
            <label className="flex items-start gap-sm text-sm text-slate mb-lg cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-accent" />
              <span>I agree to the{" "}<a href="/terms" target="_blank" className="text-accent hover:text-accent-hover underline">Service Agreement</a></span>
            </label>
            {error && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }} role="alert"
                className="bg-error/10 border border-error rounded-sm p-md text-sm text-error mb-md">
                {error}
              </motion.div>
            )}
            <Button className="w-full" disabled={!agreed} loading={loading} onClick={handlePay}>
              Pay {isNigeria ? "₦" : "$"}{isNigeria ? (params.amount * 1500).toLocaleString() : params.amount.toLocaleString()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}