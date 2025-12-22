import axios from '@/lib/axios';

/**
 * Authentication service
 */

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  const response = await axios.post('/auth/logout');
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user profile
 */
export const updateProfile = async (profileData) => {
  const response = await axios.put('/auth/profile', profileData);
  return response.data;
};

/**
 * Change password
 * @param {Object} passwordData - { currentPassword, newPassword }
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwordData) => {
  const response = await axios.post('/auth/change-password', passwordData);
  return response.data;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Success message
 */
export const forgotPassword = async (email) => {
  const response = await axios.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 * @param {Object} resetData - { token, newPassword }
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (resetData) => {
  const response = await axios.post('/auth/reset-password', resetData);
  return response.data;
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Success message
 */
export const verifyEmail = async (token) => {
  const response = await axios.post('/auth/verify-email', { token });
  return response.data;
};

/**
 * Refresh authentication token
 * @returns {Promise<Object>} New token
 */
export const refreshToken = async () => {
  const response = await axios.post('/auth/refresh-token');
  return response.data;
};

export default {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
};

