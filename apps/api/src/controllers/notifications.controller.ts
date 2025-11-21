import { Request, Response, NextFunction } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '../services/notifications.service';
import { NotificationReadStatus } from '@prisma/client';
import { serializeNotification } from '../utils/serializers';

/**
 * Haal alle notificaties op voor de ingelogde gebruiker
 * GET /api/notifications
 */
export async function getNotificationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const readStatus = req.query.readStatus as NotificationReadStatus | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const notifications = await getNotifications(userId, {
      readStatus,
      limit,
    });

    res.json({
      success: true,
      data: notifications.map(serializeNotification),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Haal aantal ongelezen notificaties op
 * GET /api/notifications/unread/count
 */
export async function getUnreadNotificationCountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const count = await getUnreadNotificationCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Markeer een notificatie als gelezen
 * PATCH /api/notifications/:id/read
 */
export async function markNotificationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const notificationId = req.params.id;

    const notification = await markNotificationAsRead(notificationId, userId);

    res.json({
      success: true,
      data: serializeNotification(notification),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Markeer alle notificaties als gelezen
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Niet geauthenticeerd' },
      });
    }

    const result = await markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
}

