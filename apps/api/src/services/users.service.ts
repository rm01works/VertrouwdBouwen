import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';

/**
 * Haal alle aannemers op
 * Gebruikt door consumenten om een aannemer te selecteren bij project aanmaak
 */
export async function getContractors() {
  return prisma.user.findMany({
    where: {
      role: UserRole.CONTRACTOR,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      phone: true,
    },
    orderBy: {
      lastName: 'asc',
    },
  });
}

/**
 * Haal één gebruiker op (voor validatie)
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      companyName: true,
    },
  });
}

