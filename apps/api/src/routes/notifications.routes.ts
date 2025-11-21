import { Router } from 'express';
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Alle routes vereisen authenticatie
router.use(authenticate);

// GET /api/notifications - Haal alle notificaties op
router.get('/', getNotificationsController);

// GET /api/notifications/unread/count - Haal aantal ongelezen notificaties op
router.get('/unread/count', getUnreadNotificationCountController);

// PATCH /api/notifications/:id/read - Markeer notificatie als gelezen
router.patch('/:id/read', markNotificationAsReadController);

// PATCH /api/notifications/read-all - Markeer alle notificaties als gelezen
router.patch('/read-all', markAllNotificationsAsReadController);

export default router;

