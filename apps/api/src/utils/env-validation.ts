/**
 * Environment Variable Validation Utility
 * 
 * This utility validates required environment variables at runtime.
 * It should be called early in the application lifecycle, but NOT at module load time
 * to prevent serverless function initialization failures.
 * 
 * IMPORTANT: This does NOT log actual secret values, only variable names and presence.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Required environment variables for the API
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  'NODE_ENV',
] as const;

/**
 * Validate required environment variables
 * 
 * @returns Validation result with missing variables and warnings
 * @throws Error if critical variables are missing (in production)
 */
export function validateRequiredEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      missing.push(envVar);
    }
  }

  // Check recommended variables (warnings only)
  for (const envVar of RECOMMENDED_ENV_VARS) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      warnings.push(envVar);
    }
  }

  // Validate DATABASE_URL format if present
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && databaseUrl.trim() !== '') {
    if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
      warnings.push('DATABASE_URL does not start with postgres:// or postgresql://');
    }
  }

  // In production, throw error if required vars are missing
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please configure these in your Vercel project settings.`
    );
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate and log environment configuration (non-throwing)
 * 
 * This function logs validation results but does not throw errors.
 * Use this for health checks or startup logging.
 */
export function validateAndLogEnv(): EnvValidationResult {
  const result = validateRequiredEnv();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    console.error(`   Missing required variables: ${result.missing.join(', ')}`);
  } else {
    console.log('✅ Environment validation passed');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    result.warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }

  return result;
}

/**
 * Get environment variable value safely (without logging secrets)
 * 
 * @param key Environment variable name
 * @param defaultValue Optional default value
 * @returns Environment variable value or default
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return '';
  }
  return value;
}

/**
 * Check if an environment variable is set (without logging its value)
 * 
 * @param key Environment variable name
 * @returns True if variable is set and non-empty
 */
export function hasEnvVar(key: string): boolean {
  const value = process.env[key];
  return !!(value && value.trim() !== '');
}

