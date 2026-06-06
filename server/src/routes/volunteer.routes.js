import { Router } from 'express';
import { volunteerController } from '../controllers/volunteer.controller.js';
import { authenticateToken, authenticateOptional } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// ── Public Routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/volunteers/ngos
 * List all NGOs for the registration dropdown
 */
router.get('/ngos', volunteerController.listNGOs);

/**
 * POST /api/volunteers/register
 * Submit a volunteer application
 */
router.post('/register', authenticateOptional, volunteerController.register);

/**
 * POST /api/volunteers/complete-invite
 * Complete accepted volunteer account setup
 */
router.post('/complete-invite', volunteerController.completeInvite);

// ── Volunteer Routes (VOLUNTEER role) ─────────────────────────────────────────

/**
 * GET /api/volunteers/me
 * Get the volunteer's own profile
 */
router.get('/me', authenticateToken, requireRole('VOLUNTEER'), volunteerController.getMyProfile);

/**
 * PUT /api/volunteers/change-password
 * Change temporary password after first login
 */
router.put('/change-password', authenticateToken, requireRole('VOLUNTEER'), volunteerController.changePassword);

/**
 * POST /api/volunteers/phone/request-otp
 * Request SMS/email OTP for phone verification
 */
router.post('/phone/request-otp', authenticateToken, requireRole('VOLUNTEER'), volunteerController.requestPhoneOTP);

/**
 * PUT /api/volunteers/phone/verify
 * Verify the phone OTP
 */
router.put('/phone/verify', authenticateToken, requireRole('VOLUNTEER'), volunteerController.verifyPhoneOTP);

// ── NGO Routes (NGO role) ──────────────────────────────────────────────────────

/**
 * GET /api/volunteers/my-ngo
 * NGO fetches all volunteers assigned to them
 */
router.get('/my-ngo', authenticateToken, requireRole('NGO'), volunteerController.getVolunteersForMyNGO);

/**
 * PUT /api/volunteers/:id/verify
 * NGO verifies a volunteer and sends credentials
 */
router.put('/:id/verify', authenticateToken, requireRole('NGO'), volunteerController.verify);

/**
 * PUT /api/volunteers/:id/reject
 * NGO rejects a volunteer application
 */
router.put('/:id/reject', authenticateToken, requireRole('NGO'), volunteerController.reject);

export default router;
