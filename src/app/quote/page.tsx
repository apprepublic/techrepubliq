"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { DimensionLine } from "@/components/DimensionLine";
import { Button } from "@/components/Button";
import { ContactSalesForm } from "@/components/ContactSalesForm";
import { services, serviceBySlug } from "@/lib/services";
import { getPricingEngine, type ProjectEstimate } from "@/lib/pricing-engine";
import { api } from "@/lib/api";
import {
  ADDON_CATALOG,
  BUSINESS_STAGES,
  DOMAIN_OPTIONS,
  INTAKE_METRICS,
  ONE_TIME_SERVICES,
  TIERS,
  computePrice,
  formatUsd,
  recommendTier,
  revisionLabel,
  type CategorySlug,
  type ComplexityId,
  type TierId,
} from "@/lib/product";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * PRD §1 — Home → paid order, in five steps.
 * Category → Tier & scale → Brief & assets → Get Priced → Price summary.
 * Enterprise never reaches a price: it short-circuits to the Contact Sales form (§4.3).
 */

const steps = [
  { label: "Category" },
  { label: "Tier & scale" },
  { label: "Brief & assets" },
  { label: "Get Priced" },
  { label: "Price" },
];

const STORAGE_KEY = "techrepubliq-quote-session";
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000;

/** Categories that ask about a domain (PRD §2). */
const DOMAIN_CATEGORIES = ["web-development", "app-development"];

interface Metrics {
  requestsPerDay: string;
  users: string;
  transactions: string;
  staff: string;
  stage: string;
}

interface StoredAsset {
  key: string;
  name: string;
  slot: string;
}

interface Session {
  category: string;
  tierId: string;
  metrics: Metrics;
  brief: string;
  assets: StoredAsset[];
  domainOption: string;
  cadence: "annual" | "monthly";
  devFeeMode: "once" | "installments";
  addons: string[];
  oneTimeServices: string[];
}

interface SavedSession {
  data: Session;
  step: number;
  savedAt: number;
}

const emptySession = (category = "", tierId = ""): Session => ({
  category,
  tierId,
  metrics: { requestsPerDay: "", users: "", transactions: "", staff: "", stage: "" },
  brief: "",
  assets: [],
  domainOption: "",
  cadence: "annual",
  devFeeMode: "once",
  addons: [],
  oneTimeServices: [],
});

function loadSession(): { data: Session; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: SavedSession = JSON.parse(raw);
    if (Date.now() - saved.savedAt > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { data: { ...emptySession(), ...saved.data }, step: saved.step };
  } catch {
    return null;
  }
}

