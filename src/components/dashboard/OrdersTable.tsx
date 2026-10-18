"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search } from "lucide-react";
import type { OrderView } from "@/lib/data";
import { updateOrderStatusAction } from "@/app/dashboard/actions";
import { cn, formatDate, formatMoney } from "@/lib/utils";

const STATUSES = ["PAID", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];
type SortKey =
  | "createdAt"
  | "customerName"
  | "productTitle"
  | "amount"
  | "status";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<Status, string> = {
  PAID: "bg-amber-50 text-amber-700 border-amber-200",
  SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export function OrdersTable({ orders }: { orders: OrderView[] }) {
  const [rows, setRows] = useState<OrderView[]>(orders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setRows(orders);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((o) => {
      const matchesFilter = filter === "ALL" || o.status === filter;
      const matchesQuery =
        !q ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.productTitle.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [rows, query, filter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      else if (sortKey === "customerName")
        cmp = a.customerName.localeCompare(b.customerName);
      else if (sortKey === "productTitle")
        cmp = a.productTitle.localeCompare(b.productTitle);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  function changeStatus(id: string, status: Status) {
    const previous = rows;
    setRows((r) => r.map((o) => (o.id === id ? { ...o, status } : o)));
    setPendingId(id);
    startTransition(async () => {
      const result = await updateOrderStatusAction({ id, status });
      if (!result.ok) setRows(previous);
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone or order id..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Status | "ALL")}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <SortTh
                label="Date"
                k="createdAt"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortTh
                label="Customer"
                k="customerName"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <th className="px-4 py-3 font-medium">Contact</th>
              <SortTh
                label="Product"
                k="productTitle"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortTh
                label="Amount"
                k="amount"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <SortTh
                label="Status"
                k="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No orders match.
                </td>
              </tr>
            )}
            {sorted.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatDate(o.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customerName}</p>
                  <p className="max-w-[220px] truncate text-xs text-slate-400">
                    {o.address}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p>{o.email}</p>
                  <p className="text-xs text-slate-400">{o.phone}</p>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                  {o.productTitle}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">
                  {formatMoney(o.amount, o.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        changeStatus(o.id, e.target.value as Status)
                      }
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none ${STATUS_STYLES[o.status as Status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {pendingId === o.id && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortTh({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = k === sortKey;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-slate-800",
          active && "text-brand-700",
        )}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}
