import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Prisma 7 requires a driver adapter for every database — there's no more
// "just pass a URL string" constructor. This uses Neon's serverless driver,
// which works over HTTP/WebSockets and is a good fit for serverless/edge
// deployments (e.g. Vercel).
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });

// Prevent multiple PrismaClient instances in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
