import OrderDetailClient from "./OrderDetailClient";

export function generateStaticParams() {
  return [{ id: "ORD-001" }, { id: "ORD-002" }, { id: "ORD-003" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailClient id={id} />;
}