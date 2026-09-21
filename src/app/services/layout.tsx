import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — TechRepubliQ",
  description:
    "Web, app, AI automation, AI integration, training, optimization, and product management — built by a human team from your brief. Describe the project, get priced, launch.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
