import {
  getActiveProductView,
  getCollectionProducts,
  getDashboardStats,
} from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { LandingContent } from "@/components/landing/LandingContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const product = await getActiveProductView();

  const [collection, stats, settings] = await Promise.all([
    getCollectionProducts(product?.id ?? null, 8),
    getDashboardStats(),
    getSettings(),
  ]);

  const paypalClientId = settings.paypalClientId ?? null;
  const paypalConfigured = Boolean(
    settings.paypalClientId && settings.paypalSecret,
  );

  return (
    <LandingContent
      product={product}
      collection={collection}
      paypalClientId={paypalClientId}
      paypalConfigured={paypalConfigured}
      chatbotEnabled={settings.chatbotEnabled}
      ordersDelivered={stats.totalOrders}
    />
  );
}
