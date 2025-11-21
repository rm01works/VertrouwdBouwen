import { apiClient } from './client';

export interface Payout {
  id: string;
  projectId: string;
  milestoneId: string;
  contractorId: string;
  amount: number;
  status: 'PENDING_ADMIN_PAYOUT' | 'PAID';
  transactionRef?: string | null;
  adminNotes?: string | null;
  requestedAt: string;
  paidAt?: string | null;
  paidBy?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  milestone?: {
    id: string;
    title: string;
    amount: number;
  };
  contractor?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
  };
}

/**
 * Haal alle payouts op voor de ingelogde aannemer
 */
export async function getContractorPayouts() {
  return apiClient.get<Payout[]>('/payouts/contractor');
}

/**
 * Haal één payout op
 */
export async function getPayoutById(id: string) {
  return apiClient.get<Payout>(`/payouts/${id}`);
}

