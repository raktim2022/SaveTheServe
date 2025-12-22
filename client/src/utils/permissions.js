import { USER_ROLES } from './constants';

/**
 * Permission utility functions
 */

/**
 * Check if user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (user, role) => {
  return user && user.role === role;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

/**
 * Check if user is NGO
 * @param {Object} user - User object
 * @returns {boolean} True if user is NGO
 */
export const isNGO = (user) => {
  return hasRole(user, USER_ROLES.NGO);
};

/**
 * Check if user is restaurant/donor
 * @param {Object} user - User object
 * @returns {boolean} True if user is restaurant
 */
export const isRestaurant = (user) => {
  return hasRole(user, USER_ROLES.RESTAURANT);
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (user, roles) => {
  return user && roles.includes(user.role);
};

/**
 * Get dashboard route based on user role
 * @param {Object} user - User object
 * @returns {string} Dashboard route
 */
export const getDashboardRoute = (user) => {
  if (!user) return '/login';
  
  switch (user.role) {
    case USER_ROLES.ADMIN:
      return '/admin';
    case USER_ROLES.NGO:
      return '/ngo';
    case USER_ROLES.RESTAURANT:
      return '/donor';
    default:
      return '/';
  }
};

/**
 * Check if user can access a route
 * @param {Object} user - User object
 * @param {string} route - Route to check
 * @returns {boolean} True if user can access the route
 */
export const canAccessRoute = (user, route) => {
  if (!user) return false;
  
  if (route.startsWith('/admin')) {
    return isAdmin(user);
  } else if (route.startsWith('/ngo')) {
    return isNGO(user);
  } else if (route.startsWith('/donor')) {
    return isRestaurant(user);
  }
  
  return true;
};

/**
 * Check if user can perform an action
 * @param {Object} user - User object
 * @param {string} action - Action to check
 * @param {Object} resource - Resource object (optional)
 * @returns {boolean} True if user can perform the action
 */
export const canPerformAction = (user, action, resource = null) => {
  if (!user) return false;
  
  // Admin can do everything
  if (isAdmin(user)) return true;
  
  switch (action) {
    case 'create_food':
      return isRestaurant(user);
    case 'request_food':
      return isNGO(user);
    case 'approve_request':
      return isRestaurant(user) && resource?.restaurantId === user.restaurantId;
    case 'cancel_request':
      return isNGO(user) && resource?.ngoId === user.ngoId;
    default:
      return false;
  }
};

