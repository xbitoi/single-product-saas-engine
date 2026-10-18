import { getActiveProductView, getAllProductsView } from "@/lib/data";
import { ProductScraper } from "@/components/dashboard/ProductScraper";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [currentProduct, products] = await Promise.all([
    getActiveProductView(),
    getAllProductsView(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Product Scraper
        </h1>
        <p className="text-sm text-slate-500">
          Import a product from any store, edit it, and publish it as your
          featured landing page product. Previous products are saved below so you
          can re-select them, hide them or delete them.
        </p>
      </div>

      <ProductScraper currentProduct={currentProduct} products={products} />
    </div>
  );
}
