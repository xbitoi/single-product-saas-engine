import { prisma } from "./prisma";
import type { Order, OrderStatus, Product } from "@prisma/client";

/** Serialisable product shape for client components. */
export interface ProductView {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  features: string[];
  sourceUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  position: number;
  eyebrow: string | null;
  storyTitle: string | null;
  storyText: string | null;
  closingTitle: string | null;
  closingText: string | null;
  createdAt: string;
}

export interface OrderView {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  productTitle: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paypalOrderId: string | null;
  createdAt: string;
}

export interface ArchivedProductView {
  id: string;
  title: string;
  price: number;
  currency: string;
  archivedAt: string | null;
}

export function toProductView(p: Product): ProductView {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    currency: p.currency,
    images: p.images,
    features: p.features,
    sourceUrl: p.sourceUrl,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    position: p.position,
    eyebrow: p.eyebrow ?? null,
    storyTitle: p.storyTitle ?? null,
    storyText: p.storyText ?? null,
    closingTitle: p.closingTitle ?? null,
    closingText: p.closingText ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export function toOrderView(o: Order): OrderView {
  return {
    id: o.id,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    address: o.address,
    productTitle: o.productTitle,
    amount: o.amount,
    currency: o.currency,
    status: o.status,
    paypalOrderId: o.paypalOrderId,
    createdAt: o.createdAt.toISOString(),
  };
}

/** The featured (hero) product: the flagged one, else the most recent active. */
export async function getActiveProduct(): Promise<Product | null> {
  return prisma.product.findFirst({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getActiveProductView(): Promise<ProductView | null> {
  const product = await getActiveProduct();
  return product ? toProductView(product) : null;
}

/** A single storefront product by id (used by the product detail page). */
export async function getProductView(id: string): Promise<ProductView | null> {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
  });
  return product ? toProductView(product) : null;
}

/** Storefront collection: active products other than the featured hero. */
export async function getCollectionProducts(
  excludeId?: string | null,
  limit = 12,
): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toProductView);
}

/** Every product for the dashboard manager (newest first). */
export async function getAllProductsView(): Promise<ProductView[]> {
  const rows = await prisma.product.findMany({
    orderBy: [
      { isFeatured: "desc" },
      { isActive: "desc" },
      { position: "asc" },
      { createdAt: "desc" },
    ],
  });
  return rows.map(toProductView);
}

export async function getOrders(limit = 200): Promise<OrderView[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return orders.map(toOrderView);
}

export async function getArchivedProducts(
  limit = 20,
): Promise<ArchivedProductView[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: false },
    orderBy: { archivedAt: "desc" },
    take: limit,
  });
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    currency: p.currency,
    archivedAt: p.archivedAt ? p.archivedAt.toISOString() : null,
  }));
}

export interface DashboardStats {
  totalOrders: number;
  paid: number;
  shipped: number;
  completed: number;
  cancelled: number;
  revenue: number;
  currency: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [total, paid, shipped, completed, cancelled, revenueAgg] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);

  return {
    totalOrders: total,
    paid,
    shipped,
    completed,
    cancelled,
    revenue: revenueAgg._sum.amount ?? 0,
    currency: "USD",
  };
}
