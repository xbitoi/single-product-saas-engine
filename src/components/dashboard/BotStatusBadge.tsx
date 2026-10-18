import { Bot } from "lucide-react";
import { getTelegramStatus } from "@/lib/telegram";
import { cn } from "@/lib/utils";

/** Server component: renders the live Telegram bot status as a pill. */
export async function BotStatusBadge({
  className,
}: {
  className?: string;
}) {
  const status = await getTelegramStatus();

  const label = status.active
    ? "Bot active"
    : status.configured
      ? "Bot inactive"
      : "Bot not configured";

  return (
    <span
      title={status.reason ? `Reason: ${status.reason}` : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        status.active
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400"
          : status.configured
            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
            : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status.active
            ? "animate-pulse-soft bg-green-500"
            : status.configured
              ? "bg-amber-500"
              : "bg-slate-400",
        )}
      />
      <Bot className="h-3.5 w-3.5" />
      {label}
      {status.active && status.bot?.username && (
        <span className="font-normal opacity-80">@{status.bot.username}</span>
      )}
    </span>
  );
}
