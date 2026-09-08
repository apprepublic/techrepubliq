import { services } from "@/lib/utils";
import ServicePageClient from "./ServicePageClient";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServicePageClient slug={slug} />;
}