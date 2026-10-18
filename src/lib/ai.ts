import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { DEFAULT_AI_MODELS, type AiProvider } from "./settings";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string | null;
}

export interface ProductContext {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  features: string[];
}

export function buildSystemPrompt(
  product: ProductContext | null,
  customPrompt: string | null,
  tone: string | null,
): string {
  const parts: string[] = [];
  if (customPrompt && customPrompt.trim()) {
    parts.push(customPrompt.trim());
  }
  if (tone) {
    parts.push(`\nTone of voice: ${tone}.`);
  }
  if (product) {
    const discount =
      product.compareAtPrice && product.compareAtPrice > product.price
        ? ` (was ${product.compareAtPrice} ${product.currency})`
        : "";
    parts.push(
      [
        "\n--- PRODUCT DATA (the only product you sell) ---",
        `Title: ${product.title}`,
        `Price: ${product.price} ${product.currency}${discount}`,
        `Description: ${product.description}`,
        product.features.length
          ? `Key features:\n- ${product.features.join("\n- ")}`
          : "",
        "--- END PRODUCT DATA ---",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } else {
    parts.push(
      "\nNo product is currently published. Politely tell visitors the store is being updated.",
    );
  }
  return parts.join("\n");
}

export interface GenerateArgs {
  systemPrompt: string;
  messages: ChatMessage[];
  config: AiConfig;
}

export function isAiConfigured(config: AiConfig): boolean {
  return Boolean(config.apiKey && config.apiKey.trim());
}

export async function generateChatReply({
  systemPrompt,
  messages,
  config,
}: GenerateArgs): Promise<string> {
  const model = config.model ?? DEFAULT_AI_MODELS[config.provider];

  if (config.provider === "openai") {
    const client = new OpenAI({ apiKey: config.apiKey });
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }

  const genAI = new GoogleGenerativeAI(config.apiKey);
  const gModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const last = messages[messages.length - 1];

  const chat = gModel.startChat({ history });
  const result = await chat.sendMessage(last?.content ?? "");
  return result.response.text().trim();
}
