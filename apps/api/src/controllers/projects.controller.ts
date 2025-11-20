import { Request, Response, NextFunction } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  acceptProject,
} from '../services/projects.service';
import { transformProject, transformProjects } from '../utils/serializers';

/**
 * Maak nieuw project aan
 * POST /api/projects
 */
export async function createProjectController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const project = await createProject(userId, req.body);

    res.status(201).json({
      success: true,
      data: transformProject(project),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal alle projecten op
 * GET /api/projects
 */
export async function getProjectsController(
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

    const projects = await getProjects(userId, userRole as any);

    res.status(200).json({
      success: true,
      data: transformProjects(projects),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal één project op
 * GET /api/projects/:id
 */
export async function getProjectByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const project = await getProjectById(projectId, userId, userRole as any);

    res.status(200).json({
      success: true,
      data: transformProject(project),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Accepteer project als aannemer
 * POST /api/projects/:id/accept
 */
export async function acceptProjectController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    // Alleen aannemers kunnen projecten accepteren
    if (userRole !== 'CONTRACTOR') {
      return res.status(403).json({
        success: false,
        error: { message: 'Alleen aannemers kunnen projecten accepteren' },
      });
    }

    const project = await acceptProject(projectId, userId);

    res.status(200).json({
      success: true,
      data: transformProject(project),
      message: 'Project succesvol geaccepteerd',
    });
  } catch (error) {
    next(error);
  }
}

