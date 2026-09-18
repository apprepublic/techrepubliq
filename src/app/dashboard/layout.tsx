"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const sidebarLinks = [
  { label: "Projects", href: "/dashboard" },
  { label: "Subscriptions", href: "/dashboard/subscriptions" },
  { label: "Service Center", href: "/dashboard/support" },
  { label: "Account", href: "/dashboard/settings" },
  { label: "Past orders", href: "/dashboard/orders" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("email_verified");
    if (stored === "true") {
      setEmailVerified(true);
    } else if (stored === "false") {
      setEmailVerified(false);
    } else {
      // Fetch from API
      api.auth.me().then((res) => {
        const verified = !!res.customer.emailVerified;
        setEmailVerified(verified);
        sessionStorage.setItem("email_verified", String(verified));
      }).catch(() => setEmailVerified(true)); // fallback: assume verified
    }
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.auth.resendVerification();
      setResendSent(true);
      setTimeout(() => setResendSent(false), 4000);
    } catch {
      setResendSent(false);
    }
    setResending(false);
  };

  return (
    <div className="mx-auto max-w-[1120px] px-md py-xl">
      {/* Verification banner */}
      {emailVerified === false && (
        <div className="mb-lg p-sm bg-amber/10 border border-amber rounded-sm text-sm text-amber flex items-center justify-between gap-sm flex-wrap">
          <span>Please verify your email address to access all features.</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="shrink-0 text-xs text-accent hover:text-accent-hover underline disabled:opacity-50"
          >
            {resending ? "Sending..." : resendSent ? "Sent!" : "Resend verification email"}
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-xl">
        <aside className="hidden md:block w-[240px] shrink-0">
          <nav className="space-y-sm">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-md py-sm text-sm font-body no-underline rounded-sm transition-colors duration-150",
                  pathname === link.href
                    ? "bg-accent-dim text-accent"
                    : "text-slate hover:text-ink hover:bg-accent-dim/40"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <nav className="md:hidden flex border-b border-line mb-lg">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex-1 text-center pb-sm text-sm font-body no-underline transition-colors duration-150",
                pathname === link.href
                  ? "text-accent border-b-2 border-accent"
                  : "text-slate hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}