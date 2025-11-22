import { Request, Response, NextFunction } from 'express';
import { register, login, getUserById } from '../services/auth.service';
import { AppError } from '../utils/errors';

/**
 * Registreer nieuwe gebruiker
 * POST /auth/register
 */
/**
 * Registreer nieuwe gebruiker
 * POST /auth/register
 * 
 * IMPORTANT: This handler MUST always return JSON, even on errors.
 * In serverless environments (Vercel), empty responses cause 500 errors.
 */
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Ensure we always send a response, even if something goes wrong
  let responseSent = false;

  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 REGISTRATIE CONTROLLER - Start');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 Ontvangen POST body:', JSON.stringify(req.body, null, 2));
    console.log('📋 Body keys:', Object.keys(req.body));
    console.log('📋 Body values:', {
      email: req.body.email,
      role: req.body.role,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password?.length || 0,
      phone: req.body.phone,
      companyName: req.body.companyName,
    });
    
    const result = await register(req.body);
    
    console.log('✅ Registratie succesvol in controller:', { 
      userId: result.user.id, 
      email: result.user.email,
      hasToken: !!result.token 
    });
    
    // Set httpOnly cookie with token
    // Use 'none' for cross-origin support in production (requires secure: true)
    // Use 'lax' for same-site in development
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log('🍪 Cookie gezet voor gebruiker:', result.user.id);
    console.log('📤 Response wordt verzonden met status 201');
    console.log('═══════════════════════════════════════════════════════');

    responseSent = true;
    return res.status(201).json({
      success: true,
      message: 'Registratie succesvol',
      data: {
        user: result.user,
        // Don't send token in response body when using cookies
      },
    });
  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ REGISTRATIE CONTROLLER - FOUT');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && 'statusCode' in error) {
      console.error('Status code:', (error as any).statusCode);
    }
    
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error cause:', (error as any).cause);
    }
    
    // Check for Prisma errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    console.error('═══════════════════════════════════════════════════════');
    
    // If response hasn't been sent yet, ensure we send one
    if (!responseSent && !res.headersSent) {
      // Try to pass to error handler, but if that fails, send a basic error response
      try {
        return next(error);
      } catch (handlerError) {
        console.error('❌ Error handler failed, sending fallback response:', handlerError);
        return res.status(500).json({
          success: false,
          error: {
            message: 'Er is een fout opgetreden bij de registratie. Probeer het later opnieuw.',
          },
        });
      }
    }
    
    // If response was already sent, just pass error to handler
    return next(error);
  }
}

/**
 * Login gebruiker
 * POST /auth/login
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('🔐 Login poging:', { email: req.body.email });
    
    const result = await login(req.body);
    
    console.log('✅ Login succesvol:', { userId: result.user.id, email: result.user.email, role: result.user.role });
    
    // Set httpOnly cookie with token
    // Use 'none' for cross-origin support in production (requires secure: true)
    // Use 'lax' for same-site in development
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Login succesvol',
      data: {
        user: result.user,
        // Don't send token in response body when using cookies
      },
    });
  } catch (error) {
    console.error('❌ Login fout:', error instanceof Error ? error.message : error);
    next(error);
  }
}

/**
 * Haal huidige gebruiker op
 * GET /auth/me
 */
export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('🔍 GET /auth/me - Start');
    console.log('   req.user:', req.user ? 'aanwezig' : 'afwezig');
    console.log('   req.user details:', req.user ? { userId: req.user.userId, email: req.user.email } : 'geen user');
    
    // req.user wordt gezet door auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('❌ GET /auth/me: Geen userId gevonden');
      throw new AppError(401, 'Niet geauthenticeerd');
    }

    console.log('🔍 GET /auth/me: Ophalen gebruiker met ID:', userId);
    const user = await getUserById(userId);
    
    console.log('✅ GET /auth/me: Gebruiker opgehaald:', { id: user.id, email: user.email });
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ GET /auth/me: Fout opgetreden');
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Error stack:', error instanceof Error ? error.stack : 'geen stack');
    next(error);
  }
}

/**
 * Logout gebruiker
 * POST /auth/logout
 */
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Clear httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Uitgelogd',
    });
  } catch (error) {
    next(error);
  }
}

