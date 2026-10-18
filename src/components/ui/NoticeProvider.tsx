"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";

interface Notice {
  kind: Kind;
  title: string;
  details?: string[];
}

interface NoticeContextValue {
  notify: (notice: Notice) => void;
  success: (title: string, details?: string[]) => void;
  error: (title: string, details?: string[]) => void;
  info: (title: string, details?: string[]) => void;
}

const NoticeContext = createContext<NoticeContextValue | null>(null);

export function useNotice(): NoticeContextValue {
  const ctx = useContext(NoticeContext);
  if (!ctx) throw new Error("useNotice must be used inside <NoticeProvider>");
  return ctx;
}

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; notice: Notice }[]>([]);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((notice: Notice) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, notice }]);
  }, []);

  const value = useMemo<NoticeContextValue>(
    () => ({
      notify: push,
      success: (title, details) => push({ kind: "success", title, details }),
      error: (title, details) => push({ kind: "error", title, details }),
      info: (title, details) => push({ kind: "info", title, details }),
    }),
    [push],
  );

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4">
        {items.map(({ id, notice }) => (
          <NoticeCard
            key={id}
            notice={notice}
            onClose={() => remove(id)}
          />
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

function NoticeCard({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  const { kind, title, details } = notice;

  useEffect(() => {
    if (kind === "error") return;
    const timer = setTimeout(onClose, kind === "success" ? 4500 : 6500);
    return () => clearTimeout(timer);
  }, [kind, onClose]);

  const tone =
    kind === "success"
      ? {
          ring: "ring-green-200",
          bg: "bg-white",
          icon: "text-green-600",
          dot: "bg-green-500",
          Icon: CheckCircle2,
        }
      : kind === "error"
        ? {
            ring: "ring-red-200",
            bg: "bg-white",
            icon: "text-red-600",
            dot: "bg-red-500",
            Icon: AlertTriangle,
          }
        : {
            ring: "ring-brand-200",
            bg: "bg-white",
            icon: "text-brand-600",
            dot: "bg-brand-500",
            Icon: Info,
          };

  const { Icon } = tone;

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full max-w-md animate-[fadeIn_.18s_ease-out] rounded-2xl ${tone.bg} p-4 shadow-xl ring-1 ${tone.ring}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${tone.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">{title}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 space-y-1">
              {details.map((line, i) => (
                <li
                  key={`${line}-${i}`}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`}
                  />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
