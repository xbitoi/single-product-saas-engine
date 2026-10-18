import { getSettings } from "./settings";
import { escapeHtml, formatMoney } from "./utils";

const TELEGRAM_API = "https://api.telegram.org";

export type TelegramResult = { ok: true } | { ok: false; reason: string };

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  html: string,
): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string }
    | null;

  if (!res.ok || !json?.ok) {
    throw new Error(json?.description ?? `Telegram HTTP ${res.status}`);
  }
}

export interface OrderNotification {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  productTitle: string;
  amount: number;
  currency: string;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  createdAt?: Date;
}

export function formatOrderMessage(order: OrderNotification): string {
  const lines = [
    "<b>🛒 New paid order</b>",
    "",
    `<b>Product:</b> ${escapeHtml(order.productTitle)}`,
    `<b>Amount:</b> ${escapeHtml(formatMoney(order.amount, order.currency))}`,
    "",
    `<b>Name:</b> ${escapeHtml(order.customerName)}`,
    `<b>Email:</b> ${escapeHtml(order.email)}`,
    `<b>Phone:</b> ${escapeHtml(order.phone)}`,
    `<b>Address:</b> ${escapeHtml(order.address)}`,
    "",
    `<b>Order ref:</b> <code>${escapeHtml(order.id)}</code>`,
  ];
  if (order.paypalOrderId) {
    lines.push(`<b>PayPal order:</b> <code>${escapeHtml(order.paypalOrderId)}</code>`);
  }
  if (order.paypalCaptureId) {
    lines.push(`<b>PayPal capture:</b> <code>${escapeHtml(order.paypalCaptureId)}</code>`);
  }
  return lines.join("\n");
}

/** Fire the order notification. Never throws - returns a status object instead. */
export async function sendOrderNotification(
  order: OrderNotification,
): Promise<TelegramResult> {
  try {
    const s = await getSettings();
    if (!s.telegramBotToken || !s.telegramChatId) {
      return { ok: false, reason: "telegram-not-configured" };
    }
    await sendTelegramMessage(
      s.telegramBotToken,
      s.telegramChatId,
      formatOrderMessage(order),
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "unknown-error",
    };
  }
}

export interface TelegramBotInfo {
  id: number;
  username: string | null;
  firstName: string;
}

export type ConnectionTestResult =
  | { ok: true; bot: TelegramBotInfo; sent: boolean }
  | { ok: false; reason: string; bot?: TelegramBotInfo };

/** Calls getMe so the dashboard can show the real bot name/username. */
export async function getTelegramBotInfo(
  botToken: string,
): Promise<TelegramBotInfo> {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/getMe`, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  const json = (await res.json().catch(() => null)) as
    | {
        ok?: boolean;
        description?: string;
        result?: { id?: number; username?: string; first_name?: string };
      }
    | null;

  if (!res.ok || !json?.ok || !json.result?.id) {
    throw new Error(json?.description ?? `Telegram HTTP ${res.status}`);
  }

  return {
    id: json.result.id,
    username: json.result.username ?? null,
    firstName: json.result.first_name ?? json.result.username ?? "Bot",
  };
}

/**
 * Verifies the token with getMe, then (optionally) sends a test message.
 * Returns the bot identity even when sending fails, so the dashboard can
 * still display the bot name.
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string,
  customMessage?: string,
): Promise<ConnectionTestResult> {
  let bot: TelegramBotInfo;
  try {
    bot = await getTelegramBotInfo(botToken);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "unknown-error",
    };
  }

  if (!chatId) {
    return { ok: false, reason: "Chat id is required to send a message.", bot };
  }

  try {
    const text = customMessage?.trim()
      ? escapeHtml(customMessage.trim())
      : [
          "<b>✅ Test connection</b>",
          `Bot: <b>${escapeHtml(bot.firstName)}</b>${
            bot.username ? ` (@${escapeHtml(bot.username)})` : ""
          }`,
          "",
          "Your Single Product SaaS Engine is connected to Telegram successfully.",
        ].join("\n");

    await sendTelegramMessage(botToken, chatId, text);
    return { ok: true, bot, sent: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "unknown-error",
      bot,
    };
  }
}

export interface TelegramStatus {
  configured: boolean;
  active: boolean;
  bot: TelegramBotInfo | null;
  reason?: string;
}

/**
 * Live bot status for the dashboard: verifies the stored token with getMe.
 * `active` = token present and accepted by Telegram.
 */
export async function getTelegramStatus(): Promise<TelegramStatus> {
  const s = await getSettings();
  if (!s.telegramBotToken) {
    return { configured: false, active: false, bot: null, reason: "no-token" };
  }
  try {
    const bot = await getTelegramBotInfo(s.telegramBotToken);
    return { configured: true, active: true, bot };
  } catch (error) {
    return {
      configured: true,
      active: false,
      bot: null,
      reason: error instanceof Error ? error.message : "unknown-error",
    };
  }
}
