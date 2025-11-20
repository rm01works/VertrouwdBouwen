import { Request, Response, NextFunction } from 'express';
import { getContractors, getUserById } from '../services/users.service';

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

