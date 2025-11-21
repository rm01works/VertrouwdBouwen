import { apiClient } from './client';

export interface FinancialMetrics {
  totalEscrowHeld: number;
  totalPaidOut: number;
  totalPendingPayouts: number;
  projectCountsByStatus: Record<string, number>;
  milestoneCountsByStatus: Record<string, number>;
  monthlyPayouts: Array<{
    month: number;
    year: number;
    amount: number;
  }>;
  projectsPendingPayout: Array<{
    projectId: string;
    projectTitle: string;
    customerName: string;
    contractorName: string | null;
    totalAmount: number;
    completedMilestones: number;
    totalMilestones: number;
    lastUpdated: string;
  }>;
}

export async function getFinancialMetrics() {
  return apiClient.get<FinancialMetrics>('/admin/metrics/financial');
}

