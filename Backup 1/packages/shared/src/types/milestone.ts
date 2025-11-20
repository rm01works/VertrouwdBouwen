export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  order: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMilestoneDto {
  title: string;
  description: string;
  amount: number;
  order: number;
  dueDate?: Date;
}

