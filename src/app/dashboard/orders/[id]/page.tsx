"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CornerBracketFrame } from "@/components/CornerBracketFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { DimensionLine } from "@/components/DimensionLine";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

const statusSteps = [
  { label: "Paid" },
  { label: "In Progress" },
  { label: "Delivered" },
];

// Mock order data
const mockOrder = {
  id: "ORD-001",
  referenceId: "QR-XK8F2A",
  service: "Web Development",
  status: "In Progress" as const,
  currentStep: 1,
  date: "2026-08-15",
  total: 3500,
  currency: "USD",
  scope: [
    "Full web development project delivery",
    "Responsive, production-ready build",
    "Performance optimization & SEO basics",
    "Deployment & hosting configuration",
    "30-day post-delivery support",
  ],
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [migrationOpen, setMigrationOpen] = useState(false);
  const [migrationScope, setMigrationScope] = useState("");
  const [migrationSubmitted, setMigrationSubmitted] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  const order = mockOrder; // In real app, fetch by params.id

  const handleMigrationSubmit = () => {
    setMigrationSubmitted(true);
    setMigrationOpen(false);
  };

  const isDelivered = (order.status as string) === "Delivered";

  return (
    <div className="max-w-[720px]">
      {/* Breadcrumb */}
      <nav className="mb-lg text-sm text-slate">
        <Link
          href="/dashboard"
          className="hover:text-accent transition-colors duration-150 no-underline"
        >
          Orders
        </Link>
        <span className="mx-sm">/</span>
        <span className="text-ink">{order.referenceId}</span>
      </nav>

      {/* Order summary */}
      <CornerBracketFrame className="mb-xl">
        <div className="flex items-start justify-between mb-lg">
          <div>
            <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">
              {order.service}
            </h1>
            <p className="font-mono text-sm text-slate">
              {order.referenceId}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-xl text-sm mb-lg">
          <div>
            <p className="text-xs text-slate mb-xs">Date</p>
            <p className="font-mono text-ink">{order.date}</p>
          </div>
          <div>
            <p className="text-xs text-slate mb-xs">Total</p>
            <p className="font-mono text-ink">
              ${order.total.toLocaleString()} {order.currency}
            </p>
          </div>
        </div>

        <h2 className="text-sm font-medium text-ink mb-sm">Scope</h2>
        <ul className="space-y-sm mb-lg">
          {order.scope.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-sm text-sm text-slate"
            >
              <span className="text-accent mt-[3px] shrink-0">—</span>
              {item}
            </li>
          ))}
        </ul>
      </CornerBracketFrame>

      {/* Status timeline */}
      <div className="mb-xl">
        <h2 className="font-display text-md font-semibold text-ink mb-md">
          Status
        </h2>
        <DimensionLine steps={statusSteps} currentStep={order.currentStep} />
      </div>

      {/* Actions */}
      <div className="space-y-sm mb-xl">
        {/* Invoice */}
        <div className="border border-line rounded-sm p-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Invoice</p>
            <p className="text-xs text-slate">
              {invoiceDownloaded
                ? "Downloaded"
                : "Download your invoice receipt"}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setInvoiceDownloaded(true)}
          >
            {invoiceDownloaded ? "Download again" : "Download PDF"}
          </Button>
        </div>

        {/* Migration */}
        <div className="border border-line rounded-sm p-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Request Migration</p>
            <p className="text-xs text-slate">
              {migrationSubmitted
                ? "Request received"
                : isDelivered
                  ? "Get your front-end code and migration files"
                  : "Available once your order is delivered"}
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={!isDelivered || migrationSubmitted}
            onClick={() => setMigrationOpen(true)}
          >
            {migrationSubmitted ? "Requested" : "Request"}
          </Button>
        </div>
      </div>

      {/* Service Agreement link */}
      <p className="text-xs text-slate">
        This order is governed by the{" "}
        <Link
          href="/terms"
          className="text-accent hover:text-accent-hover underline"
        >
          Service Agreement
        </Link>
        .
      </p>

      {/* Migration modal */}
      <Modal
        isOpen={migrationOpen}
        onClose={() => setMigrationOpen(false)}
        title="Request Migration"
      >
        <p className="text-sm text-slate mb-md">
          Choose what you'd like to receive:
        </p>
        <fieldset className="space-y-sm mb-lg">
          <legend className="sr-only">Migration scope</legend>
          <label className="flex items-start gap-sm text-sm text-slate cursor-pointer">
            <input
              type="radio"
              name="migration-scope"
              value="frontend"
              checked={migrationScope === "frontend"}
              onChange={(e) => setMigrationScope(e.target.value)}
              className="mt-1 accent-accent"
            />
            Front-end code only
          </label>
          <label className="flex items-start gap-sm text-sm text-slate cursor-pointer">
            <input
              type="radio"
              name="migration-scope"
              value="full"
              checked={migrationScope === "full"}
              onChange={(e) => setMigrationScope(e.target.value)}
              className="mt-1 accent-accent"
            />
            Front-end + back-end migration files
          </label>
        </fieldset>

        <div className="p-sm bg-accent-dim rounded-sm text-xs text-slate mb-lg">
          <strong className="text-ink">What's included:</strong> All your
          front-end code and applicable back-end files. Proprietary AI
          automation components are not included as they are not portable.
        </div>

        <div className="flex justify-end gap-sm">
          <Button
            variant="ghost"
            onClick={() => setMigrationOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!migrationScope}
            onClick={handleMigrationSubmit}
          >
            Send Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}