import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validators";
import { getSettings } from "@/lib/settings";
import { getActiveProduct } from "@/lib/data";
import {
  buildSystemPrompt,
  generateChatReply,
  isAiConfigured,
  type ProductContext,
} from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackReply(product: ProductContext | null): string {
  if (!product) {
    return "Our store is being updated right now. Please check back in a little while.";
  }
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? ` It is currently discounted from ${product.compareAtPrice} to ${product.price} ${product.currency}.`
      : "";
  return `Thanks for your interest in ${product.title}! It is available for ${product.price} ${product.currency}.${discount} You can order it directly from this page.`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const settings = await getSettings();
    if (!settings.chatbotEnabled) {
      return NextResponse.json(
        { error: "The assistant is currently disabled." },
        { status: 403 },
      );
    }

    const product = await getActiveProduct();
    const productCtx: ProductContext | null = product
      ? {
          title: product.title,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          features: product.features,
        }
      : null;

    const aiConfig = {
      provider: settings.aiProvider,
      apiKey: settings.aiApiKey ?? "",
      model: settings.aiModel,
    };

    if (!isAiConfigured(aiConfig)) {
      return NextResponse.json({ reply: fallbackReply(productCtx) });
    }

    const systemPrompt = buildSystemPrompt(
      productCtx,
      settings.chatbotSystemPrompt,
      settings.chatbotTone,
    );

    const reply = await generateChatReply({
      systemPrompt,
      messages: parsed.data.messages,
      config: aiConfig,
    });

    return NextResponse.json({
      reply: reply || fallbackReply(productCtx),
    });
  } catch (error) {
    const product = await getActiveProduct().catch(() => null);
    const productCtx: ProductContext | null = product
      ? {
          title: product.title,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          features: product.features,
        }
      : null;
    console.error("[chat] error", error);
    return NextResponse.json({ reply: fallbackReply(productCtx) });
  }
}
