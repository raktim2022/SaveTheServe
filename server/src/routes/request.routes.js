import express from 'express';
import requestController from '../controllers/request.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Main Routes that tests expect
 */

// Create food request (NGO only)
router.post('/create', requireRole('NGO'), requestController.createFoodRequest);

// Get own requests (NGO only)
router.get('/my-requests', requireRole('NGO'), requestController.getNGOFoodRequests);

// Get incoming requests (Restaurant only)
router.get('/incoming', requireRole('RESTAURANT'), requestController.getRestaurantFoodRequests);

// Update request status (Restaurant only)
router.put('/:id/status', requireRole('RESTAURANT'), requestController.approveFoodRequest);

// Cancel/Delete request (NGO only)
router.delete('/:id', requireRole('NGO'), requestController.cancelFoodRequest);

// Get food request by ID (General)
router.get('/:id', requestController.getFoodRequestById);

/**
 * Legacy NGO Routes
 */

// NGO specific routes
router.use('/ngo', requireRole('NGO'));

// Create food request (NGO only)
router.post('/ngo/create', requestController.createFoodRequest);

// Get NGO's food requests
router.get('/ngo/my-requests', requestController.getNGOFoodRequests);

// Cancel food request (NGO only)
router.patch('/ngo/:id/cancel', requestController.cancelFoodRequest);

/**
 * Legacy Restaurant Routes
 */

// Remove NGO role requirement for restaurant routes
router.use((req, res, next) => {
  next();
});

router.use('/restaurant', requireRole('RESTAURANT'));

// Get restaurant's food requests
router.get('/restaurant/received', requestController.getRestaurantFoodRequests);

// Approve food request (Restaurant only)
router.patch('/restaurant/:id/approve', requestController.approveFoodRequest);

// Reject food request (Restaurant only)
router.patch('/restaurant/:id/reject', requestController.rejectFoodRequest);

// Get pending requests for a food listing
router.get('/restaurant/food/:id/pending', requestController.getPendingRequestsForFood);

/**
 * Admin Routes
 */

// Remove restaurant role requirement for admin routes
router.use((req, res, next) => {
  next();
});

router.use('/admin', requireRole('ADMIN'));

// Get all food requests (Admin only)
router.get('/admin/all', requestController.getAllFoodRequests);

// Update request status (Admin only)
router.patch('/admin/:id/status', requestController.updateRequestStatus);

// Get urgent requests (Admin only)
router.get('/admin/urgent', requestController.getUrgentRequests);

export default router;