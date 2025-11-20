import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Als het al een AppError is, gebruik die
  if (err instanceof AppError) {
    console.error(`❌ ${err.statusCode} Error:`, err.message);
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Check for database connection errors
  const errorMessage = err.message || String(err);
  const isDatabaseError = 
    errorMessage.includes("Can't reach database server") ||
    errorMessage.includes('P1001') || // Prisma connection error code
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('Connection refused') ||
    errorMessage.includes('connect ECONNREFUSED') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('authentication failed') ||
    errorMessage.includes('Kan niet verbinden met de database');

  if (isDatabaseError) {
    console.error('❌ Database verbindingsfout:', errorMessage);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database verbindingsfout. Controleer of PostgreSQL draait en of DATABASE_URL correct is ingesteld.',
        ...(env.NODE_ENV === 'development' && { 
          details: errorMessage,
          stack: err.stack 
        }),
      },
    });
  }

  // Onverwachte errors
  console.error('❌ Onverwachte fout:', err);
  console.error('   Error name:', err.name);
  console.error('   Error message:', errorMessage);

  return res.status(500).json({
    success: false,
    error: {
      message: env.NODE_ENV === 'production' 
        ? 'Er is een fout opgetreden. Probeer het later opnieuw.' 
        : errorMessage,
      ...(env.NODE_ENV === 'development' && { 
        stack: err.stack,
        name: err.name 
      }),
    },
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} niet gevonden`,
    },
  });
}

