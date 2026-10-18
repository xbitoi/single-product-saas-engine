import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import { ImageOff } from "lucide-react";

export interface PreviewProduct {
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  features: string[];
}

export function ProductPreviewCard({
  product,
}: {
  product: PreviewProduct;
}) {
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const image = product.images[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {image ? (
            <Image
              src={image}
              alt={product.title || "preview"}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold">
            {product.title || "Product title"}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-brand-700">
              {formatMoney(product.price || 0, product.currency || "USD")}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {formatMoney(product.compareAtPrice!, product.currency || "USD")}
              </span>
            )}
          </div>
          <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm text-slate-600">
            {product.description || "Product description"}
          </p>
          {product.features.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {product.features.slice(0, 5).map((f, i) => (
                <li key={`${f}-${i}`} className="flex gap-1.5">
                  <span className="text-brand-500">•</span>
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
