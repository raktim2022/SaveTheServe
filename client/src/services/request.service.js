import axios from '@/lib/axios';

/**
 * Request service - Complete API integration with server endpoints
 * Based on server documentation: /requests/create, /requests/my-requests, /requests/incoming, /requests/:id/status
 */

/**
 * Create new request (NGO role only)
 * @param {Object} requestData - { foodListingId, pickupTime, notes? }
 * @returns {Promise<{message: string, data: Object}>} Created request
 */
export const createRequest = async (requestData) => {
  try {
    // Validate required fields based on server requirements
    const requiredFields = ['foodListingId', 'pickupTime'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate pickup time is in future
    const pickupDate = new Date(requestData.pickupTime);
    if (pickupDate <= new Date()) {
      throw new Error('Pickup time must be in the future');
    }

    const response = await axios.post('/requests/create', requestData);
    // Server responds with: { message: "Request created successfully", data: { id, status: "PENDING", foodListingId } }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create request');
  }
};

/**
 * Get my requests (NGO role only)
 * @returns {Promise<{message: string, data: Array}>} User's requests with food listing details
 */
export const getMyRequests = async () => {
  try {
    const response = await axios.get('/requests/my-requests');
    // Server responds with: { message: "Requests retrieved successfully", data: [{ id, status, foodListing: {...} }] }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch my requests');
  }
};

/**
 * Get incoming requests (restaurant role only)
 * @returns {Promise<{message: string, data: Array}>} Incoming requests with NGO details
 */
export const getIncomingRequests = async () => {
  try {
    const response = await axios.get('/requests/incoming');
    // Server responds with: { message: "Incoming requests retrieved successfully", data: [{ id, status, ngo: {...} }] }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch incoming requests');
  }
};

/**
 * Update request status (restaurant role only)
 * @param {string} id - Request ID
 * @param {string} status - New status: "ACCEPTED" | "COMPLETED"
 * @returns {Promise<{message: string, data: Object}>} Updated request
 */
export const updateRequestStatus = async (id, status) => {
  try {
    if (!id) {
      throw new Error('Request ID is required');
    }

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      throw new Error('Status must be either "ACCEPTED", "REJECTED", or "COMPLETED"');
    }

    const response = await axios.put(`/requests/${id}/status`, { status });
    // Server responds with: { message: "Request status updated successfully", data: { id, status } }
    return response.data;
  } catch (error) {
    // Preserve the original validation error (e.g. 'REJECTED not allowed') if it came from this fn
    if (!error.response) throw error;
    throw new Error(error.response?.data?.message || 'Failed to update request status');
  }
};

/**
 * Cancel request (NGO role only, while status is pending)
 * @param {string} id - Request ID
 * @returns {Promise<{message: string, data: Object}>} Cancellation confirmation
 */
export const cancelRequest = async (id) => {
  try {
    if (!id) {
      throw new Error('Request ID is required');
    }

    const response = await axios.delete(`/requests/${id}`);
    // Server responds with: { message: "Request cancelled successfully", data: { id } }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel request');
  }
};

/**
 * Get request by ID (for detailed view)
 * @param {string} id - Request ID
 * @returns {Promise<{message: string, data: Object}>} Request details
 */
export const getRequestById = async (id) => {
  try {
    if (!id) {
      throw new Error('Request ID is required');
    }

    const response = await axios.get(`/requests/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch request details');
  }
};

// Validation helpers
/**
 * Validate request creation data
 * @param {Object} requestData - Request data to validate
 * @returns {Object} Validation result
 */
export const validateRequestData = (requestData) => {
  const errors = {};
  
  if (!requestData.foodListingId) {
    errors.foodListingId = 'Food listing is required';
  }
  
  if (!requestData.pickupTime) {
    errors.pickupTime = 'Pickup time is required';
  } else {
    const pickupDate = new Date(requestData.pickupTime);
    if (isNaN(pickupDate.getTime())) {
      errors.pickupTime = 'Invalid pickup time format';
    } else if (pickupDate <= new Date()) {
      errors.pickupTime = 'Pickup time must be in the future';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getRequestsByNGO = async (_ngoId, params = {}) => {
  const response = await axios.get('/requests/my-requests', { params });
  return response.data;
};

export const getRequestsByRestaurant = async (_restaurantId, params = {}) => {
  const response = await axios.get('/requests/incoming', { params });
  return response.data;
};

export const getRequestStats = async () => {
  try {
    const response = await axios.get('/requests/stats');
    return response.data;
  } catch {
    const my = await getMyRequests();
    const incoming = await getIncomingRequests();
    const myData = my?.data || [];
    const incomingData = incoming?.data || [];

    return {
      message: 'Request statistics computed successfully',
      data: {
        totalMyRequests: myData.length,
        totalIncomingRequests: incomingData.length,
      },
    };
  }
};

// Backward-compatible aliases
export const approveRequest = async (id) => updateRequestStatus(id, 'ACCEPTED');
export const completeRequest = async (id) => updateRequestStatus(id, 'COMPLETED');
export const rejectRequest = async (id) => cancelRequest(id);

/**
 * Assign a volunteer to an accepted request (NGO)
 * @param {number} requestId
 * @param {number} volunteerId
 */
export const assignVolunteer = async (requestId, volunteerId) => {
  try {
    const response = await axios.post(`/requests/${requestId}/assign-volunteer`, { volunteerId });
    return response.data;
  } catch (error) {
    if (!error.response) throw error;
    throw new Error(error.response?.data?.message || 'Failed to assign volunteer');
  }
};

/**
 * Verify pickup via OTP (Restaurant/Donor)
 * @param {number} requestId
 * @param {string} otp - 6-digit OTP
 */
export const verifyPickupOtp = async (requestId, otp) => {
  try {
    const response = await axios.post(`/requests/${requestId}/verify-pickup`, { otp });
    return response.data;
  } catch (error) {
    if (!error.response) throw error;
    throw new Error(error.response?.data?.message || 'Failed to verify pickup OTP');
  }
};

/**
 * Verify pickup via QR token (Restaurant/Donor)
 * @param {number} requestId
 * @param {string} qrToken - token extracted from scanned QR code
 */
export const verifyPickupQR = async (requestId, qrToken) => {
  try {
    const response = await axios.post(`/requests/${requestId}/verify-pickup`, { qrToken });
    return response.data;
  } catch (error) {
    if (!error.response) throw error;
    throw new Error(error.response?.data?.message || 'Failed to verify pickup QR');
  }
};

/**
 * Get volunteer's pickup assignments (VOLUNTEER role)
 */
export const getMyVolunteerPickups = async () => {
  try {
    const response = await axios.get('/requests/volunteer/my-pickups');
    return response.data;
  } catch (error) {
    if (!error.response) throw error;
    throw new Error(error.response?.data?.message || 'Failed to fetch pickup assignments');
  }
};

export default {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  cancelRequest,
  getRequestById,
  getRequestsByNGO,
  getRequestsByRestaurant,
  getRequestStats,
  approveRequest,
  completeRequest,
  rejectRequest,
  validateRequestData,
  assignVolunteer,
  verifyPickupOtp,
  verifyPickupQR,
  getMyVolunteerPickups,
};

