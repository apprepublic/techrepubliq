"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

interface OrderRow {
  id: string;
  service_title: string;
  quote_reference: string;
  price_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

/**
 * Historical orders (§15) — readable exactly as they were. New purchases show up under
 * Projects; this view exists so nothing that was already bought disappears.
 */
export default function PastOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    api.orders
      .list()
      .then((res) => setOrders((res.orders ?? []) as OrderRow[]))
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <div className="h-32 w-full bg-accent-dim rounded-sm animate-pulse" />;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
          Past orders
        </h1>
        <div className="text-center py-xl border border-line rounded-sm">
          <p className="text-base text-slate mb-md">No past orders.</p>
          <Link href="/quote">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-lg">
        Past orders
      </h1>

      <motion.div variants={staggerContainer} initial="hidden" animate="show">
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
                    className="font-mono text-ink no-underline hover:text-accent block"
                  >
                    {order.quote_reference || order.id}
                  </Link>
                </td>
                <td className="py-md">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-ink no-underline hover:text-accent block"
                  >
                    {order.service_title}
                  </Link>
                </td>
                <td className="py-md font-mono text-slate">
                  {(order.created_at ?? "").slice(0, 10)}
                </td>
                <td className="py-md">
                  <StatusBadge status={order.status as ProjectStatus} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div className="md:hidden space-y-sm">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block border border-line rounded-sm p-md no-underline hover:border-ink transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-sm gap-sm">
                <span className="font-mono text-sm text-ink">
                  {order.quote_reference || order.id}
                </span>
                <StatusBadge status={order.status as ProjectStatus} />
              </div>
              <p className="text-sm text-ink">{order.service_title}</p>
              <p className="text-xs text-slate font-mono">{(order.created_at ?? "").slice(0, 10)}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
