"use client";

import { Globe } from "lucide-react";
import { useI18n } from "./LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      aria-label="Switch language"
      title="Switch language"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700",
        className,
      )}
    >
      <Globe className="h-4 w-4" />
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}
