import axios from '@/lib/axios';

/**
 * User service
 */

/**
 * Get all users (admin only)
 * @param {Object} params - Query parameters (page, limit, role, status, etc.)
 * @returns {Promise<Object>} Users with pagination
 */
export const getUsers = async (params = {}) => {
  const response = await axios.get('/admin/users/all', { params });
  return response.data;
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User details
 */
export const getUserById = async (id) => {
  const response = await axios.get(`/users/${id}`);
  return response.data;
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (id, userData) => {
  const response = await axios.put(`/users/${id}`, userData);
  return response.data;
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Success message
 */
export const deleteUser = async (id) => {
  const response = await axios.delete(`/users/${id}`);
  return response.data;
};

/**
 * Verify user (admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user
 */
export const verifyUser = async (id) => {
  const response = await axios.patch(`/admin/users/${id}/verify`); // Backend may need this implemented, but let's correct the route format.
  return response.data;
};

/**
 * Suspend user (admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user
 */
export const suspendUser = async (id, reason) => {
  const response = await axios.patch(`/admin/users/${id}/suspend`, { reason });
  return response.data;
};

/**
 * Activate user (admin only)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user
 */
export const activateUser = async (id) => {
  const response = await axios.patch(`/admin/users/${id}/reactivate`);
  return response.data;
};

/**
 * Get NGOs
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} NGOs with pagination
 */
export const getNGOs = async (params = {}) => {
  const response = await axios.get('/ngos', { params });
  return response.data;
};

/**
 * Get restaurants
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Restaurants with pagination
 */
export const getRestaurants = async (params = {}) => {
  const response = await axios.get('/restaurants', { params });
  return response.data;
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async () => {
  const response = await axios.get('/admin/users/stats');
  return response.data;
};

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser,
  suspendUser,
  activateUser,
  getNGOs,
  getRestaurants,
  getUserStats,
};

