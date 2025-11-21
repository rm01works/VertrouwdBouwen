import { Request, Response, NextFunction } from 'express';
import { getContractors, getCustomers, getUserById } from '../services/users.service';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../utils/errors';

/**
 * Haal alle aannemers op
 * GET /api/users/contractors
 */
export async function getContractorsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const contractors = await getContractors();

    res.status(200).json({
      success: true,
      data: contractors,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal alle klanten op (alleen voor admins)
 * GET /api/users/customers
 */
export async function getCustomersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userRole = req.user?.role;
    if (!userRole || userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Alleen admins hebben toegang tot deze endpoint');
    }

    const customers = await getCustomers();

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal één gebruiker op (voor validatie)
 * GET /api/users/:id
 */
export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Gebruiker niet gevonden' },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

