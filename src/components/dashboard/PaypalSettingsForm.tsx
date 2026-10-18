"use client";

import { useState, useTransition } from "react";
import {
  BadgeCheck,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  clearPaypalSettingsAction,
  savePaypalSettingsAction,
} from "@/app/dashboard/actions";
import { useNotice } from "@/components/ui/NoticeProvider";

export function PaypalSettingsForm({
  clientId,
  hasSecret,
  mode,
  merchantName,
  envFallback,
}: {
  clientId: string;
  hasSecret: boolean;
  mode: "sandbox" | "live";
  merchantName: string | null;
  envFallback: boolean;
}) {
  const notice = useNotice();
  const [clientIdValue, setClientIdValue] = useState(clientId);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [modeValue, setModeValue] = useState<"sandbox" | "live">(mode);
  const [account, setAccount] = useState<string | null>(merchantName);
  const [verifying, setVerifying] = useState(false);
  const [pending, startTransition] = useTransition();
  const [clearing, setClearing] = useState(false);

  const configured = Boolean(clientIdValue.trim()) && hasSecret;

  function save() {
    startTransition(async () => {
      const result = await savePaypalSettingsAction({
        paypalClientId: clientIdValue,
        paypalSecret: secret || undefined,
        paypalMode: modeValue,
      });
      if (result.ok) {
        notice.success(result.message ?? "Saved.", [
          "The PayPal button on the landing page now uses these keys.",
        ]);
        setSecret("");
      } else {
        notice.error(result.error ?? "Save failed.", result.details);
      }
    });
  }

  async function verify() {
    setVerifying(true);
    try {
      const res = await fetch("/api/admin/paypal-verify", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        accountName?: string | null;
        email?: string | null;
        userId?: string | null;
        mode?: string;
      };
      if (!data.ok) throw new Error(data.error ?? "Verification failed.");
      setAccount(data.accountName ?? data.email ?? "Connected");
      notice.success(
        `PayPal keys are valid (${data.mode ?? modeValue}).`,
        [
          `Account: ${data.accountName ?? data.email ?? data.userId ?? "verified"}`,
        ],
      );
    } catch (err) {
      notice.error(err instanceof Error ? err.message : "Verification failed.", [
        "Confirm the Client ID and Secret belong to the same app.",
        "Confirm the mode (sandbox vs live) matches those keys.",
      ]);
    } finally {
      setVerifying(false);
    }
  }

  async function clear() {
    setClearing(true);
    try {
      const result = await clearPaypalSettingsAction();
      if (result.ok) {
        notice.success(result.message ?? "Cleared.");
        setClientIdValue("");
        setSecret("");
        setAccount(null);
      } else {
        notice.error(result.error ?? "Reset failed.", result.details);
      }
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              configured
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                configured ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {configured ? "PayPal connected" : "PayPal not configured"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            {modeValue === "live" ? "Live" : "Sandbox"}
          </span>
          {account && (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <BadgeCheck className="h-4 w-4 text-brand-600" />
              {account}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          These keys power the PayPal button your customers tap at checkout. Get
          them from the PayPal Developer Dashboard → your app → Live/Sandbox
          credentials.
          {envFallback
            ? " (An environment key is also present as a fallback.)"
            : ""}
        </p>
      </section>

      {/* Credentials */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="h-5 w-5 text-brand-600" />
          API credentials
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Stored server-side only. The secret is never shown again after saving.
        </p>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Client ID
            </span>
            <input
              value={clientIdValue}
              onChange={(e) => setClientIdValue(e.target.value)}
              placeholder="AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Secret {hasSecret && <em className="text-slate-400">(leave blank to keep current)</em>}
            </span>
            <div className="flex gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={hasSecret ? "••••••••••••" : "ELxxxxxxxxxxxxxxxxxxxxxxxx"}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="shrink-0 rounded-xl border border-slate-300 px-3 text-slate-500 transition hover:bg-slate-50"
                aria-label="Toggle secret visibility"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <div>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Mode
            </span>
            <div className="inline-flex rounded-xl border border-slate-300 p-1">
              {(["sandbox", "live"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeValue(m)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                    modeValue === m
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save keys
          </button>
          <button
            type="button"
            onClick={() => void verify()}
            disabled={verifying || !configured}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Test connection &amp; get account
          </button>
          {(hasSecret || clientId.trim()) && (
            <button
              type="button"
              onClick={() => void clear()}
              disabled={clearing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
