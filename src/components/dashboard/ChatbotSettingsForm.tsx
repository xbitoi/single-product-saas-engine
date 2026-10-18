"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveChatbotSettingsAction } from "@/app/dashboard/actions";
import { useNotice } from "@/components/ui/NoticeProvider";

export interface ChatbotFormInitial {
  chatbotEnabled: boolean;
  chatbotSystemPrompt: string;
  chatbotTone: string;
  aiProvider: "gemini" | "openai";
  aiApiKey: string;
  aiModel: string;
}

export function ChatbotSettingsForm({
  initial,
}: {
  initial: ChatbotFormInitial;
}) {
  const popup = useNotice();
  const [enabled, setEnabled] = useState(initial.chatbotEnabled);
  const [prompt, setPrompt] = useState(initial.chatbotSystemPrompt);
  const [tone, setTone] = useState(initial.chatbotTone);
  const [provider, setProvider] = useState<"gemini" | "openai">(
    initial.aiProvider,
  );
  const [apiKey, setApiKey] = useState(initial.aiApiKey);
  const [model, setModel] = useState(initial.aiModel);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const result = await saveChatbotSettingsAction({
      chatbotEnabled: enabled,
      chatbotSystemPrompt: prompt || null,
      chatbotTone: tone || null,
      aiProvider: provider,
      aiApiKey: apiKey.trim() || null,
      aiModel: model.trim() || null,
    });
    setSaving(false);
    if (result.ok) popup.success(result.message ?? "Saved.");
    else popup.error(result.error ?? "Failed.", result.details);
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="max-w-2xl space-y-5">
      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        <span>
          <span className="block font-medium">Enable assistant on landing page</span>
          <span className="block text-sm text-slate-500">
            Turns the floating chat widget on or off for visitors.
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            AI provider
          </span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as "gemini" | "openai")}
            className={inputClass}
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Model
          </span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini"}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          API key
        </span>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          placeholder={
            provider === "gemini" ? "Gemini API key" : "OpenAI API key"
          }
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-slate-400">
          Stored server-side. Falls back to the environment variable if empty.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Tone of voice
        </span>
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="friendly-professional"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          System prompt / instructions
        </span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={9}
          className={`${inputClass} scroll-thin resize-none`}
        />
        <span className="mt-1 block text-xs text-slate-400">
          The current product data is appended automatically at runtime, so the
          assistant always knows what it is selling.
        </span>
      </label>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save settings
      </button>
    </div>
  );
}
