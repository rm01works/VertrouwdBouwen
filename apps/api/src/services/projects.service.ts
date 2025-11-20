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
  contractorId?: string; // ID van de aannemer die aan het project gekoppeld wordt
  milestones: CreateMilestoneDto[];
}

/**
 * Maak een nieuw project aan met milestones
 * Alleen consumenten (CUSTOMER) kunnen projecten aanmaken
 * Tijdens het aanmaken kan een aannemer (CONTRACTOR) gekoppeld worden
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

  // Alleen consumenten (CUSTOMER) kunnen projecten aanmaken
  if (user.role !== UserRole.CUSTOMER) {
    throw new ForbiddenError('Alleen consumenten kunnen projecten aanmaken');
  }

  // Consument is altijd de customer
  const customerId = userId;
  
  // Valideer en zet contractorId
  let contractorId: string | null = null;
  
  if (data.contractorId) {
    // Valideer dat de contractor bestaat en de juiste rol heeft
    const contractor = await prisma.user.findUnique({
      where: { id: data.contractorId },
      select: { id: true, role: true },
    });

    if (!contractor) {
      throw new NotFoundError('Aannemer niet gevonden');
    }

    if (contractor.role !== UserRole.CONTRACTOR) {
      throw new ValidationError('Geselecteerde gebruiker is geen aannemer');
    }

    contractorId = data.contractorId;
  }

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
      status: contractorId ? ProjectStatus.ACTIVE : ProjectStatus.DRAFT,
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
    // Aannemers zien:
    // 1. Projecten zonder contractor (beschikbaar voor acceptatie)
    // 2. Projecten waar ze zelf contractor zijn (hun eigen projecten)
    return prisma.project.findMany({
      where: {
        OR: [
          {
            contractorId: null,
            status: {
              in: [ProjectStatus.DRAFT, ProjectStatus.PENDING_CONTRACTOR],
            },
          },
          {
            contractorId: userId,
          },
        ],
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

/**
 * Accepteer een project als aannemer
 * Zet contractorId en update status naar ACTIVE
 */
export async function acceptProject(projectId: string, contractorId: string) {
  // Haal project op
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project niet gevonden');
  }

  // Check of project al een contractor heeft
  if (project.contractorId) {
    throw new ValidationError('Project heeft al een aannemer');
  }

  // Check of project status geschikt is voor acceptatie
  if (
    project.status !== ProjectStatus.DRAFT &&
    project.status !== ProjectStatus.PENDING_CONTRACTOR
  ) {
    throw new ValidationError(
      `Project kan niet geaccepteerd worden in status: ${project.status}`
    );
  }

  // Update project: zet contractor en status
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      contractorId,
      status: ProjectStatus.ACTIVE,
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
  });

  return updatedProject;
}

