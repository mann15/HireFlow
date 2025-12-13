import api from "../api/axios";

const BASE = "/notifications";

// Get user's notifications
export const getMyNotifications = async () => {
  const response = await api.get(`${BASE}/my-notifications`);
  return response.data;
};

// Get unread notifications
export const getUnreadNotifications = async () => {
  const response = await api.get(`${BASE}/unread`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  const response = await api.get(`${BASE}/unread/count`);
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const response = await api.put(`${BASE}/${notificationId}/mark-read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put(`${BASE}/mark-all-read`);
  return response.data;
};

// Create notification (Admin only)
export const createNotification = async (notificationData) => {
  const response = await api.post(`${BASE}`, notificationData);
  return response.data;
};
