"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageWrap, PrimaryButton, SignalPanel, TextInput, Field } from "@/components/product-ui";
import { api } from "@/lib/api";
import { services } from "@/lib/services";
import {
  formatMoney,
  fxLine,
  installmentSummary,
  PROVIDER_LABEL,
  type PaymentIntent,
} from "@/lib/payments/provider";
import { useTone } from "@/lib/theme";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTone();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [params, setParams] = useState({
    ref: "",
    category: "",
    discountCode: "",
    cadence: "annual",
    devFeeMode: "once",
  });
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [intentError, setIntentError] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams({
      ref: search.get("ref") ?? "",
      category: search.get("category") ?? "",
      discountCode: search.get("discount") ?? "",
      cadence: search.get("cadence") === "monthly" ? "monthly" : "annual",
      devFeeMode: search.get("devFeeMode") === "installments" ? "installments" : "once",
    });
    setEmail(sessionStorage.getItem("customer_email") ?? "");

    if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setScriptLoaded(false);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const emailIsValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  useEffect(() => {
    if (!params.ref || !emailIsValid) {
      setIntent(null);
      setIntentError("");
      return;
    }

    let cancelled = false;
    setIntent(null);
    setIntentError("");
    api.payments
      .createIntent({
        quoteRef: params.ref,
        email: email.trim(),
        cadence: params.cadence === "monthly" ? "monthly" : "annual",
        devFeeMode: params.devFeeMode === "installments" ? "installments" : "once",
        discountCode: params.discountCode || undefined,
      })
      .then((response) => {
        if (cancelled) return;
        if ("intent" in response) setIntent(response.intent);
        else setIntentError(response.error ?? "Could not price this quote");
      })
      .catch((requestError) => {
        if (!cancelled) {
          setIntentError(requestError instanceof Error ? requestError.message : "Could not reach the payment service");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [email, emailIsValid, params.cadence, params.devFeeMode, params.discountCode, params.ref]);

  const service = services.find((item) => item.slug === params.category);
  const total = intent ? formatMoney(intent.amountMinor, intent.currency) : "—";
  const rate = intent ? fxLine(intent.fx, intent.currency) : null;
  const schedule = intent ? installmentSummary(intent.installments, intent.currency) : null;

  const handlePay = async () => {
    if (!emailIsValid) {
      setEmailError("Enter a valid email address so we can send your invoice.");
      return;
    }
    if (!intent) return;

    sessionStorage.setItem("customer_email", email.trim());
    setLoading(true);
    setError("");
    const payload = intent.payload;

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

    if (!scriptLoaded || !window.PaystackPop) {
      setError("Payment window is still loading. Please try again in a moment.");
      setLoading(false);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: payload.publicKey,
        email: payload.email || email.trim(),
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
        callback: () => router.push(`/checkout/confirmation?ref=${params.ref}`),
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

  if (!params.ref) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[480px] px-6 py-24 text-center">
          <p className={t.muted}>Start with a quote before opening checkout.</p>
          <Link href="/quote" className="mt-4 inline-block text-[#C8102E]">
            Get Started
          </Link>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <div className="mx-auto max-w-[720px] px-6 py-12 lg:py-16">
        <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Checkout</h1>
        <p className={`mb-8 mt-2 text-[14px] ${t.muted}`}>
          An unpaid invoice is prepared when payment starts. Pay to begin the build. There are no refunds once payment is made.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <SignalPanel>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C8102E]">Due today</p>
            <p className={`mt-3 font-display text-[36px] font-semibold tabular-nums ${t.ink}`}>{total}</p>
            <p className={`mt-2 text-[13px] ${t.muted}`}>
              {service?.title ?? "Custom project"} · {params.devFeeMode === "installments" ? "12 installments" : "pay once"} · {params.cadence}
            </p>
            {rate && <p className={`mt-4 text-[12px] ${t.muted}`}>{rate}</p>}
            {schedule && <p className={`mt-2 text-[12px] ${t.muted}`}>{schedule}</p>}
            {intent?.fx?.stale && (
              <p className="mt-3 text-[12px] text-amber-700">
                This exchange rate may be out of date — we&apos;ll confirm the final amount before charging.
              </p>
            )}
          </SignalPanel>

          <div className={`rounded-[20px] border p-6 ${t.card}`}>
            <Field label="Invoice email">
              <TextInput
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                }}
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={!!emailError}
              />
            </Field>
            {emailError && <p className="mt-2 text-[12px] text-[#8C2F1B]">{emailError}</p>}

            <p className={`mb-4 mt-5 text-[12px] ${t.muted}`}>
              {intent ? `Pay securely with ${PROVIDER_LABEL[intent.provider]} (${intent.currency})` : "Preparing your payment…"}
            </p>

            <div className={`mb-5 rounded-[12px] border p-4 text-[13px] ${t.muted} ${t.border}`}>
              <p className={`mb-1 font-medium ${t.ink}`}>
                {intent?.installments ? "Twelve payments, no markup" : "No refunds"}
              </p>
              <p>
                {intent?.installments
                  ? "The development fee is split into twelve even payments. The first is taken at checkout; the schedule is shown above."
                  : "Every project is scoped and priced before work starts, and payment is a commitment to the full amount."}{" "}
                See the{" "}
                <Link href="/terms" target="_blank" className="text-[#C8102E] underline">
                  Service Agreement
                </Link>
                .
              </p>
            </div>

            <label className={`mb-5 flex cursor-pointer items-start gap-2 text-[13px] ${t.muted}`}>
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-[#C8102E] underline">
                  Service Agreement
                </Link>
              </span>
            </label>

            {(error || intentError) && <p role="alert" className="mb-4 text-[13px] text-[#8C2F1B]">{error || intentError}</p>}

            <PrimaryButton className="w-full" disabled={!agreed || !intent || loading} onClick={handlePay}>
              {loading ? "Opening payment…" : intent ? `Pay ${total}` : "Preparing…"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
