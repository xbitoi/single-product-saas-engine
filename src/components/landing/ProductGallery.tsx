"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const list = images ?? [];

  if (list.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-400">
        No image
      </div>
    );
  }

  const safeIndex = Math.min(index, list.length - 1);
  const current = list[safeIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Image
          src={current}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setIndex((i) => (i - 1 + list.length) % list.length)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="scroll-thin flex flex-1 gap-2 overflow-x-auto">
            {list.map((img, i) => (
              <button
                type="button"
                key={`${img}-${i}`}
                onClick={() => setIndex(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === safeIndex
                    ? "border-brand-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next image"
            onClick={() => setIndex((i) => (i + 1) % list.length)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:text-brand-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
