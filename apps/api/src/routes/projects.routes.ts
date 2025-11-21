import { Router } from 'express';
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  acceptProjectController,
} from '../controllers/projects.controller';
import {
  initiateProjectPaymentController,
  getProjectPaymentsController,
} from '../controllers/project-payments.controller';
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

/**
 * @route   POST /api/projects/:id/payments
 * @desc    Consument initieert een escrow betaling voor een project
 * @access  Private (alleen CUSTOMER)
 */
router.post('/:id/payments', authenticate, initiateProjectPaymentController);

/**
 * @route   GET /api/projects/:id/payments
 * @desc    Haal alle project payments op voor een project
 * @access  Private
 */
router.get('/:id/payments', authenticate, getProjectPaymentsController);

export default router;

