// ============================================================================
// Database Configuration
// ============================================================================
// Ondersteunt zowel DATABASE_URL als losse DB_* environment variables
// Voor lokale ontwikkeling: gebruik DATABASE_URL of DB_* vars
// Voor Kubernetes: gebruik DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
// ============================================================================

import { PrismaClient } from '@prisma/client';

/**
 * Database configuratie type
 */
export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Genereert DATABASE_URL uit losse environment variables
 * Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
 */
function buildDatabaseUrl(): string {
  // Als DATABASE_URL al gezet is, gebruik die
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Anders, bouw URL uit losse variabelen
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'vertrouwdbouwen';
  const schema = process.env.DB_SCHEMA || 'public';

  // Valideer dat alle benodigde variabelen aanwezig zijn in productie
  if (process.env.NODE_ENV === 'production') {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required database environment variables in production: ${missing.join(', ')}. ` +
        `Either set DATABASE_URL or set all of: ${required.join(', ')}`
      );
    }
  }

  // URL encoden van password (kan speciale karakters bevatten)
  const encodedPassword = encodeURIComponent(password);
  
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?schema=${schema}`;
}

/**
 * Haalt database configuratie op uit environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  const url = buildDatabaseUrl();
  
  // Parse URL om losse componenten te krijgen (voor logging/debugging)
  const urlObj = new URL(url);
  
  return {
    url,
    host: urlObj.hostname,
    port: parseInt(urlObj.port || '5432', 10),
    user: urlObj.username,
    password: urlObj.password,
    database: urlObj.pathname.slice(1).split('?')[0],
  };
}

// Configureer Prisma met de database URL
const dbConfig = getDatabaseConfig();

// Log database configuratie (zonder password) in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Database configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    url: dbConfig.url.replace(/:[^:@]+@/, ':****@'), // Verberg password in logs
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbConfig.url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

