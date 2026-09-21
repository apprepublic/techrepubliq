"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useTone } from "@/lib/theme";
import { FolderKanban, CreditCard, LifeBuoy, Settings } from "lucide-react";

const links = [
  { label: "Projects", href: "/dashboard", icon: FolderKanban },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Service Center", href: "/dashboard/support", icon: LifeBuoy },
  { label: "Account", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTone();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("email_verified");
    if (stored === "true") setEmailVerified(true);
    else if (stored === "false") setEmailVerified(false);
    else {
      api.auth
        .me()
        .then((res) => {
          const verified = !!res.customer.emailVerified;
          setEmailVerified(verified);
          sessionStorage.setItem("email_verified", String(verified));
        })
        .catch(() => setEmailVerified(true));
    }
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.auth.resendVerification();
      setResendSent(true);
      setTimeout(() => setResendSent(false), 4000);
    } catch {
      /* ignore */
    }
    setResending(false);
  };

  const active = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className={t.page}>
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        {emailVerified === false && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-amber-700/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700">
            <span>Verify your email to unlock every dashboard feature.</span>
            <button onClick={handleResend} disabled={resending} className="text-[#C8102E] underline">
              {resending ? "Sending…" : resendSent ? "Sent" : "Resend"}
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-[220px] shrink-0">
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] no-underline transition-colors",
                      active(link.href) ? "bg-[rgba(200,16,46,0.1)] text-[#C8102E]" : `${t.muted} hover:text-[#C8102E]`
                    )}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <nav className={`md:hidden flex overflow-x-auto border-b ${t.border} -mx-2 px-2`}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 px-3 pb-3 text-[13px] no-underline",
                  active(link.href) ? "text-[#C8102E] border-b-2 border-[#C8102E]" : t.muted
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
