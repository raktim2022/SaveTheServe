/**
 * Food type definitions
 */

export const FOOD_STATUS = {
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  PICKED: 'PICKED',
};

export const FOOD_CATEGORIES = {
  PREPARED: 'prepared',
  PACKAGED: 'packaged',
  PRODUCE: 'produce',
  BAKERY: 'bakery',
  DAIRY: 'dairy',
  OTHER: 'other',
};

/**
 * @typedef {Object} FoodListing
 * @property {string} id - Food listing ID
 * @property {string} restaurantId - Restaurant ID
 * @property {string} name - Food name
 * @property {string} description - Food description
 * @property {string} category - Food category
 * @property {number} quantity - Available quantity
 * @property {string} unit - Unit of measurement
 * @property {string} expiryDate - Expiry date/time
 * @property {string} status - Food status
 * @property {string[]} images - Array of image URLs
 * @property {Object} location - Location coordinates
 * @property {string} pickupInstructions - Pickup instructions
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} FoodRequest
 * @property {string} id - Request ID
 * @property {string} foodId - Food listing ID
 * @property {string} ngoId - NGO ID
 * @property {string} status - Request status
 * @property {number} requestedQuantity - Requested quantity
 * @property {string} pickupTime - Scheduled pickup time
 * @property {string} notes - Additional notes
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

