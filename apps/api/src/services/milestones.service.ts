import { prisma } from '../config/database';
import {
  MilestoneStatus,
  PaymentStatus,
  ApprovalStatus,
  UserRole,
} from '@prisma/client';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export interface ApproveMilestoneDto {
  comments?: string;
}

/**
 * Keur een milestone goed en geef betaling vrij
 * Alleen klanten kunnen milestones goedkeuren
 */
export async function approveMilestone(
  milestoneId: string,
  customerId: string,
  data: ApproveMilestoneDto = {}
) {
  console.log('✓ [ESCROW] Approve Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  Customer ID:', customerId);
  console.log('  Comments:', data.comments || 'none');

  // Haal milestone op met project en betaling info
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          customer: true,
        },
      },
      payments: {
        where: {
          status: {
            in: [PaymentStatus.HELD, PaymentStatus.PENDING],
          },
        },
        take: 1,
      },
      approvals: {
        where: {
          status: ApprovalStatus.APPROVED,
        },
        take: 1,
      },
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of gebruiker de klant is van het project
  if (milestone.project.customerId !== customerId) {
    throw new ForbiddenError(
      'Alleen de klant van dit project kan milestones goedkeuren'
    );
  }

  // Check of milestone status SUBMITTED is (aannemer heeft ingediend)
  if (milestone.status !== MilestoneStatus.SUBMITTED) {
    throw new ValidationError(
      `Milestone moet status SUBMITTED hebben om goedgekeurd te worden. Huidige status: ${milestone.status}`
    );
  }

  // Check of er al een goedgekeurde approval is
  if (milestone.approvals.length > 0) {
    throw new ValidationError('Milestone is al goedgekeurd');
  }

  // Check of er een escrow payment is
  if (milestone.payments.length === 0) {
    throw new ValidationError(
      'Geen escrow betaling gevonden. Milestone moet eerst gefinancierd worden.'
    );
  }

  const payment = milestone.payments[0];

  console.log('✓ [ESCROW] Payment found in escrow');
  console.log('  Payment ID:', payment.id);
  console.log('  Payment Status:', payment.status);
  console.log('  Amount:', payment.amount);
  console.log('  Transaction Ref:', payment.transactionRef);

  // Check of betaling in escrow staat (HELD status)
  if (payment.status !== PaymentStatus.HELD) {
    throw new ValidationError(
      `Betaling moet status HELD hebben om vrijgegeven te worden. Huidige status: ${payment.status}`
    );
  }

  console.log('✓ [ESCROW] Starting approval transaction...');

  // Alles valide, voer goedkeuring en betaling release uit in transactie
  const result = await prisma.$transaction(async (tx) => {
    console.log('  → Creating approval record...');
    // 1. Maak approval aan
    const approval = await tx.approval.create({
      data: {
        milestoneId: milestone.id,
        approverId: customerId,
        status: ApprovalStatus.APPROVED,
        comments: data.comments || null,
      },
    });
    console.log('  ✅ Approval created:', approval.id);

    // 2. Update milestone status naar APPROVED
    console.log('  → Updating milestone: SUBMITTED → APPROVED');
    const updatedMilestone = await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: MilestoneStatus.APPROVED,
      },
    });

    // 3. Update escrow payment naar RELEASED (gesimuleerd)
    const transactionRef = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    console.log('  → Releasing payment: HELD → RELEASED');
    console.log('  → Release Transaction Ref:', transactionRef);
    const releasedPayment = await tx.escrowPayment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.RELEASED,
        releasedAt: new Date(),
        transactionRef: transactionRef,
      },
    });
    console.log('  ✅ Payment released to contractor');
    console.log('  → Amount:', releasedPayment.amount);
    console.log('  → Released At:', releasedPayment.releasedAt);

    // 4. Update milestone status naar PAID
    console.log('  → Updating milestone: APPROVED → PAID');
    const paidMilestone = await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: MilestoneStatus.PAID,
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
        },
        payments: true,
        approvals: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log('  ✅ Milestone marked as PAID');
    console.log('  ✅ Transaction complete');

    return {
      milestone: paidMilestone,
      approval,
      payment: releasedPayment,
    };
  });

  console.log('✅ [ESCROW] Milestone approved and payment released');
  console.log('  Final Milestone Status: PAID');
  console.log('  Final Payment Status: RELEASED');
  console.log('  Contractor has received payment (simulated)');
  console.log('✓ [ESCROW] Approve Milestone - Complete');

  return result;
}

/**
 * Haal milestone op met details
 */
export async function getMilestoneById(
  milestoneId: string,
  userId: string,
  userRole: UserRole
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
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
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      approvals: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          approver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check toegang
  if (userRole === UserRole.CUSTOMER) {
    if (milestone.project.customerId !== userId) {
      throw new ForbiddenError('Geen toegang tot deze milestone');
    }
  } else if (userRole === UserRole.CONTRACTOR) {
    if (
      !milestone.project.contractorId ||
      milestone.project.contractorId !== userId
    ) {
      throw new ForbiddenError('Geen toegang tot deze milestone');
    }
  }

  return milestone;
}

/**
 * Dien milestone in voor goedkeuring (aannemer)
 */
export async function submitMilestone(
  milestoneId: string,
  contractorId: string
) {
  console.log('📤 [MILESTONE] Submit Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  Contractor ID:', contractorId);

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: true,
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of gebruiker de aannemer is van het project
  if (!milestone.project.contractorId || milestone.project.contractorId !== contractorId) {
    throw new ForbiddenError(
      'Alleen de aannemer van dit project kan milestones indienen'
    );
  }

  // Check of milestone status IN_PROGRESS is
  if (milestone.status !== MilestoneStatus.IN_PROGRESS) {
    throw new ValidationError(
      `Milestone moet status IN_PROGRESS hebben om ingediend te worden. Huidige status: ${milestone.status}`
    );
  }

  console.log('📤 [MILESTONE] Updating status: IN_PROGRESS → SUBMITTED');
  console.log('  Current status:', milestone.status);

  // Update milestone status naar SUBMITTED
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestone.id },
    data: {
      status: MilestoneStatus.SUBMITTED,
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
      },
      payments: true,
      approvals: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return updatedMilestone;
}

/**
 * Start werk aan milestone (aannemer)
 * Zet milestone status naar IN_PROGRESS
 */
export async function startMilestone(
  milestoneId: string,
  contractorId: string
) {
  console.log('▶️  [MILESTONE] Start Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  Contractor ID:', contractorId);

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: true,
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of gebruiker de aannemer is van het project
  if (!milestone.project.contractorId || milestone.project.contractorId !== contractorId) {
    throw new ForbiddenError(
      'Alleen de aannemer van dit project kan milestones starten'
    );
  }

  // Check of milestone status PENDING is
  if (milestone.status !== MilestoneStatus.PENDING) {
    throw new ValidationError(
      `Milestone moet status PENDING hebben om gestart te worden. Huidige status: ${milestone.status}`
    );
  }

  console.log('▶️  [MILESTONE] Updating status: PENDING → IN_PROGRESS');

  // Update milestone status naar IN_PROGRESS
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestone.id },
    data: {
      status: MilestoneStatus.IN_PROGRESS,
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
      },
      payments: true,
    },
  });

  return updatedMilestone;
}

