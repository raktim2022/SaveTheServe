import axios from '@/lib/axios';

/**
 * Analytics service - API integration for analytics endpoints
 */

/**
 * Get restaurant analytics
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Restaurant analytics data
 */
export const getRestaurantAnalytics = async (restaurantId) => {
  try {
    const response = await axios.get(`/analytics/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get restaurant analytics');
  }
};

/**
 * Get NGO analytics
 * @param {number} ngoId - NGO ID
 * @returns {Promise<Object>} NGO analytics data
 */
export const getNGOAnalytics = async (ngoId) => {
  try {
    const response = await axios.get(`/analytics/ngo/${ngoId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get NGO analytics');
  }
};

/**
 * Get admin analytics (system-wide)
 * @returns {Promise<Object>} Admin analytics data
 */
export const getAdminAnalytics = async () => {
  try {
    const response = await axios.get('/analytics/admin');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get admin analytics');
  }
};

/**
 * Get public leaderboard
 * @param {number} limit - Number of top entries to return (default: 10)
 * @returns {Promise<Object>} Leaderboard data with top restaurants and NGOs
 */
export const getPublicLeaderboard = async (limit = 10) => {
  try {
    const response = await axios.get('/analytics/public/leaderboard', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get leaderboard');
  }
};
