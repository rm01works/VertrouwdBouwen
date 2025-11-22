import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

/**
 * Global Error Handler Middleware
 * 
 * IMPORTANT: This handler MUST always send a response, even if an error occurs.
 * In serverless environments (Vercel), if no response is sent, the function
 * will timeout and return an empty 500 error.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Prevent double response sending
  if (res.headersSent) {
    console.error('⚠️ Response already sent, cannot send error response');
    return next(err);
  }

  try {
    // Als het al een AppError is, gebruik die
    if (err instanceof AppError) {
      console.error(`❌ ${err.statusCode} Error:`, err.message);
      console.error('   Stack:', err.stack);
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
    const errorName = err.name || 'UnknownError';
    const errorStack = err.stack || 'No stack trace available';
    
    const isDatabaseError = 
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes('P1001') || // Prisma connection error code
      errorMessage.includes('P1000') || // Prisma authentication error
      errorMessage.includes('P1002') || // Prisma timeout error
      errorMessage.includes('P1003') || // Prisma database not found
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('connect ECONNREFUSED') ||
      errorMessage.includes('does not exist') ||
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('Kan niet verbinden met de database') ||
      errorMessage.includes('Connection') ||
      errorMessage.includes('timeout');

    if (isDatabaseError) {
      console.error('❌ Database verbindingsfout:', errorMessage);
      console.error('   Error name:', errorName);
      console.error('   Error stack:', errorStack);
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database verbindingsfout. Controleer of PostgreSQL draait en of DATABASE_URL correct is ingesteld.',
          ...(env.NODE_ENV === 'development' && { 
            details: errorMessage,
            stack: errorStack,
            name: errorName
          }),
        },
      });
    }

    // Onverwachte errors
    console.error('❌ Onverwachte fout:', err);
    console.error('   Error name:', errorName);
    console.error('   Error message:', errorMessage);
    console.error('   Error stack:', errorStack);
    console.error('   Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

    // Always send a response, even in production
    return res.status(500).json({
      success: false,
      error: {
        message: env.NODE_ENV === 'production' 
          ? 'Er is een fout opgetreden. Probeer het later opnieuw.' 
          : errorMessage,
        ...(env.NODE_ENV === 'development' && { 
          stack: errorStack,
          name: errorName 
        }),
      },
    });
  } catch (handlerError) {
    // If error handler itself fails, try to send a basic response
    console.error('❌ CRITICAL: Error handler failed!', handlerError);
    if (!res.headersSent) {
      try {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Er is een kritieke fout opgetreden bij het verwerken van de request.',
          },
        });
      } catch (finalError) {
        console.error('❌ CRITICAL: Cannot send error response at all!', finalError);
        // At this point, we've done everything we can
      }
    }
  }
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

