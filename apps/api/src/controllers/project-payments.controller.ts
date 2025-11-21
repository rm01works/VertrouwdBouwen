import { Request, Response, NextFunction } from 'express';
import {
  initiateProjectPayment,
  getProjectPayments,
  getConsumerProjectPayments,
} from '../services/project-payments.service';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

/**
 * POST /api/projects/:id/payments
 * Consument initieert een escrow betaling voor een project
 */
export async function initiateProjectPaymentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.CUSTOMER) {
      throw new ForbiddenError('Alleen consumenten kunnen escrow betalingen initiëren');
    }

    const { id } = req.params;
    const { amount, transactionRef } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Bedrag is verplicht en moet positief zijn' },
      });
    }

    const result = await initiateProjectPayment(id, userId, {
      amount: Number(amount),
      transactionRef,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects/:id/payments
 * Haal alle project payments op voor een project
 */
export async function getProjectPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new ForbiddenError('Authenticatie vereist');
    }

    const { id } = req.params;
    const payments = await getProjectPayments(id, userId, userRole as UserRole);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/consumer
 * Haal alle project payments op voor de ingelogde consument
 */
export async function getConsumerProjectPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.CUSTOMER) {
      throw new ForbiddenError('Alleen consumenten hebben toegang tot deze endpoint');
    }

    const payments = await getConsumerProjectPayments(userId);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

