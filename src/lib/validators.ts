import { z } from "zod";

export const productDraftSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(20000),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  currency: z.string().trim().min(1).max(8).default("USD"),
  images: z.array(z.string().url()).max(12).default([]),
  features: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
  sourceUrl: z.string().url().optional().nullable(),
  eyebrow: z.string().trim().max(160).optional().nullable(),
  storyTitle: z.string().trim().max(200).optional().nullable(),
  storyText: z.string().trim().max(4000).optional().nullable(),
  closingTitle: z.string().trim().max(200).optional().nullable(),
  closingText: z.string().trim().max(4000).optional().nullable(),
});

export type ProductDraftInput = z.infer<typeof productDraftSchema>;

export const scrapeRequestSchema = z.object({
  url: z.string().url("A valid product URL is required"),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(150),
  email: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().min(3, "Phone is required").max(40),
  address: z.string().trim().min(5, "Shipping address is required").max(1000),
  productId: z.string().trim().min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const telegramSettingsSchema = z.object({
  telegramBotToken: z.string().trim().max(200).optional().nullable(),
  telegramChatId: z.string().trim().max(200).optional().nullable(),
});

export const chatbotSettingsSchema = z.object({
  chatbotEnabled: z.coerce.boolean(),
  chatbotSystemPrompt: z.string().max(8000).optional().nullable(),
  chatbotTone: z.string().trim().max(120).optional().nullable(),
  aiProvider: z.enum(["gemini", "openai"]),
  aiApiKey: z.string().trim().max(400).optional().nullable(),
  aiModel: z.string().trim().max(120).optional().nullable(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PAID", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

export const generalSettingsSchema = z.object({
  authEnabled: z.coerce.boolean(),
  defaultLanguage: z.enum(["en", "ar"]),
});

export const passwordSettingsSchema = z.object({
  currentPassword: z.string().max(200).optional().nullable(),
  newPassword: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(200),
});

export const paypalSettingsSchema = z.object({
  paypalClientId: z.string().trim().max(400).optional().nullable(),
  paypalSecret: z.string().trim().max(400).optional().nullable(),
  paypalMode: z.enum(["sandbox", "live"]).default("sandbox"),
});

export const productIdSchema = z.object({ id: z.string().min(1) });

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});
