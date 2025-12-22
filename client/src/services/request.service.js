import axios from '@/lib/axios';

/**
 * Request service
 */

/**
 * Get all requests
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise<Object>} Requests with pagination
 */
export const getRequests = async (params = {}) => {
  const response = await axios.get('/requests', { params });
  return response.data;
};

/**
 * Get request by ID
 * @param {string} id - Request ID
 * @returns {Promise<Object>} Request details
 */
export const getRequestById = async (id) => {
  const response = await axios.get(`/requests/${id}`);
  return response.data;
};

/**
 * Create new request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Created request
 */
export const createRequest = async (requestData) => {
  const response = await axios.post('/requests', requestData);
  return response.data;
};

/**
 * Update request
 * @param {string} id - Request ID
 * @param {Object} requestData - Updated request data
 * @returns {Promise<Object>} Updated request
 */
export const updateRequest = async (id, requestData) => {
  const response = await axios.put(`/requests/${id}`, requestData);
  return response.data;
};

/**
 * Approve request
 * @param {string} id - Request ID
 * @returns {Promise<Object>} Updated request
 */
export const approveRequest = async (id) => {
  const response = await axios.patch(`/requests/${id}/approve`);
  return response.data;
};

/**
 * Reject request
 * @param {string} id - Request ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated request
 */
export const rejectRequest = async (id, reason) => {
  const response = await axios.patch(`/requests/${id}/reject`, { reason });
  return response.data;
};

/**
 * Complete request
 * @param {string} id - Request ID
 * @returns {Promise<Object>} Updated request
 */
export const completeRequest = async (id) => {
  const response = await axios.patch(`/requests/${id}/complete`);
  return response.data;
};

/**
 * Cancel request
 * @param {string} id - Request ID
 * @returns {Promise<Object>} Updated request
 */
export const cancelRequest = async (id) => {
  const response = await axios.patch(`/requests/${id}/cancel`);
  return response.data;
};

/**
 * Get requests by NGO
 * @param {string} ngoId - NGO ID (not used since auth provides user context)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Requests
 */
export const getRequestsByNGO = async (ngoId, params = {}) => {
  const response = await axios.get(`/requests/my-requests`, { params });
  return response.data;
};

/**
 * Get requests by restaurant
 * @param {string} restaurantId - Restaurant ID (not used since auth provides user context)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Requests
 */
export const getRequestsByRestaurant = async (restaurantId, params = {}) => {
  const response = await axios.get(`/requests/incoming`, { params });
  return response.data;
};

/**
 * Get request statistics
 * @returns {Promise<Object>} Request statistics
 */
export const getRequestStats = async () => {
  const response = await axios.get('/requests/stats');
  return response.data;
};

/**
 * Get my requests (current user's requests)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Current user's requests
 */
export const getMyRequests = async (params = {}) => {
  try {
    const response = await axios.get('/requests/my-requests', { params });
    return response.data;
  } catch (error) {
    console.error('Request service error:', error);
    // Return empty result instead of throwing
    return { data: [], success: false, message: 'Failed to fetch requests' };
  }
};

/**
 * Get incoming requests (for restaurants)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Incoming requests
 */
export const getIncomingRequests = async (params = {}) => {
  const response = await axios.get('/requests/incoming', { params });
  return response.data;
};

export default {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  approveRequest,
  rejectRequest,
  completeRequest,
  cancelRequest,
  getRequestsByNGO,
  getRequestsByRestaurant,
  getRequestStats,
  getMyRequests,
  getIncomingRequests,
};

