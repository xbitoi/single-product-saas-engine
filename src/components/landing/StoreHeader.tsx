"use client";

import Link from "next/link";
import { Leaf, ShoppingCart } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function StoreHeader() {
  const { t } = useI18n();

  function scrollToCheckout() {
    document
      .getElementById("checkout")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-emerald-950">
            {t("common.store")}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#story" className="transition hover:text-emerald-800">
            {t("lp.story")}
          </a>
          <a href="#products" className="transition hover:text-emerald-800">
            {t("lp.products")}
          </a>
          <a href="#reviews" className="transition hover:text-emerald-800">
            {t("nav.reviews")}
          </a>
          <a href="#faq" className="transition hover:text-emerald-800">
            {t("nav.faq")}
          </a>
          <a href="#footer" className="transition hover:text-emerald-800">
            {t("lp.contact")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollToCheckout}
            aria-label="Go to checkout"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
