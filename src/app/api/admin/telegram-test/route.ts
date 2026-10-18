import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { testTelegramConnection } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  telegramBotToken: z.string().trim().optional(),
  telegramChatId: z.string().trim().optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const body = parsed.success ? parsed.data : {};

  const settings = await getSettings();
  const token = body.telegramBotToken || settings.telegramBotToken;
  const chatId = body.telegramChatId || settings.telegramChatId;

  if (!token) {
    return NextResponse.json(
      { ok: false, reason: "Bot token is required." },
      { status: 400 },
    );
  }

  const result = await testTelegramConnection(token, chatId ?? "", body.message);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
