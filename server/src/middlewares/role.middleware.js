/**
 * Role-based access control middleware
 */

/**
 * Require specific role middleware
 * @param {string|string[]} requiredRole - Required role(s) to access the route
 * @returns {Function} Express middleware function
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      const userRole = req.user.role;
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRole}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role verification error',
        error: error.message
      });
    }
  };
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {Function} Express middleware function
 */
export const hasAnyRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${roles.join(', ')}. Your role: ${userRole}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Role verification error',
        error: error.message
      });
    }
  };
};

/**
 * Check if user is admin
 * @returns {Function} Express middleware function
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Check if user is NGO
 * @returns {Function} Express middleware function
 */
export const requireNGO = requireRole('NGO');

/**
 * Check if user is Restaurant
 * @returns {Function} Express middleware function
 */
export const requireRestaurant = requireRole('RESTAURANT');

/**
 * Check if user is either NGO or Restaurant
 * @returns {Function} Express middleware function
 */
export const requireNGOOrRestaurant = hasAnyRole(['NGO', 'RESTAURANT']);