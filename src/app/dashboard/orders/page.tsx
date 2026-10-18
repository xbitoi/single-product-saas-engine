import { getOrders } from "@/lib/data";
import { OrdersTable } from "@/components/dashboard/OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-slate-500">
          Search, filter and update the fulfillment status of every order.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
