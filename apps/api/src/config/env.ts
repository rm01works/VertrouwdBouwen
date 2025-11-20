// ============================================================================
// Environment Configuration
// ============================================================================
// Centrale configuratie voor alle environment variables
// ============================================================================

/**
 * Parse CORS origins uit environment variable
 * Ondersteunt:
 * - Enkele origin: "http://localhost:3000"
 * - Meerdere origins (comma-separated): "http://localhost:3000,https://example.com"
 * - Wildcard: "*" (alleen in development)
 */
function parseCorsOrigins(): string | string[] {
  const corsOrigin = process.env.CORS_ORIGIN;
  
  // Als CORS_ORIGIN niet gezet is, gebruik defaults voor development
  if (!corsOrigin) {
    if (process.env.NODE_ENV === 'production') {
      // In productie moet CORS_ORIGIN gezet zijn
      throw new Error(
        'CORS_ORIGIN is required in production. Set it to your Netlify site URL, ' +
        'e.g., https://your-site.netlify.app'
      );
    }
    // Development defaults: lokale Next.js en Vite dev servers
    return [
      'http://localhost:3000',  // Next.js default
      'http://localhost:5173',  // Vite default
      'http://localhost:5174',  // Vite alternatief
    ];
  }

  // Als wildcard in development, allow all
  if (corsOrigin === '*' && process.env.NODE_ENV !== 'production') {
    return '*';
  }

  // Split comma-separated origins
  const origins = corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
  
  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one origin');
  }

  // In productie, geen wildcard toestaan
  if (origins.includes('*') && process.env.NODE_ENV === 'production') {
    throw new Error('Wildcard CORS origin (*) is not allowed in production');
  }

  return origins.length === 1 ? origins[0] : origins;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: parseCorsOrigins(),
};

// Validate required environment variables
// In productie: DATABASE_URL of alle DB_* vars moeten gezet zijn (gevalideerd in database.ts)
// JWT_SECRET is altijd verplicht
const requiredEnvVars: Array<keyof typeof env> = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

