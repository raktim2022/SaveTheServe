import { Router } from 'express';
import { ngoController } from '../controllers/ngo.controller.js';
import { ngoValidationSchemas, validateNGO } from '../validations/ngo.validation.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Role authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Rate limiting placeholder - TODO: Implement proper rate limiting
const rateLimiter = {
  createRequest: (req, res, next) => next(),
  general: (req, res, next) => next(),
};

/**
 * @route   POST /api/ngos
 * @desc    Register a new NGO profile
 * @access  Private - NGO role required
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('NGO'),
  validateNGO(ngoValidationSchemas.registerNGO),
  rateLimiter.createRequest,
  ngoController.registerNGO
);

/**
 * @route   GET /api/ngos/profile
 * @desc    Get current user's NGO profile
 * @access  Private - NGO role required
 */
router.get(
  '/profile',
  authenticateToken,
  authorizeRoles('NGO'),
  ngoController.getCurrentNGOProfile
);

/**
 * @route   GET /api/ngos/service-area
 * @desc    Find NGOs by service area (coordinates)
 * @access  Public
 */
router.get(
  '/service-area',
  rateLimiter.general,
  ngoController.getNGOsByServiceArea
);

/**
 * @route   GET /api/ngos/capacity
 * @desc    Get NGOs with capacity information for a specific area
 * @access  Public
 */
router.get(
  '/capacity',
  rateLimiter.general,
  ngoController.getNGOsWithCapacity
);

/**
 * @route   GET /api/ngos/search
 * @desc    Search NGOs by name or location
 * @access  Public
 */
router.get(
  '/search',
  rateLimiter.general,
  ngoController.searchNGOs
);

/**
 * @route   GET /api/ngos
 * @desc    Get all NGOs with pagination and filters
 * @access  Public
 */
router.get(
  '/',
  rateLimiter.general,
  ngoController.getAllNGOs
);

/**
 * @route   GET /api/ngos/:id
 * @desc    Get NGO by ID
 * @access  Public
 */
router.get(
  '/:id',
  rateLimiter.general,
  ngoController.getNGOById
);

/**
 * @route   PUT /api/ngos/:id
 * @desc    Update NGO profile
 * @access  Private - NGO owner or Admin
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('NGO', 'ADMIN'),
  validateNGO(ngoValidationSchemas.updateNGO),
  ngoController.updateNGO
);

/**
 * @route   DELETE /api/ngos/:id
 * @desc    Delete NGO profile
 * @access  Private - NGO owner or Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('NGO', 'ADMIN'),
  ngoController.deleteNGO
);

/**
 * @route   GET /api/ngos/:id/requests
 * @desc    Get NGO's food requests
 * @access  Private - NGO owner or Admin
 */
router.get(
  '/:id/requests',
  authenticateToken,
  authorizeRoles('NGO', 'ADMIN'),
  ngoController.getNGORequests
);

/**
 * @route   POST /api/ngos/:id/requests
 * @desc    Create a food request
 * @access  Private - NGO owner
 */
router.post(
  '/:id/requests',
  authenticateToken,
  authorizeRoles('NGO'),
  validateNGO(ngoValidationSchemas.createFoodRequest),
  rateLimiter.createRequest,
  ngoController.createFoodRequest
);

/**
 * @route   GET /api/ngos/:id/stats
 * @desc    Get NGO dashboard statistics
 * @access  Private - NGO owner or Admin
 */
router.get(
  '/:id/stats',
  authenticateToken,
  authorizeRoles('NGO', 'ADMIN'),
  ngoController.getNGOStats
);

// Error handling middleware for NGO routes
router.use((error, req, res, next) => {
  console.error('NGO Route Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }

  if (error.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      error: error.message,
    });
  }

  if (error.message.includes('Unauthorized')) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden',
      error: error.message,
    });
  }

  // Pass to global error handler
  next(error);
});

export default router;
