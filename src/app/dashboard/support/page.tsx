"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";

/**
 * Service Center — the promise in §7, stated plainly: we hold the vendor accounts, so the
 * customer never inherits a third-party login to chase.
 */
export default function SupportPage() {
  const [info, setInfo] = useState<{ handled: string[]; note: string; contact: string } | null>(null);

  useEffect(() => {
    api.serviceCenter
      .info()
      .then(setInfo)
      .catch(() => setInfo(null));
  }, []);

  return (
    <div>
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-md">
        Service Center
      </h1>

      <p className="text-sm text-slate mb-lg max-w-[560px]">
        {info?.note ??
          "We run your project end to end. If something needs attention, it comes here rather than to a vendor's support queue."}
      </p>

      <div className="border border-line rounded-sm p-lg mb-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-md">What we handle</h2>
        {info ? (
          <ul className="space-y-sm">
            {info.handled.map((item) => (
              <li key={item} className="flex gap-sm text-sm text-slate">
                <span aria-hidden className="text-accent">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-24 w-full bg-accent-dim rounded-sm animate-pulse" />
        )}
      </div>

      <div className="border border-line rounded-sm p-lg">
        <h2 className="text-md font-display font-semibold text-ink mb-sm">Something wrong?</h2>
        <p className="text-sm text-slate mb-md">
          Email us and it reaches the team that built your project — not a ticket queue.
        </p>
        <a href={`mailto:${info?.contact ?? "admin@techrepubliq.com"}`}>
          <Button>{info?.contact ?? "admin@techrepubliq.com"}</Button>
        </a>
      </div>
    </div>
  );
}
