"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { DimensionLine } from "@/components/DimensionLine";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/payments/provider";

/**
 * Historical orders (§15) — readable exactly as they were.
 *
 * This used to render a hardcoded sample order for every id, which meant a customer
 * clicking any past order was shown someone else's figures: "ORD-001", "$3,500",
 * "In Progress". It now reads the real row.
 *
 * Orders are thin by nature — the ones that matter live under Projects now — so every
 * field here degrades to nothing rather than to a placeholder. An empty scope list is
 * honest; an invented one isn't.
 */

const STATUS_STEPS = ["Paid", "In Progress", "Delivered"];

interface OrderRecord {
  id: string;
  quote_reference: string;
  service_title: string;
  service_slug: string;
  description: string;
  scope_features: string;
  timeline: string | null;
  price_cents: number;
  currency: string;
  status: string;
  invoice_url: string | null;
  created_at: string;
}

interface MigrationRecord {
  id: string;
  scope: string;
  status: string;
  requested_at: string;
}

function parseList(value: string): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function formatDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function OrderDetailClient() {
  // Read from the URL rather than useSearchParams: this page is statically exported, and
  // useSearchParams would demand a Suspense boundary for no benefit here.
  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [migration, setMigration] = useState<MigrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [migrationOpen, setMigrationOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  const load = useCallback(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.orders
      .get(id)
      .then((res: any) => {
        setOrder(res.order ?? null);
        setMigration(res.migration ?? null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Couldn't load this order.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  if (id === null || loading) {
    return (
      <div className="max-w-[720px] space-y-md">
        <div className="h-8 w-48 bg-accent-dim rounded-sm animate-pulse" />
        <div className="h-64 w-full bg-accent-dim rounded-sm animate-pulse" />
      </div>
    );
  }

  if (!id || error || !order) {
    return (
      <div className="max-w-[720px] text-center py-xl border border-line rounded-sm">
        <p className="text-base text-slate mb-md">
          {error || (!id ? "Pick an order to open." : "That order isn't available.")}
        </p>
        <Link href="/dashboard/orders">
          <Button>Back to past orders</Button>
        </Link>
      </div>
    );
  }

  const features = parseList(order.scope_features);
  const isDelivered = order.status === "Delivered";
  const currentStep = Math.max(STATUS_STEPS.indexOf(order.status), 0);

  const requestMigration = async () => {
    setBusy(true);
    setError("");
    try {
      await api.migrations.request({ orderId: order.id, scope: "frontend" });
      setMigrationOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That request didn't go through.");
    }
    setBusy(false);
  };

  return (
    <div className="max-w-[720px]">
      <nav className="mb-lg text-sm text-slate">
        <Link
          href="/dashboard/orders"
          className="hover:text-accent transition-colors duration-150 no-underline"
        >
          Past orders
        </Link>
        <span className="mx-sm">/</span>
        <span className="text-ink">{order.quote_reference}</span>
      </nav>

      <CornerBracketFrame className="mb-xl">
        <div className="flex items-start justify-between mb-lg gap-sm flex-wrap">
          <div>
            <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">
              {order.service_title}
            </h1>
            <p className="font-mono text-sm text-slate">{order.quote_reference}</p>
          </div>
          <StatusBadge status={order.status as ProjectStatus} />
        </div>

        <div className="flex items-center gap-xl text-sm mb-lg flex-wrap">
          <div>
            <p className="text-xs text-slate mb-xs">Date</p>
            <p className="font-mono text-ink">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate mb-xs">Total</p>
            <p className="font-mono text-ink">
              {formatMoney(order.price_cents, order.currency)}
            </p>
          </div>
          {order.timeline && (
            <div>
              <p className="text-xs text-slate mb-xs">Timeline</p>
              <p className="font-mono text-ink">{order.timeline}</p>
            </div>
          )}
        </div>

        {features.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-ink mb-sm">Scope</h2>
            <ul className="space-y-sm mb-lg">
              {features.map((item, i) => (
                <li key={i} className="flex items-start gap-sm text-sm text-slate">
                  <span className="text-accent mt-[3px] shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}

        {order.description && (
          <p className="text-sm text-slate leading-relaxed">{order.description}</p>
        )}
      </CornerBracketFrame>

      <div className="mb-xl">
        <h2 className="font-display text-md font-semibold text-ink mb-md">Status</h2>
        <DimensionLine
          steps={STATUS_STEPS.map((label) => ({ label }))}
          currentStep={currentStep}
        />
      </div>

      <div className="space-y-sm mb-xl">
        <div className="border border-line rounded-sm p-md flex items-center justify-between gap-sm flex-wrap">
          <div>
            <p className="text-sm font-medium text-ink">Invoice</p>
            <p className="text-xs text-slate">
              {order.invoice_url
                ? "Download your invoice receipt"
                : "Emailed to you when the payment cleared"}
            </p>
          </div>
          {order.invoice_url ? (
            <a href={order.invoice_url} target="_blank" rel="noreferrer">
              <Button variant="secondary">Download PDF</Button>
            </a>
          ) : (
            <Button variant="secondary" disabled>
              No file
            </Button>
          )}
        </div>

        <div className="border border-line rounded-sm p-md flex items-center justify-between gap-sm flex-wrap">
          <div>
            <p className="text-sm font-medium text-ink">Request Migration</p>
            <p className="text-xs text-slate">
              {migration
                ? `Requested ${formatDate(migration.requested_at)} · ${migration.status}`
                : isDelivered
                  ? "Get your front-end code"
                  : "Available once your order is delivered"}
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={!isDelivered || Boolean(migration)}
            onClick={() => setMigrationOpen(true)}
          >
            {migration ? "Requested" : "Request"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate">
        This order is governed by the{" "}
        <Link href="/terms" className="text-accent hover:text-accent-hover underline">
          Service Agreement
        </Link>
        .
      </p>

      <Modal
        isOpen={migrationOpen}
        onClose={() => setMigrationOpen(false)}
        title="Request Migration"
      >
        {/* One option, because one thing is delivered. The old copy offered "front-end +
            back-end migration files" — the server has only ever produced the front-end
            bundle, and the Service Agreement says so. */}
        <p className="text-sm text-slate mb-md">
          We&apos;ll prepare your front-end code as a downloadable bundle.
        </p>
        <div className="p-sm bg-accent-dim rounded-sm text-xs text-slate mb-lg">
          <strong className="text-ink">What&apos;s included:</strong> your front-end code and
          static assets. Hosting, backend and database stay with us — that&apos;s what your
          Project Services cover — and proprietary AI automation components aren&apos;t
          portable. We don&apos;t hand over a repository or source-control access.
        </div>
        {error && <p className="text-sm text-error mb-md">{error}</p>}
        <div className="flex justify-end gap-sm">
          <Button variant="ghost" onClick={() => setMigrationOpen(false)}>
            Cancel
          </Button>
          <Button onClick={requestMigration} loading={busy}>
            Send Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
