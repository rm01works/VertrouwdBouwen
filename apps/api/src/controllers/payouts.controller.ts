import { Request, Response, NextFunction } from 'express';
import {
  getContractorPayouts,
  getPayoutById,
} from '../services/payouts.service';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '@prisma/client';

/**
 * GET /api/payouts/contractor
 * Haal alle payouts op voor de ingelogde aannemer
 */
export async function getContractorPayoutsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole || userRole !== UserRole.CONTRACTOR) {
      throw new ForbiddenError('Alleen aannemers hebben toegang tot deze endpoint');
    }

    const payouts = await getContractorPayouts(userId);

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payouts/:id
 * Haal één payout op
 */
export async function getPayoutByIdController(
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
    const payout = await getPayoutById(id, userId, userRole as UserRole);

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    next(error);
  }
}

