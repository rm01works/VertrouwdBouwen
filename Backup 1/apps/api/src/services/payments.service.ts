import { prisma } from '../config/database';
import { PaymentStatus, UserRole } from '@prisma/client';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export interface FundMilestoneDto {
  amount?: number; // Optioneel, gebruikt milestone amount als niet opgegeven
}

/**
 * Zet geld in escrow voor een milestone (gesimuleerd)
 * Alleen klanten kunnen milestones financieren
 */
export async function fundMilestone(
  milestoneId: string,
  customerId: string,
  data: FundMilestoneDto = {}
) {
  console.log('💰 [ESCROW] Fund Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  Customer ID:', customerId);
  console.log('  Amount:', data.amount || 'using milestone amount');

  // Haal milestone op met project info
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
      },
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of gebruiker de klant is van het project
  if (milestone.project.customerId !== customerId) {
    throw new ForbiddenError(
      'Alleen de klant van dit project kan milestones financieren'
    );
  }

  // Check of er al een actieve betaling is
  if (milestone.payments.length > 0) {
    const activePayment = milestone.payments[0];
    if (activePayment.status === PaymentStatus.HELD) {
      throw new ValidationError(
        'Milestone is al gefinancierd. Geld staat al in escrow.'
      );
    }
  }

  // Bepaal bedrag (gebruik opgegeven amount of milestone amount)
  const amount = data.amount
    ? Number(data.amount)
    : Number(milestone.amount);

  if (amount <= 0) {
    throw new ValidationError('Bedrag moet positief zijn');
  }

  if (data.amount && Math.abs(amount - Number(milestone.amount)) > 0.01) {
    throw new ValidationError(
      `Bedrag moet overeenkomen met milestone bedrag (${milestone.amount})`
    );
  }

  // Genereer unieke transactie referentie
  const transactionRef = `ESCROW-${Date.now()}-${uuidv4()
    .substring(0, 8)
    .toUpperCase()}`;

  console.log('💰 [ESCROW] Creating payment record');
  console.log('  Amount:', amount);
  console.log('  Transaction Ref:', transactionRef);
  console.log('  Status: HELD');

  // Maak escrow payment aan (gesimuleerd - geen echte betaling)
  const payment = await prisma.escrowPayment.create({
    data: {
      milestoneId: milestone.id,
      amount: amount,
      status: PaymentStatus.HELD,
      heldAt: new Date(),
      transactionRef: transactionRef,
    },
    include: {
      milestone: {
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
        },
      },
    },
  });

  console.log('✅ [ESCROW] Payment created successfully');
  console.log('  Payment ID:', payment.id);
  console.log('  Status: HELD');
  console.log('  Held At:', payment.heldAt);
  console.log('  Transaction Ref:', payment.transactionRef);
  console.log('💰 [ESCROW] Fund Milestone - Complete');

  return {
    payment,
    message: `€${amount.toFixed(2)} is in escrow gezet voor milestone "${milestone.title}"`,
  };
}

/**
 * Haal escrow payment op
 */
export async function getPaymentById(
  paymentId: string,
  userId: string,
  userRole: UserRole
) {
  const payment = await prisma.escrowPayment.findUnique({
    where: { id: paymentId },
    include: {
      milestone: {
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
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError('Betaling niet gevonden');
  }

  // Check toegang
  if (userRole === UserRole.CUSTOMER) {
    if (payment.milestone.project.customerId !== userId) {
      throw new ForbiddenError('Geen toegang tot deze betaling');
    }
  } else if (userRole === UserRole.CONTRACTOR) {
    if (
      !payment.milestone.project.contractorId ||
      payment.milestone.project.contractorId !== userId
    ) {
      throw new ForbiddenError('Geen toegang tot deze betaling');
    }
  }

  return payment;
}

/**
 * Haal alle betalingen op voor een milestone
 */
export async function getPaymentsByMilestone(
  milestoneId: string,
  userId: string,
  userRole: UserRole
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: true,
      payments: {
        orderBy: {
          createdAt: 'desc',
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

  return milestone.payments;
}

/**
 * Refund betaling (terugbetalen aan klant)
 * Alleen klanten kunnen refunds aanvragen
 */
export async function refundPayment(
  paymentId: string,
  customerId: string,
  reason?: string
) {
  const payment = await prisma.escrowPayment.findUnique({
    where: { id: paymentId },
    include: {
      milestone: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError('Betaling niet gevonden');
  }

  // Check of gebruiker de klant is
  if (payment.milestone.project.customerId !== customerId) {
    throw new ForbiddenError(
      'Alleen de klant kan een refund aanvragen voor deze betaling'
    );
  }

  // Check of betaling in escrow staat
  if (payment.status !== PaymentStatus.HELD) {
    throw new ValidationError(
      `Alleen betalingen met status HELD kunnen worden terugbetaald. Huidige status: ${payment.status}`
    );
  }

  // Check of milestone nog niet goedgekeurd is
  if (payment.milestone.status === 'APPROVED' || payment.milestone.status === 'PAID') {
    throw new ValidationError(
      'Kan geen refund geven voor een goedgekeurde milestone'
    );
  }

  // Update betaling naar REFUNDED (gesimuleerd)
  const refundedPayment = await prisma.escrowPayment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.REFUNDED,
      // Note: releasedAt wordt gebruikt voor refund timestamp
      releasedAt: new Date(),
    },
    include: {
      milestone: {
        include: {
          project: true,
        },
      },
    },
  });

  return {
    payment: refundedPayment,
    message: `€${Number(payment.amount).toFixed(2)} is terugbetaald aan klant`,
  };
}

/**
 * Haal alle betalingen op voor een gebruiker
 */
export async function getUserPayments(userId: string, userRole: UserRole) {
  if (userRole === UserRole.CUSTOMER) {
    // Klanten zien betalingen van hun projecten
    const projects = await prisma.project.findMany({
      where: { customerId: userId },
      include: {
        milestones: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    const payments = projects.flatMap((project) =>
      project.milestones.flatMap((milestone) => milestone.payments)
    );

    return payments;
  } else if (userRole === UserRole.CONTRACTOR) {
    // Aannemers zien betalingen van hun projecten
    const projects = await prisma.project.findMany({
      where: { contractorId: userId },
      include: {
        milestones: {
          include: {
            payments: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    const payments = projects.flatMap((project) =>
      project.milestones.flatMap((milestone) => milestone.payments)
    );

    return payments;
  }

  // Admin ziet alle betalingen
  return prisma.escrowPayment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      milestone: {
        include: {
          project: true,
        },
      },
    },
  });
}

