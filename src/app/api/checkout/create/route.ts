import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder, isPaypalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!(await isPaypalConfigured())) {
      return NextResponse.json(
        {
          error: "PayPal is not configured yet.",
          details: [
            "The store owner must add the PayPal Client ID and Secret.",
            "Open Dashboard -> Payments, paste the keys and press Save.",
          ],
        },
        { status: 503 },
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json(
        {
          error: "Product is no longer available.",
          details: [
            "This product was hidden or deleted by the store owner.",
            "Refresh the page and pick another product.",
          ],
        },
        { status: 404 },
      );
    }

    const order = await createPaypalOrder({
      amount: product.price,
      currency: product.currency,
      description: product.title,
      referenceId: product.id,
    });

    return NextResponse.json({ paypalOrderId: order.id });
  } catch (error) {
    console.error("[checkout/create] error", error);
    return NextResponse.json(
      {
        error: "Could not start the payment. Please try again.",
        details: [
          error instanceof Error ? error.message : "Unknown error.",
          "If this repeats, check the PayPal keys and the account mode (sandbox/live).",
        ],
      },
      { status: 500 },
    );
  }
}
