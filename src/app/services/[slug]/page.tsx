import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceBySlug, services } from "@/lib/services";
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
  const service = serviceBySlug(slug);
  if (!service) return { title: "Services — TechRepubliQ" };
  return {
    title: `${service.title} — TechRepubliQ`,
    description: service.short,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!serviceBySlug(slug)) notFound();
  return <ServicePageClient slug={slug} />;
}
