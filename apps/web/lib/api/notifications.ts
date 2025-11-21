import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  projectId: string | null;
  type: 'PROJECT_CREATED' | 'PROJECT_ACCEPTED' | 'MILESTONE_SUBMITTED' | 'MILESTONE_APPROVED' | 'PAYMENT_RECEIVED' | 'DISPUTE_OPENED';
  title: string;
  message: string;
  readStatus: 'UNREAD' | 'READ';
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  } | null;
}

export interface UnreadCount {
  count: number;
}

/**
 * Haal alle notificaties op voor de ingelogde gebruiker
 */
export async function getNotifications(options?: {
  readStatus?: 'UNREAD' | 'READ';
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options?.readStatus) {
    params.append('readStatus', options.readStatus);
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }

  const queryString = params.toString();
  const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<Notification[]>(endpoint);
}

/**
 * Haal aantal ongelezen notificaties op
 */
export async function getUnreadNotificationCount() {
  return apiClient.get<UnreadCount>('/notifications/unread/count');
}

/**
 * Markeer een notificatie als gelezen
 */
export async function markNotificationAsRead(notificationId: string) {
  return apiClient.patch<Notification>(`/notifications/${notificationId}/read`);
}

/**
 * Markeer alle notificaties als gelezen
 */
export async function markAllNotificationsAsRead() {
  return apiClient.patch<{ count: number }>('/notifications/read-all');
}

