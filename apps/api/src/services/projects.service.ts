import { prisma } from '../config/database';
import { ProjectStatus, UserRole } from '@prisma/client';
import { ValidationError, ForbiddenError, NotFoundError } from '../utils/errors';

export interface CreateMilestoneDto {
  title: string;
  description: string;
  amount: number;
  order: number;
  dueDate?: string; // ISO date string
}

export interface CreateProjectDto {
  title: string;
  description: string;
  totalBudget: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  milestones: CreateMilestoneDto[];
}

/**
 * Maak een nieuw project aan met milestones
 * Klanten en aannemers kunnen projecten aanmaken
 */
export async function createProject(
  userId: string,
  data: CreateProjectDto
) {
  // Verifieer dat gebruiker bestaat
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('Gebruiker niet gevonden');
  }

  // Klanten en aannemers kunnen projecten aanmaken
  if (user.role !== UserRole.CUSTOMER && user.role !== UserRole.CONTRACTOR) {
    throw new ForbiddenError('Alleen klanten en aannemers kunnen projecten aanmaken');
  }

  // Voor klanten: customerId = userId, contractorId = null (wacht op aannemer)
  // Voor aannemers: customerId = userId (aannemer is ook klant), contractorId = userId
  const customerId = userId;
  const contractorId = user.role === UserRole.CONTRACTOR ? userId : null;

  // Valideer milestones
  if (!data.milestones || data.milestones.length === 0) {
    throw new ValidationError('Project moet minimaal één milestone hebben');
  }

  // Valideer dat total budget overeenkomt met som van milestones
  const totalMilestoneAmount = data.milestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );

  if (Math.abs(totalMilestoneAmount - Number(data.totalBudget)) > 0.01) {
    throw new ValidationError(
      'Totaal budget moet overeenkomen met de som van alle milestone bedragen'
    );
  }

  // Valideer dat orders uniek zijn en sequentieel zijn
  const orders = data.milestones.map((m) => m.order).sort((a, b) => a - b);
  const expectedOrders = Array.from(
    { length: data.milestones.length },
    (_, i) => i + 1
  );

  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    throw new ValidationError(
      'Milestone orders moeten sequentieel zijn (1, 2, 3, ...)'
    );
  }

  // Valideer dat alle amounts positief zijn
  for (const milestone of data.milestones) {
    if (Number(milestone.amount) <= 0) {
      throw new ValidationError(
        `Milestone "${milestone.title}" moet een positief bedrag hebben`
      );
    }
  }

  // Valideer dat endDate na startDate is (als beide aanwezig)
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      throw new ValidationError('Einddatum moet na startdatum zijn');
    }
  }

  // Maak project aan met milestones in een transactie
  const project = await prisma.project.create({
    data: {
      customerId,
      contractorId,
      title: data.title,
      description: data.description,
      totalBudget: data.totalBudget,
      status: user.role === UserRole.CUSTOMER ? ProjectStatus.DRAFT : ProjectStatus.ACTIVE,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      milestones: {
        create: data.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          order: m.order,
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
        })),
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      milestones: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  return project;
}

/**
 * Haal alle projecten op voor een gebruiker
 * Klanten zien hun eigen projecten, aannemers zien beschikbare projecten
 */
export async function getProjects(userId: string, userRole: UserRole) {
  if (userRole === UserRole.CUSTOMER) {
    // Klanten zien hun eigen projecten
    return prisma.project.findMany({
      where: { customerId: userId },
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
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } else if (userRole === UserRole.CONTRACTOR) {
    // Aannemers zien projecten zonder contractor (beschikbaar voor acceptatie)
    return prisma.project.findMany({
      where: {
        contractorId: null,
        status: {
          in: [ProjectStatus.DRAFT, ProjectStatus.PENDING_CONTRACTOR],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Admin ziet alle projecten
  return prisma.project.findMany({
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
      milestones: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Haal één project op
 */
export async function getProjectById(projectId: string, userId: string, userRole: UserRole) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
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
      milestones: {
        orderBy: {
          order: 'asc',
        },
        include: {
          payments: true,
          approvals: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Laatste approval
          },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project niet gevonden');
  }

  // Check toegang: klant kan alleen eigen projecten zien, aannemer alleen geaccepteerde projecten
  if (userRole === UserRole.CUSTOMER && project.customerId !== userId) {
    throw new ForbiddenError('Geen toegang tot dit project');
  }

  if (userRole === UserRole.CONTRACTOR) {
    if (project.contractorId && project.contractorId !== userId) {
      throw new ForbiddenError('Geen toegang tot dit project');
    }
  }

  return project;
}

