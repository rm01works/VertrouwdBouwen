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
 * - Errors during initialization are caught and logged, but don't crash the module
 */
let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl || databaseUrl.trim() === '') {
      console.error('❌ DATABASE_URL is not set. Prisma client cannot be initialized.');
      throw new Error('DATABASE_URL environment variable is required but not set.');
    }

    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Optimize for serverless environments
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Test connection on initialization (async, but we don't wait for it)
    // This helps catch connection issues early
    prismaInstance.$connect().catch((error) => {
      console.error('❌ Prisma client connection test failed:', error);
      // Don't throw - let the first query fail gracefully
    });

    return prismaInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to create Prisma client:', errorMessage);
    throw error;
  }
}

// Initialize Prisma client (lazy initialization)
export const prisma: PrismaClient = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  
  // Cache in global for reuse in serverless environments
  globalForPrisma.prisma = client;
  
  return client;
})();

