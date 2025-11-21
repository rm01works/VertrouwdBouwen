import { Router } from 'express';
import {
  getContractorPayoutsController,
  getPayoutByIdController,
} from '../controllers/payouts.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/payouts/contractor
 * @desc    Haal alle payouts op voor de ingelogde aannemer
 * @access  Private (alleen CONTRACTOR)
 */
router.get('/contractor', authenticate, getContractorPayoutsController);

/**
 * @route   GET /api/payouts/:id
 * @desc    Haal één payout op
 * @access  Private
 */
router.get('/:id', authenticate, getPayoutByIdController);

export default router;

