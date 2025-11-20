import { Router } from 'express';
import {
  approveMilestoneController,
  rejectMilestoneController,
  getMilestoneByIdController,
  submitMilestoneController,
  startMilestoneController,
  getMilestonesController,
} from '../controllers/milestones.controller';
import {
  getMilestonePaymentsController,
  fundMilestoneController,
} from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/milestones
 * @desc    Haal alle milestones op voor ingelogde gebruiker
 * @access  Private
 */
router.get('/', authenticate, getMilestonesController);

/**
 * @route   GET /api/milestones/:id
 * @desc    Haal milestone op met details
 * @access  Private
 */
router.get('/:id', authenticate, getMilestoneByIdController);

/**
 * @route   GET /api/milestones/:id/payments
 * @desc    Haal betalingen op voor milestone
 * @access  Private
 */
router.get('/:id/payments', authenticate, getMilestonePaymentsController);

/**
 * @route   POST /api/milestones/:id/fund
 * @desc    Zet geld in escrow voor milestone
 * @access  Private (alleen CUSTOMER)
 */
router.post('/:id/fund', authenticate, fundMilestoneController);

/**
 * @route   POST /api/milestones/:id/start
 * @desc    Start werk aan milestone
 * @access  Private (alleen CONTRACTOR)
 */
router.post('/:id/start', authenticate, startMilestoneController);

/**
 * @route   POST /api/milestones/:id/submit
 * @desc    Dien milestone in voor goedkeuring
 * @access  Private (alleen CONTRACTOR)
 */
router.post('/:id/submit', authenticate, submitMilestoneController);

/**
 * @route   POST /api/milestones/:id/approve
 * @desc    Keur milestone goed en geef betaling vrij
 * @access  Private (alleen CUSTOMER)
 */
router.post('/:id/approve', authenticate, approveMilestoneController);

/**
 * @route   POST /api/milestones/:id/reject
 * @desc    Keur milestone af
 * @access  Private (alleen CUSTOMER)
 */
router.post('/:id/reject', authenticate, rejectMilestoneController);

export default router;

