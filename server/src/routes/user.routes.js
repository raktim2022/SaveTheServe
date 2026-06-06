import express from 'express';
import { UserModel, getPrismaClient } from '../models/index.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

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

export default router;