import type { Metadata } from "next";
import { services } from "@/lib/utils";
import ServicePageClient from "./ServicePageClient";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) {
    return { title: "Services — TechRepubliQ" };
  }
  return {
    title: `${service.title} — TechRepubliQ`,
    description: service.description,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServicePageClient slug={slug} />;
}