import { Request, Response, NextFunction } from 'express';
import {
  approveMilestone,
  rejectMilestone,
  getMilestoneById,
  submitMilestone,
  startMilestone,
  getMilestonesForUser,
} from '../services/milestones.service';
import { transformMilestone, transformPayment, transformMilestones } from '../utils/serializers';

/**
 * Keur milestone goed en geef betaling vrij
 * POST /api/milestones/:id/approve
 */
export async function approveMilestoneController(
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

    const result = await approveMilestone(milestoneId, userId, userRole as any, req.body);

    const message = result.fullyApproved
      ? 'Milestone volledig goedgekeurd en betaling vrijgegeven'
      : `${userRole === 'CUSTOMER' ? 'Consument' : 'Aannemer'} heeft goedgekeurd, wachtend op andere partij`;

    res.status(200).json({
      success: true,
      data: {
        milestone: transformMilestone(result.milestone),
        approval: result.approval,
        payment: result.payment ? transformPayment(result.payment) : null,
        fullyApproved: result.fullyApproved,
        message,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal milestone op
 * GET /api/milestones/:id
 */
export async function getMilestoneByIdController(
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

    const milestone = await getMilestoneById(
      milestoneId,
      userId,
      userRole as any
    );

    res.status(200).json({
      success: true,
      data: transformMilestone(milestone),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Start werk aan milestone
 * POST /api/milestones/:id/start
 */
export async function startMilestoneController(
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

    const milestone = await startMilestone(milestoneId, userId);

    res.status(200).json({
      success: true,
      data: {
        milestone: transformMilestone(milestone),
        message: 'Milestone gestart - werk kan beginnen',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Dien milestone in voor goedkeuring
 * POST /api/milestones/:id/submit
 */
export async function submitMilestoneController(
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

    const milestone = await submitMilestone(milestoneId, userId);

    res.status(200).json({
      success: true,
      data: {
        milestone: transformMilestone(milestone),
        message: 'Milestone ingediend voor goedkeuring',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Keur milestone af
 * POST /api/milestones/:id/reject
 */
export async function rejectMilestoneController(
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

    const result = await rejectMilestone(milestoneId, userId, req.body);

    res.status(200).json({
      success: true,
      data: {
        milestone: transformMilestone(result.milestone),
        approval: result.approval,
        message: 'Milestone afgekeurd - aannemer kan herwerken',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal alle milestones op voor ingelogde gebruiker
 * GET /api/milestones
 */
export async function getMilestonesController(
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

    const milestones = await getMilestonesForUser(userId, userRole as any);

    res.status(200).json({
      success: true,
      data: transformMilestones(milestones),
    });
  } catch (error) {
    next(error);
  }
}

