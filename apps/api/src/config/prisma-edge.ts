/**
 * Prisma Edge Client voor Neon Database
 * 
 * Gebruik deze client alleen voor Edge runtime contexten (bijv. Next.js Edge routes).
 * Voor standaard Node.js runtime (Express API), gebruik prisma uit database.ts
 * 
 * @example
 * // In een Next.js Edge route:
 * export const runtime = 'edge';
 * import { prismaEdge } from '@/config/prisma-edge';
 * 
 * export async function GET() {
 *   const users = await prismaEdge.user.findMany();
 *   return Response.json(users);
 * }
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Required for Prisma Edge client.');
}

// Initialiseer Neon Pool client voor Edge runtime
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Maak Prisma adapter met Neon Pool
const adapter = new PrismaNeon(pool);

// PrismaClient via de Neon adapter (Edge-geschikt)
// Type assertion nodig omdat TypeScript types adapter optie niet altijd herkennen
export const prismaEdge = new PrismaClient({ adapter } as any);

