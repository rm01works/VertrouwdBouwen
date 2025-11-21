import { prisma } from '../config/database';
import { NotificationType, NotificationReadStatus, UserRole } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

/**
 * Maak een notificatie aan voor een gebruiker
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  projectId?: string
) {
  // Verifieer dat gebruiker bestaat
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError('Gebruiker niet gevonden');
  }

  // Verifieer project als projectId is opgegeven
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError('Project niet gevonden');
    }
  }

  // Maak notificatie aan
  const notification = await prisma.notification.create({
    data: {
      userId,
      projectId: projectId || null,
      type,
      title,
      message,
      readStatus: NotificationReadStatus.UNREAD,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return notification;
}

/**
 * Haal alle notificaties op voor een gebruiker
 * Optioneel gefilterd op read status
 */
export async function getNotifications(
  userId: string,
  options?: {
    readStatus?: NotificationReadStatus;
    limit?: number;
  }
) {
  const where: any = {
    userId,
  };

  if (options?.readStatus) {
    where.readStatus = options.readStatus;
  }

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit,
  });

  return notifications;
}

/**
 * Markeer een notificatie als gelezen
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  // Verifieer dat notificatie bestaat en bij gebruiker hoort
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new NotFoundError('Notificatie niet gevonden');
  }

  // Update notificatie
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      readStatus: NotificationReadStatus.READ,
      readAt: new Date(),
    },
  });

  return updated;
}

/**
 * Markeer alle notificaties van een gebruiker als gelezen
 */
export async function markAllNotificationsAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readStatus: NotificationReadStatus.UNREAD,
    },
    data: {
      readStatus: NotificationReadStatus.READ,
      readAt: new Date(),
    },
  });

  return result;
}

/**
 * Haal aantal ongelezen notificaties op voor een gebruiker
 */
export async function getUnreadNotificationCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      readStatus: NotificationReadStatus.UNREAD,
    },
  });

  return count;
}

