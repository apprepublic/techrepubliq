"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addonCatalog, computePrice, emptyIntake, formatUsd, INTAKE_KEY, ORDER_KEY, type IntakeState } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { PageWrap, PrimaryButton, SignalPanel } from "@/components/product-ui";
import { Loader2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuoteResultPage() {
  const router = useRouter();
  const t = useTone();
  const [intake, setIntake] = useState<IntakeState | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [openAddons, setOpenAddons] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTAKE_KEY);
      setIntake(raw ? JSON.parse(raw) : emptyIntake());
    } catch {
      setIntake(emptyIntake());
    }
    const timer = setTimeout(() => setAnalyzing(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  const persist = (next: IntakeState) => {
    setIntake(next);
    localStorage.setItem(INTAKE_KEY, JSON.stringify(next));
  };

  const price = useMemo(() => {
    if (!intake) return null;
    return computePrice({
      category: intake.category,
      tierId: intake.tierId,
      brief: intake.brief,
      addonIds: intake.extraAddonIds,
      buyDomain: intake.buyDomain,
      storeDeploy: intake.storeDeploy,
      cadence: intake.cadence,
    });
  }, [intake]);

  if (!intake || !price) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[560px] px-6 py-24 text-center">Loading…</div>
      </PageWrap>
    );
  }

  if (!intake.category || !intake.brief) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
          <p className={t.muted}>Start from the beginning so we can price from your brief.</p>
          <PrimaryButton className="mt-6" onClick={() => router.push("/quote")}>
            Get Started
          </PrimaryButton>
        </div>
      </PageWrap>
    );
  }

  if (analyzing) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[480px] px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-[#C8102E] mb-4" size={36} />
          <h1 className={`font-display text-[24px] font-semibold ${t.ink}`}>Analyzing project…</h1>
          <p className={`mt-2 text-[14px] ${t.muted}`}>
            Reading the brief, estimating scope, and attaching the services this build needs.
          </p>
        </div>
      </PageWrap>
    );
  }

  if (price.enterprise) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <SignalPanel>
            <h1 className={`font-display text-[24px] font-semibold ${t.ink}`}>Enterprise — contact sales</h1>
            <p className={`mt-3 text-[14px] leading-[1.6] ${t.muted}`}>
              Enterprise isn’t priced in this flow. We’ll scope hosting, volume, and reviews with your team. No public rate is shown.
            </p>
            <PrimaryButton className="mt-6 w-full" onClick={() => router.push("/#quote")}>
              Talk to us
            </PrimaryButton>
          </SignalPanel>
        </div>
      </PageWrap>
    );
  }

  const toggleAddon = (id: string) => {
    const extra = intake.extraAddonIds.includes(id)
      ? intake.extraAddonIds.filter((x) => x !== id)
      : [...intake.extraAddonIds, id];
    persist({ ...intake, extraAddonIds: extra });
  };

  const proceed = () => {
    const payload = { intake, totalDue: price.totalDue, cadence: intake.cadence, at: Date.now() };
    localStorage.setItem(ORDER_KEY, JSON.stringify(payload));
    router.push("/checkout");
  };

  const catalogLeft = addonCatalog.filter((a) => !price.inferredAddonIds.includes(a.id));

  return (
    <PageWrap>
      <div className="mx-auto max-w-[560px] px-6 py-12 lg:py-16">
        <SignalPanel>
          <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${t.isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
            Price summary
          </p>
          <h1 className={`mt-2 font-display text-[26px] font-semibold ${t.ink}`}>One total to start the build.</h1>
          <p className={`mt-2 text-[14px] ${t.muted}`}>
            Hosting and backend included. Add-ons were inferred from your brief. You can add more below — the number stays a single total.
          </p>

          <div className="mt-6 flex gap-2">
            {(["annual", "monthly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => persist({ ...intake, cadence: c })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium border",
                  intake.cadence === c
                    ? "border-[#C8102E] bg-[rgba(200,16,46,0.1)] text-[#C8102E]"
                    : `${t.border} ${t.muted}`
                )}
              >
                {c === "annual" ? "Pay annually" : "Pay monthly"}
              </button>
            ))}
          </div>
          <p className={`mt-2 text-[12px] ${t.muted}`}>
            Annual is the default. Monthly costs 15% more overall, then splits across 12 payments.
          </p>

          <p className={`mt-8 font-display text-[40px] font-semibold tabular-nums ${t.ink}`}>
            <data value={String(price.totalDue)}>{formatUsd(price.totalDue)}</data>
          </p>
          <p className={`text-[13px] ${t.muted}`}>
            {intake.cadence === "annual" ? "Due today (annual)." : "Due today (first month + build)."}
          </p>

          <button
            type="button"
            onClick={() => setOpenAddons(!openAddons)}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#C8102E]"
          >
            <Plus size={16} /> Add additional add-on
          </button>
          {openAddons && (
            <div className={`mt-3 rounded-[16px] border divide-y ${t.border}`}>
              {catalogLeft.map((a) => {
                const on = intake.extraAddonIds.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left ${t.hoverRow}`}
                  >
                    <span>
                      <span className={`block text-[14px] font-medium ${t.ink}`}>{a.name}</span>
                      <span className={`block text-[12px] ${t.muted}`}>{a.blurb}</span>
                    </span>
                    {on && <Check size={16} className="text-[#C8102E] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <PrimaryButton className="mt-8 w-full" onClick={proceed}>
            Proceed to Payment
          </PrimaryButton>
          <p className={`mt-3 text-center text-[12px] ${t.muted}`}>
            This sends an unpaid invoice to your email and takes you to checkout. No refunds after payment.
          </p>
        </SignalPanel>
      </div>
    </PageWrap>
  );
}
