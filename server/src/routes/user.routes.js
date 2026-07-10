import express from 'express';
import { UserModel, getPrismaClient } from '../models/index.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { initiateDonation, verifyPayment } from '../services/payment.service.js';


const router = express.Router();

/**
 * PUT /api/users/:id - Update user profile with role-specific data
 * Allows users to update their own profile
 * Separates user fields from role-specific fields and updates them in corresponding models
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const paramUserId = parseInt(req.params.id);
    const prisma = getPrismaClient();

    // Allow users to update their own profile, or admins to update any
    if (userId !== paramUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    // Get the user first
    const user = await UserModel.findById(paramUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Separate user fields from role-specific fields
    const userFields = ['name', 'email', 'phone', 'role', 'password', 'authProvider', 'businessVerified', 'isVerified', 'verificationToken', 'verificationTokenExpiry'];

    const userUpdateData = {};
    const roleUpdateData = {};

    // Categorize fields
    Object.keys(req.body).forEach(key => {
      if (userFields.includes(key)) {
        userUpdateData[key] = req.body[key];
      } else {
        roleUpdateData[key] = req.body[key];
      }
    });

    // Update user data
    let updatedUser = null;
    if (Object.keys(userUpdateData).length > 0) {
      updatedUser = await UserModel.update(paramUserId, userUpdateData);
    } else {
      updatedUser = user;
    }

    // Update role-specific data if provided
    const userRole = userUpdateData.role || user.role;
    
    if (Object.keys(roleUpdateData).length > 0) {
      try {
        if (userRole === 'RESTAURANT') {
          // Find or create restaurant for this user
          let restaurant = user.restaurant;
          
          if (!restaurant) {
            // Create restaurant if it doesn't exist
            restaurant = await prisma.restaurant.create({
              data: {
                userId: paramUserId,
                shopName: roleUpdateData.shopName || 'Restaurant',
                shopType: roleUpdateData.shopType || null,
                address: roleUpdateData.address || '',
                latitude: roleUpdateData.latitude || 0,
                longitude: roleUpdateData.longitude || 0,
                verified: roleUpdateData.verified !== undefined ? roleUpdateData.verified : false,
              }
            });
          } else {
            // Update existing restaurant
            restaurant = await prisma.restaurant.update({
              where: { userId: paramUserId },
              data: {
                ...(roleUpdateData.shopName && { shopName: roleUpdateData.shopName }),
                ...(roleUpdateData.shopType !== undefined && { shopType: roleUpdateData.shopType }),
                ...(roleUpdateData.address && { address: roleUpdateData.address }),
                ...(roleUpdateData.latitude && { latitude: roleUpdateData.latitude }),
                ...(roleUpdateData.longitude && { longitude: roleUpdateData.longitude }),
                ...(roleUpdateData.verified !== undefined && { verified: roleUpdateData.verified }),
              }
            });
          }
        } else if (userRole === 'NGO') {
          // Find or create NGO for this user
          let ngo = user.ngo;
          
          if (!ngo) {
            ngo = await prisma.nGO.create({
              data: {
                userId: paramUserId,
                ngoName: roleUpdateData.ngoName || 'NGO',
                address: roleUpdateData.address || '',
                latitude: roleUpdateData.latitude || 0,
                longitude: roleUpdateData.longitude || 0,
                coverageRadiusKm: roleUpdateData.coverageRadiusKm || 5,
              }
            });
          } else {
            ngo = await prisma.nGO.update({
              where: { userId: paramUserId },
              data: {
                ...(roleUpdateData.ngoName && { ngoName: roleUpdateData.ngoName }),
                ...(roleUpdateData.address && { address: roleUpdateData.address }),
                ...(roleUpdateData.latitude && { latitude: roleUpdateData.latitude }),
                ...(roleUpdateData.longitude && { longitude: roleUpdateData.longitude }),
                ...(roleUpdateData.coverageRadiusKm && { coverageRadiusKm: roleUpdateData.coverageRadiusKm }),
              }
            });
          }
        }
      } catch (roleError) {
        console.error('Error updating role-specific data:', roleError.message);
        // Don't fail completely if role update fails, user was already updated
      }
    }

    // Fetch complete updated user with relationships
    const finalUser = await UserModel.findById(paramUserId);
    const { password: _, ...userWithoutPassword } = finalUser;

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    next(error);
  }
});


// ── Payment / Donation Routes ──────────────────────────────────────────────────

/**
 * POST /api/users/payment/initiate
 * Create a Razorpay order for donating to an NGO
 * Body: { ngoId, amount }
 */
router.post('/payment/initiate', authenticateToken, async (req, res, next) => {
  try {
    const { ngoId, amount } = req.body;
    const donorId = req.user.id;

    if (!ngoId || !amount) {
      return res.status(400).json({ success: false, message: 'ngoId and amount are required' });
    }
    if (typeof amount !== 'number' || amount < 1) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number (in INR)' });
    }

    const orderData = await initiateDonation(donorId, parseInt(ngoId), amount);

    res.json({ success: true, data: orderData });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/payment/verify
 * Verify Razorpay payment signature and save record
 * Body: { orderId, paymentId, signature, ngoId, amount }
 */
router.post('/payment/verify', authenticateToken, async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, ngoId, amount } = req.body;
    const donorId = req.user.id;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'orderId, paymentId, and signature are required' });
    }

    const result = await verifyPayment(orderId, paymentId, signature, donorId, parseInt(ngoId), amount);

    res.json({ success: true, data: result, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/payment/history
 * Get payment history for the authenticated donor
 */
router.get('/payment/history', authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const donorId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { donorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        ngo: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

export default router;