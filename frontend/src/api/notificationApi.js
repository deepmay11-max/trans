import { apiClient } from './apiClient';

export const getNotifications = () => apiClient.get('/notifications');
export const markAsRead = (id) => apiClient.patch(`/notifications/read/${id}`);
export const deleteNotification = (id) => apiClient.delete(`/notifications/${id}`);
