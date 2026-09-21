"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Check } from "lucide-react";
import { ContactSalesForm } from "@/components/ContactSalesForm";
import { PageWrap, PrimaryButton, SignalPanel } from "@/components/product-ui";
import { api, type QuoteIntake, type QuotePricing } from "@/lib/api";
import { getPricingEngine, type ProjectEstimate } from "@/lib/pricing-engine";
import {
  ADDON_CATALOG,
  computePrice,
  formatUsd,
  type CategorySlug,
  type ComplexityId,
  type TierId,
} from "@/lib/product";
import { INTAKE_KEY, metricsFor, normalizeIntake, type IntakeState } from "@/lib/quote-session";
import { useTone } from "@/lib/theme";
import { cn } from "@/lib/utils";

const DOMAIN_CATEGORIES = new Set(["web-development", "app-development"]);

function oneTimeServicesFor(intake: IntakeState): string[] {
  return [
    ...(intake.domainOption === "buy" ? ["domain-purchase"] : []),
    ...(intake.storeDeploy ? ["store-deployment"] : []),
  ];
}

function makePayload(
  intake: IntakeState,
  estimate: ProjectEstimate,
  inferredAddons: string[]
): QuoteIntake {
  return {
    category: intake.category,
    tierId: intake.tierId,
    brief: intake.brief,
    pages: estimate.pages,
    components: estimate.components,
    complexity: estimate.complexity,
    metrics: metricsFor(intake),
    assets: intake.logoName ? [{ key: "brief-logo", name: intake.logoName }] : [],
    domainOption: intake.domainOption || undefined,
    cadence: intake.cadence,
    devFeeMode: intake.devFeeMode,
    addons: Array.from(new Set([...inferredAddons, ...intake.addons])),
    oneTimeServices: oneTimeServicesFor(intake),
  };
}

