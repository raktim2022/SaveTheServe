import axios from '@/lib/axios';

/**
 * Review service - API integration for review endpoints
 */

/**
 * Create a new review
 * @param {Object} reviewData - { rating, comment?, restaurantId?, ngoId?, foodRequestId? }
 * @returns {Promise<Object>} Created review
 */
export const createReview = async (reviewData) => {
  try {
    const { rating, comment, restaurantId, ngoId, foodRequestId } = reviewData;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate that either restaurantId or ngoId is provided
    if (!restaurantId && !ngoId) {
      throw new Error('Either restaurantId or ngoId must be provided');
    }

    const response = await axios.post('/reviews', {
      rating,
      comment: comment || null,
      restaurantId: restaurantId || null,
      ngoId: ngoId || null,
      foodRequestId: foodRequestId || null
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create review');
  }
};

/**
 * Get review by ID
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Review details
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await axios.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get review');
  }
};

/**
 * Get reviews for a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} Restaurant reviews with pagination
 */
export const getRestaurantReviews = async (restaurantId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/reviews/restaurant/${restaurantId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get restaurant reviews');
  }
};

/**
 * Get reviews for an NGO
 * @param {number} ngoId - NGO ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} NGO reviews with pagination
 */
export const getNgoReviews = async (ngoId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/reviews/ngo/${ngoId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get NGO reviews');
  }
};

/**
 * Get user's own reviews
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} User reviews with pagination
 */
export const getMyReviews = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get('/reviews/my-reviews', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get reviews');
  }
};

/**
 * Update a review
 * @param {number} reviewId - Review ID
 * @param {Object} updateData - { rating?, comment? }
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    const response = await axios.put(`/reviews/${reviewId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update review');
  }
};

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete review');
  }
};

/**
 * Get all reviews (Admin only)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {Object} filters - Filter options { restaurantId?, ngoId?, rating?, reviewerId? }
 * @returns {Promise<Object>} All reviews with pagination
 */
export const getAllReviews = async (page = 1, limit = 10, filters = {}) => {
  try {
    const response = await axios.get('/reviews/all', {
      params: { page, limit, ...filters }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get all reviews');
  }
};
