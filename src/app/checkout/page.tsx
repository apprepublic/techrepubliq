"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_KEY, formatUsd, serviceTitle, type IntakeState, type BillingCadence } from "@/lib/product";
import { saveProject, type StoredProject } from "@/lib/store";
import { addonCatalog, addonMonthly, computePrice, tiers } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { PageWrap, PrimaryButton, SignalPanel, TextInput, Field } from "@/components/product-ui";
import Link from "next/link";

type LastOrder = { intake: IntakeState; totalDue: number; cadence: BillingCadence };

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTone();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw));
      setEmail(sessionStorage.getItem("customer_email") || "");
    } catch {
      setOrder(null);
    }
  }, []);

  if (!order) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[480px] px-6 py-24 text-center">
          <p className={t.muted}>Nothing to pay yet.</p>
          <Link href="/quote" className="mt-4 inline-block text-[#C8102E]">
            Get Started
          </Link>
        </div>
      </PageWrap>
    );
  }

  const pay = async () => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    const id = `PRJ-${Date.now().toString(36).toUpperCase()}`;
    const price = computePrice({
      category: order.intake.category,
      tierId: order.intake.tierId,
      brief: order.intake.brief,
      addonIds: order.intake.extraAddonIds,
      buyDomain: order.intake.buyDomain,
      storeDeploy: order.intake.storeDeploy,
      cadence: order.intake.cadence,
    });
    const tier = tiers.find((x) => x.id === order.intake.tierId) ?? tiers[1];
    const addonIds = Array.from(new Set([...price.inferredAddonIds, ...order.intake.extraAddonIds]));
    const project: StoredProject = {
      id,
      name: serviceTitle(order.intake.category),
      category: order.intake.category,
      tierId: order.intake.tierId,
      status: "Queued",
      previewUrl: null,
      customDomain: order.intake.hasDomain === "yes" ? "your-domain" : null,
      createdAt: new Date().toISOString().slice(0, 10),
      totalPaid: order.totalDue,
      cadence: order.intake.cadence,
      services: addonIds.map((aid) => {
        const addon = addonCatalog.find((a) => a.id === aid)!;
        return {
          id: aid,
          name: addon.name,
          monthly: addonMonthly(addon, tier),
          status: "Active" as const,
          renewsOn: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        };
      }),
      revisionsLeft: tier.revisions,
      launched: false,
      hasEmail: addonIds.includes("email"),
      hasDatabase: order.intake.category !== "training" && order.intake.category !== "optimization",
      isMobile: order.intake.category === "app-development",
    };
    saveProject(project);
    sessionStorage.setItem("last_paid_project", id);
    if (email) sessionStorage.setItem("customer_email", email);
    router.push(`/checkout/confirmation?ref=${id}`);
  };

  return (
    <PageWrap>
      <div className="mx-auto max-w-[720px] px-6 py-12 lg:py-16">
        <h1 className={`font-display text-[28px] font-semibold ${t.ink}`}>Checkout</h1>
        <p className={`mt-2 mb-8 text-[14px] ${t.muted}`}>
          An unpaid invoice is on its way to your email. Pay to start the build. There are no refunds once payment is made.
        </p>
        <div className="grid lg:grid-cols-2 gap-6">
          <SignalPanel>
            <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C8102E]`}>Due today</p>
            <p className={`mt-3 font-display text-[36px] font-semibold tabular-nums ${t.ink}`}>
              {formatUsd(order.totalDue)}
            </p>
            <p className={`mt-2 text-[13px] ${t.muted}`}>
              {serviceTitle(order.intake.category)} · {order.intake.tierId} · {order.cadence}
            </p>
            <p className={`mt-4 text-[13px] ${t.muted}`}>
              Recurring services are itemized in your dashboard after payment — not on this screen.
            </p>
          </SignalPanel>
          <div className={`rounded-[20px] border p-6 ${t.card}`}>
            <Field label="Invoice email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>
            <label className={`mt-5 flex items-start gap-2 text-[13px] ${t.muted}`}>
              <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#C8102E]" target="_blank">
                  Service Agreement
                </Link>
                , including the no-refund policy.
              </span>
            </label>
            {error && <p className="mt-3 text-[13px] text-[#8C2F1B]">{error}</p>}
            <PrimaryButton
              className="mt-6 w-full"
              disabled={!agreed || !email.includes("@")}
              onClick={pay}
            >
              {loading ? "Processing…" : `Pay ${formatUsd(order.totalDue)}`}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
