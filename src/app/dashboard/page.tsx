"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { motion } from "motion/react";

const orders = [
  {
    id: "ORD-001",
    service: "Web Development",
    date: "2026-08-15",
    status: "In Progress" as const,
    referenceId: "QR-XK8F2A",
  },
  {
    id: "ORD-002",
    service: "AI Integration",
    date: "2026-07-28",
    status: "Delivered" as const,
    referenceId: "QR-M3P9Q1",
  },
  {
    id: "ORD-003",
    service: "Web / UI Design",
    date: "2026-07-10",
    status: "Paid" as const,
    referenceId: "QR-J2R7B4",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-xl">
          <p className="text-base text-slate mb-lg">
            You haven&apos;t placed any orders yet.
          </p>
          <Link href="/quote">
            <Button>Get Started</Button>
          </Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-slate uppercase tracking-wider">
                <th className="pb-sm font-medium">Reference</th>
                <th className="pb-sm font-medium">Service</th>
                <th className="pb-sm font-medium">Date</th>
                <th className="pb-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  variants={staggerItem}
                  className="border-b border-line hover:bg-accent-dim/40 transition-colors duration-150"
                >
                  <td className="py-md">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-mono text-ink no-underline hover:text-accent transition-colors duration-150 block w-full"
                    >
                      {order.referenceId}
                    </Link>
                  </td>
                  <td className="py-md">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-ink no-underline hover:text-accent transition-colors duration-150 block w-full"
                    >
                      {order.service}
                    </Link>
                  </td>
                  <td className="py-md">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-mono text-slate no-underline hover:text-accent transition-colors duration-150 block w-full"
                    >
                      {order.date}
                    </Link>
                  </td>
                  <td className="py-md">
                    <StatusBadge status={order.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden space-y-sm">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="block border border-line rounded-sm p-md no-underline hover:border-ink transition-colors duration-150"
              >
                <div className="flex items-center justify-between mb-sm">
                  <span className="font-mono text-sm text-ink">
                    {order.referenceId}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-ink">{order.service}</p>
                <p className="text-xs text-slate font-mono">{order.date}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}