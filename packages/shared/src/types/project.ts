import { UserRole } from './user';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_CONTRACTOR = 'PENDING_CONTRACTOR',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export interface Project {
  id: string;
  customerId: string;
  contractorId?: string;
  title: string;
  description: string;
  totalBudget: number;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  totalBudget: number;
  startDate?: Date;
  endDate?: Date;
}

