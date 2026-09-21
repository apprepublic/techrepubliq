"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { services } from "@/lib/services";
import { DOMAIN_OPTIONS, TIERS, revisionLabel, type TierId } from "@/lib/product";
import { useTone } from "@/lib/theme";
import { INTAKE_KEY, emptyIntake, type IntakeState } from "@/lib/quote-session";
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
import { cn } from "@/lib/utils";

const steps = ["Category", "Tier & scale", "Brief & assets"];
const DOMAIN_CATEGORIES = new Set(["web-development", "app-development"]);

export default function QuotePage() {
  const router = useRouter();
  const t = useTone();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeState>(emptyIntake);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = localStorage.getItem(INTAKE_KEY);
      const saved = raw ? (JSON.parse(raw) as IntakeState) : emptyIntake();
      const category = params.get("category");
      const tier = params.get("tier");
      setData({
        ...emptyIntake(),
        ...saved,
        ...(category && services.some((service) => service.slug === category)
          ? { category: category as IntakeState["category"] }
          : {}),
        ...(tier && TIERS.some((item) => item.id === tier) ? { tierId: tier as TierId } : {}),
      });
    } catch {
      setData(emptyIntake());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(INTAKE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const selected = services.find((service) => service.slug === data.category);
  const needsDomain = DOMAIN_CATEGORIES.has(data.category);

  const canContinue = useMemo(() => {
    if (step === 0) return !!data.category;
    if (step === 1) return !!data.tierId && !!data.stage;
    return data.brief.trim().length >= 20 && (!needsDomain || !!data.domainOption);
  }, [data, needsDomain, step]);

  const patch = (next: Partial<IntakeState>) => setData((current) => ({ ...current, ...next }));

  const goNext = () => {
    setError("");
    if (step === 2) {
      if (data.brief.trim().length < 20) {
        setError("Give us a bit more — at least a few sentences about what to build.");
        return;
      }
      if (needsDomain && !data.domainOption) {
        setError("Choose how you want to handle the domain before continuing.");
        return;
      }
      router.push("/quote/result");
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <PageWrap>
      <div className="mx-auto max-w-[640px] px-6 py-12 lg:py-16">
        <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${t.isDark ? "text-[#FF8A80]" : "text-[#C8102E]"}`}>
          Get Started
        </p>
        <h1 className={`mt-2 font-display text-[28px] font-semibold lg:text-[36px] ${t.ink}`}>
          Describe the product. We&apos;ll price the build.
        </h1>
        <p className={`mb-8 mt-2 text-[14px] ${t.muted}`}>
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
                  {services.map((service) => (
                    <label
                      key={service.slug}
                      className={cn(
                        "block cursor-pointer rounded-[16px] border p-4 transition-colors",
                        data.category === service.slug
                          ? "border-[#C8102E] bg-[rgba(200,16,46,0.08)]"
                          : t.card
                      )}
                    >
                      <input
                        type="radio"
                        name="category"
                        className="sr-only"
                        checked={data.category === service.slug}
                        onChange={() => patch({ category: service.slug as IntakeState["category"] })}
                      />
                      <span className={`block text-[15px] font-semibold ${t.ink}`}>{service.title}</span>
                      <span className={`mt-1 block text-[13px] ${t.muted}`}>{service.short}</span>
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TIERS.map((tier) => (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() => patch({ tierId: tier.id })}
                      className={cn(
                        "rounded-[16px] border p-4 text-left transition-colors",
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
                      <p className={`mt-2 text-[12px] ${t.muted}`}>{revisionLabel(tier.id)}</p>
                    </button>
                  ))}
                </div>

                <Field label="Current stage of the business">
                  <SelectInput value={data.stage} onChange={(event) => patch({ stage: event.target.value })}>
                    <option value="">Select…</option>
                    <option value="solo">Solo / small team</option>
                    <option value="funded">Funded startup</option>
                    <option value="established">Established business</option>
                    <option value="large">Large organization</option>
                  </SelectInput>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Expected daily traffic" hint="Rough page or API requests per day.">
                    <TextInput
                      inputMode="numeric"
                      value={data.requestsPerDay}
                      onChange={(event) => patch({ requestsPerDay: event.target.value })}
                      placeholder="e.g. 2,000"
                    />
                  </Field>
                  <Field label="Expected registered users">
                    <TextInput
                      inputMode="numeric"
                      value={data.users}
                      onChange={(event) => patch({ users: event.target.value })}
                      placeholder="e.g. 5,000"
                    />
                  </Field>
                  <Field label="Daily transactions" hint="Leave blank if it does not apply.">
                    <TextInput
                      inputMode="numeric"
                      value={data.transactions}
                      onChange={(event) => patch({ transactions: event.target.value })}
                      placeholder="e.g. 80"
                    />
                  </Field>
                  <Field label="Staff / admin users">
                    <TextInput
                      inputMode="numeric"
                      value={data.staff}
                      onChange={(event) => patch({ staff: event.target.value })}
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
                  Send the brief and assets. We infer add-ons from what you write — you do not pick them here.
                </p>
                <Field label="Business brief" hint="What should exist when we launch? Who is it for?">
                  <TextArea
                    value={data.brief}
                    maxLength={4000}
                    onChange={(event) => patch({ brief: event.target.value })}
                    placeholder="We&apos;re a café group that needs a site with locations, online ordering, and a weekly newsletter…"
                  />
                  <div className={`mt-1 text-right text-[12px] ${data.brief.length > 3600 ? "text-amber-700" : t.muted}`}>
                    {data.brief.length}/4000
                  </div>
                </Field>
                <Field label="Logo / brand file" hint="Optional. We store the file with the quote when you send it.">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className={`block w-full text-[13px] ${t.muted}`}
                    onChange={(event) => patch({ logoName: event.target.files?.[0]?.name ?? "" })}
                  />
                  {data.logoName && <p className={`mt-1 text-[12px] ${t.ink}`}>{data.logoName}</p>}
                </Field>

                {needsDomain && (
                  <Card>
                    <p className={`text-[14px] font-medium ${t.ink}`}>Domain</p>
                    <p className={`mt-1 text-[13px] ${t.muted}`}>
                      Hosting and backend are included either way. Registering a domain here is optional.
                    </p>
                    <div className="mt-3 space-y-2">
                      {DOMAIN_OPTIONS.map((option) => (
                        <label key={option.id} className={`flex gap-2 text-[14px] ${t.ink}`}>
                          <input
                            type="radio"
                            name="domain-option"
                            checked={data.domainOption === option.id}
                            onChange={() => patch({ domainOption: option.id })}
                          />
                          <span>
                            {option.label}
                            <span className={`block text-[12px] ${t.muted}`}>{option.note}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </Card>
                )}

                {data.category === "app-development" && (
                  <label className={`flex items-start gap-2 text-[14px] ${t.ink}`}>
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={data.storeDeploy}
                      onChange={(event) => patch({ storeDeploy: event.target.checked })}
                    />
                    Include App Store / Play Store deployment assistance (one-time service)
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
            <button type="button" onClick={() => setStep((current) => current - 1)} className={`text-[14px] ${t.muted} hover:text-[#C8102E]`}>
              Back
            </button>
          ) : (
            <span />
          )}
          <PrimaryButton disabled={!canContinue} onClick={goNext}>
            {step === 2 && data.tierId === "enterprise" ? "Contact sales" : step === 2 ? "Get Priced" : "Continue"}
          </PrimaryButton>
        </div>
      </div>
    </PageWrap>
  );
}
