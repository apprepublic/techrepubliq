import type { Metadata } from "next";
import Link from "next/link";

/**
 * Retired slug (locked decision 5): `web-ui-design` folded into `web-development`.
 * `next.config.mjs` uses `output: "export"`, which cannot emit a redirect, so this
 * static page keeps old links alive instead of 404-ing.
 */
export const metadata: Metadata = {
  title: "Web UI Design — now part of Web Development — TechRepubliQ",
  description:
    "Web UI Design is now part of our Web Development service. Describe your project and let a real team scope and build it.",
};

export default function WebUiDesignPage() {
  return (
    <div className="mx-auto max-w-[720px] px-md py-xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent mb-sm">
        Services
      </p>
      <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-md">
        Web UI Design is now part of Web Development
      </h1>
      <p className="text-base leading-relaxed text-slate mb-lg">
        Interface design isn&apos;t a separate product for us any more — it&apos;s the first
        thing that happens inside a Web Development project. You describe what you need, we
        scope it from your brief, and a real team designs, builds and launches it.
      </p>
      <div className="flex flex-wrap gap-sm">
        <Link
          href="/services/web-development"
          className="inline-flex items-center px-md py-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-sm no-underline transition-colors duration-150"
        >
          See Web Development
        </Link>
        <Link
          href="/quote?category=web-development"
          className="inline-flex items-center px-md py-sm text-sm font-medium text-ink border border-ink rounded-sm hover:bg-ink/5 no-underline transition-colors duration-150"
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}