function saveSession(data: Session, step: number) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, step, savedAt: Date.now() } satisfies SavedSession)
    );
  } catch {
    /* storage unavailable — the flow still works, it just won't resume */
  }
}

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [resumeBanner, setResumeBanner] = useState(false);
  const [briefError, setBriefError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [showContactSales, setShowContactSales] = useState(false);
  const [estimate, setEstimate] = useState<ProjectEstimate | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const initialQuery = useMemo(() => {
    if (typeof window === "undefined") return { category: "", tier: "" };
    const sp = new URLSearchParams(window.location.search);
    return { category: sp.get("category") ?? "", tier: sp.get("tier") ?? "" };
  }, []);

  const [session, setSession] = useState<Session>(() => {
    const saved = loadSession();
    if (saved) return saved.data;
    return emptySession(initialQuery.category, initialQuery.tier);
  });

  // Restore where they left off, honouring ?category= / ?tier= from the landing page.
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setResumeBanner(true);
      setStep(Math.min(saved.step, 2));
      return;
    }
    if (initialQuery.category && serviceBySlug(initialQuery.category)) {
      setSession((prev) => ({ ...prev, category: initialQuery.category }));
      if (initialQuery.tier && TIERS.some((t) => t.id === initialQuery.tier)) {
        if (initialQuery.tier === "enterprise") setShowContactSales(true);
        setStep(1);
      }
    }
  }, [initialQuery]);

  useEffect(() => {
    saveSession(session, step);
  }, [session, step]);

  useEffect(() => {
    if (step === 0 || step === 1 || step === 2) {
      const firstInput = stepRef.current?.querySelector<HTMLElement>(
        "input:not([type='checkbox']):not([type='radio']):not([aria-hidden]), textarea, select"
      );
      firstInput?.focus();
    }
  }, [step]);

  const service = serviceBySlug(session.category);
  const engine = getPricingEngine();

  const goToStep = useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1);
      setBriefError("");
      setNetworkError("");
      setStep(next);
    },
    [step]
  );

  const patch = (next: Partial<Session>) => setSession((prev) => ({ ...prev, ...next }));

  /* ---------------------------------------------------------------- *
   * Step 3 — "Get Priced": run the engine, then ask the server to price it.
   * ---------------------------------------------------------------- */
  const runPricing = useCallback(async () => {
    const est = engine.estimate(session.brief, session.category);
    const inferred = engine.inferAddons(session.brief, session.category);
    setEstimate(est);

    const payload = {
      category: session.category,
      tierId: session.tierId as TierId,
      brief: session.brief,
      pages: est.pages,
      components: est.components,
      complexity: est.complexity as ComplexityId,
      metrics: {
        requestsPerDay: Number(session.metrics.requestsPerDay) || 0,
        users: Number(session.metrics.users) || 0,
        transactions: Number(session.metrics.transactions) || 0,
        staff: Number(session.metrics.staff) || 0,
        stage: session.metrics.stage || undefined,
      },
      assets: session.assets.map((a) => ({ key: a.key, name: a.name })),
      domainOption: session.domainOption || undefined,
      cadence: session.cadence,
      devFeeMode: session.devFeeMode,
      addons: Array.from(new Set([...inferred, ...session.addons])),
      oneTimeServices: session.oneTimeServices,
    };

    try {
      const pricing = await api.quotes.generate(payload);
      patch({ addons: pricing.addons, oneTimeServices: pricing.oneTimeServices });
      goToStep(4);
    } catch (err) {
      // A local estimate is useful for previewing, but it is not a payable quote. Do not
      // manufacture a reference that the payment worker cannot find; keep the customer on
      // the brief step and make them retry while the server is reachable.
      setNetworkError(
        err instanceof Error
          ? err.message
          : "We couldn't save your quote. Check your connection and try again."
      );
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  }, [engine, session, goToStep]);

  useEffect(() => {
    if (step !== 3 || analyzing) return;
    setAnalyzing(true);
    const id = window.setTimeout(() => {
      void runPricing();
    }, 900); // the "Analyzing project…" beat from PRD §1.5
    return () => window.clearTimeout(id);
  }, [step, analyzing, runPricing]);

  /* ---------------------------------------------------------------- *
   * Totals — recomputed locally from the same model the server uses, so the
   * toggles are instant. The server is the authority at payment (PR 4).
   * ---------------------------------------------------------------- */
  const totals = useMemo(() => {
    if (!estimate) return null;
    const input = {
      category: session.category as CategorySlug,
      tierId: session.tierId as TierId,
      pages: estimate.pages,
      components: estimate.components,
      complexity: estimate.complexity as ComplexityId,
      addons: session.addons,
      oneTimeServices: session.oneTimeServices,
    };
    const at = (devFeeMode: "once" | "installments", cadence: "annual" | "monthly") =>
      computePrice({ ...input, devFeeMode, cadence });
    const current = at(session.devFeeMode, session.cadence);
    return { dueNowCents: current.dueNowCents };
  }, [estimate, session]);

  const recommendedTier = useMemo(
    () =>
      recommendTier({
        requestsPerDay: Number(session.metrics.requestsPerDay) || 0,
        users: Number(session.metrics.users) || 0,
        transactions: Number(session.metrics.transactions) || 0,
        staff: Number(session.metrics.staff) || 0,
        stage: session.metrics.stage || undefined,
      }),
    [session.metrics]
  );

  /* ---------------------------------------------------------------- *
   * Uploads (R2)
   * ---------------------------------------------------------------- */
  const handleUpload = async (slot: string, file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    setUploading(slot);
    try {
      const uploaded = await api.uploads.create(file);
      patch({
        assets: [
          ...session.assets.filter((a) => a.slot !== slot),
          { key: uploaded.key, name: uploaded.name, slot },
        ],
      });
    } catch {
      setUploadError(
        "That upload didn't go through. You can carry on and send the files later."
      );
    } finally {
      setUploading(null);
    }
  };

  const toggleAddon = (id: string) =>
    patch({
      addons: session.addons.includes(id)
        ? session.addons.filter((a) => a !== id)
        : [...session.addons, id],
    });

  const toggleOneTime = (id: string) => {
    // Registering a domain in the intake is the source of truth; it cannot be
    // unchecked later in the summary while the customer still chose "buy".
    if (
      id === "domain-purchase" &&
      session.domainOption === "buy" &&
      session.oneTimeServices.includes(id)
    ) {
      return;
    }
    patch({
      oneTimeServices: session.oneTimeServices.includes(id)
        ? session.oneTimeServices.filter((s) => s !== id)
        : [...session.oneTimeServices, id],
    });
  };

  // Registering a domain through us adds the one-time service, and vice versa.
  useEffect(() => {
    if (session.domainOption === "buy" && !session.oneTimeServices.includes("domain-purchase")) {
      patch({ oneTimeServices: [...session.oneTimeServices, "domain-purchase"] });
    }
    if (session.domainOption === "have") {
      patch({ oneTimeServices: session.oneTimeServices.filter((s) => s !== "domain-purchase") });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.domainOption]);

  const canContinue =
    step === 0
      ? session.category !== ""
      : step === 1
        ? session.tierId !== ""
        : step === 2
          ? session.brief.trim().length >= 20 &&
            (!DOMAIN_CATEGORIES.includes(session.category) || session.domainOption !== "")
          : true;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
  };

  const proceedToPayment = async () => {
    if (!totals?.dueNowCents || !estimate || proceeding) return;
    setProceeding(true);
    setNetworkError("");

    // The summary is still editable: fee mode, cadence, add-ons and one-time services may
    // have changed since the first analysis. Save those final choices into a fresh server
    // quote so checkout recomputes the same total instead of charging the original draft.
    try {
      const pricing = await api.quotes.generate({
        category: session.category,
        tierId: session.tierId as TierId,
        brief: session.brief,
        pages: estimate.pages,
        components: estimate.components,
        complexity: estimate.complexity as ComplexityId,
        metrics: {
          requestsPerDay: Number(session.metrics.requestsPerDay) || 0,
          users: Number(session.metrics.users) || 0,
          transactions: Number(session.metrics.transactions) || 0,
          staff: Number(session.metrics.staff) || 0,
          stage: session.metrics.stage || undefined,
        },
        assets: session.assets.map((a) => ({ key: a.key, name: a.name })),
        domainOption: session.domainOption || undefined,
        cadence: session.cadence,
        devFeeMode: session.devFeeMode,
        addons: session.addons,
        oneTimeServices: session.oneTimeServices,
      });
      patch({ addons: pricing.addons, oneTimeServices: pricing.oneTimeServices });
      const params = new URLSearchParams({
        ref: pricing.referenceId,
        category: session.category,
        cadence: session.cadence,
        devFeeMode: session.devFeeMode,
      });
      router.push(`/checkout?${params.toString()}`);
    } catch (err) {
      setNetworkError(
        err instanceof Error
          ? err.message
          : "We couldn't save your final choices. Check your connection and try again."
      );
    } finally {
      setProceeding(false);
    }
  };

  const inputClass =
    "w-full border border-line rounded-sm p-md text-sm font-body text-ink bg-paper-raised focus:border-accent transition-colors duration-150 outline-none";

  /* ---------------------------------------------------------------- *
   * Enterprise short-circuit
   * ---------------------------------------------------------------- */
  if (showContactSales) {
    return (
      <div className="mx-auto max-w-[640px] px-md py-xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-sm">
          Enterprise
        </p>
        <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-md">
          Let&apos;s scope it together
        </h1>
        <p className="text-base leading-relaxed text-slate mb-lg">
          Enterprise projects are quoted by conversation rather than by the online estimator, so
          there&apos;s no price to show here. Tell us a little about it and we&apos;ll come back to
          you.
        </p>
        <ContactSalesForm
          category={session.category || undefined}
          tierId="enterprise"
          source="quote-enterprise"
        />
        <button
          onClick={() => {
            setShowContactSales(false);
            patch({ tierId: "business" });
          }}
          className="mt-lg text-sm text-slate hover:text-accent underline"
        >
          Actually, price it online instead
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Get Started
      </h1>

      {resumeBanner && (
        <div className="mb-lg p-sm bg-accent-dim border border-accent/20 rounded-sm text-sm text-ink flex items-center justify-between gap-sm">
          <span>Picking up where you left off.</span>
          <button
            onClick={() => {
              setResumeBanner(false);
              setSession(emptySession());
              setStep(0);
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="text-xs text-accent hover:text-accent-hover underline"
          >
            Start over
          </button>
        </div>
      )}

      <div className="mb-xl">
        <div className="md:hidden text-sm text-accent font-body mb-sm">
          Step {step + 1} of {steps.length}: {steps[step].label}
        </div>
        <div className="md:block hidden">
          <DimensionLine steps={steps} currentStep={step} />
        </div>
        <div className="md:hidden">
          <DimensionLine steps={steps} currentStep={step} hideLabels />
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        Step {step + 1} of {steps.length}: {steps[step].label}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          ref={stepRef}
        >
          {/* Step 0 — Category */}
          {step === 0 && (
            <fieldset>
              <legend className="text-sm text-slate mb-md">
                What are you building? Pick the closest fit — we&apos;ll read the brief either way.
              </legend>
              <div className="space-y-sm">
                {services.map((s) => (
                  <label
                    key={s.slug}
                    className={`block p-md border text-sm rounded-sm transition-all duration-150 cursor-pointer ${
                      session.category === s.slug
                        ? "border-accent bg-accent-dim text-ink"
                        : "border-line text-slate hover:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={s.slug}
                      checked={session.category === s.slug}
                      onChange={() => patch({ category: s.slug })}
                      className="sr-only"
                    />
                    <span className="font-medium text-ink">{s.title}</span>
                    <p className="text-xs text-slate mt-xs">{s.short}</p>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Step 1 — Tier & scale */}
          {step === 1 && (
            <div className="space-y-lg">
              <fieldset>
                <legend className="text-sm text-slate mb-md">
                  Tiers scale your recurring services — never the one-time build fee. You can
                  upgrade later, never downgrade.
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                  {TIERS.map((tier) => (
                    <label
                      key={tier.id}
                      className={`block p-md border text-sm rounded-sm transition-all duration-150 cursor-pointer ${
                        session.tierId === tier.id
                          ? "border-accent bg-accent-dim text-ink"
                          : "border-line text-slate hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={tier.id}
                        checked={session.tierId === tier.id}
                        onChange={() =>
                          tier.id === "enterprise"
                            ? setShowContactSales(true)
                            : patch({ tierId: tier.id })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium text-ink">{tier.name}</span>
                        <span className="font-mono text-xs text-slate">
                          {tier.monthlyCents === null
                            ? "Contact Sales"
                            : `$${tier.monthlyCents / 100}/mo`}
                        </span>
                      </div>
                      <p className="text-xs text-slate mt-xs">{tier.for}</p>
                      <p className="text-xs text-slate mt-xs">{revisionLabel(tier.id)}</p>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <p className="text-sm font-medium text-ink mb-xs">
                  Roughly how big is this?{" "}
                  <span className="text-slate font-normal">
                    Optional — it only helps us suggest a tier.
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {INTAKE_METRICS.map((metric) => (
                    <div key={metric.id}>
                      <label
                        htmlFor={`metric-${metric.id}`}
                        className="text-xs text-slate mb-xs block"
                      >
                        {metric.label}
                      </label>
                      <input
                        id={`metric-${metric.id}`}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={(session.metrics as any)[metric.id]}
                        onChange={(e) =>
                          patch({
                            metrics: { ...session.metrics, [metric.id]: e.target.value },
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="metric-stage" className="text-xs text-slate mb-xs block">
                      Stage of the business
                    </label>
                    <select
                      id="metric-stage"
                      value={session.metrics.stage}
                      onChange={(e) =>
                        patch({ metrics: { ...session.metrics, stage: e.target.value } })
                      }
                      className={inputClass}
                    >
                      <option value="">Prefer not to say</option>
                      {BUSINESS_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {recommendedTier !== session.tierId && recommendedTier !== "enterprise" && (
                  <p className="mt-sm text-xs text-slate">
                    Based on those numbers we&apos;d suggest{" "}
                    <button
                      onClick={() => patch({ tierId: recommendedTier })}
                      className="text-accent underline"
                    >
                      {TIERS.find((t) => t.id === recommendedTier)?.name}
                    </button>
                    . Yours to choose — you can upgrade later.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Brief & assets */}
          {step === 2 && (
            <div className="space-y-lg">
              <div>
                <label htmlFor="brief" className="text-sm font-medium text-ink mb-sm block">
                  Describe your project <span className="text-error">*</span>
                </label>
                <p className="text-xs text-slate mb-sm">
                  What it should do, who uses it, and anything it has to connect to. This is what
                  the pricing engine reads.
                </p>
                <textarea
                  id="brief"
                  value={session.brief}
                  onChange={(e) => patch({ brief: e.target.value.slice(0, 2000) })}
                  placeholder="e.g. A booking site for three salon locations: customers pick a service, choose a stylist, and pay a deposit. Staff need a dashboard and SMS reminders."
                  className={`w-full border rounded-sm p-md text-sm font-body text-ink bg-paper-raised resize-none min-h-[160px] transition-colors duration-150 outline-none ${
                    briefError ? "border-error" : "border-line focus:border-accent"
                  }`}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-xs">
                  {briefError && (
                    <p className="text-xs text-error flex items-center gap-xs">
                      <AlertCircle size={12} />
                      {briefError}
                    </p>
                  )}
                  <span className="text-xs text-slate ml-auto">
                    {session.brief.length}/2000
                  </span>
                </div>
              </div>

              {DOMAIN_CATEGORIES.includes(session.category) && (
                <fieldset>
                  <legend className="text-sm font-medium text-ink mb-sm">Domain</legend>
                  <div className="space-y-sm">
                    {DOMAIN_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`block p-md border text-sm rounded-sm transition-all duration-150 cursor-pointer ${
                          session.domainOption === option.id
                            ? "border-accent bg-accent-dim text-ink"
                            : "border-line text-slate hover:border-ink"
                        }`}
                      >
                        <input
                          type="radio"
                          name="domain"
                          value={option.id}
                          checked={session.domainOption === option.id}
                          onChange={() => patch({ domainOption: option.id })}
                          className="sr-only"
                        />
                        <span className="font-medium text-ink">{option.label}</span>
                        <p className="text-xs text-slate mt-xs">{option.note}</p>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div>
                <p className="text-sm font-medium text-ink mb-xs">Assets</p>
                <p className="text-xs text-slate mb-md">
                  Optional, and you can always send them later. They go straight to our own
                  storage.
                </p>
                <div className="space-y-md">
                  {(service?.assets ?? [{ id: "logo", label: "Logo", hint: "PNG or SVG." }]).map(
                    (slot) => {
                      const uploaded = session.assets.find((a) => a.slot === slot.id);
                      return (
                        <div key={slot.id} className="flex items-center justify-between gap-md">
                          <div className="min-w-0">
                            <p className="text-sm text-ink">{slot.label}</p>
                            <p className="text-xs text-slate">{slot.hint}</p>
                            {uploaded && (
                              <p className="text-xs text-success flex items-center gap-xs mt-xs">
                                <CheckCircle2 size={12} />
                                <span className="truncate">{uploaded.name}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-sm shrink-0">
                            <label className="text-sm text-accent underline cursor-pointer">
                              {uploaded ? "Replace" : "Upload"}
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*,application/pdf,.csv,.txt,.json,.zip"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (file) void handleUpload(slot.id, file);
                                }}
                              />
                            </label>
                            {uploaded && (
                              <button
                                onClick={() =>
                                  patch({
                                    assets: session.assets.filter((a) => a.slot !== slot.id),
                                  })
                                }
                                className="text-xs text-slate hover:text-error underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          {uploading === slot.id && (
                            <span className="text-xs text-slate">Uploading…</span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
                {uploadError && (
                  <p className="mt-sm text-xs text-amber">{uploadError}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — Get Priced */}
          {step === 3 && (
            <div className="py-xl text-center">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-md" />
              <p className="font-display text-md font-semibold text-ink mb-xs">
                Analyzing project…
              </p>
              <p className="text-sm text-slate">
                Working out the pages, components and complexity in your brief.
              </p>
            </div>
          )}

          {/* Step 4 — Price summary */}
          {step === 4 && totals && (
            <div>
              <p className="text-sm text-slate mb-md">
                Your total updates as you choose the fee option, billing cadence and additional
                services. At purchase, you see one final total — no line-item breakdown.
              </p>

              <div className="border border-line rounded-sm p-lg mb-lg">
                <p className="text-xs uppercase tracking-[0.14em] text-slate mb-sm">
                  Your total
                </p>
                <p className="font-mono text-[36px] leading-[44px] text-ink">
                  {formatUsd(totals.dueNowCents)}
                </p>
                <p className="text-xs text-slate mt-sm">
                  {session.devFeeMode === "once"
                    ? "One-time development fee paid in full with 15% off."
                    : "Development fee split into 12 even monthly payments, with no interest or markup."}
                </p>
              </div>

              <div className="space-y-md mb-lg">
                {/* Fee option */}
                <div className="border border-line rounded-sm p-md">
                  <p className="text-sm font-medium text-ink mb-sm">Development fee</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {(
                      [
                        { id: "once", label: "Pay once — 15% off", note: "One payment" },
                        {
                          id: "installments",
                          label: "12 monthly payments",
                          note: "No interest or markup",
                        },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.id}
                        className={`block p-md border text-sm rounded-sm cursor-pointer transition-all duration-150 ${
                          session.devFeeMode === option.id
                            ? "border-accent bg-accent-dim text-ink"
                            : "border-line text-slate hover:border-ink"
                        }`}
                      >
                        <input
                          type="radio"
                          name="devFeeMode"
                          checked={session.devFeeMode === option.id}
                          onChange={() => patch({ devFeeMode: option.id })}
                          className="sr-only"
                        />
                        <span className="block">{option.label}</span>
                        <span className="text-xs text-slate">{option.note}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services cadence */}
                <div className="border border-line rounded-sm p-md">
                  <p className="text-sm font-medium text-ink mb-sm">Recurring services</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {(
                      [
                        {
                          id: "annual",
                          label: "Annually",
                          note: "Default",
                        },
                        {
                          id: "monthly",
                          label: "Monthly",
                          note: "Paid month to month",
                        },
                      ] as const
                    ).map((option) => (
                      <label
                        key={option.id}
                        className={`block p-md border text-sm rounded-sm cursor-pointer transition-all duration-150 ${
                          session.cadence === option.id
                            ? "border-accent bg-accent-dim text-ink"
                            : "border-line text-slate hover:border-ink"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cadence"
                          checked={session.cadence === option.id}
                          onChange={() => patch({ cadence: option.id })}
                          className="sr-only"
                        />
                        <span className="block">
                          {option.label}
                          {option.note && (
                            <span className="text-xs text-slate"> · {option.note}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate mt-sm">
                    Annual billing is the default. Hosting and backend are included and never
                    itemised.
                  </p>
                </div>

                {/* Add-ons */}
                <div className="border border-line rounded-sm p-md">
                  <div className="flex items-center justify-between gap-sm mb-sm">
                    <p className="text-sm font-medium text-ink">Project services</p>
                    <span className="text-xs text-slate">Included in your total</span>
                  </div>
                  {session.addons.length === 0 ? (
                    <p className="text-xs text-slate">
                      Nothing extra was inferred from your brief.
                    </p>
                  ) : (
                    <ul className="space-y-xs">
                      {session.addons.map((id) => {
                        const addon = ADDON_CATALOG.find((a) => a.id === id);
                        return (
                          <li
                            key={id}
                            className="flex items-center justify-between gap-sm text-sm text-slate"
                          >
                            <span>
                              {addon?.label ?? id}
                              <span className="text-xs text-slate"> · inferred for your build</span>
                            </span>
                            <button
                              onClick={() => toggleAddon(id)}
                              className="text-xs text-slate hover:text-error underline shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="mt-sm flex items-center gap-sm">
                    <select
                      value=""
                      onChange={(e) => e.target.value && toggleAddon(e.target.value)}
                      className={`${inputClass} max-w-[280px]`}
                      aria-label="Add additional add-on"
                    >
                      <option value="">Add additional add-on…</option>
                      {ADDON_CATALOG.filter((a) => !session.addons.includes(a.id)).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} — {a.example}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* One-time services */}
                {ONE_TIME_SERVICES.some(
                  (s) =>
                    s.id !== "domain-purchase" ||
                    DOMAIN_CATEGORIES.includes(session.category)
                ) && (
                  <div className="border border-line rounded-sm p-md">
                    <p className="text-sm font-medium text-ink mb-sm">One-time services</p>
                    <div className="space-y-sm">
                      {ONE_TIME_SERVICES.filter(
                        (s) =>
                          s.id !== "store-deployment" ||
                          session.category === "app-development"
                      )
                        .filter(
                          (s) =>
                            s.id !== "domain-purchase" ||
                            DOMAIN_CATEGORIES.includes(session.category)
                        )
                        .map((s) => (
                          <label
                            key={s.id}
                            className="flex items-start justify-between gap-sm text-sm text-slate cursor-pointer"
                          >
                            <span className="flex items-start gap-sm">
                              <input
                                type="checkbox"
                                checked={session.oneTimeServices.includes(s.id)}
                                onChange={() => toggleOneTime(s.id)}
                                disabled={s.id === "domain-purchase" && session.domainOption === "buy"}
                                className="mt-1 accent-accent"
                              />
                              <span>
                                {s.label}
                                <span className="block text-xs text-slate">{s.note}</span>
                              </span>
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {networkError && (
        <div
          role="alert"
          className="mt-lg p-sm bg-error/10 border border-error rounded-sm text-sm text-error flex items-center gap-sm"
        >
          <AlertCircle size={14} className="shrink-0" />
          {networkError}
        </div>
      )}

      {step !== 3 && (
        <div className="flex items-center justify-between mt-xl">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => goToStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <Button
              disabled={!canContinue}
              onClick={() => {
                if (step === 2 && session.brief.trim().length < 20) {
                  setBriefError("A sentence or two more, so we can price it properly.");
                  return;
                }
                goToStep(step + 1);
              }}
            >
              Continue
            </Button>
          )}

          {step === 4 && (
            <Button
              onClick={proceedToPayment}
              disabled={!totals?.dueNowCents || proceeding}
              loading={proceeding}
            >
              Proceed to Payment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
