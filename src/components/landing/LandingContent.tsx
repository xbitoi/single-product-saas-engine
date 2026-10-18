"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductView } from "@/lib/data";
import { CheckoutModal } from "./CheckoutModal";
import { ProductGallery } from "./ProductGallery";
import { StoreFooter } from "./StoreFooter";
import { StoreHeader } from "./StoreHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { cn, formatMoney } from "@/lib/utils";
import {
  BadgeCheck,
  ChevronDown,
  Headphones,
  Leaf,
  Lock,
  PackageX,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

export function LandingContent({
  product,
  collection,
  paypalClientId,
  paypalConfigured,
  chatbotEnabled,
  ordersDelivered,
}: {
  product: ProductView | null;
  collection: ProductView[];
  paypalClientId: string | null;
  paypalConfigured: boolean;
  chatbotEnabled: boolean;
  ordersDelivered: number;
}) {
  const { t } = useI18n();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen">
        <StoreHeader />
        <main className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
          <PackageX className="mb-4 h-14 w-14 text-slate-300" />
          <h1 className="text-2xl font-bold">{t("preparing.title")}</h1>
          <p className="mt-2 max-w-md text-slate-500">{t("preparing.text")}</p>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  const trustItems = [
    { icon: Lock, label: t("trust.secure") },
    { icon: Truck, label: t("trust.shipping") },
    { icon: RotateCcw, label: t("trust.returns") },
    { icon: Headphones, label: t("trust.support") },
  ];

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  const reviews = [
    { text: t("reviews.r1"), name: t("reviews.r1Name") },
    { text: t("reviews.r2"), name: t("reviews.r2Name") },
    { text: t("reviews.r3"), name: t("reviews.r3Name") },
  ];

  const gridItems: { id: string; title: string; image: string | null; price: number; currency: string }[] =
    [
      {
        id: product.id,
        title: product.title,
        image: product.images[0] ?? null,
        price: product.price,
        currency: product.currency,
      },
      ...collection.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images[0] ?? null,
        price: p.price,
        currency: p.currency,
      })),
    ].slice(0, 6);

  const eyebrow = product.eyebrow?.trim() || t("lp.eyebrow");
  const storyTitle = product.storyTitle?.trim() || t("lp.storyTitle");
  const storyText = product.storyText?.trim() || t("lp.storyText");
  const closingTitle = product.closingTitle?.trim() || t("lp.closingTitle");
  const closingText = product.closingText?.trim() || t("lp.closingText");

  function openCheckout() {
    setCheckoutOpen(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-white">
          <div className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                <Leaf className="h-3.5 w-3.5" />
                {eyebrow}
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-emerald-950 lg:text-5xl">
                {product.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Stars />
                <span>{t("hero.ratingFrom")}</span>
              </div>

              <p className="mt-5 max-w-xl whitespace-pre-line text-slate-600">
                {product.description}
              </p>

              {product.features.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("lp.category")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.features.slice(0, 5).map((f, i) => (
                      <span
                        key={`${f}-${i}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                          i === 0
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-emerald-200 bg-white text-emerald-800",
                        )}
                      >
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full border",
                            i === 0 ? "border-white bg-white" : "border-emerald-400",
                          )}
                        />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-emerald-800">
                  {formatMoney(product.price, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatMoney(product.compareAtPrice!, product.currency)}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCheckout}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  {t("lp.explore")}
                </button>
                <button
                  type="button"
                  onClick={openCheckout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700 px-7 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  {t("common.buyNow")}
                </button>
              </div>
            </div>

            <div className="relative">
              {hasDiscount && (
                <span className="absolute -top-2 right-2 z-10 inline-flex -rotate-3 items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg lg:right-6">
                  <Sparkles className="h-4 w-4" />
                  {t("hero.save")} {discountPct}%
                </span>
              )}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 shadow-sm ring-1 ring-emerald-100">
                <ProductGallery images={product.images} title={product.title} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust band */}
        <section className="bg-emerald-900 py-10 text-white">
          <div className="container-page flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div className="max-w-md text-center lg:text-start">
              <h2 className="text-xl font-bold lg:text-2xl">
                {t("lp.trustHeadline")}
              </h2>
              <p className="mt-2 text-sm text-emerald-100/80">
                {t("trust.secure")} · {t("trust.shipping")}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="rounded-2xl bg-white/10 px-6 py-4 text-center ring-1 ring-white/15">
                <p className="text-2xl font-extrabold">4.8/5</p>
                <div className="mt-1 flex justify-center">
                  <Stars />
                </div>
                <p className="mt-1 text-xs text-emerald-100/80">
                  {t("lp.rating")}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-6 py-4 text-center ring-1 ring-white/15">
                <p className="text-2xl font-extrabold">{ordersDelivered}</p>
                <p className="mt-1 text-xs text-emerald-100/80">
                  {t("lp.orders")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our story */}
        <section id="story" className="container-page grid scroll-mt-20 items-center gap-10 py-14 lg:grid-cols-2">
          <div className="text-center lg:text-start">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-950 lg:text-3xl">
              {storyTitle}
            </h2>
            <p className="mt-4 text-slate-600">{storyText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={openCheckout}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {t("lp.storyMore")}
              </button>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-700 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              >
                {t("lp.storyBrowse")}
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <ProductGallery images={product.images} title={product.title} />
          </div>
        </section>

        {/* Collection grid */}
        <section id="products" className="scroll-mt-20 bg-slate-50 py-14">
          <div className="container-page">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-emerald-950 lg:text-3xl">
                {t("lp.collectionTitle")}
              </h2>
              <p className="mt-2 text-slate-500">{t("lp.collectionSubtitle")}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item, i) => (
                <Link
                  key={`${item.id}-${i}`}
                  href={`/product/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-emerald-50">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <Leaf className="h-10 w-10 text-emerald-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold">
                      {item.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-emerald-800">
                        {formatMoney(item.price, item.currency)}
                      </span>
                      <span className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-emerald-800">
                        {t("lp.view")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* What makes it special (icon grid) */}
        {product.features.length > 0 && (
          <section id="features" className="container-page scroll-mt-20 py-14">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-emerald-950 lg:text-3xl">
              {t("lp.whatMakesTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {product.features.slice(0, 8).map((f, i) => (
                <div key={`${f}-${i}`} className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <Leaf className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-slate-700">{f}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section id="reviews" className="container-page scroll-mt-20 py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-950 lg:text-3xl">
              {t("reviews.title")}
            </h2>
            <p className="mt-2 text-slate-500">{t("reviews.subtitle")}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <Stars />
                <blockquote className="mt-3 text-sm text-slate-600">
                  {r.text}
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-2 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                    {r.name.charAt(0)}
                  </span>
                  <span className="font-medium">{r.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t("reviews.verified")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Guarantee */}
        <section className="container-page pb-14">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center sm:flex-row sm:text-start">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-emerald-950">
                {t("guarantee.title")}
              </h3>
              <p className="mt-1 text-sm text-emerald-900/80">
                {t("guarantee.text")}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-14">
          <div className="container-page max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-emerald-950 lg:text-3xl">
              {t("faq.title")}
            </h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                    {f.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm text-slate-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-emerald-900 py-16 text-center text-white">
          <div className="container-page max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {closingTitle}
            </h2>
            <p className="mt-3 text-emerald-100/85">{closingText}</p>
            <button
              type="button"
              onClick={openCheckout}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              {t("lp.closingCta")}
            </button>
          </div>
        </section>
      </main>

      <StoreFooter />

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="container-page flex items-center justify-between gap-3 py-3">
          <div>
            <span className="block text-[11px] text-slate-500">
              {t("checkout.total")}
            </span>
            <span className="font-bold text-emerald-800">
              {formatMoney(product.price, product.currency)}
            </span>
          </div>
          <button
            type="button"
            onClick={openCheckout}
            className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            {t("common.buyNow")}
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        paypalClientId={paypalClientId}
        paypalConfigured={paypalConfigured}
      />

      <ChatWidget enabled={chatbotEnabled} storeName={t("common.store")} />
    </div>
  );
}

function Stars() {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </span>
  );
}
