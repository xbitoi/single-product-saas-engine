"use client";

import { useFormStatus } from "react-dom";
import { Lock, Loader2 } from "lucide-react";
import { loginAction } from "@/app/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm({
  from,
  hasError,
}: {
  from: string;
  hasError: boolean;
}) {
  return (
    <form
      action={loginAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="from" value={from} />
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="••••••••"
        />
      </div>

      {hasError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          Wrong password. Try again.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
