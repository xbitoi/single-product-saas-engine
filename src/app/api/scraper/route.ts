import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { scrapeRequestSchema } from "@/lib/validators";
import { scrapeProduct } from "@/lib/scraper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsed = scrapeRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid product URL." },
        { status: 400 },
      );
    }

    const product = await scrapeProduct(parsed.data.url);

    const warnings: string[] = [];
    if (!product.title) warnings.push("No title was found on the page.");
    if (!product.description)
      warnings.push("No description was found - write it in the editor below.");
    if (product.images.length === 0)
      warnings.push(
        "No product images were found in the description area - add them manually.",
      );
    else if (product.images.length < 5)
      warnings.push(
        `Only ${product.images.length} product image(s) were found (5-7 recommended).`,
      );
    if (product.price == null)
      warnings.push("No price was detected - enter it manually.");

    return NextResponse.json({ product, warnings });
  } catch (error) {
    console.error("[scraper] error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not extract the product.",
        details: [
          "Open the link in Brave and confirm it is a single product page, not a category or search page.",
          "Some stores block automated access - try again in a moment.",
          "If the store needs a login, the page cannot be read automatically.",
          "You can always add the product manually in the editor below.",
        ],
      },
      { status: 422 },
    );
  }
}
