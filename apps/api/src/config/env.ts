export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

/**
 * Validate required environment variables
 * This function is called at runtime, not at module load time,
 * to prevent serverless function initialization failures
 */
export function validateEnv(): void {
  const requiredEnvVars: Array<keyof typeof env> = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!env[envVar] || env[envVar] === '') {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please set these in your Vercel project settings.`
    );
  }
}

