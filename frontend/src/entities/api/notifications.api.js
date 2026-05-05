import { client } from '@/shared/api/client.api';

export const markNotificationRead = (id) =>
  client(`/api/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  client('/api/notifications/read-all', { method: 'PATCH' });