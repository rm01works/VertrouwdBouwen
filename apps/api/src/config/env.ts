import { validateRequiredEnv } from '../utils/env-validation';

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
 * to prevent serverless function initialization failures.
 * 
 * Uses the centralized env-validation utility for consistency.
 */
export function validateEnv(): void {
  const result = validateRequiredEnv();
  
  if (!result.valid) {
    throw new Error(
      `Missing required environment variables: ${result.missing.join(', ')}. ` +
      `Please set these in your Vercel project settings.`
    );
  }
}

