import { prisma } from "./prisma";
import { env } from "./env";

export type AiProvider = "gemini" | "openai";

export type AppSettings = {
  telegramBotToken: string | null;
  telegramChatId: string | null;
  chatbotEnabled: boolean;
  chatbotSystemPrompt: string | null;
  chatbotTone: string | null;
  aiProvider: AiProvider;
  aiApiKey: string | null;
  aiModel: string | null;
  adminPasswordHash: string | null;
  authEnabled: boolean;
  defaultLanguage: string;
  paypalClientId: string | null;
  paypalSecret: string | null;
  paypalMode: "sandbox" | "live";
  paypalMerchantName: string | null;
};

export const DEFAULT_CHATBOT_PROMPT = `You are a warm, persuasive sales assistant for an online store that sells ONE product.
Your job: answer visitor questions about the product using ONLY the product data provided,
remove doubts, highlight benefits, and gently guide the visitor to complete the purchase.
Keep answers short (2-4 sentences), friendly and confident. Never invent facts, never promise
discounts or delivery times that are not stated in the data. If asked something unknown, say you
will confirm with the store owner and invite them to ask something else. Reply in the visitor's language.`;

export const DEFAULT_AI_MODELS: Record<AiProvider, string> = {
  gemini: "gemini-1.5-flash",
  openai: "gpt-4o-mini",
};

/**
 * Reads the singleton settings row, creating it on first use, and applies
 * env fallbacks for anything not set from the dashboard.
 */
export async function getSettings(): Promise<AppSettings> {
  const row = await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  const provider: AiProvider = row.aiProvider === "openai" ? "openai" : "gemini";
  const envFallbackKey =
    provider === "openai" ? env.OPENAI_API_KEY : env.GEMINI_API_KEY;

  return {
    telegramBotToken: row.telegramBotToken ?? env.TELEGRAM_BOT_TOKEN ?? null,
    telegramChatId: row.telegramChatId ?? env.TELEGRAM_CHAT_ID ?? null,
    chatbotEnabled: row.chatbotEnabled,
    chatbotSystemPrompt: row.chatbotSystemPrompt ?? DEFAULT_CHATBOT_PROMPT,
    chatbotTone: row.chatbotTone ?? "friendly-professional",
    aiProvider: provider,
    aiApiKey: row.aiApiKey ?? envFallbackKey ?? null,
    aiModel: row.aiModel ?? env.AI_MODEL ?? DEFAULT_AI_MODELS[provider],
    adminPasswordHash: row.adminPasswordHash ?? null,
    authEnabled: row.authEnabled,
    defaultLanguage: row.defaultLanguage === "ar" ? "ar" : "en",
    paypalClientId: row.paypalClientId ?? env.PAYPAL_CLIENT_ID ?? null,
    paypalSecret: row.paypalSecret ?? env.PAYPAL_CLIENT_SECRET ?? null,
    paypalMode:
      row.paypalMode === "live"
        ? "live"
        : env.PAYPAL_ENV === "live"
          ? "live"
          : "sandbox",
    paypalMerchantName: row.paypalMerchantName ?? null,
  };
}

export type SettingsUpdate = {
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  chatbotEnabled?: boolean;
  chatbotSystemPrompt?: string | null;
  chatbotTone?: string | null;
  aiProvider?: AiProvider;
  aiApiKey?: string | null;
  aiModel?: string | null;
  adminPasswordHash?: string | null;
  authEnabled?: boolean;
  defaultLanguage?: string;
  paypalClientId?: string | null;
  paypalSecret?: string | null;
  paypalMode?: "sandbox" | "live";
  paypalMerchantName?: string | null;
};

export async function updateSettings(data: SettingsUpdate): Promise<AppSettings> {
  await prisma.setting.upsert({
    where: { id: "global" },
    update: {
      telegramBotToken: data.telegramBotToken,
      telegramChatId: data.telegramChatId,
      chatbotEnabled: data.chatbotEnabled,
      chatbotSystemPrompt: data.chatbotSystemPrompt,
      chatbotTone: data.chatbotTone,
      aiProvider: data.aiProvider,
      aiApiKey: data.aiApiKey,
      aiModel: data.aiModel,
      adminPasswordHash: data.adminPasswordHash,
      authEnabled: data.authEnabled,
      defaultLanguage: data.defaultLanguage,
      paypalClientId: data.paypalClientId,
      paypalSecret: data.paypalSecret,
      paypalMode: data.paypalMode,
      paypalMerchantName: data.paypalMerchantName,
    },
    create: {
      id: "global",
      telegramBotToken: data.telegramBotToken ?? undefined,
      telegramChatId: data.telegramChatId ?? undefined,
      chatbotEnabled: data.chatbotEnabled ?? true,
      chatbotSystemPrompt: data.chatbotSystemPrompt ?? undefined,
      chatbotTone: data.chatbotTone ?? undefined,
      aiProvider: data.aiProvider ?? "gemini",
      aiApiKey: data.aiApiKey ?? undefined,
      aiModel: data.aiModel ?? undefined,
      adminPasswordHash: data.adminPasswordHash ?? undefined,
      authEnabled: data.authEnabled ?? true,
      defaultLanguage: data.defaultLanguage ?? "en",
      paypalClientId: data.paypalClientId ?? undefined,
      paypalSecret: data.paypalSecret ?? undefined,
      paypalMode: data.paypalMode ?? "sandbox",
      paypalMerchantName: data.paypalMerchantName ?? undefined,
    },
  });
  return getSettings();
}
