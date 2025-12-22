import express from 'express';
import pickupController from '../controllers/pickup.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * General Routes (All authenticated users)
 */

// Get pickup by ID
router.get('/:id', pickupController.getPickupById);

// Get pickup by request ID
router.get('/request/:id', pickupController.getPickupByRequestId);

// Get pickup statistics
router.get('/stats/overview', pickupController.getPickupStats);

// Get user-specific pickups
router.get('/my/pickups', pickupController.getUserPickups);

// Verify QR code (Both NGO and Restaurant)
router.post('/verify-qr', pickupController.verifyQRCode);

/**
 * NGO and Restaurant Routes
 */

// Initiate pickup
router.post('/initiate', pickupController.initiatePickup);

// Complete pickup
router.patch('/:id/complete', pickupController.completePickup);

// Cancel pickup
router.patch('/:id/cancel', pickupController.cancelPickup);

/**
 * Admin Routes
 */

router.use('/admin', requireRole('ADMIN'));

// Get all pickups (Admin only)
router.get('/admin/all', pickupController.getAllPickups);

// Get pending pickups (Admin only)
router.get('/admin/pending', pickupController.getPendingPickups);

// Get overdue pickups (Admin only)
router.get('/admin/overdue', pickupController.getOverduePickups);

// Update pickup status (Admin only)
router.patch('/admin/:id/status', pickupController.updatePickupStatus);

// Generate pickup report (Admin only)
router.post('/admin/report', pickupController.generateReport);

export default router;