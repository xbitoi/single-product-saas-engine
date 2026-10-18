import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { NoticeProvider } from "@/components/ui/NoticeProvider";
import { getDictionary, type Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "Single Product Store",
    template: "%s | Single Product Store",
  },
  description:
    "Single Product SaaS Engine - one dynamic landing page, PayPal checkout, Telegram alerts and an AI sales assistant.",
};

const themeInitScript = `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await cookies();
  const cookieLang = store.get("lang")?.value;
  const lang: Lang = cookieLang === "ar" ? "ar" : "en";
  const dict = getDictionary(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <LanguageProvider initialLang={lang}>
          <NoticeProvider>{children}</NoticeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
