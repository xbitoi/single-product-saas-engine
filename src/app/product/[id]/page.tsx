import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionProducts, getProductView } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { ProductDetail } from "@/components/landing/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductView(id);
  return { title: product?.title ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductView(id);
  if (!product) notFound();

  const [collection, settings] = await Promise.all([
    getCollectionProducts(product.id, 6),
    getSettings(),
  ]);

  return (
    <ProductDetail
      product={product}
      collection={collection}
      paypalClientId={settings.paypalClientId ?? null}
      paypalConfigured={Boolean(
        settings.paypalClientId && settings.paypalSecret,
      )}
      chatbotEnabled={settings.chatbotEnabled}
    />
  );
}
