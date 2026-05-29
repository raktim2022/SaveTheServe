import axios from '@/lib/axios';

/**
 * Authentication service - Complete API integration with server
 */

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{message: string, data: {token: string, user: Object}}>}
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    // Server responds with: { message: "Login successful", data: { token: "...", user: {...} } }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Register new user
 * @param {Object} userData - { name, email, password, role: "ngo"|"restaurant", address, phone?, description? }
 * @returns {Promise<{message: string, data: {token: string, user: Object}}>}
 */
export const register = async (userData) => {
  try {
    // Validate required fields based on server requirements
    const requiredFields = ['name', 'email', 'password', 'role', 'address'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure role is valid (case-insensitive)
    if (!['ngo', 'restaurant'].includes(userData.role?.toLowerCase())) {
      throw new Error('Role must be either "ngo" or "restaurant"');
    }

    // Server expects uppercase role ('NGO' | 'RESTAURANT')
    const response = await axios.post('/auth/register', {
      ...userData,
      role: userData.role.toUpperCase(),
    });
    // Server responds with: { message: "User registered successfully", data: { token: "...", user: {...} } }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Logout user (client-side only, server doesn't have logout endpoint)
 * @returns {Promise<void>}
 */
export const logout = async () => {
  // Since server doesn't have a logout endpoint, we only clear client-side data
  // This is handled by the auth context
  return Promise.resolve();
};

/**
 * Get current user profile
 * @returns {Promise<{message: string, data: Object}>} User profile data
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
 * Verify email with code
 * @param {Object} verificationData - { userId, email, code }
 * @returns {Promise<Object>} Verification result
 */
export const verifyEmailCode = async (verificationData) => {
  const response = await axios.post('/auth/verify-email', verificationData);
  return response.data;
};

/**
 * Resend verification code
 * @param {Object} resendData - { email, userId }
 * @returns {Promise<Object>} Resend result
 */
export const resendVerification = async (resendData) => {
  const response = await axios.post('/auth/resend-verification', resendData);
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
  verifyEmailCode,
  resendVerification,
  refreshToken,
};

