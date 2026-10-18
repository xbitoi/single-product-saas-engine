import { getSettings, DEFAULT_CHATBOT_PROMPT } from "@/lib/settings";
import { ChatbotSettingsForm } from "@/components/dashboard/ChatbotSettingsForm";

export const dynamic = "force-dynamic";

export default async function ChatbotPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chatbot</h1>
        <p className="text-sm text-slate-500">
          Configure the AI sales assistant that answers your visitors.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <ChatbotSettingsForm
          initial={{
            chatbotEnabled: settings.chatbotEnabled,
            chatbotSystemPrompt:
              settings.chatbotSystemPrompt ?? DEFAULT_CHATBOT_PROMPT,
            chatbotTone: settings.chatbotTone ?? "friendly-professional",
            aiProvider: settings.aiProvider,
            aiApiKey: settings.aiApiKey ?? "",
            aiModel: settings.aiModel ?? "",
          }}
        />
      </div>
    </div>
  );
}
