"use client";

import { useState } from "react";
import { useTone } from "@/lib/theme";
import { Card, Field, PrimaryButton, TextInput } from "@/components/product-ui";
import { Modal } from "@/components/Modal";

export default function SettingsPage() {
  const t = useTone();
  const [name, setName] = useState("Jane Smith");
  const [email, setEmail] = useState("jane@example.com");
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  return (
    <div className="max-w-[560px]">
      <h1 className={`font-display text-[28px] font-semibold mb-8 ${t.ink}`}>Account</h1>
      <Card>
        <p className={`text-[16px] font-semibold ${t.ink}`}>Contact details</p>
        <div className="mt-4 space-y-4">
          <Field label="Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <div className="flex items-center gap-3">
            <PrimaryButton
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
              }}
            >
              Save changes
            </PrimaryButton>
            {saved && <span className="text-[13px] text-emerald-600">Saved</span>}
          </div>
        </div>
      </Card>
      <div className={`mt-4 rounded-[20px] border border-[#8C2F1B]/40 p-5`}>
        <p className="font-semibold text-[#8C2F1B]">Delete account</p>
        <p className={`mt-2 text-[13px] ${t.muted}`}>
          Paid projects are not refunded. Type your email to confirm.
        </p>
        <button className="mt-3 text-[13px] text-[#8C2F1B] underline" onClick={() => setDeleteOpen(true)}>
          Delete account
        </button>
      </div>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm deletion">
        <p className={`text-[14px] ${t.muted}`}>Type {email} to confirm. This cannot be undone.</p>
        <TextInput className="mt-3" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
        <div className="mt-4 flex justify-end">
          <button
            disabled={confirmEmail !== email}
            className="text-[14px] text-[#8C2F1B] disabled:opacity-40"
          >
            Delete my account
          </button>
        </div>
      </Modal>
    </div>
  );
}
