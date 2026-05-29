import express from 'express';
import reviewController from '../controllers/review.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Review Routes
 */

// Create a review (Authenticated users)
router.post('/', reviewController.createReview);

// Get user's own reviews
router.get('/my-reviews', reviewController.getUserReviews);

// Get all reviews (Admin only)
router.get('/all', requireRole('ADMIN'), reviewController.getAllReviews);

// Get reviews for a restaurant
router.get('/restaurant/:id', reviewController.getRestaurantReviews);

// Get reviews for an NGO
router.get('/ngo/:id', reviewController.getNgoReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Update a review (only by the reviewer)
router.put('/:id', reviewController.updateReview);

// Delete a review (only by the reviewer or admin)
router.delete('/:id', reviewController.deleteReview);

export default router;
