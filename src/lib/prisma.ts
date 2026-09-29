import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL não está configurada.");
  }

  const rejectUnauthorized = process.env["DATABASE_SSL_REJECT_UNAUTHORIZED"] !== "false";
  const databaseUrl = new URL(connectionString);
  databaseUrl.searchParams.delete("sslmode");
  databaseUrl.searchParams.delete("uselibpqcompat");

  const configuredPoolSize = Number.parseInt(process.env["DATABASE_POOL_MAX"] ?? "1", 10);
  const poolSize =
    Number.isFinite(configuredPoolSize) && configuredPoolSize > 0 ? configuredPoolSize : 1;

  const adapter = new PrismaPg({
    connectionString: databaseUrl.toString(),
    ssl: { rejectUnauthorized },
    max: poolSize,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
