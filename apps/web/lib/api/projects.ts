import { apiClient } from './client';

export interface Project {
  id: string;
  customerId: string;
  contractorId?: string | null;
  title: string;
  description: string;
  totalBudget: number;
  status: string;
  paymentStatus?: 'NOT_FUNDED' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED';
  escrowFundedAmount?: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  contractor?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
  } | null;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  order: number;
  dueDate?: string | null;
  approvedByConsumer?: boolean;
  approvedByContractor?: boolean;
  requiresConsumerAction?: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getProjects() {
  return apiClient.get<Project[]>('/projects');
}

export async function getProjectById(id: string) {
  return apiClient.get<Project>(`/projects/${id}`);
}

export async function createProject(data: {
  title: string;
  description: string;
  totalBudget: number;
  startDate?: string;
  endDate?: string;
  contractorId?: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    order: number;
    dueDate?: string;
  }>;
}) {
  return apiClient.post<Project>('/projects', data);
}

export async function acceptProject(id: string) {
  return apiClient.post<Project>(`/projects/${id}/accept`);
}

