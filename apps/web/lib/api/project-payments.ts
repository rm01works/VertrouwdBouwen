import { apiClient } from './client';

export interface ProjectPayment {
  id: string;
  projectId: string;
  consumerId: string;
  amount: number;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'PENDING_CONSUMER' | 'PENDING_ADMIN_REVIEW' | 'ESCROW_CONFIRMED' | 'REJECTED';
  transactionRef?: string | null;
  adminNotes?: string | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    totalBudget: number;
    paymentStatus: 'NOT_FUNDED' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED';
  };
  consumer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Initieer een escrow betaling voor een project
 */
export async function initiateProjectPayment(
  projectId: string,
  data: { amount: number; transactionRef?: string }
) {
  return apiClient.post<{ payment: ProjectPayment; message: string }>(
    `/projects/${projectId}/payments`,
    data
  );
}

/**
 * Haal alle project payments op voor een project
 */
export async function getProjectPayments(projectId: string) {
  return apiClient.get<ProjectPayment[]>(`/projects/${projectId}/payments`);
}

/**
 * Haal alle project payments op voor de ingelogde consument
 */
export async function getConsumerProjectPayments() {
  return apiClient.get<ProjectPayment[]>('/payments/consumer');
}

