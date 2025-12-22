import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

/**
 * Admin Management Routes
 */

// Create admin
router.post('/', adminController.createAdmin);

// Get all admins
router.get('/', adminController.getAllAdmins);

// Get current admin profile
router.get('/profile', adminController.getProfile);

// Get admin by ID
router.get('/:id', adminController.getAdminById);

// Update admin
router.put('/:id', adminController.updateAdmin);

// Delete admin
router.delete('/:id', adminController.deleteAdmin);

/**
 * User Management Routes
 */

// Get all users
router.get('/users/all', adminController.getAllUsers);

// Suspend user
router.patch('/users/:id/suspend', adminController.suspendUser);

// Reactivate user
router.patch('/users/:id/reactivate', adminController.reactivateUser);

// Change user password
router.patch('/users/:id/change-password', adminController.changeUserPassword);

/**
 * Approval Management Routes
 */

// Get pending approvals
router.get('/approvals/pending', adminController.getPendingApprovals);

// Approve NGO
router.patch('/ngos/:id/approve', adminController.approveNGO);

// Reject NGO
router.patch('/ngos/:id/reject', adminController.rejectNGO);

// Approve Restaurant
router.patch('/restaurants/:id/approve', adminController.approveRestaurant);

// Reject Restaurant
router.patch('/restaurants/:id/reject', adminController.rejectRestaurant);

/**
 * Dashboard Routes
 */

// Get dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

export default router;
