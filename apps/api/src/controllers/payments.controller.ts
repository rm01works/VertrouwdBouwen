import { Request, Response, NextFunction } from 'express';
import {
  fundMilestone,
  getPaymentById,
  getPaymentsByMilestone,
  refundPayment,
  getUserPayments,
} from '../services/payments.service';

/**
 * Zet geld in escrow voor milestone
 * POST /api/milestones/:id/fund
 */
export async function fundMilestoneController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const milestoneId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const result = await fundMilestone(milestoneId, userId, req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal betaling op
 * GET /api/payments/:id
 */
export async function getPaymentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const paymentId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const payment = await getPaymentById(paymentId, userId, userRole as any);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal betalingen op voor milestone
 * GET /api/milestones/:id/payments
 */
export async function getMilestonePaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const milestoneId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const payments = await getPaymentsByMilestone(
      milestoneId,
      userId,
      userRole as any
    );

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refund betaling
 * POST /api/payments/:id/refund
 */
export async function refundPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const paymentId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const result = await refundPayment(paymentId, userId, req.body.reason);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal alle betalingen op voor gebruiker
 * GET /api/payments
 */
export async function getUserPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const payments = await getUserPayments(userId, userRole as any);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

