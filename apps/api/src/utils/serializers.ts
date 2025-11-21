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

  // Bereken of alle milestones zijn afgerond
  const milestones = project.milestones || [];
  const allMilestonesCompleted = milestones.length > 0 && 
    milestones.every((m: any) => m.status === 'PAID');
  
  const completedMilestonesCount = milestones.filter((m: any) => m.status === 'PAID').length;
  const totalMilestonesCount = milestones.length;

  return {
    ...project,
    totalBudget: decimalToNumber(project.totalBudget),
    milestones: milestones.length > 0
      ? milestones.map((milestone: any) => transformMilestone(milestone))
      : undefined,
    allMilestonesCompleted,
    completedMilestonesCount,
    totalMilestonesCount,
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

/**
 * Serializeer een notificatie object
 */
export function serializeNotification(notification: any): any {
  if (!notification) return notification;

  return {
    id: notification.id,
    userId: notification.userId,
    projectId: notification.projectId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readStatus: notification.readStatus,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    project: notification.project ? {
      id: notification.project.id,
      title: notification.project.title,
    } : null,
  };
}

