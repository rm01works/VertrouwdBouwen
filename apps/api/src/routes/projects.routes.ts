import { Router } from 'express';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  acceptProjectController,
} from '../controllers/projects.controller';
import { validateCreateProject } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/projects
 * @desc    Maak nieuw project aan met milestones
 * @access  Private (alleen CUSTOMER)
 */
router.post(
  '/',
  authenticate,
  validateCreateProject,
  createProjectController
);

/**
 * @route   GET /api/projects
 * @desc    Haal alle projecten op (gefilterd op basis van rol)
 * @access  Private
 */
router.get('/', authenticate, getProjectsController);

/**
 * @route   GET /api/projects/:id
 * @desc    Haal één project op met details
 * @access  Private
 */
router.get('/:id', authenticate, getProjectByIdController);

/**
 * @route   POST /api/projects/:id/accept
 * @desc    Accepteer project als aannemer
 * @access  Private (alleen CONTRACTOR)
 */
router.post('/:id/accept', authenticate, acceptProjectController);

export default router;