export default function QuoteResultPage() {
  const router = useRouter();
  const t = useTone();
  const engine = getPricingEngine();
  const [intake, setIntake] = useState<IntakeState | null>(null);
  const [estimate, setEstimate] = useState<ProjectEstimate | null>(null);
  const [pricing, setPricing] = useState<QuotePricing | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [openAddons, setOpenAddons] = useState(false);
  const [error, setError] = useState("");
  const [proceeding, setProceeding] = useState(false);

  const requestQuote = useCallback(
    async (next: IntakeState) => {
      if (!next.category || !next.tierId || !next.brief.trim()) {
        setAnalyzing(false);
        return;
      }
      const nextEstimate = engine.estimate(next.brief, next.category);
      const inferredAddons = engine.inferAddons(next.brief, next.category);
      setEstimate(nextEstimate);
      setError("");
      try {
        const response = await api.quotes.generate(makePayload(next, nextEstimate, inferredAddons));
        setPricing(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not save your quote. Please retry.");
      } finally {
        setAnalyzing(false);
      }
    },
    [engine]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INTAKE_KEY);
      const next = normalizeIntake(raw ? JSON.parse(raw) : null);
      setIntake(next);
      if (next.category === "" || next.brief.trim().length < 20) {
        setAnalyzing(false);
        return;
      }
      const timer = window.setTimeout(() => void requestQuote(next), 700);
      return () => window.clearTimeout(timer);
    } catch {
      setIntake(normalizeIntake(null));
      setAnalyzing(false);
    }
  }, [requestQuote]);

  const price = useMemo(() => {
    if (!intake || !estimate || !intake.category || !intake.tierId) return null;
    return computePrice({
      category: intake.category as CategorySlug,
      tierId: intake.tierId as TierId,
      pages: estimate.pages,
      components: estimate.components,
      complexity: estimate.complexity as ComplexityId,
      addons: Array.from(new Set([...(pricing?.addons ?? []), ...intake.addons])),
      oneTimeServices: oneTimeServicesFor(intake),
      devFeeMode: intake.devFeeMode,
      cadence: intake.cadence,
    });
  }, [estimate, intake, pricing]);

  const persist = (next: IntakeState) => {
    setIntake(next);
    localStorage.setItem(INTAKE_KEY, JSON.stringify(next));
  };

  if (!intake || !intake.category || !intake.brief.trim()) {
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
        <div className="mx-auto flex min-h-[60vh] max-w-[480px] flex-col items-center justify-center px-6 text-center">
          <Loader2 className="mb-4 animate-spin text-[#C8102E]" size={36} />
          <h1 className={`font-display text-[24px] font-semibold ${t.ink}`}>Analyzing project…</h1>
          <p className={`mt-2 text-[14px] ${t.muted}`}>
            Reading the brief, estimating scope, and attaching the services this build needs.
          </p>
        </div>
      </PageWrap>
    );
  }

  if (error || !pricing || !price) {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
          <p className={`text-[14px] ${t.muted}`}>{error || "We could not prepare this quote."}</p>
          <PrimaryButton className="mt-6" onClick={() => { setAnalyzing(true); void requestQuote(intake); }}>
            Try again
          </PrimaryButton>
        </div>
      </PageWrap>
    );
  }

  if (pricing.contactSales || intake.tierId === "enterprise") {
    return (
      <PageWrap>
        <div className="mx-auto max-w-[560px] px-6 py-12 lg:py-16">
          <SignalPanel>
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#C8102E]">Enterprise</p>
            <h1 className={`mt-2 font-display text-[26px] font-semibold ${t.ink}`}>Let&apos;s scope this with you.</h1>
            <p className={`mt-3 text-[14px] leading-[1.6] ${t.muted}`}>
              Enterprise work is arranged through Contact Sales. No public rate is shown; we will scope hosting, volume, and reviews with your team.
            </p>
            <div className="mt-8">
              <ContactSalesForm category={intake.category} tierId={intake.tierId} source="quote-enterprise" />
            </div>
          </SignalPanel>
        </div>
      </PageWrap>
    );
  }

  const toggleAddon = (id: string) => {
    const addons = intake.addons.includes(id)
      ? intake.addons.filter((item) => item !== id)
      : [...intake.addons, id];
    persist({ ...intake, addons });
  };

  const proceed = async () => {
    if (!estimate || proceeding) return;
    setProceeding(true);
    setError("");
    try {
      // Create a fresh server quote after the final toggles. The checkout page receives only
      // this reference; it never trusts the browser's displayed amount.
      const finalQuote = await api.quotes.generate(
        makePayload(intake, estimate, engine.inferAddons(intake.brief, intake.category))
      );
      if (finalQuote.contactSales) return;
      const params = new URLSearchParams({
        ref: finalQuote.referenceId,
        category: intake.category,
        cadence: intake.cadence,
        devFeeMode: intake.devFeeMode,
      });
      router.push(`/checkout?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save your final choices. Please retry.");
    } finally {
      setProceeding(false);
    }
  };

  const catalogLeft = ADDON_CATALOG.filter((addon) => !pricing.addons.includes(addon.id));
  const total = price.dueNowCents;
  const domainChoiceRequired = DOMAIN_CATEGORIES.has(intake.category);

  return (
    <PageWrap>
      <div className="mx-auto max-w-[560px] px-6 py-12 lg:py-16">
        <SignalPanel>
          <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${t.isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
            Price summary
          </p>
          <h1 className={`mt-2 font-display text-[26px] font-semibold ${t.ink}`}>One total to start the build.</h1>
          <p className={`mt-2 text-[14px] ${t.muted}`}>
            Hosting and backend are included. Add-ons were inferred from your brief. You can add more below — the number stays a single total.
          </p>

          <div className="mt-6 space-y-3">
            <div>
              <p className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${t.muted}`}>Development fee</p>
              <div className="flex flex-wrap gap-2">
                {(["once", "installments"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => persist({ ...intake, devFeeMode: mode })}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-[13px] font-medium",
                      intake.devFeeMode === mode
                        ? "border-[#C8102E] bg-[rgba(200,16,46,0.1)] text-[#C8102E]"
                        : `${t.border} ${t.muted}`
                    )}
                  >
                    {mode === "once" ? "Pay once — 15% off" : "12 even installments"}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-[12px] ${t.muted}`}>
                Installments are the development fee divided by twelve with no interest or markup.
              </p>
            </div>
            <div>
              <p className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${t.muted}`}>Recurring services</p>
              <div className="flex flex-wrap gap-2">
                {(["annual", "monthly"] as const).map((cadence) => (
                  <button
                    key={cadence}
                    type="button"
                    onClick={() => persist({ ...intake, cadence })}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-[13px] font-medium",
                      intake.cadence === cadence
                        ? "border-[#C8102E] bg-[rgba(200,16,46,0.1)] text-[#C8102E]"
                        : `${t.border} ${t.muted}`
                    )}
                  >
                    {cadence === "annual" ? "Bill annually" : "Bill monthly"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={`mt-8 font-display text-[40px] font-semibold tabular-nums ${t.ink}`}>
            <data value={String(total ?? 0)}>{formatUsd(total)}</data>
          </p>
          <p className={`text-[13px] ${t.muted}`}>
            {intake.devFeeMode === "installments" ? "First installment plus recurring services due today." : "Development fee and recurring services due today."}
          </p>
          {domainChoiceRequired && intake.domainOption === "buy" && (
            <p className={`mt-2 text-[12px] ${t.muted}`}>Domain registration is included as a one-time service.</p>
          )}

          <button
            type="button"
            onClick={() => setOpenAddons((open) => !open)}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#C8102E]"
          >
            <Plus size={16} /> Add additional add-on
          </button>
          {openAddons && (
            <div className={`mt-3 divide-y rounded-[16px] border ${t.border}`}>
              {catalogLeft.map((addon) => {
                const on = intake.addons.includes(addon.id);
                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left ${t.hoverRow}`}
                  >
                    <span>
                      <span className={`block text-[14px] font-medium ${t.ink}`}>{addon.label}</span>
                      <span className={`block text-[12px] ${t.muted}`}>{addon.example}</span>
                    </span>
                    {on && <Check size={16} className="shrink-0 text-[#C8102E]" />}
                  </button>
                );
              })}
            </div>
          )}

          {error && <p className="mt-4 text-[13px] text-[#8C2F1B]">{error}</p>}
          <PrimaryButton className="mt-8 w-full" onClick={proceed} disabled={proceeding}>
            {proceeding ? "Saving quote…" : "Proceed to Payment"}
          </PrimaryButton>
          <p className={`mt-3 text-center text-[12px] ${t.muted}`}>
            This saves an unpaid invoice and takes you to checkout. No refunds after payment.
          </p>
        </SignalPanel>
      </div>
    </PageWrap>
  );
}
