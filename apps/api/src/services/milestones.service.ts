import { prisma } from '../config/database';
import {
  MilestoneStatus,
  PaymentStatus,
  ApprovalStatus,
  UserRole,
  ProjectPaymentStatus,
  PayoutStatus,
} from '@prisma/client';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { createPayoutRequest } from './payouts.service';

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
  // EN of requiresConsumerAction = true (voor consumenten)
  if (milestone.status !== MilestoneStatus.SUBMITTED) {
    throw new ValidationError(
      `Milestone moet status SUBMITTED hebben om goedgekeurd te worden. Huidige status: ${milestone.status}`
    );
  }
  
  // Voor consumenten: check of requiresConsumerAction = true
  if (userRole === UserRole.CUSTOMER && !(milestone as any).requiresConsumerAction) {
    throw new ValidationError(
      'Milestone wacht niet op actie van consument. Aannemer moet eerst milestone indienen.'
    );
  }

  // Check of deze rol al heeft goedgekeurd
  if (userRole === UserRole.CUSTOMER && (milestone as any).approvedByConsumer) {
    throw new ValidationError('Consument heeft deze milestone al goedgekeurd');
  }
  if (userRole === UserRole.CONTRACTOR && (milestone as any).approvedByContractor) {
    throw new ValidationError('Aannemer heeft deze milestone al goedgekeurd');
  }

  // Check of er een escrow payment is (optioneel - alleen nodig voor payment release)
  const hasPayment = milestone.payments.length > 0;
  const payment = hasPayment ? milestone.payments[0] : null;

  if (hasPayment && payment) {
    console.log('✓ [ESCROW] Payment found in escrow');
    console.log('  Payment ID:', payment.id);
    console.log('  Payment Status:', payment.status);
    console.log('  Amount:', payment.amount);
    console.log('  Transaction Ref:', payment.transactionRef);

    // Check of betaling in escrow staat (HELD status) - alleen als er een payment is
    if (payment.status !== PaymentStatus.HELD) {
      throw new ValidationError(
        `Betaling moet status HELD hebben om vrijgegeven te worden. Huidige status: ${payment.status}`
      );
    }
  } else {
    console.log('ℹ️  [ESCROW] No payment found - approval will proceed without payment release');
  }

  console.log('✓ [ESCROW] Starting approval transaction...');

  // Bepaal welke approval flag moet worden gezet
  const updateData: any = {};
  if (userRole === UserRole.CUSTOMER) {
    updateData.approvedByConsumer = true;
    // Consument heeft goedgekeurd, dus requiresConsumerAction = false
    updateData.requiresConsumerAction = false;
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
      console.log('  → Both parties approved');
      
      // Update milestone status naar APPROVED
      console.log('  → Updating milestone: SUBMITTED → APPROVED');
      await tx.milestone.update({
        where: { id: milestone.id },
        data: {
          status: MilestoneStatus.APPROVED,
          requiresConsumerAction: false, // Beide partijen hebben goedgekeurd
        },
      });

      // Maak payout request aan voor admin (in plaats van direct uitbetalen)
      console.log('  → Creating payout request for admin...');
      let payout = null;
      try {
        // Check of er al een payout bestaat
        const existingPayout = await tx.payout.findUnique({
          where: { milestoneId: milestone.id },
        });

        if (!existingPayout) {
          // Maak nieuwe payout aan
          payout = await tx.payout.create({
            data: {
              projectId: milestone.projectId,
              milestoneId: milestone.id,
              contractorId: milestone.project.contractorId!,
              amount: milestone.amount,
              status: PayoutStatus.PENDING_ADMIN_PAYOUT,
            },
          });
          console.log('  ✅ Payout request created');
          console.log('  → Payout ID:', payout.id);
          console.log('  → Amount:', payout.amount);
          console.log('  → Status: PENDING_ADMIN_PAYOUT');
        } else {
          payout = existingPayout;
          console.log('  ℹ️  Payout already exists for this milestone');
        }
      } catch (error: any) {
        console.error('  ❌ Error creating payout:', error.message);
        // Payout aanmaken is niet kritiek, milestone kan nog steeds goedgekeurd worden
      }
      
      // Haal volledige milestone op voor return
      const completedMilestone = await tx.milestone.findUnique({
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
        milestone: completedMilestone!,
        approval,
        payout, // Payout request voor admin
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
    ? 'Milestone volledig goedgekeurd. Payout request aangemaakt voor admin review.'
    : `${userRole === UserRole.CUSTOMER ? 'Consument' : 'Aannemer'} heeft goedgekeurd, wachtend op andere partij`;

  console.log(`✅ [ESCROW] ${message}`);
  if (result.fullyApproved && result.payout) {
    console.log('  Final Milestone Status: APPROVED');
    console.log('  Payout Request Status: PENDING_ADMIN_PAYOUT');
    console.log('  Admin moet payout goedkeuren voordat aannemer wordt uitbetaald');
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
    // Reset approvedByContractor en requiresConsumerAction
    const finalMilestone = await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: MilestoneStatus.IN_PROGRESS,
        approvedByContractor: false,
        requiresConsumerAction: false,
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
  // Bij indienen: approvedByContractor = true (aannemer heeft zijn deel afgerond)
  // requiresConsumerAction = true (consument moet nu actie ondernemen)
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestone.id },
    data: {
      status: MilestoneStatus.SUBMITTED,
      approvedByContractor: true,
      requiresConsumerAction: true,
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

  // Check of project gefund is - aannemer mag alleen starten als project FULLY_FUNDED is
  if (milestone.project.paymentStatus !== ProjectPaymentStatus.FULLY_FUNDED) {
    throw new ValidationError(
      'Dit project is nog niet (voldoende) gefund. De consument moet eerst geld naar escrow overmaken voordat werk kan starten.'
    );
  }

  console.log('▶️  [MILESTONE] Updating status: PENDING → IN_PROGRESS');

  // Update milestone status naar IN_PROGRESS
  // Bij start werk: approvedByContractor = false, requiresConsumerAction = false
  const updatedMilestone = await prisma.milestone.update({
    where: { id: milestone.id },
    data: {
      status: MilestoneStatus.IN_PROGRESS,
      approvedByContractor: false,
      requiresConsumerAction: false,
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

