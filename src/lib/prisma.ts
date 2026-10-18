import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

type PrismaOptions = ConstructorParameters<typeof PrismaClient>[0];

/**
 * Two modes:
 *  - Production: a normal PostgreSQL connection via DATABASE_URL.
 *  - Local preview (USE_PGLITE=1): an embedded PostgreSQL (PGlite) that runs
 *    in-process, so you can preview the whole app without installing a server.
 *    Data is persisted to PGLITE_DIR (default ./.pglite).
 */
function createClient(): PrismaClient {
  if (process.env.USE_PGLITE === "1") {
    const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
    const { PrismaPGlite } = require("pglite-prisma-adapter") as typeof import("pglite-prisma-adapter");

    const pglite = new PGlite(process.env.PGLITE_DIR || "./.pglite");
    const adapter = new PrismaPGlite(pglite);

    // Double cast because the adapter package type-checks against a slightly
    // different (duplicated) copy of @prisma/driver-adapter-utils.
    return new PrismaClient({ adapter } as unknown as PrismaOptions);
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
