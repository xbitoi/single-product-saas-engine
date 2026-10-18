import { getSettings } from "@/lib/settings";
import { TelegramSettingsForm } from "@/components/dashboard/TelegramSettingsForm";
import { BotStatusBadge } from "@/components/dashboard/BotStatusBadge";

export const dynamic = "force-dynamic";

export default async function TelegramPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Telegram Bot</h1>
          <p className="text-sm text-slate-500">
            Every paid order is pushed to your Telegram chat in real time.
          </p>
        </div>
        <BotStatusBadge />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <TelegramSettingsForm
          initialToken={settings.telegramBotToken ?? ""}
          initialChatId={settings.telegramChatId ?? ""}
        />
      </div>
    </div>
  );
}
