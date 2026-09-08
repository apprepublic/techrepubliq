"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { DimensionLine } from "@/components/DimensionLine";
import { Button } from "@/components/Button";
import { services } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const steps = [
  { label: "Service" },
  { label: "Details" },
  { label: "Review" },
];

type FormData = {
  category: string;
  description: string;
  features: string[];
  timeline: string;
  budget: string;
};

const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-2 weeks", label: "1–2 weeks" },
  { value: "3-4 weeks", label: "3–4 weeks" },
  { value: "1-2 months", label: "1–2 months" },
  { value: "flexible", label: "Flexible — no rush" },
];

const budgetOptions = [
  { value: "under-2k", label: "Under $2,000" },
  { value: "2k-5k", label: "$2,000 – $5,000" },
  { value: "5k-10k", label: "$5,000 – $10,000" },
  { value: "10k-plus", label: "$10,000+" },
  { value: "not-sure", label: "Not sure yet" },
];

const STORAGE_KEY = "techrepubliq-quote-session";
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000;

interface SavedSession {
  data: FormData;
  step: number;
  savedAt: number;
}

function loadSession(): { data: FormData; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: SavedSession = JSON.parse(raw);
    if (Date.now() - saved.savedAt > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { data: saved.data, step: saved.step };
  } catch {
    return null;
  }
}

