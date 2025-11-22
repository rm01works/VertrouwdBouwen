import { prisma } from '../config/database';
import {
  PaymentStatus,
  ProjectStatus,
  MilestoneStatus,
  ProjectPaymentStatusEnum,
  ProjectPaymentStatus,
  PayoutStatus,
} from '@prisma/client';
import { ValidationError, NotFoundError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * Admin service voor financiële en operationele metrics
 * Alleen toegankelijk voor ADMIN gebruikers
 */

export interface FinancialMetrics {
  totalEscrowHeld: number; // Totaal bedrag in escrow (status HELD)
  totalPaidOut: number; // Totaal bedrag uitbetaald (status RELEASED)
  totalPendingPayouts: number; // Totaal bedrag voor afgeronde milestones die nog niet uitbetaald zijn
  projectCountsByStatus: Record<ProjectStatus, number>;
  milestoneCountsByStatus: Record<MilestoneStatus, number>;
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
    lastUpdated: string; // ISO string format for JSON serialization
  }>;
}

/**
 * Haal alle financiële metrics op voor admin dashboard
 */
export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  // Haal alle projecten op met zowel escrowFundedAmount als status voor beide berekeningen
  const projects = await prisma.project.findMany({
    select: {
      escrowFundedAmount: true,
      status: true,
    },
  });

  // Totaal escrow bedrag: som van alle project.escrowFundedAmount
  // Dit is het geld dat in escrow staat na admin goedkeuring van ProjectPayments
  const totalEscrowHeld = projects.reduce(
    (sum: number, project: { escrowFundedAmount: unknown; status: ProjectStatus }) => sum + Number(project.escrowFundedAmount),
    0
  );

  // Totaal uitbetaald bedrag: som van alle payouts met status PAID
  const paidPayouts = await prisma.payout.findMany({
    where: {
      status: PayoutStatus.PAID,
    },
    select: {
      amount: true,
    },
  });
  const totalPaidOut = paidPayouts.reduce(
    (sum: number, payout: { amount: unknown }) => sum + Number(payout.amount),
    0
  );

  // Project counts per status
  const projectCountsByStatus: Record<ProjectStatus, number> = {
    DRAFT: 0,
    PENDING_CONTRACTOR: 0,
    ACTIVE: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    DISPUTED: 0,
  };
  projects.forEach((project) => {
    projectCountsByStatus[project.status]++;
  });

  // Milestone counts per status
  const milestones = await prisma.milestone.findMany({
    select: {
      status: true,
    },
  });
  const milestoneCountsByStatus: Record<MilestoneStatus, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    REJECTED: 0,
    PAID: 0,
  };
  milestones.forEach((milestone) => {
    milestoneCountsByStatus[milestone.status]++;
  });

  // Maandelijkse uitbetalingen (laatste 12 maanden)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const recentPaidPayouts = await prisma.payout.findMany({
    where: {
      status: PayoutStatus.PAID,
      paidAt: {
        gte: twelveMonthsAgo,
        not: null,
      },
    },
    select: {
      amount: true,
      paidAt: true,
    },
  });

  // Groepeer per maand
  const monthlyPayoutsMap = new Map<string, number>();
  recentPaidPayouts.forEach((payout) => {
    if (payout.paidAt) {
      const date = new Date(payout.paidAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const current = monthlyPayoutsMap.get(key) || 0;
      monthlyPayoutsMap.set(key, current + Number(payout.amount));
    }
  });

  const monthlyPayouts = Array.from(monthlyPayoutsMap.entries())
    .map(([key, amount]: [string, number]) => {
      const [year, month] = key.split('-').map(Number);
      return { month, year, amount };
    })
    .sort((a: { month: number; year: number; amount: number }, b: { month: number; year: number; amount: number }) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  // Projecten met afgeronde milestones die nog niet uitbetaald zijn
  // Een project heeft "pending payout" als:
  // - Het heeft payouts met status PENDING_ADMIN_PAYOUT
  // - OF het heeft milestones met status APPROVED maar nog geen payout
  const projectsWithPendingPayouts = await prisma.project.findMany({
    where: {
      OR: [
        {
          payouts: {
            some: {
              status: PayoutStatus.PENDING_ADMIN_PAYOUT,
            },
          },
        },
        {
          milestones: {
            some: {
              status: MilestoneStatus.APPROVED,
              payout: null, // Milestone is goedgekeurd maar heeft nog geen payout
            },
          },
        },
      ],
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      contractor: {
        select: {
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      milestones: {
        include: {
          payout: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
        },
      },
      payouts: {
        where: {
          status: PayoutStatus.PENDING_ADMIN_PAYOUT,
        },
        select: {
          amount: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const projectsPendingPayout = projectsWithPendingPayouts.map((project) => {
    // Bereken totaal bedrag van pending payouts voor dit project
    const pendingPayoutsAmount = project.payouts.reduce(
      (sum: number, payout: { amount: unknown }) => sum + Number(payout.amount),
      0
    );

    // Bereken ook milestones die goedgekeurd zijn maar nog geen payout hebben
    const approvedMilestonesWithoutPayout = project.milestones.filter(
      (m: { status: MilestoneStatus; payout: unknown }) => m.status === MilestoneStatus.APPROVED && !m.payout
    );
    const missingPayoutsAmount = approvedMilestonesWithoutPayout.reduce(
      (sum: number, milestone: { amount: unknown }) => sum + Number(milestone.amount),
      0
    );

    const totalAmount = pendingPayoutsAmount + missingPayoutsAmount;

    const completedMilestones = project.milestones.filter(
      (m) => m.status === MilestoneStatus.PAID || m.status === MilestoneStatus.APPROVED
    ).length;

    return {
      projectId: project.id,
      projectTitle: project.title,
      customerName: `${project.customer.firstName} ${project.customer.lastName}`,
      contractorName: project.contractor
        ? project.contractor.companyName ||
          `${project.contractor.firstName} ${project.contractor.lastName}`
        : null,
      totalAmount,
      completedMilestones,
      totalMilestones: project.milestones.length,
      lastUpdated: project.updatedAt.toISOString(),
    };
  }).filter((p) => p.totalAmount > 0); // Alleen projecten met pending payouts

  // Totaal pending payouts: som van alle payouts met status PENDING_ADMIN_PAYOUT
  const pendingPayouts = await prisma.payout.findMany({
    where: {
      status: PayoutStatus.PENDING_ADMIN_PAYOUT,
    },
    select: {
      amount: true,
    },
  });
  const totalPendingPayouts = pendingPayouts.reduce(
    (sum: number, payout: { amount: unknown }) => sum + Number(payout.amount),
    0
  );

  return {
    totalEscrowHeld,
    totalPaidOut,
    totalPendingPayouts,
    projectCountsByStatus,
    milestoneCountsByStatus,
    monthlyPayouts,
    projectsPendingPayout,
  };
}

/**
 * Haal alle escrow betalingen op die wachten op admin review
 */
export async function getPendingEscrowPayments() {
  return prisma.projectPayment.findMany({
    where: {
      status: ProjectPaymentStatusEnum.PENDING_ADMIN_REVIEW,
      direction: 'INCOMING',
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export interface ApproveEscrowPaymentDto {
  adminNotes?: string;
}

/**
 * Admin keurt een escrow betaling goed
 * - Zet payment status naar ESCROW_CONFIRMED
 * - Update project.escrowFundedAmount
 * - Update project.paymentStatus (NOT_FUNDED -> PARTIALLY_FUNDED -> FULLY_FUNDED)
 */
export async function approveEscrowPayment(
  paymentId: string,
  adminId: string,
  data: ApproveEscrowPaymentDto = {}
) {
  console.log('✅ [ADMIN] Approve Escrow Payment - Start');
  console.log('  Payment ID:', paymentId);
  console.log('  Admin ID:', adminId);

  // Haal payment op met project
  const payment = await prisma.projectPayment.findUnique({
    where: { id: paymentId },
    include: {
      project: true,
    },
  });

  if (!payment) {
    throw new NotFoundError('Betaling niet gevonden');
  }

  if (payment.status !== ProjectPaymentStatusEnum.PENDING_ADMIN_REVIEW) {
    throw new ValidationError(
      `Betaling heeft niet de juiste status voor goedkeuring. Huidige status: ${payment.status}`
    );
  }

  // Update in transactie
  const result = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPayment = await tx.projectPayment.update({
      where: { id: paymentId },
      data: {
        status: ProjectPaymentStatusEnum.ESCROW_CONFIRMED,
        confirmedAt: new Date(),
        confirmedBy: adminId,
        adminNotes: data.adminNotes,
      },
    });

    // Update project escrowFundedAmount
    const newEscrowAmount =
      Number(payment.project.escrowFundedAmount) + Number(payment.amount);

    // Bepaal nieuwe paymentStatus
    let newPaymentStatus: ProjectPaymentStatus;
    if (newEscrowAmount >= Number(payment.project.totalBudget)) {
      newPaymentStatus = ProjectPaymentStatus.FULLY_FUNDED;
    } else if (newEscrowAmount > 0) {
      newPaymentStatus = ProjectPaymentStatus.PARTIALLY_FUNDED;
    } else {
      newPaymentStatus = ProjectPaymentStatus.NOT_FUNDED;
    }

    // Update project
    const updatedProject = await tx.project.update({
      where: { id: payment.projectId },
      data: {
        escrowFundedAmount: newEscrowAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    return {
      payment: updatedPayment,
      project: updatedProject,
    };
  });

  console.log('✅ [ADMIN] Escrow Payment approved');
  console.log('  New Escrow Amount:', result.project.escrowFundedAmount);
  console.log('  New Payment Status:', result.project.paymentStatus);

  return {
    payment: result.payment,
    project: result.project,
    message: `Escrow betaling van €${Number(payment.amount).toFixed(2)} is goedgekeurd`,
  };
}

export interface RejectEscrowPaymentDto {
  adminNotes: string; // Verplicht bij afwijzing
}

/**
 * Admin wijst een escrow betaling af
 */
export async function rejectEscrowPayment(
  paymentId: string,
  adminId: string,
  data: RejectEscrowPaymentDto
) {
  if (!data.adminNotes || data.adminNotes.trim().length === 0) {
    throw new ValidationError('Admin notes zijn verplicht bij afwijzing');
  }

  const payment = await prisma.projectPayment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new NotFoundError('Betaling niet gevonden');
  }

  if (payment.status !== ProjectPaymentStatusEnum.PENDING_ADMIN_REVIEW) {
    throw new ValidationError(
      `Betaling heeft niet de juiste status voor afwijzing. Huidige status: ${payment.status}`
    );
  }

  const updatedPayment = await prisma.projectPayment.update({
    where: { id: paymentId },
    data: {
      status: ProjectPaymentStatusEnum.REJECTED,
      adminNotes: data.adminNotes,
      confirmedBy: adminId,
    },
  });

  return {
    payment: updatedPayment,
    message: 'Escrow betaling is afgewezen',
  };
}

/**
 * Haal alle payouts op die wachten op admin uitbetaling
 */
export async function getPendingPayouts() {
  return prisma.payout.findMany({
    where: {
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
    orderBy: {
      requestedAt: 'desc',
    },
  });
}

export interface MarkPayoutPaidDto {
  transactionRef?: string;
  adminNotes?: string;
}

/**
 * Admin markeert een payout als betaald
 * - Zet payout status naar PAID
 * - Verminder project.escrowFundedAmount
 */
export async function markPayoutPaid(
  payoutId: string,
  adminId: string,
  data: MarkPayoutPaidDto = {}
) {
  console.log('💰 [ADMIN] Mark Payout Paid - Start');
  console.log('  Payout ID:', payoutId);
  console.log('  Admin ID:', adminId);

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      project: true,
    },
  });

  if (!payout) {
    throw new NotFoundError('Payout niet gevonden');
  }

  if (payout.status !== PayoutStatus.PENDING_ADMIN_PAYOUT) {
    throw new ValidationError(
      `Payout heeft niet de juiste status. Huidige status: ${payout.status}`
    );
  }

  // Genereer transaction reference als niet opgegeven
  const transactionRef =
    data.transactionRef ||
    `PAYOUT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

  // Check of transaction reference al bestaat
  if (data.transactionRef) {
    const existing = await prisma.payout.findUnique({
      where: { transactionRef: data.transactionRef },
    });
    if (existing) {
      throw new ValidationError('Deze transactie referentie bestaat al');
    }
  }

  // Update in transactie
  const result = await prisma.$transaction(async (tx) => {
    // Update payout
    const updatedPayout = await tx.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        paidAt: new Date(),
        paidBy: adminId,
        transactionRef: transactionRef,
        adminNotes: data.adminNotes,
      },
    });

    // Verminder project escrowFundedAmount
    const newEscrowAmount = Math.max(
      0,
      Number(payout.project.escrowFundedAmount) - Number(payout.amount)
    );

    // Update project paymentStatus indien nodig
    let newPaymentStatus = payout.project.paymentStatus;
    if (newEscrowAmount === 0) {
      newPaymentStatus = ProjectPaymentStatus.NOT_FUNDED;
    } else if (
      newEscrowAmount < Number(payout.project.totalBudget)
    ) {
      newPaymentStatus = ProjectPaymentStatus.PARTIALLY_FUNDED;
    }

    const updatedProject = await tx.project.update({
      where: { id: payout.projectId },
      data: {
        escrowFundedAmount: newEscrowAmount,
        paymentStatus: newPaymentStatus,
      },
    });

    return {
      payout: updatedPayout,
      project: updatedProject,
    };
  });

  console.log('✅ [ADMIN] Payout marked as paid');
  console.log('  New Escrow Amount:', result.project.escrowFundedAmount);

  return {
    payout: result.payout,
    project: result.project,
    message: `Payout van €${Number(payout.amount).toFixed(2)} is gemarkeerd als betaald`,
  };
}

