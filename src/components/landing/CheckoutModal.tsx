"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ProductView } from "@/lib/data";
import { CheckoutSection } from "./CheckoutSection";

export function CheckoutModal({
  open,
  onClose,
  product,
  paypalClientId,
  paypalConfigured,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductView;
  paypalClientId: string | null;
  paypalConfigured: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-full max-w-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-1 right-1 z-10 rounded-full bg-white/90 p-1.5 text-slate-600 shadow transition hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
        <CheckoutSection
          product={product}
          paypalClientId={paypalClientId}
          paypalConfigured={paypalConfigured}
        />
      </div>
    </div>
  );
}
