import type { Metadata } from "next";
import { Settings as SettingsIcon } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <SettingsIcon className="h-6 w-6 text-brand-600" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Owner access and store language. The owner password can be changed or
          the login can be switched off entirely.
        </p>
      </header>

      <SettingsForm
        authEnabled={settings.authEnabled}
        defaultLanguage={settings.defaultLanguage}
        hasStoredPassword={Boolean(settings.adminPasswordHash)}
        hasEnvFallback={Boolean(env.ADMIN_PASSWORD)}
      />
    </div>
  );
}
