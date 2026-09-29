import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";

import { PrismaClient } from "@/generated/prisma/client";

type DatabaseConfig = {
  connectionString: string;
  rejectUnauthorized: boolean;
  poolSize: number;
  cacheKey: string;
};

function getDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL não está configurada.");
  }

  const databaseUrl = new URL(connectionString);
  databaseUrl.searchParams.delete("sslmode");
  databaseUrl.searchParams.delete("uselibpqcompat");

  // O certificado apresentado pelo pooler do Supabase pode incluir uma cadeia
  // privada que o Node no Windows/Vercel não reconhece. A ligação continua TLS,
  // mas a validação dessa cadeia precisa ser desativada para esse host específico.
  const isSupabasePooler = databaseUrl.hostname.endsWith(".pooler.supabase.com");
  const rejectUnauthorized = isSupabasePooler
    ? false
    : process.env["DATABASE_SSL_REJECT_UNAUTHORIZED"] !== "false";

  const configuredPoolSize = Number.parseInt(process.env["DATABASE_POOL_MAX"] ?? "1", 10);
  const poolSize =
    Number.isFinite(configuredPoolSize) && configuredPoolSize > 0 ? configuredPoolSize : 1;

  const normalizedConnectionString = databaseUrl.toString();
  const cacheKey = createHash("sha256")
    .update(`${normalizedConnectionString}|tls:${rejectUnauthorized}|pool:${poolSize}`)
    .digest("hex");

  return {
    connectionString: normalizedConnectionString,
    rejectUnauthorized,
    poolSize,
    cacheKey,
  };
}

function createPrismaClient(config: DatabaseConfig) {
  const adapter = new PrismaPg({
    connectionString: config.connectionString,
    ssl: { rejectUnauthorized: config.rejectUnauthorized },
    max: config.poolSize,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ReturnType<typeof createPrismaClient>;
  prismaConfigKey?: string;
};

const databaseConfig = getDatabaseConfig();
const cachedPrisma =
  globalForPrisma.prismaConfigKey === databaseConfig.cacheKey ? globalForPrisma.prisma : undefined;

if (globalForPrisma.prisma && !cachedPrisma) {
  void globalForPrisma.prisma.$disconnect();
}

export const prisma = cachedPrisma ?? createPrismaClient(databaseConfig);

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConfigKey = databaseConfig.cacheKey;
}
