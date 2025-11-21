import { Router } from 'express';
import {
  getFinancialMetricsController,
  getPendingEscrowPaymentsController,
  approveEscrowPaymentController,
  rejectEscrowPaymentController,
  getPendingPayoutsController,
  markPayoutPaidController,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/admin/metrics/financial
 * @desc    Haal financiële metrics op voor admin dashboard
 * @access  Private (alleen ADMIN)
 */
router.get('/metrics/financial', authenticate, getFinancialMetricsController);

/**
 * @route   GET /api/admin/escrow-payments/pending
 * @desc    Haal alle escrow betalingen op die wachten op admin review
 * @access  Private (alleen ADMIN)
 */
router.get('/escrow-payments/pending', authenticate, getPendingEscrowPaymentsController);

/**
 * @route   POST /api/admin/escrow-payments/:id/approve
 * @desc    Admin keurt een escrow betaling goed
 * @access  Private (alleen ADMIN)
 */
router.post('/escrow-payments/:id/approve', authenticate, approveEscrowPaymentController);

/**
 * @route   POST /api/admin/escrow-payments/:id/reject
 * @desc    Admin wijst een escrow betaling af
 * @access  Private (alleen ADMIN)
 */
router.post('/escrow-payments/:id/reject', authenticate, rejectEscrowPaymentController);

/**
 * @route   GET /api/admin/payouts/pending
 * @desc    Haal alle payouts op die wachten op admin uitbetaling
 * @access  Private (alleen ADMIN)
 */
router.get('/payouts/pending', authenticate, getPendingPayoutsController);

/**
 * @route   POST /api/admin/payouts/:id/mark-paid
 * @desc    Admin markeert een payout als betaald
 * @access  Private (alleen ADMIN)
 */
router.post('/payouts/:id/mark-paid', authenticate, markPayoutPaidController);

export default router;

