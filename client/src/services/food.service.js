import axios from '@/lib/axios';

/**
 * Food service - Complete API integration with server endpoints
 * Based on server documentation: /food/create, /food/available, /food/my-listings, /food/:id
 */

/**
 * Get available food listings with optional geolocation filtering
 * @param {Object} params - Query parameters { latitude?, longitude?, radius? (in km) }
 * @returns {Promise<{message: string, data: Array}>} Available food listings
 */
export const getFoodListings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add geolocation parameters if provided
    if (params.latitude) queryParams.append('latitude', params.latitude);
    if (params.longitude) queryParams.append('longitude', params.longitude);
    if (params.radius) queryParams.append('radius', params.radius);
    
    const url = `/food/available${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    
    // Server responds with: { message: "Available food listings retrieved successfully", data: [...] }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch available food listings');
  }
};

export const getAvailableFoodListings = getFoodListings;

/**
 * Get food listing by ID (public endpoint)
 * @param {string} id - Food listing ID
 * @returns {Promise<Object>} Food listing details
 */
export const getFoodById = async (id) => {
  try {
    const response = await axios.get(`/food/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch food listing');
  }
};

/**
 * Create new food listing (restaurant role only)
 * @param {Object} foodData - { foodName, description?, category?, quantity, unit?, expiryTime, pickupInstructions?, _imageFile? }
 * @returns {Promise<{message: string, data: Object}>} Created food listing
 */
export const createFood = async (foodData) => {
  try {
    // Extract image file before sending JSON
    const { _imageFile, ...jsonData } = foodData;

    const requiredFields = ['foodName', 'quantity', 'expiryTime'];
    const missingFields = requiredFields.filter(field => !jsonData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await axios.post('/food/create', jsonData);
    const created = response.data;

    // Upload image separately if provided
    if (_imageFile && created?.data?.id) {
      try {
        const form = new FormData();
        form.append('image', _imageFile);
        await axios.post(`/food/${created.data.id}/image`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (imgErr) {
        console.warn('Image upload failed:', imgErr.message);
      }
    }

    return created;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create food listing');
  }
};
/**
 * Update food listing (restaurant owner only)
 * @param {string} id - Food listing ID
 * @param {Object} foodData - Updated food data
 * @returns {Promise<{message: string, data: Object}>} Updated food listing
 */
export const updateFood = async (id, foodData) => {
  try {
    if (!id) {
      throw new Error('Food listing ID is required');
    }

    const { _imageFile, ...jsonData } = foodData;

    const response = await axios.put(`/food/${id}`, jsonData);

    // Upload image separately if provided
    if (_imageFile) {
      try {
        const form = new FormData();
        form.append('image', _imageFile);
        await axios.post(`/food/${id}/image`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (imgErr) {
        console.warn('Image upload failed:', imgErr.message);
      }
    }

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update food listing');
  }
};

/**
 * Delete food listing (restaurant owner only)
 * @param {string} id - Food listing ID
 * @returns {Promise<{message: string, data: Object}>} Deletion confirmation
 */
export const deleteFood = async (id) => {
  try {
    if (!id) {
      throw new Error('Food listing ID is required');
    }

    const response = await axios.delete(`/food/${id}`);
    // Server responds with: { message: "Food listing deleted successfully", data: { id } }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete food listing');
  }
};

/**
 * Get my food listings (restaurant role only)
 * @returns {Promise<{message: string, data: Array}>} User's food listings
 */
export const getMyFoodListings = async (params = {}) => {
  try {
    const response = await axios.get('/food/my-listings', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch my food listings');
  }
};

export const searchFoodByLocation = async ({ latitude, longitude, radius }) => {
  return getFoodListings({ latitude, longitude, radius });
};

export const getFoodByRestaurant = async (restaurantId, params = {}) => {
  // Backward-compatible fallback if dedicated endpoint is absent.
  return getFoodListings({ ...params, restaurantId });
};

export const uploadFoodImage = async (foodId, formData) => {
  const response = await axios.post(`/food/${foodId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFoodStats = async () => {
  try {
    const response = await axios.get('/food/stats');
    return response.data;
  } catch {
    const listingsRes = await getFoodListings();
    const listings = listingsRes?.data || [];
    return {
      message: 'Food statistics computed successfully',
      data: {
        totalListings: listings.length,
        availableListings: listings.length,
      },
    };
  }
};

/**
 * Mark food as picked
 * @param {string} id - Food listing ID
 * @returns {Promise<Object>} Updated food listing
 */
export const markAsPicked = async (id) => {
  const response = await axios.patch(`/food/${id}/pick`);
  return response.data;
};

export default {
  getFoodListings,
  getAvailableFoodListings,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  searchFoodByLocation,
  getFoodByRestaurant,
  uploadFoodImage,
  getFoodStats,
  getMyFoodListings,
  markAsPicked,
};

