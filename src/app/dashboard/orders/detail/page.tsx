import OrderDetailClient from "./OrderDetailClient";

/**
 * Static export (`output: "export"`) can't prerender a per-customer order id, which is
 * why this reads `?id=` from the URL instead of sitting on a dynamic segment — the same
 * reason `/dashboard/project` works the way it does.
 *
 * The `/dashboard/orders/[id]` route this replaced had to declare generateStaticParams,
 * and the only ids it could declare were the sample order's own.
 */
export default function Page() {
  return <OrderDetailClient />;
}