function saveSession(data: FormData, step: number) {
  try {
    const session: SavedSession = { data, step, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [resumeBanner, setResumeBanner] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [generating, setGenerating] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  const initialCategory = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("category") ?? "" : "";

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = loadSession();
    if (saved) {
      return saved.data;
    }
    return {
      category: initialCategory,
      description: "",
      features: [],
      timeline: "",
      budget: "",
    };
  });

  const [restoredStep, setRestoredStep] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setRestoredStep(saved.step);
      setResumeBanner(true);
      setStep(saved.step);
    }
  }, []);

  useEffect(() => {
    saveSession(formData, step);
  }, [formData, step]);

  useEffect(() => {
    if (stepRef.current) {
      const firstInput = stepRef.current.querySelector<HTMLElement>(
        "input:not([type='checkbox']):not([type='radio']):not([aria-hidden]), textarea, select"
      );
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [step]);

  const selectedService = services.find((s) => s.slug === formData.category);

  const goToStep = useCallback(
    (newStep: number) => {
      setDirection(newStep > step ? 1 : -1);
      setDescriptionError("");
      setNetworkError("");
      setStep(newStep);
    },
    [step]
  );

  const handleGenerate = async () => {
    if (!formData.description.trim()) {
      setDescriptionError("Please describe your project to continue.");
      return;
    }
    setGenerating(true);
    setNetworkError("");

    try {
      const res = await fetch("/api/quotes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to generate quote");
      const data = await res.json();
      localStorage.removeItem(STORAGE_KEY);
      router.push(
        `/quote/result?ref=${data.referenceId}&category=${formData.category}&desc=${encodeURIComponent(formData.description)}&timeline=${formData.timeline}`
      );
    } catch {
      setNetworkError("Couldn't generate your quote. Check your connection and try again.");
      setGenerating(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
  };

  const canContinue =
    step === 0
      ? formData.category !== ""
      : step === 1
        ? formData.description.trim().length > 0
        : true;

  const handleDescriptionChange = (value: string) => {
    if (value.length <= 2000) {
      setFormData({ ...formData, description: value });
      if (value.trim()) setDescriptionError("");
    }
  };

  return (
    <div className="mx-auto max-w-[640px] px-md py-xl">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Request a Quote
      </h1>

      {/* Resume banner */}
      {resumeBanner && (
        <div className="mb-lg p-sm bg-accent-dim border border-accent/20 rounded-sm text-sm text-ink flex items-center justify-between gap-sm">
          <span>Picking up where you left off.</span>
          <button
            onClick={() => {
              setResumeBanner(false);
              setStep(0);
              setFormData({
                category: "",
                description: "",
                features: [],
                timeline: "",
                budget: "",
              });
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="text-xs text-accent hover:text-accent-hover underline"
          >
            Start over
          </button>
        </div>
      )}

      {/* Step indicator - mobile: ticks only, desktop: labels */}
      <div className="mb-xl">
        <div className="md:hidden text-sm text-accent font-body mb-sm">
          Step {step + 1} of 3: {steps[step].label}
        </div>
        <div className="md:block hidden">
          <DimensionLine steps={steps} currentStep={step} />
        </div>
        <div className="md:hidden">
          <DimensionLine steps={steps} currentStep={step} hideLabels />
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        Step {step + 1} of 3: {steps[step].label}
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
          {/* Step 0: Category - native radio inputs */}
          {step === 0 && (
            <fieldset>
              <legend className="text-sm text-slate mb-md">
                Select the service that best matches your project.
              </legend>
              <div className="space-y-sm">
                {services.map((s) => (
                  <label
                    key={s.slug}
                    className={`block p-md border text-sm rounded-sm transition-all duration-150 cursor-pointer ${
                      formData.category === s.slug
                        ? "border-accent bg-accent-dim text-ink"
                        : "border-line text-slate hover:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={s.slug}
                      checked={formData.category === s.slug}
                      onChange={() =>
                        setFormData({ ...formData, category: s.slug })
                      }
                      className="sr-only"
                    />
                    <span className="font-medium text-ink">{s.title}</span>
                    <p className="text-xs text-slate mt-xs">
                      {s.description}
                    </p>
                  </label>
                ))}
                <label
                  className={`block p-md border text-sm rounded-sm transition-all duration-150 cursor-pointer ${
                    formData.category === "other"
                      ? "border-accent bg-accent-dim text-ink"
                      : "border-line text-slate hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value="other"
                    checked={formData.category === "other"}
                    onChange={() =>
                      setFormData({ ...formData, category: "other" })
                    }
                    className="sr-only"
                  />
                  <span className="font-medium text-ink">
                    Not sure — describe my project
                  </span>
                  <p className="text-xs text-slate mt-xs">
                    Tell us about your project and we&apos;ll match it to the right service.
                  </p>
                </label>
              </div>
            </fieldset>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div>
              <p className="text-sm text-slate mb-md">
                Tell us about your project. The more detail, the more accurate
                your quote will be.
              </p>

              <div className="space-y-lg">
                {selectedService && (
                  <fieldset>
                    <legend className="text-sm font-medium text-ink mb-sm">
                      Which features do you need?
                    </legend>
                    <div className="space-y-sm">
                      {selectedService.features.map((f) => (
                        <label
                          key={f}
                          className="flex items-start gap-sm text-sm text-slate cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.features.includes(f)}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                features: e.target.checked
                                  ? [...formData.features, f]
                                  : formData.features.filter((x) => x !== f),
                              })
                            }
                            className="mt-1 accent-accent"
                          />
                          {f}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div>
                  <label
                    htmlFor="project-desc"
                    className="text-sm font-medium text-ink mb-sm block"
                  >
                    Project description{" "}
                    <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="project-desc"
                    ref={firstFieldRef as any}
                    value={formData.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Describe your project goal, key features, and any specific requirements..."
                    className={`w-full border rounded-sm p-md text-sm font-body text-ink bg-paper-raised resize-none min-h-[160px] max-h-[240px] transition-colors duration-150 outline-none ${
                      descriptionError ? "border-error" : formData.description.length > 1800 ? "border-amber" : "border-line focus:border-accent"
                    }`}
                    maxLength={2000}
                    aria-describedby={descriptionError ? "desc-error" : "char-count"}
                    aria-invalid={!!descriptionError}
                  />
                  {descriptionError && (
                    <p id="desc-error" className="text-xs text-error mt-xs flex items-center gap-xs">
                      <AlertCircle size={12} />
                      {descriptionError}
                    </p>
                  )}
                  <div
                    id="char-count"
                    className={`text-xs mt-xs text-right ${
                      formData.description.length > 1800
                        ? "text-amber"
                        : "text-slate"
                    }`}
                  >
                    {formData.description.length}/2000
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="timeline"
                    className="text-sm font-medium text-ink mb-sm block"
                  >
                    Timeline preference
                  </label>
                  <select
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) =>
                      setFormData({ ...formData, timeline: e.target.value })
                    }
                    className="w-full border border-line rounded-sm p-md text-sm font-body text-ink bg-paper-raised focus:border-accent transition-colors duration-150 outline-none"
                  >
                    <option value="">Select a timeline</option>
                    {timelineOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="text-sm font-medium text-ink mb-sm block"
                  >
                    Budget range{" "}
                    <span className="text-slate font-normal">
                      — Optional, helps us calibrate
                    </span>
                  </label>
                  <select
                    id="budget"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full border border-line rounded-sm p-md text-sm font-body text-ink bg-paper-raised focus:border-accent transition-colors duration-150 outline-none"
                  >
                    <option value="">Prefer not to say</option>
                    {budgetOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <p className="text-sm text-slate mb-md">
                Review your answers before generating your quote.
              </p>
              <div className="space-y-sm border border-line rounded-sm p-md">
                <ReviewField
                  label="Service"
                  value={
                    selectedService?.title ?? "Not sure — describe my project"
                  }
                  onEdit={() => goToStep(0)}
                />
                <ReviewField
                  label="Description"
                  value={formData.description}
                  onEdit={() => goToStep(1)}
                />
                {formData.features.length > 0 && (
                  <ReviewField
                    label="Selected features"
                    value={formData.features.join(", ")}
                    onEdit={() => goToStep(1)}
                  />
                )}
                {formData.timeline && (
                  <ReviewField
                    label="Timeline"
                    value={
                      timelineOptions.find((o) => o.value === formData.timeline)
                        ?.label ?? formData.timeline
                    }
                    onEdit={() => goToStep(1)}
                  />
                )}
                {formData.budget && (
                  <ReviewField
                    label="Budget"
                    value={
                      budgetOptions.find((o) => o.value === formData.budget)
                        ?.label ?? formData.budget
                    }
                    onEdit={() => goToStep(1)}
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Network error */}
      {networkError && (
        <div
          role="alert"
          className="mt-lg p-sm bg-error/10 border border-error rounded-sm text-sm text-error flex items-center gap-sm"
        >
          <AlertCircle size={14} className="shrink-0" />
          {networkError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-xl">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => goToStep(step - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <Button
            disabled={!canContinue}
            onClick={() => {
              if (step === 1 && !formData.description.trim()) {
                setDescriptionError("Please describe your project to continue.");
                return;
              }
              goToStep(step + 1);
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            disabled={!formData.description.trim()}
            loading={generating}
            onClick={handleGenerate}
          >
            Generate Quote
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-sm">
      <div className="min-w-0">
        <p className="text-xs text-slate">{label}</p>
        <p className="text-sm text-ink truncate">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 text-xs text-accent hover:text-accent-hover transition-colors duration-150"
      >
        Edit
      </button>
    </div>
  );
}