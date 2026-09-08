"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Orders", href: "/dashboard" },
  { label: "Account", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1120px] px-md py-xl">
      <div className="flex flex-col md:flex-row gap-xl">
        {/* Sidebar - desktop */}
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

        {/* Bottom tabs - mobile */}
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

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}