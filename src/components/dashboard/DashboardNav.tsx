"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Package,
  Send,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/LanguageProvider";

const items = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/products", key: "nav.products", icon: Package },
  { href: "/dashboard/orders", key: "nav.orders", icon: ShoppingCart },
  { href: "/dashboard/payments", key: "nav.payments", icon: CreditCard },
  { href: "/dashboard/telegram", key: "nav.telegram", icon: Send },
  { href: "/dashboard/chatbot", key: "nav.chatbot", icon: Bot },
  { href: "/dashboard/settings", key: "nav.settings", icon: Settings },
];

export function DashboardNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();

  if (horizontal) {
    return (
      <nav className="scroll-thin flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
