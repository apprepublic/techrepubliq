import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — TechRepubliQ",
  description:
    "Web development, app development, AI automation, AI integration, training, optimization and ongoing management — one upfront price, built and launched by a real team.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
