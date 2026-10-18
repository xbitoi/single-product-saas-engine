import { z } from "zod";

/**
 * Central-ish env access. Everything is optional with sane dev fallbacks so the
 * app boots without a full .env; features that need a key fail closed at call
 * time (see lib/paypal.ts, lib/ai.ts, lib/telegram.ts).
 */
const schema = z.object({
  NODE_ENV: z.string().default("development"),
  APP_URL: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().optional(),

  ADMIN_PASSWORD: z.string().optional(),
  SESSION_SECRET: z.string().optional(),

  PAYPAL_ENV: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_CURRENCY: z.string().default("USD"),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  AI_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : schema.parse({ NODE_ENV: process.env.NODE_ENV });

export const DEFAULT_SESSION_SECRET =
  "dev-only-session-secret-change-me-please-32chars";

export function getSessionSecret(): string {
  const s = env.SESSION_SECRET;
  return s && s.length >= 16 ? s : DEFAULT_SESSION_SECRET;
}
