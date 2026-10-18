"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { ProductView } from "@/lib/data";
import {
  deleteProductAction,
  setFeaturedProductAction,
  toggleProductActiveAction,
  updateProductAction,
} from "@/app/dashboard/actions";
import { useNotice } from "@/components/ui/NoticeProvider";
import { formatMoney } from "@/lib/utils";

interface CopyDraft {
  eyebrow: string;
  storyTitle: string;
  storyText: string;
  closingTitle: string;
  closingText: string;
}

function toDraft(p: ProductView): CopyDraft {
  return {
    eyebrow: p.eyebrow ?? "",
    storyTitle: p.storyTitle ?? "",
    storyText: p.storyText ?? "",
    closingTitle: p.closingTitle ?? "",
    closingText: p.closingText ?? "",
  };
}

export function ProductLibrary({ products }: { products: ProductView[] }) {
  const notice = useNotice();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CopyDraft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string; message?: string; details?: string[] }>) {
    setBusyId(id);
    startTransition(async () => {
      try {
        const result = await fn();
        if (result.ok) {
          notice.success(result.message ?? "Done.");
        } else {
          notice.error(result.error ?? "Failed.", result.details);
        }
      } finally {
        setBusyId(null);
      }
    });
  }

  function startEdit(p: ProductView) {
    setEditingId(p.id);
    setDraft(toDraft(p));
  }

  function saveCopy(id: string) {
    if (!draft) return;
    run(id, () =>
      updateProductAction({
        id,
        eyebrow: draft.eyebrow.trim() || null,
        storyTitle: draft.storyTitle.trim() || null,
        storyText: draft.storyText.trim() || null,
        closingTitle: draft.closingTitle.trim() || null,
        closingText: draft.closingText.trim() || null,
      }),
    );
    setEditingId(null);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="h-5 w-5 text-brand-600" />
        Saved products
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Every product you publish is saved here. Pick one to display on the
        landing page again, hide it, edit its landing text, or delete it. Extra
        visible products appear in the collection grid at the bottom of the page.
      </p>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">No products yet. Publish one above.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {products.map((p) => (
            <li key={p.id} className="py-3">
              <div className="flex items-center gap-3">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-100" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{p.title}</p>
                    {p.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    ) : p.isActive ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Visible
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatMoney(p.price, p.currency)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {!p.isFeatured && p.isActive && (
                    <button
                      type="button"
                      onClick={() => run(p.id, () => setFeaturedProductAction({ id: p.id }))}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                      Display
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  {!p.isFeatured && (
                    <button
                      type="button"
                      onClick={() =>
                        run(p.id, () =>
                          toggleProductActiveAction({ id: p.id, isActive: !p.isActive }),
                        )
                      }
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {p.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {p.isActive ? "Hide" : "Show"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => run(p.id, () => deleteProductAction({ id: p.id }))}
                    disabled={busyId === p.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {editingId === p.id && draft && (
                <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Landing page text for this product
                  </p>
                  <Field
                    label="Eyebrow (small line above the title)"
                    value={draft.eyebrow}
                    onChange={(v) => setDraft({ ...draft, eyebrow: v })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Story title"
                      value={draft.storyTitle}
                      onChange={(v) => setDraft({ ...draft, storyTitle: v })}
                    />
                    <Field
                      label="Closing title"
                      value={draft.closingTitle}
                      onChange={(v) => setDraft({ ...draft, closingTitle: v })}
                    />
                  </div>
                  <Field
                    label="Story text"
                    value={draft.storyText}
                    onChange={(v) => setDraft({ ...draft, storyText: v })}
                    textarea
                  />
                  <Field
                    label="Closing text"
                    value={draft.closingText}
                    onChange={(v) => setDraft({ ...draft, closingText: v })}
                    textarea
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveCopy(p.id)}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Leave a field empty to use the store default wording.
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const base =
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${base} scroll-thin resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </label>
  );
}
