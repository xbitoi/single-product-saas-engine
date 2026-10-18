"use client";

import { Leaf } from "lucide-react";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function StoreFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-emerald-950 text-emerald-100">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-8 sm:flex-row">
        <span className="flex items-center gap-2 font-semibold text-white">
          <Leaf className="h-4 w-4" />
          {t("common.store")}
        </span>
        <span className="text-xs text-emerald-200/70">
          &copy; {year} {t("common.store")}. {t("footer.rights")}
        </span>
        <span className="text-xs text-emerald-200/70">
          {t("footer.payments")}
        </span>
      </div>
    </footer>
  );
}
