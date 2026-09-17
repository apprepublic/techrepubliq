"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { api, type EmailCenter, type EmailMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * §13 — an inbox on the project's own domain.
 *
 * Shown only when the Email add-on is active; the server enforces the same rule, so a
 * hidden tab is a convenience rather than the control.
 *
 * The provider is never named anywhere in here (§7). As far as the customer is
 * concerned this is their inbox on their domain, and that's the whole story.
 */

type Folder = "inbound" | "sent";

function when(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function who(message: EmailMessage, folder: Folder): string {
  return folder === "sent" ? message.to_addr : message.from_addr;
}

export function EmailTab({ projectId }: { projectId: string }) {
  const [folder, setFolder] = useState<Folder>("inbound");
  const [data, setData] = useState<EmailCenter | null>(null);
  const [open, setOpen] = useState<EmailMessage | null>(null);
  /** null = closed. An object opens the composer already addressed. */
  const [compose, setCompose] = useState<{ to: string; subject: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.projects.email
      .list(projectId, folder)
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Couldn't load your inbox.")
      );
  };

  useEffect(load, [projectId, folder]);

  /** Opening a message is what marks it read — no separate action to forget. */
  const read = async (message: EmailMessage) => {
    setOpen(message);
    if (message.read_at || folder !== "inbound") return;
    try {
      const res = await api.projects.email.markRead(projectId, message.id);
      setData((current) => (current ? { ...current, unread: res.unread } : current));
      setOpen({ ...message, read_at: new Date().toISOString() });
    } catch {
      // Failing to record a read must not stop the message from opening.
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      const res = await api.projects.email.markRead(projectId);
      setData((current) =>
        current
          ? {
              ...current,
              unread: res.unread,
              messages: current.messages.map((m) => ({ ...m, read_at: m.read_at ?? "read" })),
            }
          : current
      );
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="border border-line rounded-sm p-lg">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!data) return <div className="h-64 w-full bg-accent-dim rounded-sm animate-pulse" />;

  return (
    <div className="space-y-md">
      <div className="border border-line rounded-sm p-md bg-paper flex items-center justify-between gap-sm flex-wrap">
        <div>
          <p className="text-sm text-ink">
            {data.mailbox ? (
              <span className="font-mono">{data.mailbox}</span>
            ) : (
              "No address yet"
            )}
          </p>
          <p className="text-xs text-slate mt-xs">
            {data.mailbox
              ? "Mail sent here arrives in this inbox. Replies go out from the same address."
              : "Your address appears as soon as this project has a domain."}
          </p>
        </div>
        <Button onClick={() => setCompose({ to: "", subject: "" })} disabled={!data.mailbox}>
          Compose
        </Button>
      </div>

      <div className="flex items-center justify-between gap-sm flex-wrap">
        <div className="flex border border-line rounded-sm overflow-hidden">
          {(["inbound", "sent"] as Folder[]).map((option) => (
            <button
              key={option}
              onClick={() => setFolder(option)}
              className={cn(
                "px-md py-xs text-sm transition-colors duration-150",
                folder === option ? "bg-accent-dim text-accent" : "text-slate hover:text-ink"
              )}
            >
              {option === "sent" ? "Sent" : "Inbox"}
              {option === "inbound" && data.unread > 0 && (
                <span className="ml-xs font-mono text-xs">({data.unread})</span>
              )}
            </button>
          ))}
        </div>

        {folder === "inbound" && data.unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={busy}
            className="text-xs text-accent hover:text-accent-hover underline disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {data.messages.length === 0 ? (
        <div className="border border-line rounded-sm p-lg">
          <p className="text-sm text-slate">
            {folder === "sent"
              ? "Nothing sent yet."
              : "No mail yet. Anything sent to your address shows up here."}
          </p>
        </div>
      ) : (
        <ul className="border border-line rounded-sm divide-y divide-line">
          {data.messages.map((message) => (
            <li key={message.id}>
              <button
                onClick={() => read(message)}
                className="w-full text-left px-md py-sm hover:bg-accent-dim/40 transition-colors duration-150 flex items-start justify-between gap-sm"
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      folder === "inbound" && !message.read_at ? "text-ink font-medium" : "text-ink"
                    )}
                  >
                    {folder === "inbound" && !message.read_at && (
                      <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent mr-sm align-middle" />
                    )}
                    {message.subject}
                  </p>
                  <p className="text-xs text-slate font-mono mt-xs truncate">
                    {who(message, folder)}
                  </p>
                </div>
                <span className="text-xs text-slate font-mono shrink-0">{when(message.sent_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Reading one message */}
      <Modal isOpen={open !== null} onClose={() => setOpen(null)} title={open?.subject ?? ""}>
        {open && (
          <div>
            <p className="text-xs text-slate font-mono mb-md">
              {folder === "sent" ? "To" : "From"}: {who(open, folder)} · {when(open.sent_at)}
            </p>
            <div className="text-sm text-slate whitespace-pre-wrap leading-relaxed">
              {open.body || "(no body)"}
            </div>
            {folder === "inbound" && (
              <div className="mt-lg">
                <Button
                  onClick={() => {
                    setOpen(null);
                    setCompose({
                      to: open.from_addr,
                      subject: open.subject.startsWith("Re:")
                        ? open.subject
                        : `Re: ${open.subject}`,
                    });
                  }}
                >
                  Reply
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ComposeModal
        projectId={projectId}
        isOpen={compose !== null}
        prefill={compose}
        onClose={() => setCompose(null)}
        onSent={() => {
          setCompose(null);
          load();
        }}
      />
    </div>
  );
}

function ComposeModal({
  projectId,
  isOpen,
  prefill,
  onClose,
  onSent,
}: {
  projectId: string;
  isOpen: boolean;
  /** Set when opened from "Reply" — addresses and titles the message. */
  prefill: { to: string; subject: string } | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Re-read the prefill each time the modal opens, so a reply opens addressed and a
  // fresh compose opens blank.
  useEffect(() => {
    if (!isOpen || !prefill) return;
    setTo(prefill.to);
    setSubject(prefill.subject);
    setBody("");
    setError("");
  }, [isOpen, prefill]);

  const send = async () => {
    setBusy(true);
    setError("");
    try {
      await api.projects.email.send(projectId, { to, subject, body });
      setTo("");
      setSubject("");
      setBody("");
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That message didn't send.");
    }
    setBusy(false);
  };

  const field =
    "block w-full mt-xs border border-line rounded-sm px-sm py-xs text-sm bg-paper text-ink";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compose">
      <div className="space-y-md">
        <label className="block text-sm text-slate">
          To
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            type="email"
            placeholder="someone@example.com"
            className={field}
          />
        </label>
        <label className="block text-sm text-slate">
          Subject
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this about?"
            className={field}
          />
        </label>
        <label className="block text-sm text-slate">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className={field}
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-sm">
          <button
            onClick={onClose}
            className="text-sm text-slate hover:text-ink px-md py-xs transition-colors duration-150"
          >
            Cancel
          </button>
          <Button onClick={send} loading={busy} disabled={!to || !subject || !body}>
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
}
