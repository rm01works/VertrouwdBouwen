import { Router } from 'express';
import {
  registerController,
  loginController,
  getMeController,
  logoutController,
} from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registreer nieuwe gebruiker (klant of aannemer)
 * @access  Public
 */
router.post('/register', validateRegister, registerController);

/**
 * @route   POST /api/auth/login
 * @desc    Login gebruiker
 * @access  Public
 */
router.post('/login', validateLogin, loginController);

/**
 * @route   GET /api/auth/me
 * @desc    Haal huidige gebruiker op
 * @access  Private
 */
router.get('/me', authenticate, getMeController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout gebruiker
 * @access  Private
 */
router.post('/logout', authenticate, logoutController);

export default router;

