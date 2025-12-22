/**
 * Request type definitions
 */

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * @typedef {Object} Request
 * @property {string} id - Request ID
 * @property {string} foodId - Food listing ID
 * @property {string} ngoId - NGO ID
 * @property {string} restaurantId - Restaurant ID
 * @property {string} status - Request status
 * @property {number} requestedQuantity - Requested quantity
 * @property {string} pickupTime - Scheduled pickup time
 * @property {string} notes - Additional notes
 * @property {string} rejectionReason - Reason for rejection (if applicable)
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 * @property {Object} food - Associated food listing
 * @property {Object} ngo - Associated NGO
 * @property {Object} restaurant - Associated restaurant
 */

/**
 * @typedef {Object} RequestStats
 * @property {number} total - Total requests
 * @property {number} pending - Pending requests
 * @property {number} approved - Approved requests
 * @property {number} completed - Completed requests
 * @property {number} rejected - Rejected requests
 */

