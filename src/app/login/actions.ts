"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  isAuthEnabled,
  verifyAdminPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({ password: formData.get("password") });
  const from = String(formData.get("from") || "/dashboard");

  if (!parsed.success || !(await verifyAdminPassword(parsed.data.password))) {
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
  }

  await createSession();
  redirect(from.startsWith("/") ? from : "/dashboard");
}

/** If auth is disabled, skip the login screen entirely. */
export async function skipLoginIfDisabled(): Promise<void> {
  if (!(await isAuthEnabled())) redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
