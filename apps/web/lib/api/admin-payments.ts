import { apiClient } from './client';
import { ProjectPayment } from './project-payments';
import { Payout } from './payouts';

/**
 * Haal alle escrow betalingen op die wachten op admin review
 */
export async function getPendingEscrowPayments() {
  return apiClient.get<ProjectPayment[]>('/admin/escrow-payments/pending');
}

/**
 * Admin keurt een escrow betaling goed
 */
export async function approveEscrowPayment(
  paymentId: string,
  data?: { adminNotes?: string }
) {
  return apiClient.post<{
    payment: ProjectPayment;
    project: any;
    message: string;
  }>(`/admin/escrow-payments/${paymentId}/approve`, data || {});
}

/**
 * Admin wijst een escrow betaling af
 */
export async function rejectEscrowPayment(
  paymentId: string,
  data: { adminNotes: string }
) {
  return apiClient.post<{
    payment: ProjectPayment;
    message: string;
  }>(`/admin/escrow-payments/${paymentId}/reject`, data);
}

/**
 * Haal alle payouts op die wachten op admin uitbetaling
 */
export async function getPendingPayouts() {
  return apiClient.get<Payout[]>('/admin/payouts/pending');
}

/**
 * Admin markeert een payout als betaald
 */
export async function markPayoutPaid(
  payoutId: string,
  data?: { transactionRef?: string; adminNotes?: string }
) {
  return apiClient.post<{
    payout: Payout;
    project: any;
    message: string;
  }>(`/admin/payouts/${payoutId}/mark-paid`, data || {});
}

