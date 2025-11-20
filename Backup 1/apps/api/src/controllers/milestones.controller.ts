import { Request, Response, NextFunction } from 'express';
import {
  approveMilestone,
  getMilestoneById,
  submitMilestone,
  startMilestone,
} from '../services/milestones.service';

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

    const result = await approveMilestone(milestoneId, userId, req.body);

    res.status(200).json({
      success: true,
      data: {
        milestone: result.milestone,
        approval: result.approval,
        payment: result.payment,
        message: 'Milestone goedgekeurd en betaling vrijgegeven',
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
      data: milestone,
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
        milestone,
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
        milestone,
        message: 'Milestone ingediend voor goedkeuring',
      },
    });
  } catch (error) {
    next(error);
  }
}

