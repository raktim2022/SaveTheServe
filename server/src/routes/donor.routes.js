import express from 'express';
import donorController from '../controllers/donor.controller.js';
import { authenticateToken, authenticateOptional } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

// Search restaurants (public)
router.get('/search', donorController.searchRestaurants);

// Find nearby restaurants (public)
router.get('/nearby', donorController.findNearbyRestaurants);

// Get restaurant by ID (public)
router.get('/:id', donorController.getRestaurantById);

// Get all restaurants (public)
router.get('/', donorController.getAllRestaurants);

/**
 * Protected Routes (Authentication required)
 */

// Apply authentication to all routes below
router.use(authenticateToken);

/**
 * Restaurant Registration Routes
 */

// Register restaurant (Any authenticated user can register as restaurant)
router.post('/register', donorController.registerRestaurant);

/**
 * Restaurant Management Routes (RESTAURANT role only)
 */

// Apply RESTAURANT role requirement to routes below
router.use(requireRole('RESTAURANT'));

// Get current restaurant profile
router.get('/profile/me', donorController.getProfile);

// Update restaurant profile
router.put('/profile/me', donorController.updateProfile);

// Delete restaurant
router.delete('/profile/me', donorController.deleteRestaurant);

// Update operating hours
router.patch('/profile/operating-hours', donorController.updateOperatingHours);

// Update contact information
router.patch('/profile/contact', donorController.updateContactInfo);

// Toggle restaurant availability
router.patch('/profile/toggle-availability', donorController.toggleAvailability);

// Get restaurant statistics
router.get('/profile/stats', donorController.getStats);

// Get restaurant food listings
router.get('/profile/food-listings', donorController.getFoodListings);

export default router;
