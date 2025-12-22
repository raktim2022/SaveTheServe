/**
 * User type definitions
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  NGO: 'ngo',
  RESTAURANT: 'restaurant',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} role - User role (admin, ngo, restaurant)
 * @property {string} status - User status
 * @property {string} phone - Phone number
 * @property {Object} address - User address
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * @typedef {Object} NGO
 * @property {string} id - NGO ID
 * @property {string} userId - Associated user ID
 * @property {string} name - NGO name
 * @property {string} registrationNumber - Registration number
 * @property {string} description - NGO description
 * @property {Object} location - NGO location coordinates
 * @property {boolean} verified - Verification status
 */

/**
 * @typedef {Object} Restaurant
 * @property {string} id - Restaurant ID
 * @property {string} userId - Associated user ID
 * @property {string} name - Restaurant name
 * @property {string} type - Restaurant type
 * @property {string} description - Restaurant description
 * @property {Object} location - Restaurant location coordinates
 * @property {boolean} verified - Verification status
 */

