import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { getDashboardStats, getOrders, getActiveProductView } from "@/lib/data";
import { StatCard } from "@/components/dashboard/StatCard";
import { BotStatusBadge } from "@/components/dashboard/BotStatusBadge";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const [stats, orders, product] = await Promise.all([
    getDashboardStats(),
    getOrders(8),
    getActiveProductView(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500">
            A snapshot of your single-product store.
          </p>
        </div>
        <BotStatusBadge />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatMoney(stats.revenue, stats.currency)}
          icon={DollarSign}
          tone="green"
        />
        <StatCard
          label="Total orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          tone="brand"
        />
        <StatCard
          label="Awaiting shipment"
          value={stats.paid}
          icon={Truck}
          tone="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={Package}
          tone="slate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.customerName}</p>
                    <p className="truncate text-xs text-slate-400">
                      {o.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-700">
                      {formatMoney(o.amount, o.currency)}
                    </p>
                    <p className="text-xs text-slate-400">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Active product</h2>
          {product ? (
            <div className="space-y-3">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-40 w-full rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="h-40 w-full rounded-xl bg-slate-100" />
              )}
              <p className="font-medium">{product.title}</p>
              <p className="text-brand-700">
                {formatMoney(product.price, product.currency)}
              </p>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Replace product <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                No product is published yet.
              </p>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Import your first product <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
