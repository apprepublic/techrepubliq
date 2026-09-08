"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

const mockOrderInProgress = true;

export default function SettingsPage() {
  const [name, setName] = useState("Jane Smith");
  const [email, setEmail] = useState("jane@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleSaveName = () => {
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 3000);
  };

  const handleSavePassword = () => {
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="max-w-[560px]">
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-xl">
        Account Settings
      </h1>

      {/* Contact details */}
      <fieldset className="border border-line rounded-sm p-lg mb-lg">
        <legend className="text-md font-display font-semibold text-ink px-sm">
          Contact details
        </legend>
        <div className="space-y-md">
          <div>
            <label
              htmlFor="settings-name"
              className="text-sm font-medium text-ink mb-sm block"
            >
              Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150"
            />
          </div>
          <div>
            <label
              htmlFor="settings-email"
              className="text-sm font-medium text-ink mb-sm block"
            >
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={handleSaveName}>Save changes</Button>
            {nameSaved && (
              <span className="text-xs text-success">Saved</span>
            )}
          </div>
        </div>
      </fieldset>

      {/* Password */}
      <fieldset className="border border-line rounded-sm p-lg mb-lg">
        <legend className="text-md font-display font-semibold text-ink px-sm">
          Password
        </legend>
        <div className="space-y-md">
          <div>
            <label
              htmlFor="settings-current-pw"
              className="text-sm font-medium text-ink mb-sm block"
            >
              Current password
            </label>
            <input
              id="settings-current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError("");
              }}
              className={`w-full border rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150 ${
                passwordError ? "border-error" : "border-line"
              }`}
              aria-describedby={passwordError ? "pw-error" : undefined}
              aria-invalid={!!passwordError}
            />
          </div>
          <div>
            <label
              htmlFor="settings-new-pw"
              className="text-sm font-medium text-ink mb-sm block"
            >
              New password
            </label>
            <input
              id="settings-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-line rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150"
            />
          </div>
          {passwordError && (
            <p id="pw-error" className="text-xs text-error">
              {passwordError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <Button onClick={handleSavePassword}>Save changes</Button>
            {passwordSaved && (
              <span className="text-xs text-success">Saved</span>
            )}
          </div>
        </div>
      </fieldset>

      {/* Delete account */}
      <div className="border border-error rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-error mb-sm">
          Delete account
        </h2>
        <p className="text-sm text-slate mb-md">
          Permanently delete your account and all associated data. Existing
          orders and invoices will remain accessible via emailed copies.
        </p>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setConfirmEmail("");
        }}
        title="Confirm account deletion"
      >
        <p className="text-sm text-slate mb-md">
          This action is permanent and cannot be undone. Type your account
          email to confirm.
        </p>
        {mockOrderInProgress && (
          <div className="p-sm bg-amber/10 border border-amber rounded-sm text-xs text-amber mb-md">
            You have an order in progress. Deleting your account will stop
            work on that order.
          </div>
        )}
        <input
          type="email"
          placeholder="your@email.com"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full border border-line rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150 mb-lg"
        />
        <div className="flex justify-end gap-sm">
          <Button
            variant="ghost"
            onClick={() => {
              setDeleteOpen(false);
              setConfirmEmail("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmEmail !== email}
          >
            Delete my account
          </Button>
        </div>
      </Modal>
    </div>
  );
}