import { Decimal } from '@prisma/client/runtime/library';

/**
 * Converteer Prisma Decimal naar number
 */
export function decimalToNumber(value: Decimal | string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  // Prisma Decimal object
  return parseFloat(value.toString()) || 0;
}

/**
 * Transformeer een project object door Decimal velden naar numbers te converteren
 */
export function transformProject(project: any): any {
  if (!project) return project;

  return {
    ...project,
    totalBudget: decimalToNumber(project.totalBudget),
    milestones: project.milestones
      ? project.milestones.map((milestone: any) => transformMilestone(milestone))
      : undefined,
  };
}

/**
 * Transformeer een milestone object door Decimal velden naar numbers te converteren
 */
export function transformMilestone(milestone: any): any {
  if (!milestone) return milestone;

  return {
    ...milestone,
    amount: decimalToNumber(milestone.amount),
    payments: milestone.payments
      ? milestone.payments.map((payment: any) => transformPayment(payment))
      : undefined,
  };
}

/**
 * Transformeer een payment object door Decimal velden naar numbers te converteren
 */
export function transformPayment(payment: any): any {
  if (!payment) return payment;

  return {
    ...payment,
    amount: decimalToNumber(payment.amount),
  };
}

/**
 * Transformeer een array van projecten
 */
export function transformProjects(projects: any[]): any[] {
  return projects.map(transformProject);
}

/**
 * Transformeer een array van milestones
 */
export function transformMilestones(milestones: any[]): any[] {
  return milestones.map(transformMilestone);
}

