"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Leaf,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { ProductView } from "@/lib/data";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { ProductGallery } from "./ProductGallery";
import { CheckoutModal } from "./CheckoutModal";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { formatMoney } from "@/lib/utils";

export function ProductDetail({
  product,
  collection,
  paypalClientId,
  paypalConfigured,
  chatbotEnabled,
}: {
  product: ProductView;
  collection: ProductView[];
  paypalClientId: string | null;
  paypalConfigured: boolean;
  chatbotEnabled: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  const trust = [
    { icon: ShieldCheck, label: t("trust.secure") },
    { icon: Truck, label: t("trust.shipping") },
    { icon: RotateCcw, label: t("trust.returns") },
  ];

  const eyebrow = product.eyebrow?.trim() || t("lp.eyebrow");
  const details = [product.storyTitle, product.storyText].filter(Boolean).join(
    " ",
  );

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main className="container-page py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 ring-1 ring-emerald-100">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              <Leaf className="h-3.5 w-3.5" />
              {eyebrow}
            </span>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-emerald-950 lg:text-4xl">
              {product.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-emerald-800">
                {formatMoney(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  {formatMoney(product.compareAtPrice!, product.currency)}
                </span>
              )}
            </div>

            <p className="mt-5 whitespace-pre-line text-slate-600">
              {product.description}
            </p>

            {product.features.length > 0 && (
              <ul className="mt-5 space-y-2">
                {product.features.map((f, i) => (
                  <li key={`${f}-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {details && (
              <p className="mt-5 text-sm text-slate-500">{details}</p>
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("common.buyNow")}
            </button>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
              {trust.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs text-slate-500"
                >
                  <Icon className="h-4 w-4 text-emerald-600" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {collection.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-emerald-950">
              {t("lp.collectionTitle")}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {collection.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
                >
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-emerald-50">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <Leaf className="h-10 w-10 text-emerald-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-2 font-bold text-emerald-800">
                      {formatMoney(p.price, p.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter />

      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
        paypalClientId={paypalClientId}
        paypalConfigured={paypalConfigured}
      />

      <ChatWidget enabled={chatbotEnabled} storeName={t("common.store")} />
    </div>
  );
}
