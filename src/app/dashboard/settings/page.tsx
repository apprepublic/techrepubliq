"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTone } from "@/lib/theme";
import { api } from "@/lib/api";
import { Card, Field, PrimaryButton, TextInput } from "@/components/product-ui";
import { Modal } from "@/components/Modal";

export default function SettingsPage() {
  const router = useRouter();
  const t = useTone();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    api.customers
      .me()
      .then(({ customer }) => {
        setName(customer.name ?? "");
        setEmail(customer.email ?? "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Could not load account."))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setError("");
    try {
      const response = await api.customers.update({ name: name.trim(), email: email.trim() });
      setName(response.customer.name ?? name);
      setEmail(response.customer.email ?? email);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save changes.");
    }
  };

  const remove = async () => {
    try {
      await api.customers.remove();
      sessionStorage.clear();
      router.push("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete account.");
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-[560px]">
      <h1 className={`mb-8 font-display text-[28px] font-semibold ${t.ink}`}>Account</h1>
      <Card>
        <p className={`text-[16px] font-semibold ${t.ink}`}>Contact details</p>
        {loading ? (
          <p className={`mt-4 text-[13px] ${t.muted}`}>Loading account…</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Field label="Name"><TextInput value={name} onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="Email"><TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
            <div className="flex items-center gap-3">
              <PrimaryButton onClick={save}>Save changes</PrimaryButton>
              {saved && <span className="text-[13px] text-emerald-600">Saved</span>}
            </div>
          </div>
        )}
        {error && <p role="alert" className="mt-4 text-[13px] text-[#8C2F1B]">{error}</p>}
      </Card>
      <div className="mt-4 rounded-[20px] border border-[#8C2F1B]/40 p-5">
        <p className="font-semibold text-[#8C2F1B]">Delete account</p>
        <p className={`mt-2 text-[13px] ${t.muted}`}>Paid projects are not refunded. Type your email to confirm.</p>
        <button className="mt-3 text-[13px] text-[#8C2F1B] underline" onClick={() => setDeleteOpen(true)}>Delete account</button>
      </div>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm deletion">
        <p className={`text-[14px] ${t.muted}`}>Type {email} to confirm. This cannot be undone.</p>
        <TextInput className="mt-3" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} />
        <div className="mt-4 flex justify-end">
          <button disabled={confirmEmail !== email} onClick={remove} className="text-[14px] text-[#8C2F1B] disabled:opacity-40">
            Delete my account
          </button>
        </div>
      </Modal>
    </div>
  );
}
