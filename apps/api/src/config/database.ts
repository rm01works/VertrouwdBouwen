import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * Gebruikt voor Node.js runtime (standaard Express API routes)
 * 
 * Voor Edge runtime, gebruik prismaEdge uit lib/prisma-edge.ts
 * 
 * IMPORTANT for serverless (Vercel):
 * - Uses connection pooling via DATABASE_URL (Neon supports this)
 * - Singleton pattern prevents multiple client instances
 * - In serverless, each function invocation may reuse the connection
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// In serverless environments (Vercel), we still want to reuse the connection
// but we need to handle it differently than in traditional servers
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production/serverless, still cache the client to avoid creating multiple instances
  // but don't rely on global state persisting between invocations
  globalForPrisma.prisma = prisma;
}

