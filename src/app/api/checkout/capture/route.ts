import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { capturePaypalOrder } from "@/lib/paypal";
import { sendOrderNotification } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = checkoutSchema.extend({
  paypalOrderId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your details and try again." },
        { status: 400 },
      );
    }

    const { paypalOrderId } = parsed.data;

    // Idempotency: if we already stored this PayPal order, return it.
    const existing = await prisma.order.findUnique({
      where: { paypalOrderId },
    });
    if (existing) {
      return NextResponse.json({
        orderId: existing.id,
        status: existing.status,
        alreadyProcessed: true,
      });
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product is no longer available." },
        { status: 404 },
      );
    }

    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Payment was not completed.",
          details: [
            `PayPal returned the status "${capture.status}".`,
            "No money was taken from the customer.",
            "Ask the customer to try again with a valid payment method.",
          ],
        },
        { status: 402 },
      );
    }

    // Trust the server-side product price, not the client.
    const order = await prisma.order.create({
      data: {
        customerName: parsed.data.customerName,
        email: parsed.data.email?.trim() || "",
        phone: parsed.data.phone,
        address: parsed.data.address,
        productId: product.id,
        productTitle: product.title,
        amount: product.price,
        currency: product.currency,
        paypalOrderId: capture.paypalOrderId,
        paypalCaptureId: capture.captureId,
        status: "PAID",
      },
    });

    await sendOrderNotification({
      id: order.id,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      productTitle: order.productTitle,
      amount: order.amount,
      currency: order.currency,
      paypalOrderId: order.paypalOrderId,
      paypalCaptureId: order.paypalCaptureId,
      createdAt: order.createdAt,
    });

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      productTitle: order.productTitle,
    });
  } catch (error) {
    console.error("[checkout/capture] error", error);
    return NextResponse.json(
      {
        error: "Payment capture failed. Please contact support.",
        details: [
          error instanceof Error ? error.message : "Unknown error.",
          "The customer may have been charged without the order being saved - check your PayPal activity.",
        ],
      },
      { status: 500 },
    );
  }
}
