"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, verifyAdminPassword } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/settings";
import {
  chatbotSettingsSchema,
  generalSettingsSchema,
  passwordSettingsSchema,
  paypalSettingsSchema,
  productDraftSchema,
  productIdSchema,
  telegramSettingsSchema,
} from "@/lib/validators";

async function assertAdmin(): Promise<void> {
  const session = await requireAdmin();
  if (!session) throw new Error("Unauthorized");
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  details?: string[];
  message?: string;
}

function zodDetails(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Publishes a new product as the featured landing-page product.
 * The previous featured product is kept (auto-saved) and simply stops being
 * featured, so it stays in the collection below and can be re-selected later.
 */
export async function publishProductAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = productDraftSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product data.",
        details: zodDetails(parsed.error),
      };
    }
    const d = parsed.data;

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      }),
      prisma.product.create({
        data: {
          title: d.title,
          description: d.description,
          price: d.price,
          compareAtPrice: d.compareAtPrice ?? null,
          currency: d.currency,
          images: d.images,
          features: d.features,
          sourceUrl: d.sourceUrl ?? null,
          eyebrow: d.eyebrow ?? null,
          storyTitle: d.storyTitle ?? null,
          storyText: d.storyText ?? null,
          closingTitle: d.closingTitle ?? null,
          closingText: d.closingText ?? null,
          isActive: true,
          isFeatured: true,
        },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    return {
      ok: true,
      message: "Product published. The previous one was saved to the collection.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Publish failed.",
    };
  }
}

/** Picks a saved product to be the featured landing-page hero again. */
export async function setFeaturedProductAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = productIdSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid product." };

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      }),
      prisma.product.update({
        where: { id: parsed.data.id },
        data: { isFeatured: true, isActive: true },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { ok: true, message: "Featured product updated." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}

/** Shows or hides a product on the storefront collection. */
export async function toggleProductActiveAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = z
      .object({ id: z.string().min(1), isActive: z.boolean() })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid product." };

    await prisma.product.update({
      where: { id: parsed.data.id },
      data: { isActive: parsed.data.isActive },
    });
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}

/** Deletes a product. Orders keep their record (productId is set to null). */
export async function deleteProductAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = productIdSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid product." };

    await prisma.product.delete({ where: { id: parsed.data.id } });
    revalidatePath("/");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Delete failed.",
    };
  }
}

/** Edits an existing product's details and landing-page copy. */
export async function updateProductAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = productDraftSchema
      .partial()
      .extend({ id: z.string().min(1) })
      .safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product data.",
        details: zodDetails(parsed.error),
      };
    }
    const { id, ...d } = parsed.data;

    await prisma.product.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.price !== undefined ? { price: d.price } : {}),
        ...(d.compareAtPrice !== undefined
          ? { compareAtPrice: d.compareAtPrice ?? null }
          : {}),
        ...(d.currency !== undefined ? { currency: d.currency } : {}),
        ...(d.images !== undefined ? { images: d.images } : {}),
        ...(d.features !== undefined ? { features: d.features } : {}),
        ...(d.sourceUrl !== undefined ? { sourceUrl: d.sourceUrl ?? null } : {}),
        ...(d.eyebrow !== undefined ? { eyebrow: d.eyebrow ?? null } : {}),
        ...(d.storyTitle !== undefined
          ? { storyTitle: d.storyTitle ?? null }
          : {}),
        ...(d.storyText !== undefined ? { storyText: d.storyText ?? null } : {}),
        ...(d.closingTitle !== undefined
          ? { closingTitle: d.closingTitle ?? null }
          : {}),
        ...(d.closingText !== undefined
          ? { closingText: d.closingText ?? null }
          : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/products");
    return { ok: true, message: "Product updated." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}

/** Saves PayPal API credentials entered from the dashboard. */
export async function savePaypalSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = paypalSettingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid PayPal settings." };

    const current = await updateSettings({
      paypalClientId: parsed.data.paypalClientId?.trim()
        ? parsed.data.paypalClientId.trim()
        : null,
      ...(parsed.data.paypalSecret?.trim()
        ? { paypalSecret: parsed.data.paypalSecret.trim() }
        : {}),
      paypalMode: parsed.data.paypalMode,
    });
    void current;

    revalidatePath("/dashboard/payments");
    revalidatePath("/");
    return { ok: true, message: "PayPal settings saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
}

/** Clears the stored PayPal credentials. */
export async function clearPaypalSettingsAction(): Promise<ActionResult> {
  try {
    await assertAdmin();
    await updateSettings({
      paypalClientId: null,
      paypalSecret: null,
      paypalMerchantName: null,
    });
    revalidatePath("/dashboard/payments");
    revalidatePath("/");
    return { ok: true, message: "PayPal credentials cleared." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Reset failed.",
    };
  }
}

export async function saveTelegramSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = telegramSettingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid telegram settings." };

    await updateSettings({
      telegramBotToken: parsed.data.telegramBotToken ?? null,
      telegramChatId: parsed.data.telegramChatId ?? null,
    });
    revalidatePath("/dashboard/telegram");
    return { ok: true, message: "Telegram settings saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
}

export async function saveChatbotSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = chatbotSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid chatbot settings.",
        details: zodDetails(parsed.error),
      };
    }

    await updateSettings({
      chatbotEnabled: parsed.data.chatbotEnabled,
      chatbotSystemPrompt: parsed.data.chatbotSystemPrompt ?? null,
      chatbotTone: parsed.data.chatbotTone ?? null,
      aiProvider: parsed.data.aiProvider,
      aiApiKey: parsed.data.aiApiKey ?? null,
      aiModel: parsed.data.aiModel ?? null,
    });
    revalidatePath("/");
    revalidatePath("/dashboard/chatbot");
    return { ok: true, message: "Chatbot settings saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
}

const orderStatusInput = z.object({
  id: z.string().min(1),
  status: z.enum(["PAID", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

export async function updateOrderStatusAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = orderStatusInput.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid status." };

    await prisma.order.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Update failed.",
    };
  }
}

export async function saveGeneralSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = generalSettingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid settings." };

    await updateSettings({
      authEnabled: parsed.data.authEnabled,
      defaultLanguage: parsed.data.defaultLanguage,
    });
    revalidatePath("/dashboard/settings");
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
}

export async function changePasswordAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const parsed = passwordSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid password.",
        details: zodDetails(parsed.error),
      };
    }

    const allowed = await verifyAdminPassword(parsed.data.currentPassword ?? "");
    if (!allowed) return { ok: false, error: "Current password is incorrect." };

    await updateSettings({
      adminPasswordHash: hashPassword(parsed.data.newPassword),
    });
    revalidatePath("/dashboard/settings");
    return { ok: true, message: "Password updated." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Save failed.",
    };
  }
}

/** Drops the dashboard-stored password and falls back to ADMIN_PASSWORD. */
export async function resetPasswordAction(): Promise<ActionResult> {
  try {
    await assertAdmin();
    await updateSettings({ adminPasswordHash: null });
    revalidatePath("/dashboard/settings");
    return { ok: true, message: "Password reset to the environment default." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Reset failed.",
    };
  }
}
