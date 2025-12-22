import axios from '@/lib/axios';

/**
 * Food service
 */

/**
 * Get all food listings
 * @param {Object} params - Query parameters (page, limit, status, category, etc.)
 * @returns {Promise<Object>} Food listings with pagination
 */
export const getFoodListings = async (params = {}) => {
  const response = await axios.get('/food', { params });
  return response.data;
};

/**
 * Get food listing by ID
 * @param {string} id - Food listing ID
 * @returns {Promise<Object>} Food listing details
 */
export const getFoodById = async (id) => {
  const response = await axios.get(`/food/${id}`);
  return response.data;
};

/**
 * Create new food listing
 * @param {Object} foodData - Food listing data
 * @returns {Promise<Object>} Created food listing
 */
export const createFood = async (foodData) => {
  const response = await axios.post('/food', foodData);
  return response.data;
};

/**
 * Update food listing
 * @param {string} id - Food listing ID
 * @param {Object} foodData - Updated food data
 * @returns {Promise<Object>} Updated food listing
 */
export const updateFood = async (id, foodData) => {
  const response = await axios.put(`/food/${id}`, foodData);
  return response.data;
};

/**
 * Delete food listing
 * @param {string} id - Food listing ID
 * @returns {Promise<Object>} Success message
 */
export const deleteFood = async (id) => {
  const response = await axios.delete(`/food/${id}`);
  return response.data;
};

/**
 * Search food listings by location
 * @param {Object} locationData - { latitude, longitude, radius }
 * @returns {Promise<Array>} Nearby food listings
 */
export const searchFoodByLocation = async (locationData) => {
  const response = await axios.post('/food/search/location', locationData);
  return response.data;
};

/**
 * Get food listings by restaurant
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Food listings
 */
export const getFoodByRestaurant = async (restaurantId, params = {}) => {
  const response = await axios.get(`/food/restaurant/${restaurantId}`, { params });
  return response.data;
};

/**
 * Upload food image
 * @param {string} foodId - Food listing ID
 * @param {FormData} formData - Form data with image file
 * @returns {Promise<Object>} Image URL
 */
export const uploadFoodImage = async (foodId, formData) => {
  const response = await axios.post(`/food/${foodId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get food statistics
 * @returns {Promise<Object>} Food statistics
 */
export const getFoodStats = async () => {
  const response = await axios.get('/food/stats');
  return response.data;
};

/**
 * Mark food as expired
 * @param {string} id - Food listing ID
 * @returns {Promise<Object>} Updated food listing
 */
export const markAsExpired = async (id) => {
  const response = await axios.patch(`/food/${id}/expire`);
  return response.data;
};

export default {
  getFoodListings,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  searchFoodByLocation,
  getFoodByRestaurant,
  uploadFoodImage,
  getFoodStats,
  markAsExpired,
};

