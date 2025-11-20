import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifieert JWT token en voegt user info toe aan request
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('🔐 AUTHENTICATE MIDDLEWARE - Start');
    console.log('   Path:', req.path);
    console.log('   Method:', req.method);
    console.log('   Cookies:', req.cookies ? Object.keys(req.cookies) : 'geen cookies');
    console.log('   Cookie token:', req.cookies?.token ? 'aanwezig' : 'afwezig');
    console.log('   Authorization header:', req.headers.authorization ? 'aanwezig' : 'afwezig');
    
    // Try to get token from cookie first (for httpOnly cookies)
    let token = req.cookies?.token;

    // Fallback to Authorization header (for API clients)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('   Token gevonden in Authorization header');
      }
    } else {
      console.log('   Token gevonden in cookie');
    }

    if (!token) {
      console.log('❌ AUTHENTICATE: Geen token gevonden');
      throw new UnauthorizedError('Geen token opgegeven. Log opnieuw in.');
    }

    console.log('   Token lengte:', token.length);
    console.log('   Token preview:', token.substring(0, 20) + '...');

    // Verifieer token
    const payload = verifyToken(token);
    console.log('✅ AUTHENTICATE: Token geldig');
    console.log('   User ID:', payload.userId);
    console.log('   Email:', payload.email);
    console.log('   Role:', payload.role);

    // Voeg user info toe aan request
    req.user = payload;

    next();
  } catch (error) {
    console.error('❌ AUTHENTICATE: Fout bij authenticatie');
    console.error('   Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      next(new UnauthorizedError(error.message));
    } else {
      next(new UnauthorizedError('Ongeldige token'));
    }
  }
}

/**
 * Optionele authenticatie - voegt user toe als token aanwezig is
 */
export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch {
    // Bij fout gewoon doorgaan zonder user
    next();
  }
}

