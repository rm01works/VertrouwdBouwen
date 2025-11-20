import { Router } from 'express';
import {
  getContractorsController,
  getUserByIdController,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Alle routes vereisen authenticatie
router.use(authenticate);

// GET /api/users/contractors - Haal alle aannemers op
router.get('/contractors', getContractorsController);

// GET /api/users/:id - Haal één gebruiker op
router.get('/:id', getUserByIdController);

export default router;

