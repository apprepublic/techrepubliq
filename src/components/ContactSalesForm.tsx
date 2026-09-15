"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import { BUSINESS_STAGES } from "@/lib/product";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ContactSalesFormProps {
  /** Pre-filled from the flow the customer came through. */
  category?: string;
  tierId?: string;
  source?: string;
  onDone?: () => void;
}

/**
 * Enterprise short-circuit (PRD §4.3, decision 4/14): no price is ever shown,
 * the lead is stored and emailed to admin@techrepubliq.com.
 */
export function ContactSalesForm({
  category,
  tierId,
  source = "contact-sales",
  onDone,
}: ContactSalesFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    businessStage: "",
    expectedScale: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    form.name.trim().length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Please add your name and a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.contactSales.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        businessStage: form.businessStage || undefined,
        expectedScale: form.expectedScale.trim() || undefined,
        category,
        tierId,
        notes: form.notes.trim() || undefined,
        source,
      });
      setSent(true);
      onDone?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't send that. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="border border-line rounded-sm p-lg bg-paper-raised">
        <div className="flex items-start gap-sm">
          <CheckCircle2 size={18} className="text-success mt-[2px] shrink-0" />
          <div>
            <p className="text-sm font-medium text-ink mb-xs">
              Thanks — we have your details.
            </p>
            <p className="text-sm text-slate">
              Someone from the team will reply within one business day to scope your project.
              Enterprise work is quoted by conversation, so there&apos;s no online price for it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full border border-line rounded-sm p-md text-sm font-body text-ink bg-paper-raised focus:border-accent transition-colors duration-150 outline-none";

  return (
    <div className="space-y-lg">
      <div>
        <label htmlFor="cs-name" className="text-sm font-medium text-ink mb-sm block">
          Your name <span className="text-error">*</span>
        </label>
        <input
          id="cs-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="cs-email" className="text-sm font-medium text-ink mb-sm block">
          Work email <span className="text-error">*</span>
        </label>
        <input
          id="cs-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="cs-company" className="text-sm font-medium text-ink mb-sm block">
          Company
        </label>
        <input
          id="cs-company"
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
          className={inputClass}
          autoComplete="organization"
        />
      </div>

      <div>
        <label htmlFor="cs-stage" className="text-sm font-medium text-ink mb-sm block">
          Stage of the business
        </label>
        <select
          id="cs-stage"
          value={form.businessStage}
          onChange={(e) => set("businessStage", e.target.value)}
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

      <div>
        <label htmlFor="cs-scale" className="text-sm font-medium text-ink mb-sm block">
          Expected scale
        </label>
        <input
          id="cs-scale"
          value={form.expectedScale}
          onChange={(e) => set("expectedScale", e.target.value)}
          placeholder="Rough users, traffic, locations, or sites"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cs-notes" className="text-sm font-medium text-ink mb-sm block">
          What do you need built?
        </label>
        <textarea
          id="cs-notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value.slice(0, 2000))}
          className={`${inputClass} resize-none min-h-[120px]`}
          maxLength={2000}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-error flex items-center gap-xs">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      <Button onClick={handleSubmit} loading={submitting} disabled={!canSubmit || submitting}>
        Send enquiry
      </Button>
    </div>
  );
}
