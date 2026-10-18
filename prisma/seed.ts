import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure the singleton settings row exists with a sensible default prompt.
  await prisma.setting.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  // Seed a sample product only if the store is empty.
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.create({
      data: {
        title: "Aurora Wireless Headphones",
        description:
          "Immersive sound, 40-hour battery life and active noise cancelling. A premium everyday companion for calls, music and travel.",
        price: 49.99,
        compareAtPrice: 89.99,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
        ],
        features: [
          "Active noise cancelling",
          "40 hours playtime",
          "Fast USB-C charging",
          "Bluetooth 5.3 multipoint",
          "Foldable travel design",
        ],
        isActive: true,
      },
    });
    console.log("Seeded a sample product.");
  } else {
    console.log("Products already exist, skipping product seed.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
