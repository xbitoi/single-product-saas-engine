"use client";

import { useState } from "react";
import {
  Download,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import type { ProductView } from "@/lib/data";
import { publishProductAction } from "@/app/dashboard/actions";
import { ProductPreviewCard } from "./ProductPreviewCard";
import { ImageManager } from "./ImageManager";
import { ProductLibrary } from "./ProductLibrary";
import { useNotice } from "@/components/ui/NoticeProvider";
import { formatMoney } from "@/lib/utils";

interface Draft {
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  currency: string;
  images: string[];
  features: string;
  sourceUrl: string;
  eyebrow: string;
  storyTitle: string;
  storyText: string;
  closingTitle: string;
  closingText: string;
}

const EMPTY: Draft = {
  title: "",
  description: "",
  price: "",
  compareAtPrice: "",
  currency: "USD",
  images: [],
  features: "",
  sourceUrl: "",
  eyebrow: "",
  storyTitle: "",
  storyText: "",
  closingTitle: "",
  closingText: "",
};

export function ProductScraper({
  currentProduct,
  products,
}: {
  currentProduct: ProductView | null;
  products: ProductView[];
}) {
  const notice = useNotice();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  function set<K extends keyof Draft>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function scrape() {
    if (!url.trim()) {
      notice.error("No link provided", [
        "Paste a product URL in the box, then press Extract.",
      ]);
      return;
    }
    setScraping(true);
    try {
      const res = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        product?: {
          title: string;
          description: string;
          price: number | null;
          currency: string;
          images: string[];
          features: string[];
          sourceUrl: string;
        };
        warnings?: string[];
        error?: string;
        details?: string[];
      };
      if (!res.ok || !data.product) {
        throw Object.assign(new Error(data.error ?? "Extraction failed."), {
          details: data.details,
        });
      }
      setDraft({
        title: data.product.title ?? "",
        description: data.product.description ?? "",
        price: data.product.price != null ? String(data.product.price) : "",
        compareAtPrice: "",
        currency: data.product.currency || "USD",
        images: data.product.images ?? [],
        features: (data.product.features ?? []).join("\n"),
        sourceUrl: data.product.sourceUrl ?? url.trim(),
        eyebrow: "",
        storyTitle: "",
        storyText: "",
        closingTitle: "",
        closingText: "",
      });
      notice.success(
        `Extracted ${data.product.images?.length ?? 0} image(s). Review below, then publish.`,
        data.warnings,
      );
    } catch (err) {
      const details =
        err && typeof err === "object" && "details" in err
          ? ((err as { details?: string[] }).details ?? [])
          : [];
      notice.error(
        err instanceof Error ? err.message : "Extraction failed.",
        details,
      );
    } finally {
      setScraping(false);
    }
  }

  async function publish() {
    setPublishing(true);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        price: draft.price,
        compareAtPrice: draft.compareAtPrice.trim()
          ? draft.compareAtPrice
          : null,
        currency: draft.currency.trim() || "USD",
        images: draft.images,
        features: splitLines(draft.features),
        sourceUrl: draft.sourceUrl.trim() || null,
        eyebrow: draft.eyebrow.trim() || null,
        storyTitle: draft.storyTitle.trim() || null,
        storyText: draft.storyText.trim() || null,
        closingTitle: draft.closingTitle.trim() || null,
        closingText: draft.closingText.trim() || null,
      };
      const result = await publishProductAction(payload);
      if (!result.ok) {
        notice.error(result.error ?? "Publish failed.", result.details);
        return;
      }
      notice.success(result.message ?? "Published.", [
        "The previous product was kept in your library below.",
        "Open the landing page to see it live.",
      ]);
    } finally {
      setPublishing(false);
    }
  }

  const preview = {
    title: draft.title,
    description: draft.description,
    price: draft.price ? Number(draft.price) : 0,
    compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
    currency: draft.currency || "USD",
    images: draft.images,
    features: splitLines(draft.features),
  };

  return (
    <div className="space-y-6">
      {/* current product */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Sparkles className="h-4 w-4 text-brand-500" />
          Live product
        </h2>
        {currentProduct ? (
          <div className="flex items-center gap-4">
            {currentProduct.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentProduct.images[0]}
                alt={currentProduct.title}
                className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-slate-100" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{currentProduct.title}</p>
              <p className="text-sm text-brand-700">
                {formatMoney(currentProduct.price, currentProduct.currency)}
              </p>
            </div>
            <span className="ml-auto rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Active
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No product is published yet. Scrape one below.
          </p>
        )}
      </section>

      {/* scraper */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <Download className="h-5 w-5 text-brand-600" />
          Import from a store URL
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Paste any product link (Amazon, AliExpress, Shopify, ...). We extract
          the title, price, images, description and features.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://store.com/product/..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={() => void scrape()}
            disabled={scraping}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {scraping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {scraping ? "Extracting..." : "Extract"}
          </button>
        </div>
      </section>

      {/* editor + live preview */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Edit details</h2>

          <Text
            label="Title"
            value={draft.title}
            onChange={(v) => set("title", v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Text
              label="Price"
              value={draft.price}
              onChange={(v) => set("price", v)}
              placeholder="49.99"
            />
            <Text
              label="Compare-at price"
              value={draft.compareAtPrice}
              onChange={(v) => set("compareAtPrice", v)}
              placeholder="79.99"
            />
          </div>
          <Text
            label="Currency"
            value={draft.currency}
            onChange={(v) => set("currency", v)}
            placeholder="USD"
          />
          <Text
            label="Description"
            value={draft.description}
            onChange={(v) => set("description", v)}
            textarea
          />
          <div>
            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <ImagePlus className="h-3.5 w-3.5" />
              Images - add, remove or reorder
            </span>
            <ImageManager
              value={draft.images}
              onChange={(next) => setDraft((d) => ({ ...d, images: next }))}
            />
          </div>
          <Text
            label="Features (one per line)"
            value={draft.features}
            onChange={(v) => set("features", v)}
            textarea
          />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Landing page text (optional - leave empty for defaults)
            </p>
            <div className="space-y-3">
              <Text
                label="Eyebrow (small line above the title)"
                value={draft.eyebrow}
                onChange={(v) => set("eyebrow", v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Text
                  label="Story title"
                  value={draft.storyTitle}
                  onChange={(v) => set("storyTitle", v)}
                />
                <Text
                  label="Closing title"
                  value={draft.closingTitle}
                  onChange={(v) => set("closingTitle", v)}
                />
              </div>
              <Text
                label="Story text"
                value={draft.storyText}
                onChange={(v) => set("storyText", v)}
                textarea
              />
              <Text
                label="Closing text"
                value={draft.closingText}
                onChange={(v) => set("closingText", v)}
                textarea
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishing}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {publishing ? "Publishing..." : "Update landing page"}
          </button>
          <p className="text-center text-xs text-slate-400">
            Publishing features this product and saves the previous one to your
            library, so you can pick it again. Extra visible products appear in
            the collection below the hero.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Live preview</h2>
          <ProductPreviewCard product={preview} />
        </div>
      </section>

      <ProductLibrary products={products} />
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  icon?: React.ReactNode;
}) {
  const base =
    "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        {icon}
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${base} scroll-thin resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </label>
  );
}
