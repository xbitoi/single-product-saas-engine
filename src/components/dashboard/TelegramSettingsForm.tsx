"use client";

import { useState } from "react";
import { Bot, Loader2, Save, Send } from "lucide-react";
import { saveTelegramSettingsAction } from "@/app/dashboard/actions";
import { useNotice } from "@/components/ui/NoticeProvider";

interface BotInfo {
  id: number;
  username: string | null;
  firstName: string;
}

export function TelegramSettingsForm({
  initialToken,
  initialChatId,
}: {
  initialToken: string;
  initialChatId: string;
}) {
  const popup = useNotice();
  const [token, setToken] = useState(initialToken);
  const [chatId, setChatId] = useState(initialChatId);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [bot, setBot] = useState<BotInfo | null>(null);

  async function save() {
    setSaving(true);
    const result = await saveTelegramSettingsAction({
      telegramBotToken: token.trim() || null,
      telegramChatId: chatId.trim() || null,
    });
    setSaving(false);
    if (result.ok) {
      popup.success(result.message ?? "Saved.");
    } else {
      popup.error(result.error ?? "Failed.", result.details);
    }
  }

  async function test() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/telegram-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramBotToken: token.trim(),
          telegramChatId: chatId.trim(),
          message: message.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reason?: string;
        bot?: BotInfo;
      };
      if (data.bot) setBot(data.bot);
      if (res.ok && data.ok) {
        popup.success("Test message sent to Telegram.", [
          data.bot
            ? `Bot: ${data.bot.firstName}${
                data.bot.username ? ` (@${data.bot.username})` : ""
              }`
            : "The connection works.",
        ]);
      } else {
        popup.error(data.reason ?? "Test failed.", [
          "Check that the bot token is copied fully from @BotFather.",
          "Check that the chat ID is numeric (message the bot first, or add it to the group).",
          "If the bot was never started, open the bot in Telegram and press Start.",
        ]);
      }
    } catch {
      popup.error("Test failed (network).", [
        "Your server could not reach api.telegram.org.",
      ]);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Field
        label="Telegram Bot Token"
        value={token}
        onChange={setToken}
        placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
      />
      <Field
        label="Telegram Chat ID"
        value={chatId}
        onChange={setChatId}
        placeholder="123456789"
      />

      {bot && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Bot className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-800">
              {bot.firstName}
            </p>
            <p className="truncate text-xs text-brand-700">
              {bot.username ? `@${bot.username}` : "no username"} · id{" "}
              {bot.id}
            </p>
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Test message (optional)
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Leave empty to send the default test message."
          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={() => void test()}
          disabled={testing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {message.trim() ? "Send test message" : "Test connection"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
