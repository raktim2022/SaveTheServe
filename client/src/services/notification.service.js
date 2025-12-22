import axios from '@/lib/axios';

/**
 * Notification service
 */

/**
 * Get all notifications
 * @param {Object} params - Query parameters (page, limit, read, etc.)
 * @returns {Promise<Object>} Notifications with pagination
 */
export const getNotifications = async (params = {}) => {
  const response = await axios.get('/notifications', { params });
  return response.data;
};

/**
 * Get notification by ID
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Notification details
 */
export const getNotificationById = async (id) => {
  const response = await axios.get(`/notifications/${id}`);
  return response.data;
};

/**
 * Mark notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (id) => {
  const response = await axios.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success message
 */
export const markAllAsRead = async () => {
  const response = await axios.patch('/notifications/read-all');
  return response.data;
};

/**
 * Delete notification
 * @param {string} id - Notification ID
 * @returns {Promise<Object>} Success message
 */
export const deleteNotification = async (id) => {
  const response = await axios.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Get unread notification count
 * @returns {Promise<Object>} Unread count
 */
export const getUnreadCount = async () => {
  const response = await axios.get('/notifications/unread/count');
  return response.data;
};

/**
 * Update notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} Updated preferences
 */
export const updatePreferences = async (preferences) => {
  const response = await axios.put('/notifications/preferences', preferences);
  return response.data;
};

/**
 * Get notification preferences
 * @returns {Promise<Object>} Notification preferences
 */
export const getPreferences = async () => {
  const response = await axios.get('/notifications/preferences');
  return response.data;
};

export default {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePreferences,
  getPreferences,
};

