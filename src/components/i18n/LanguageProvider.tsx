"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDictionary, lookup, type Dict, type Lang } from "@/lib/i18n";

interface I18nContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  dict: Dict;
  t: (path: string) => string;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const dict = useMemo(() => getDictionary(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const t = useCallback((path: string) => lookup(dict, path), [dict]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, dir, dict, t, setLang }),
    [lang, dir, dict, t, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>.");
  return ctx;
}
