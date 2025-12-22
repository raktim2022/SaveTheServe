import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authValidationSchemas, validateAuth } from '../validations/auth.validation.js';
import { authenticateToken, authenticateOptional } from '../middlewares/auth.middleware.js';

const router = Router();

// Rate limiting placeholder - TODO: Implement proper rate limiting
const rateLimiter = {
  strict: (req, res, next) => next(),  // For login, register
  general: (req, res, next) => next(), // For other endpoints
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateAuth(authValidationSchemas.register),
  rateLimiter.strict,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validateAuth(authValidationSchemas.login),
  rateLimiter.strict,
  authController.login
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
router.post(
  '/verify-email',
  validateAuth(authValidationSchemas.verifyEmail),
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  validateAuth(authValidationSchemas.requestPasswordReset),
  rateLimiter.strict,
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateAuth(authValidationSchemas.resetPassword),
  rateLimiter.strict,
  authController.resetPassword
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post(
  '/refresh',
  authController.refreshToken
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post(
  '/resend-verification',
  validateAuth(authValidationSchemas.requestPasswordReset), // Same schema (email only)
  rateLimiter.strict,
  authController.resendVerification
);

/**
 * @route   GET /api/auth/status
 * @desc    Get authentication status
 * @access  Private
 */
router.get(
  '/status',
  authenticateToken,
  authController.getAuthStatus
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  validateAuth(authValidationSchemas.updateProfile),
  authController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  validateAuth(authValidationSchemas.changePassword),
  rateLimiter.general,
  authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

// Error handling middleware for auth routes
router.use((error, req, res, next) => {
  console.error('Auth Route Error:', error);

  // Handle specific error types
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message,
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: error.message,
    });
  }

  if (error.message.includes('already exists')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }

  if (error.message.includes('Invalid email or password')) {
    return res.status(401).json({
      success: false,
      message: error.message,
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

  // Pass to global error handler
  next(error);
});

export default router;
