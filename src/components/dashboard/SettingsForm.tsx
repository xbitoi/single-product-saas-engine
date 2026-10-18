"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  Languages,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  changePasswordAction,
  resetPasswordAction,
  saveGeneralSettingsAction,
} from "@/app/dashboard/actions";
import { useNotice } from "@/components/ui/NoticeProvider";

export function SettingsForm({
  authEnabled,
  defaultLanguage,
  hasStoredPassword,
  hasEnvFallback,
}: {
  authEnabled: boolean;
  defaultLanguage: string;
  hasStoredPassword: boolean;
  hasEnvFallback: boolean;
}) {
  const notice = useNotice();
  const [enabled, setEnabled] = useState(authEnabled);
  const [language, setLanguage] = useState<"en" | "ar">(
    defaultLanguage === "ar" ? "ar" : "en",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [savingPassword, setSavingPassword] = useState(false);

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
    });
  }

  function saveGeneral() {
    run(async () => {
      const result = await saveGeneralSettingsAction({
        authEnabled: enabled,
        defaultLanguage: language,
      });
      if (result.ok) notice.success(result.message ?? "Saved.");
      else notice.error(result.error ?? "Save failed.", result.details);
    });
  }

  async function savePassword() {
    setSavingPassword(true);
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
      });
      if (result.ok) {
        notice.success(result.message ?? "Password updated.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        notice.error(result.error ?? "Save failed.", result.details);
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function resetPassword() {
    setSavingPassword(true);
    try {
      const result = await resetPasswordAction();
      if (result.ok) notice.success(result.message ?? "Password reset.");
      else notice.error(result.error ?? "Reset failed.", result.details);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Access */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
          Owner access
        </h2>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
          <span>
            <span className="block font-medium">Require password to open the dashboard</span>
            <span className="block text-sm text-slate-500">
              {enabled
                ? "Visitors are asked for the password before entering /dashboard."
                : "Login is OFF - anyone with the URL can open the dashboard."}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              enabled ? "bg-brand-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                enabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>

        <div className="mt-4">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Languages className="h-3.5 w-3.5" />
            Default store language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500"
          >
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={saveGeneral}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </button>
      </section>

      {/* Password */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <KeyRound className="h-5 w-5 text-brand-600" />
          Change password
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          {hasStoredPassword
            ? "A dashboard password is set. Enter the current one to change it."
            : hasEnvFallback
              ? "Using the ADMIN_PASSWORD from the environment. Set one here to override it."
              : "No password is set yet."}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            type="password"
            placeholder="••••••"
          />
          <Input
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            type="password"
            placeholder="At least 4 characters"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void savePassword()}
            disabled={savingPassword || newPassword.length < 4}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {savingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Update password
          </button>
          {hasStoredPassword && (
            <button
              type="button"
              onClick={() => void resetPassword()}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to default
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
