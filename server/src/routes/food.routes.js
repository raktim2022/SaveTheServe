import express from 'express';
import foodController from '../controllers/food.controller.js';
import { authenticateToken, authenticateOptional } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

// Get all food listings (public)
router.get('/', foodController.getAllFoodListings);

// Search food listings (public)
router.get('/search', foodController.searchFoodListings);

// Find nearby food listings (public)
router.get('/nearby', foodController.findNearbyFoodListings);

// Get food by category (public)
router.get('/category/:category', foodController.getFoodByCategory);

// Get available food listings (authentication required)
router.get('/available', authenticateToken, foodController.getAvailableFoodListings);

// Get food listing by ID (public, only numeric ids)
router.get('/:id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    return next();
  }
  return foodController.getFoodListingById(req, res);
});

/**
 * Protected Routes (Authentication required)
 */

// Apply authentication to all routes below
router.use(authenticateToken);

/**
 * General authenticated routes (available to all authenticated users)
 */

// Get expiring food
router.get('/expiring/soon', foodController.getExpiringFood);

// Get food statistics
router.get('/stats/overview', foodController.getFoodStats);

/**
 * Restaurant Routes (RESTAURANT role only)
 */

// Apply RESTAURANT role requirement to routes below
router.use(requireRole('RESTAURANT'));

// Get own food listings
router.get('/my-listings', foodController.getMyFoodListings);

// Create food listing
router.post('/create', foodController.createFoodListing);

// Update food listing
router.put('/:id', foodController.updateFoodListing);

// Delete food listing
router.delete('/:id', foodController.deleteFoodListing);

// Update food quantity
router.patch('/:id/quantity', foodController.updateQuantity);

// Mark food as expired
router.patch('/:id/expire', foodController.markAsExpired);

// Mark food as fulfilled
router.patch('/:id/fulfill', foodController.markAsFulfilled);

/**
 * Admin Routes (ADMIN role only)
 */

// Remove restaurant role requirement and apply admin role requirement
router.use((req, res, next) => {
  // Reset role requirements for admin routes
  next();
});

router.use(requireRole('ADMIN'));

// Bulk expire food listings (Admin only)
router.post('/bulk/expire', foodController.bulkExpireFood);

export default router;
