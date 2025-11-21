import { Router } from 'express';
import {
  fundMilestoneController,
  getPaymentByIdController,
  getMilestonePaymentsController,
  refundPaymentController,
  getUserPaymentsController,
} from '../controllers/payments.controller';
import { getConsumerProjectPaymentsController } from '../controllers/project-payments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/payments
 * @desc    Haal alle betalingen op voor gebruiker
 * @access  Private
 */
router.get('/', authenticate, getUserPaymentsController);

/**
 * @route   GET /api/payments/consumer
 * @desc    Haal alle project payments op voor de ingelogde consument
 * @access  Private (alleen CUSTOMER)
 */
router.get('/consumer', authenticate, getConsumerProjectPaymentsController);

/**
 * @route   GET /api/payments/:id
 * @desc    Haal betaling op
 * @access  Private
 */
router.get('/:id', authenticate, getPaymentByIdController);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Refund betaling aan klant
 * @access  Private (alleen CUSTOMER)
 */
router.post('/:id/refund', authenticate, refundPaymentController);

export default router;

