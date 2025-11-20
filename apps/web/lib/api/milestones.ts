import { apiClient } from './client';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  order: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    heldAt?: string | null;
    releasedAt?: string | null;
    transactionRef: string;
  }>;
  approvals?: Array<{
    id: string;
    status: string;
    comments?: string | null;
    createdAt: string;
    approver: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export async function getMilestoneById(id: string) {
  return apiClient.get<Milestone>(`/milestones/${id}`);
}

export async function submitMilestone(id: string) {
  return apiClient.post<Milestone>(`/milestones/${id}/submit`);
}

export async function approveMilestone(id: string, comments?: string) {
  return apiClient.post<Milestone>(`/milestones/${id}/approve`, {
    comments,
  });
}

export async function startMilestone(id: string) {
  return apiClient.post<Milestone>(`/milestones/${id}/start`);
}

