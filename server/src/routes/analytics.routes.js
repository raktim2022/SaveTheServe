import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Public Analytics Routes (no authentication required)
 */

// Get public leaderboard
router.get('/public/leaderboard', analyticsController.getPublicLeaderboard);

/**
 * Authenticated Analytics Routes
 */

// Apply authentication to remaining routes
router.use(authenticateToken);

// Get restaurant analytics (public, but authenticated for better tracking)
router.get('/restaurant/:id', analyticsController.getRestaurantAnalytics);

// Get NGO analytics (public, but authenticated for better tracking)
router.get('/ngo/:id', analyticsController.getNGOAnalytics);

// Get admin analytics (Admin only)
router.get('/admin', requireRole('ADMIN'), analyticsController.getAdminAnalytics);

export default router;
