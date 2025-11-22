import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * Gebruikt voor Node.js runtime (standaard Express API routes)
 * 
 * IMPORTANT for serverless (Vercel):
 * - Uses connection pooling via DATABASE_URL (Neon supports this)
 * - Singleton pattern prevents multiple client instances
 * - In serverless, each function invocation may reuse the connection
 * - Lazy initialization prevents module-load failures
 * - Always uses Node.js runtime (never Edge)
 */
let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl || databaseUrl.trim() === '') {
    const error = new Error('DATABASE_URL environment variable is required but not set. Please configure it in your Vercel project settings.');
    console.error('❌ DATABASE_URL is not set. Prisma client cannot be initialized.');
    throw error;
  }

  // Validate DATABASE_URL format (basic check)
  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    console.warn('⚠️ DATABASE_URL does not start with postgres:// or postgresql://. This may cause connection issues.');
  }

  try {
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
      console.error('❌ Prisma client connection test failed:', error instanceof Error ? error.message : String(error));
      // Don't throw - let the first query fail gracefully
    });

    return prismaInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to create Prisma client:', errorMessage);
    throw new Error(`Failed to initialize Prisma client: ${errorMessage}`);
  }
}

// Initialize Prisma client (lazy initialization)
// This prevents module-load failures in serverless environments
export const prisma: PrismaClient = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  
  // Cache in global for reuse in serverless environments
  globalForPrisma.prisma = client;
  
  return client;
})();

