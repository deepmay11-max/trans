import { apiClient } from './apiClient';

export const getNotifications = async () => {
  const { data } = await apiClient.get('/notifications');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await apiClient.patch(`/notifications/read/${id}`);
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data;
};

