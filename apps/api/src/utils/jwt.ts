import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Genereer JWT token voor gebruiker
 */
export function generateToken(payload: JWTPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifieer JWT token
 */
export function verifyToken(token: string): JWTPayload {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    
    // Validate that required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new UnauthorizedError('Ongeldige token: ontbrekende gebruikersgegevens');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    // Handle different JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Ongeldige token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token is verlopen. Log opnieuw in.');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new UnauthorizedError('Token is nog niet geldig');
    }
    
    // Generic error
    throw new UnauthorizedError('Token verificatie mislukt');
  }
}

/**
 * Decode JWT token zonder verificatie (voor debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

