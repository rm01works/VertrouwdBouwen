import { Request, Response, NextFunction } from 'express';
import {
  getFinancialMetrics,
  getPendingEscrowPayments,
  approveEscrowPayment,
  rejectEscrowPayment,
  getPendingPayouts,
  markPayoutPaid,
} from '../services/admin.service';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

/**
 * GET /api/admin/metrics/financial
 * Haal financiële metrics op voor admin dashboard
 * Alleen toegankelijk voor ADMIN gebruikers
 */
export async function getFinancialMetricsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check of gebruiker admin is
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId || !userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const metrics = await getFinancialMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/escrow-payments/pending
 * Haal alle escrow betalingen op die wachten op admin review
 */
export async function getPendingEscrowPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userRole = req.user?.role;
    if (!userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const payments = await getPendingEscrowPayments();

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/escrow-payments/:id/approve
 * Admin keurt een escrow betaling goed
 */
export async function approveEscrowPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const result = await approveEscrowPayment(id, userId, { adminNotes });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/escrow-payments/:id/reject
 * Admin wijst een escrow betaling af
 */
export async function rejectEscrowPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Admin notes zijn verplicht bij afwijzing' },
      });
    }

    const result = await rejectEscrowPayment(id, userId, { adminNotes });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/payouts/pending
 * Haal alle payouts op die wachten op admin uitbetaling
 */
export async function getPendingPayoutsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userRole = req.user?.role;
    if (!userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const payouts = await getPendingPayouts();

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/payouts/:id/mark-paid
 * Admin markeert een payout als betaald
 */
export async function markPayoutPaidController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const { id } = req.params;
    const { transactionRef, adminNotes } = req.body;

    const result = await markPayoutPaid(id, userId, { transactionRef, adminNotes });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

