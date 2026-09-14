"use client";

import { useTheme } from "@/components/ThemeProvider";

export function useTone() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    isDark,
    page: `transition-colors duration-300 ${isDark ? "bg-[#0A0912] text-[#F7F6FA]" : "bg-[#F6F5F9] text-[#14121F]"}`,
    muted: isDark ? "text-[#9C99AC]" : "text-[#6B6876]",
    ink: isDark ? "text-[#F7F6FA]" : "text-[#14121F]",
    card: isDark
      ? "border-[#242233] bg-[#1A1828]/80"
      : "border-[#E8E6F0] bg-white",
    chip: isDark
      ? "border-[rgba(200,16,46,0.35)] bg-[rgba(200,16,46,0.12)] text-[#FF8A80]"
      : "border-[rgba(200,16,46,0.2)] bg-[#FBE2E4] text-[#C8102E]",
    iconBox: isDark ? "bg-[rgba(200,16,46,0.12)] text-[#FF8A80]" : "bg-[#FBE2E4] text-[#C8102E]",
    input: isDark
      ? "bg-[#141220] border-[#242233] text-[#F7F6FA] placeholder:text-[#6B6876]"
      : "bg-white border-[#E8E6F0] text-[#14121F] placeholder:text-[#9C99AC]",
    border: isDark ? "border-[#242233]" : "border-[#E8E6F0]",
    surface: isDark ? "bg-[#141220]" : "bg-white",
    hoverRow: isDark ? "hover:bg-[rgba(200,16,46,0.08)]" : "hover:bg-[#FBE2E4]/50",
  };
}

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] px-6 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed";

export const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-transform hover:-translate-y-0.5";
