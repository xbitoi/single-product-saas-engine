import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isAuthEnabled } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  if (!(await isAuthEnabled())) redirect("/dashboard");

  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const from = params.from ?? "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            SP
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Single Product Engine
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Owner dashboard - sign in to continue
          </p>
        </div>
        <LoginForm from={from} hasError={Boolean(params.error)} />
      </div>
    </main>
  );
}
