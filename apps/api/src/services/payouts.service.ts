import { prisma } from '../config/database';
import { PayoutStatus, UserRole } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';

/**
 * Maak automatisch een payout request aan wanneer milestone is goedgekeurd door beide partijen
 * Wordt aangeroepen vanuit milestone service wanneer milestone status naar COMPLETED gaat
 */
export async function createPayoutRequest(
  milestoneId: string
) {
  console.log('💰 [PAYOUT] Create Payout Request - Start');
  console.log('  Milestone ID:', milestoneId);

  // Haal milestone op met project
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: true,
      payout: true, // Check of er al een payout is
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of er al een payout bestaat voor deze milestone
  if (milestone.payout) {
    console.log('ℹ️  [PAYOUT] Payout already exists for this milestone');
    return milestone.payout;
  }

  // Check of project een contractor heeft
  if (!milestone.project.contractorId) {
    throw new ValidationError('Project heeft geen aannemer');
  }

  // Check of milestone status COMPLETED is (of APPROVED - beide partijen hebben goedgekeurd)
  // Voor nu gebruiken we de logica dat beide approvedByConsumer en approvedByContractor true moeten zijn
  // Dit wordt gecontroleerd in de milestone service voordat deze functie wordt aangeroepen

  console.log('💰 [PAYOUT] Creating payout request');
  console.log('  Amount:', milestone.amount);
  console.log('  Contractor ID:', milestone.project.contractorId);

  // Maak payout aan
  const payout = await prisma.payout.create({
    data: {
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      contractorId: milestone.project.contractorId,
      amount: milestone.amount,
      status: PayoutStatus.PENDING_ADMIN_PAYOUT,
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
      milestone: {
        select: {
          id: true,
          title: true,
          amount: true,
        },
      },
      contractor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  });

  console.log('✅ [PAYOUT] Payout request created');
  console.log('  Payout ID:', payout.id);
  console.log('  Status: PENDING_ADMIN_PAYOUT');

  return payout;
}

/**
 * Haal alle payouts op voor een aannemer
 */
export async function getContractorPayouts(contractorId: string) {
  return prisma.payout.findMany({
    where: { contractorId },
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
      milestone: {
        select: {
          id: true,
          title: true,
          amount: true,
        },
      },
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });
}

/**
 * Haal payout op
 */
export async function getPayoutById(
  payoutId: string,
  userId: string,
  userRole: UserRole
) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      project: true,
      milestone: true,
      contractor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  });

  if (!payout) {
    throw new NotFoundError('Payout niet gevonden');
  }

  // Check toegang
  if (userRole === UserRole.CONTRACTOR) {
    if (payout.contractorId !== userId) {
      throw new ForbiddenError('Geen toegang tot deze payout');
    }
  } else if (userRole === UserRole.CUSTOMER) {
    if (payout.project.customerId !== userId) {
      throw new ForbiddenError('Geen toegang tot deze payout');
    }
  }

  return payout;
}

