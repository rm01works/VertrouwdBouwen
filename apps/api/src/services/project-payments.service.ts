import { prisma } from '../config/database';
import {
  ProjectPaymentStatusEnum,
  ProjectPaymentDirection,
  UserRole,
} from '@prisma/client';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export interface InitiateProjectPaymentDto {
  amount: number;
  transactionRef?: string; // Optionele externe transactie referentie
}

/**
 * Consument initieert een escrow betaling voor een project
 * Betaling krijgt status PENDING_ADMIN_REVIEW - admin moet controleren en goedkeuren
 */
export async function initiateProjectPayment(
  projectId: string,
  consumerId: string,
  data: InitiateProjectPaymentDto
) {
  console.log('💰 [PROJECT PAYMENT] Initiate Payment - Start');
  console.log('  Project ID:', projectId);
  console.log('  Consumer ID:', consumerId);
  console.log('  Amount:', data.amount);

  // Haal project op
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      customer: true,
    },
  });

  if (!project) {
    throw new NotFoundError('Project niet gevonden');
  }

  // Check of gebruiker de consument is van het project
  if (project.customerId !== consumerId) {
    throw new ForbiddenError(
      'Alleen de consument van dit project kan escrow betalingen initiëren'
    );
  }

  // Valideer bedrag
  if (data.amount <= 0) {
    throw new ValidationError('Bedrag moet positief zijn');
  }

  // Check of bedrag niet groter is dan totalBudget
  if (Number(data.amount) > Number(project.totalBudget)) {
    throw new ValidationError(
      `Bedrag mag niet groter zijn dan totaal budget (€${Number(project.totalBudget).toFixed(2)})`
    );
  }

  // Genereer transaction reference als niet opgegeven
  const transactionRef = data.transactionRef || `PAY-${Date.now()}-${uuidv4()
    .substring(0, 8)
    .toUpperCase()}`;

  // Check of deze transaction reference al bestaat
  if (data.transactionRef) {
    const existing = await prisma.projectPayment.findUnique({
      where: { transactionRef: data.transactionRef },
    });
    if (existing) {
      throw new ValidationError(
        'Deze transactie referentie bestaat al'
      );
    }
  }

  console.log('💰 [PROJECT PAYMENT] Creating payment record');
  console.log('  Amount:', data.amount);
  console.log('  Transaction Ref:', transactionRef);
  console.log('  Status: PENDING_ADMIN_REVIEW');

  // Maak project payment aan
  const payment = await prisma.projectPayment.create({
    data: {
      projectId: project.id,
      consumerId: consumerId,
      amount: data.amount,
      direction: ProjectPaymentDirection.INCOMING,
      status: ProjectPaymentStatusEnum.PENDING_ADMIN_REVIEW,
      transactionRef: transactionRef,
    },
    include: {
      project: {
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      consumer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  console.log('✅ [PROJECT PAYMENT] Payment created successfully');
  console.log('  Payment ID:', payment.id);
  console.log('  Status: PENDING_ADMIN_REVIEW');
  console.log('  Transaction Ref:', payment.transactionRef);
  console.log('💰 [PROJECT PAYMENT] Initiate Payment - Complete');

  return {
    payment,
    message: `Escrow betaling van €${data.amount.toFixed(2)} is aangemaakt en wacht op admin review`,
  };
}

/**
 * Haal alle project payments op voor een project
 */
export async function getProjectPayments(
  projectId: string,
  userId: string,
  userRole: UserRole
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project niet gevonden');
  }

  // Check toegang
  if (userRole === UserRole.CUSTOMER && project.customerId !== userId) {
    throw new ForbiddenError('Geen toegang tot dit project');
  }
  if (userRole === UserRole.CONTRACTOR) {
    if (!project.contractorId || project.contractorId !== userId) {
      throw new ForbiddenError('Geen toegang tot dit project');
    }
  }

  return prisma.projectPayment.findMany({
    where: { projectId },
    include: {
      consumer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Haal alle project payments op voor een consument
 */
export async function getConsumerProjectPayments(consumerId: string) {
  return prisma.projectPayment.findMany({
    where: {
      consumerId,
      direction: ProjectPaymentDirection.INCOMING,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          totalBudget: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

