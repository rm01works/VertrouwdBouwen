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

export interface RejectMilestoneDto {
  comments?: string;
}

/**
 * Keur een milestone goed (zowel consument als aannemer moeten goedkeuren)
 * Betaling wordt alleen vrijgegeven als beide partijen hebben goedgekeurd
 */
export async function approveMilestone(
  milestoneId: string,
  userId: string,
  userRole: UserRole,
  data: ApproveMilestoneDto = {}
) {
  console.log('✓ [ESCROW] Approve Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  User ID:', userId);
  console.log('  User Role:', userRole);
  console.log('  Comments:', data.comments || 'none');

  // Haal milestone op met project en betaling info
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          customer: true,
          contractor: true,
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
    },
  });

  if (!milestone) {
    throw new NotFoundError('Milestone niet gevonden');
  }

  // Check of gebruiker betrokken is bij het project
  const isCustomer = milestone.project.customerId === userId;
  const isContractor = milestone.project.contractorId === userId;

  if (!isCustomer && !isContractor) {
    throw new ForbiddenError(
      'Alleen de klant of aannemer van dit project kan milestones goedkeuren'
    );
  }

  // Check of rol overeenkomt met project relatie
  if (userRole === UserRole.CUSTOMER && !isCustomer) {
    throw new ForbiddenError('Alleen de klant van dit project kan milestones goedkeuren');
  }
  if (userRole === UserRole.CONTRACTOR && !isContractor) {
    throw new ForbiddenError('Alleen de aannemer van dit project kan milestones goedkeuren');
  }

  // Check of milestone status SUBMITTED is (aannemer heeft ingediend)
  if (milestone.status !== MilestoneStatus.SUBMITTED) {
    throw new ValidationError(
      `Milestone moet status SUBMITTED hebben om goedgekeurd te worden. Huidige status: ${milestone.status}`
    );
  }

  // Check of deze rol al heeft goedgekeurd
  if (userRole === UserRole.CUSTOMER && (milestone as any).approvedByConsumer) {
    throw new ValidationError('Consument heeft deze milestone al goedgekeurd');
  }
  if (userRole === UserRole.CONTRACTOR && (milestone as any).approvedByContractor) {
    throw new ValidationError('Aannemer heeft deze milestone al goedgekeurd');
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

  // Bepaal welke approval flag moet worden gezet
  const updateData: any = {};
  if (userRole === UserRole.CUSTOMER) {
    updateData.approvedByConsumer = true;
  } else if (userRole === UserRole.CONTRACTOR) {
    updateData.approvedByContractor = true;
  }

  // Check of beide partijen al hebben goedgekeurd (na deze update)
  const willBeFullyApproved = 
    (userRole === UserRole.CUSTOMER && (milestone as any).approvedByContractor) ||
    (userRole === UserRole.CONTRACTOR && (milestone as any).approvedByConsumer) ||
    ((milestone as any).approvedByConsumer && (milestone as any).approvedByContractor);

  // Alles valide, voer goedkeuring uit in transactie
  const result = await prisma.$transaction(async (tx) => {
    console.log('  → Creating approval record...');
    // 1. Maak approval aan
    const approval = await tx.approval.create({
      data: {
        milestoneId: milestone.id,
        approverId: userId,
        status: ApprovalStatus.APPROVED,
        comments: data.comments || null,
      },
    });
    console.log('  ✅ Approval created:', approval.id);

    // 2. Update milestone met approval flag
    console.log(`  → Updating milestone: ${userRole === UserRole.CUSTOMER ? 'approvedByConsumer' : 'approvedByContractor'} = true`);
    const updatedMilestone = await tx.milestone.update({
      where: { id: milestone.id },
      data: updateData,
    });

    // 3. Als beide partijen hebben goedgekeurd, geef betaling vrij
    const isFullyApproved = (updatedMilestone as any).approvedByConsumer && (updatedMilestone as any).approvedByContractor;
    
    if (isFullyApproved) {
      console.log('  → Both parties approved, releasing payment...');
      
      // Check of er een escrow payment is
      if (milestone.payments.length === 0) {
        throw new ValidationError(
          'Geen escrow betaling gevonden. Milestone moet eerst gefinancierd worden.'
        );
      }

      const payment = milestone.payments[0];

      // Check of betaling in escrow staat (HELD status)
      if (payment.status !== PaymentStatus.HELD) {
        throw new ValidationError(
          `Betaling moet status HELD hebben om vrijgegeven te worden. Huidige status: ${payment.status}`
        );
      }

      // Update milestone status naar APPROVED
      console.log('  → Updating milestone: SUBMITTED → APPROVED');
      await tx.milestone.update({
        where: { id: milestone.id },
        data: {
          status: MilestoneStatus.APPROVED,
        },
      });

      // Update escrow payment naar RELEASED (gesimuleerd)
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

      // Update milestone status naar PAID
      console.log('  → Updating milestone: APPROVED → PAID');
      await tx.milestone.update({
        where: { id: milestone.id },
        data: {
          status: MilestoneStatus.PAID,
        },
      });

      console.log('  ✅ Milestone marked as PAID');
      console.log('  ✅ Payment released to contractor');
      
      // Haal volledige milestone op voor return
      const paidMilestone = await tx.milestone.findUnique({
        where: { id: milestone.id },
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

      return {
        milestone: paidMilestone!,
        approval,
        payment: releasedPayment,
        fullyApproved: true,
      };
    } else {
      // Nog niet volledig goedgekeurd, alleen approval flag gezet
      console.log(`  → ${userRole === UserRole.CUSTOMER ? 'Consument' : 'Aannemer'} heeft goedgekeurd`);
      console.log('  → Wachtend op goedkeuring van andere partij');
      
      // Haal volledige milestone op voor return
      const updatedMilestoneFull = await tx.milestone.findUnique({
        where: { id: milestone.id },
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

      return {
        milestone: updatedMilestoneFull!,
        approval,
        payment: null,
        fullyApproved: false,
      };
    }
  });

  const message = result.fullyApproved
    ? 'Milestone volledig goedgekeurd en betaling vrijgegeven'
    : `${userRole === UserRole.CUSTOMER ? 'Consument' : 'Aannemer'} heeft goedgekeurd, wachtend op andere partij`;

  console.log(`✅ [ESCROW] ${message}`);
  if (result.fullyApproved) {
    console.log('  Final Milestone Status: PAID');
    console.log('  Final Payment Status: RELEASED');
    console.log('  Contractor has received payment (simulated)');
  } else {
    console.log('  Milestone Status: SUBMITTED (wachtend op beide goedkeuringen)');
  }
  console.log('✓ [ESCROW] Approve Milestone - Complete');

  return result;
}

/**
 * Keur een milestone af
 * Alleen klanten kunnen milestones afkeuren
 */
export async function rejectMilestone(
  milestoneId: string,
  customerId: string,
  data: RejectMilestoneDto = {}
) {
  console.log('❌ [ESCROW] Reject Milestone - Start');
  console.log('  Milestone ID:', milestoneId);
  console.log('  Customer ID:', customerId);
  console.log('  Comments:', data.comments || 'none');

  // Haal milestone op met project info
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          customer: true,
        },
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
      'Alleen de klant van dit project kan milestones afkeuren'
    );
  }

  // Check of milestone status SUBMITTED is (aannemer heeft ingediend)
  if (milestone.status !== MilestoneStatus.SUBMITTED) {
    throw new ValidationError(
      `Milestone moet status SUBMITTED hebben om afgekeurd te worden. Huidige status: ${milestone.status}`
    );
  }

  // Check of er al een goedgekeurde approval is
  if (milestone.approvals.length > 0) {
    throw new ValidationError('Milestone is al goedgekeurd');
  }

  console.log('❌ [ESCROW] Starting rejection transaction...');

  // Alles valide, voer afwijzing uit in transactie
  const result = await prisma.$transaction(async (tx) => {
    console.log('  → Creating rejection approval record...');
    // 1. Maak rejection approval aan
    const approval = await tx.approval.create({
      data: {
        milestoneId: milestone.id,
        approverId: customerId,
        status: ApprovalStatus.REJECTED,
        comments: data.comments || null,
      },
    });
    console.log('  ✅ Rejection approval created:', approval.id);

    // 2. Update milestone status naar REJECTED, dan terug naar IN_PROGRESS
    console.log('  → Updating milestone: SUBMITTED → REJECTED → IN_PROGRESS');
    const updatedMilestone = await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: MilestoneStatus.REJECTED,
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

    // 3. Zet milestone terug naar IN_PROGRESS zodat aannemer kan herwerken
    const finalMilestone = await tx.milestone.update({
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

    console.log('  ✅ Milestone rejected and set back to IN_PROGRESS');
    console.log('  ✅ Escrow payment remains HELD');
    console.log('  ✅ Transaction complete');

    return {
      milestone: finalMilestone,
      approval,
    };
  });

  console.log('✅ [ESCROW] Milestone rejected');
  console.log('  Final Milestone Status: IN_PROGRESS');
  console.log('  Escrow Payment Status: HELD (unchanged)');
  console.log('  Contractor can resubmit after fixing issues');
  console.log('✓ [ESCROW] Reject Milestone - Complete');

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

/**
 * Haal alle milestones op voor een gebruiker (zowel als consumer als contractor)
 * GET /api/milestones
 */
export async function getMilestonesForUser(
  userId: string,
  userRole: UserRole
) {
  // Haal alle projecten op waar de gebruiker betrokken bij is
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { customerId: userId },
        { contractorId: userId },
      ],
    },
    select: {
      id: true,
    },
  });

  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return [];
  }

  // Haal alle milestones op voor deze projecten
  const milestones = await prisma.milestone.findMany({
    where: {
      projectId: {
        in: projectIds,
      },
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
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      approvals: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
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
    orderBy: [
      { projectId: 'asc' },
      { order: 'asc' },
    ],
  });

  return milestones;
}

