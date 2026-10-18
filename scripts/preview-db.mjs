// Local preview bootstrap: creates the schema inside an embedded PostgreSQL
// (PGlite) and seeds a demo product + a couple of orders so the dashboard and
// landing page have something to show. Idempotent - safe to run repeatedly.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dir = process.env.PGLITE_DIR || "./.pglite";
const db = new PGlite(dir);
if (db.waitReady) await db.waitReady;

const reg = await db.query(`SELECT to_regclass('"public"."Product"') AS t`);
if (!reg.rows[0].t) {
  const ddl = readFileSync(
    resolve(process.cwd(), "prisma", "pglite-init.sql"),
    "utf8",
  );
  await db.exec(ddl);
  console.log("Schema created.");
} else {
  console.log("Schema already present.");
}

await db.exec(
  `INSERT INTO "Setting" (id, "chatbotEnabled", "aiProvider", "chatbotTone", "updatedAt")
   VALUES ('global', true, 'gemini', 'friendly-professional', now())
   ON CONFLICT (id) DO NOTHING`,
);

const p = await db.query(`SELECT count(*)::int AS c FROM "Product"`);
if (p.rows[0].c === 0) {
  await db.exec(`
    INSERT INTO "Product"
      (id, title, description, price, "compareAtPrice", currency, images, features, "sourceUrl",
       eyebrow, "storyTitle", "storyText", "closingTitle", "closingText",
       "isActive", "isFeatured", position, "createdAt", "updatedAt")
    VALUES (
      'seed_product_1',
      'Aurora Wireless Headphones',
      'Immersive sound, 40-hour battery life and active noise cancelling. A premium everyday companion for calls, music and travel.',
      49.99, 89.99, 'USD',
      ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200'],
      ARRAY['Active noise cancelling','40 hours playtime','Fast USB-C charging','Bluetooth 5.3 multipoint','Foldable travel design'],
      NULL,
      NULL, NULL, NULL, NULL, NULL,
      true, true, 0, now(), now()
    ) ON CONFLICT (id) DO NOTHING
  `);
  console.log("Seeded demo product.");
}

const o = await db.query(`SELECT count(*)::int AS c FROM "Order"`);
if (o.rows[0].c === 0) {
  await db.exec(`
    INSERT INTO "Order"
      (id, "customerName", email, phone, address, "productId", "productTitle", amount, currency, "paypalOrderId", "paypalCaptureId", status, "createdAt", "updatedAt")
    VALUES
      ('seed_order_1','Jane Cooper','jane@example.com','+1 555 100 2000','221B Baker Street, London', 'seed_product_1','Aurora Wireless Headphones',49.99,'USD','PAYPAL-ORDER-1','PAYPAL-CAP-1','PAID', now() - interval '2 days', now()),
      ('seed_order_2','Omar Farouk','omar@example.com','+212 600 000 000','Rue 5, Casablanca', 'seed_product_1','Aurora Wireless Headphones',49.99,'USD','PAYPAL-ORDER-2','PAYPAL-CAP-2','SHIPPED', now() - interval '1 day', now()),
      ('seed_order_3','Sara Ali','sara@example.com','+971 50 000 0000','Sheikh Zayed Rd, Dubai', 'seed_product_1','Aurora Wireless Headphones',49.99,'USD','PAYPAL-ORDER-3','PAYPAL-CAP-3','COMPLETED', now() - interval '5 hours', now())
    ON CONFLICT (id) DO NOTHING
  `);
  console.log("Seeded demo orders.");
}

await db.close();
console.log("Preview database ready at", dir);
