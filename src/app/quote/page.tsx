"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { services } from "@/lib/utils";
import {
  INTAKE_KEY,
  emptyIntake,
  tiers,
  revisionLabel,
  type IntakeState,
} from "@/lib/product";
import { useTone } from "@/lib/theme";
import {
  Card,
  Field,
  PageWrap,
  PrimaryButton,
  SelectInput,
  StepTrack,
  TextArea,
  TextInput,
} from "@/components/product-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Category", "Tier", "Brief"];

export default function QuotePage() {
  const router = useRouter();
  const t = useTone();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeState>(emptyIntake);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") ?? "";
    try {
      const raw = localStorage.getItem(INTAKE_KEY);
      const saved = raw ? (JSON.parse(raw) as IntakeState) : emptyIntake();
      if (category) saved.category = category;
      setData(saved);
    } catch {
      setData({ ...emptyIntake(), category });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(INTAKE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const selected = services.find((s) => s.slug === data.category);
  const needsDomain = data.category === "web-development";
  const needsStore = data.category === "app-development";

  const canContinue = useMemo(() => {
    if (step === 0) return !!data.category;
    if (step === 1) return !!data.tierId && !!data.stage;
    if (step === 2) return data.brief.trim().length >= 40;
    return false;
  }, [step, data]);

  const goNext = () => {
    setError("");
    if (step === 2) {
      if (data.brief.trim().length < 40) {
        setError("Give us a bit more — at least a few sentences about what to build.");
        return;
      }
      router.push("/quote/result");
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <PageWrap>
      <div className="mx-auto max-w-[640px] px-6 py-12 lg:py-16">
        <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${t.isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
          Get Started
        </p>
        <h1 className={`mt-2 font-display text-[28px] lg:text-[36px] font-semibold ${t.ink}`}>
          Describe the product. We’ll price the build.
        </h1>
        <p className={`mt-2 mb-8 text-[14px] ${t.muted}`}>
          No plugin catalog. No token meter. A human team builds what you describe.
        </p>

        <StepTrack steps={steps} current={step} />

        <div className="sr-only" aria-live="polite">
          Step {step + 1} of 3: {steps[step]}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            {step === 0 && (
              <fieldset>
                <legend className={`mb-4 text-[14px] ${t.muted}`}>What are we building?</legend>
                <div className="space-y-2">
                  {services.map((s) => (
                    <label
                      key={s.slug}
                      className={cn(
                        "block cursor-pointer rounded-[16px] border p-4 transition-colors",
                        data.category === s.slug
                          ? "border-[#C8102E] bg-[rgba(200,16,46,0.08)]"
                          : t.card
                      )}
                    >
                      <input
                        type="radio"
                        name="category"
                        className="sr-only"
                        checked={data.category === s.slug}
                        onChange={() => setData({ ...data, category: s.slug })}
                      />
                      <span className={`block text-[15px] font-semibold ${t.ink}`}>{s.title}</span>
                      <span className={`mt-1 block text-[13px] ${t.muted}`}>{s.short}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <p className={`text-[14px] ${t.muted}`}>
                  Tiers scale recurring services and included reviews. The development-fee math is the same at every tier.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tiers.map((tier) => (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() =>
                        setData({
                          ...data,
                          tierId: tier.id,
                          stage: data.stage || tier.stageHint,
                        })
                      }
                      className={cn(
                        "text-left rounded-[16px] border p-4 transition-colors",
                        data.tierId === tier.id
                          ? "border-[#C8102E] bg-[rgba(200,16,46,0.08)]"
                          : t.card
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${t.ink}`}>{tier.name}</span>
                        {data.tierId === tier.id && <Check size={16} className="text-[#C8102E]" />}
                      </div>
                      <p className={`mt-1 text-[13px] ${t.muted}`}>{tier.for}</p>
                      <p className={`mt-2 text-[12px] ${t.muted}`}>{revisionLabel(tier)}</p>
                    </button>
                  ))}
                </div>

                <Field label="Current stage of the business">
                  <SelectInput
                    value={data.stage}
                    onChange={(e) => setData({ ...data, stage: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="solo/small team">Solo / small team</option>
                    <option value="funded startup">Funded startup</option>
                    <option value="established business">Established business</option>
                    <option value="large organization">Large organization</option>
                  </SelectInput>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Expected daily traffic / volume">
                    <TextInput
                      value={data.traffic}
                      onChange={(e) => setData({ ...data, traffic: e.target.value })}
                      placeholder="e.g. 2,000 visits/day"
                    />
                  </Field>
                  <Field label="Expected registered users">
                    <TextInput
                      value={data.users}
                      onChange={(e) => setData({ ...data, users: e.target.value })}
                      placeholder="e.g. 5,000"
                    />
                  </Field>
                  <Field label="Daily transactions / orders" hint="Skip if it doesn’t apply.">
                    <TextInput
                      value={data.transactions}
                      onChange={(e) => setData({ ...data, transactions: e.target.value })}
                      placeholder="e.g. 80 orders/day"
                    />
                  </Field>
                  <Field label="Staff / admin users">
                    <TextInput
                      value={data.staff}
                      onChange={(e) => setData({ ...data, staff: e.target.value })}
                      placeholder="e.g. 4"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <p className={`text-[14px] ${t.muted}`}>
                  {selected ? `${selected.title}: ` : ""}
                  Send the brief and assets. We infer add-ons from what you write — you don’t pick them here.
                </p>
                <Field label="Business brief" hint="What should exist when we launch? Who is it for?">
                  <TextArea
                    value={data.brief}
                    maxLength={4000}
                    onChange={(e) => setData({ ...data, brief: e.target.value })}
                    placeholder="We’re a café group that needs a site with locations, online ordering, and a weekly newsletter…"
                  />
                  <div className={`mt-1 text-right text-[12px] ${data.brief.length > 3600 ? "text-amber" : t.muted}`}>
                    {data.brief.length}/4000
                  </div>
                </Field>
                <Field label="Logo / brand file" hint="Optional. We only store the file name in this preview.">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className={`block w-full text-[13px] ${t.muted}`}
                    onChange={(e) =>
                      setData({ ...data, logoName: e.target.files?.[0]?.name ?? "" })
                    }
                  />
                  {data.logoName && <p className={`mt-1 text-[12px] ${t.ink}`}>{data.logoName}</p>}
                </Field>

                {needsDomain && (
                  <Card>
                    <p className={`text-[14px] font-medium ${t.ink}`}>Domain</p>
                    <p className={`mt-1 text-[13px] ${t.muted}`}>
                      Hosting and backend are included either way. Buying a domain here is optional.
                    </p>
                    <div className="mt-3 space-y-2">
                      <label className={`flex gap-2 text-[14px] ${t.ink}`}>
                        <input
                          type="radio"
                          checked={data.hasDomain === "yes"}
                          onChange={() => setData({ ...data, hasDomain: "yes", buyDomain: false })}
                        />
                        I already have a domain — you’ll get DNS details
                      </label>
                      <label className={`flex gap-2 text-[14px] ${t.ink}`}>
                        <input
                          type="radio"
                          checked={data.hasDomain === "no"}
                          onChange={() => setData({ ...data, hasDomain: "no", buyDomain: true })}
                        />
                        Buy a domain through TechRepubliQ
                      </label>
                    </div>
                  </Card>
                )}

                {needsStore && (
                  <label className={`flex items-start gap-2 text-[14px] ${t.ink}`}>
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={data.storeDeploy}
                      onChange={(e) => setData({ ...data, storeDeploy: e.target.checked })}
                    />
                    Include App Store / Play Store deployment assistance (one-time)
                  </label>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-6 text-[13px] text-[#8C2F1B]">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={`text-[14px] ${t.muted} hover:text-[#C8102E]`}
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <PrimaryButton disabled={!canContinue} onClick={goNext}>
            {step === 2 ? (data.tierId === "enterprise" ? "Contact sales" : "Get Priced") : "Continue"}
          </PrimaryButton>
        </div>
      </div>
    </PageWrap>
  );
}
