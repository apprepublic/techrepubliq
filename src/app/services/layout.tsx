import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — TechRepubliQ",
  description:
    "Web, app, AI automation, AI integration, and training — built by a human team for a one-time fee. Describe the project, get priced, launch.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
