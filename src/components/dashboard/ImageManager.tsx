"use client";

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Add images by URL or by uploading from the computer, then reorder/remove. */
export function ImageManager({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function isValidImageUrl(candidate: string): boolean {
    try {
      const u = new URL(candidate, window.location.origin);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function addFromUrl() {
    setError(null);
    const candidates = url
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (candidates.length === 0) {
      setError("Paste an image URL first.");
      return;
    }
    const invalid = candidates.find((c) => !isValidImageUrl(c));
    if (invalid) {
      setError(`Not a valid image URL: ${invalid}`);
      return;
    }
    onChange([...value, ...candidates]);
    setUrl("");
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setError("Choose image files (JPG, PNG, WEBP, GIF, AVIF).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Upload failed.");
        }
        urls.push(data.url);
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Upload from computer */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
          dragOver
            ? "border-brand-400 bg-brand-50"
            : "border-slate-300 bg-slate-50",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </span>
        <p className="text-sm font-medium text-slate-700">
          {uploading ? "Uploading..." : "Drag images here"}
        </p>
        <p className="text-xs text-slate-400">
          or choose files from your computer (max 5 MB each)
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" />
          Upload from computer
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) void uploadFiles(e.target.files);
          }}
        />
      </div>

      {/* Add by URL */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFromUrl();
            }
          }}
          placeholder="...or paste an image URL"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={addFromUrl}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Add URL
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {value.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-400">
          <ImagePlus className="h-4 w-4" />
          No images yet. Add at least one.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Product image ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-slate-900/70 p-1.5 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Move left"
                    onClick={() => move(index, -1)}
                    className={cn(
                      "rounded-md p-1.5 text-white hover:bg-white/20",
                      index === 0 && "opacity-40",
                    )}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move right"
                    onClick={() => move(index, 1)}
                    className={cn(
                      "rounded-md p-1.5 text-white hover:bg-white/20",
                      index === value.length - 1 && "opacity-40",
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Make cover"
                    onClick={() => makeCover(index)}
                    className={cn(
                      "rounded-md p-1.5 text-white hover:bg-white/20",
                      index === 0 && "opacity-40",
                    )}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => remove(index)}
                    className="rounded-md p-1.5 text-red-200 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-400">
        The first image is the cover shown on the storefront and in Telegram
        alerts.
      </p>
    </div>
  );
}
