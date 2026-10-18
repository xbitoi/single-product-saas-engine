"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          compact
            ? "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
            : "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        }
      >
        <LogOut className="h-4 w-4" />
        {t("nav.signOut")}
      </button>
    </form>
  );
}
