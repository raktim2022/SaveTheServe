import { UserModel, AdminModel, RestaurantModel, NGOModel } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';
import crypto from 'crypto';

export class AuthService {

  /**
   * Generate JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const { email, password, name, phone, role } = userData;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const isTestEnv = process.env.NODE_ENV === 'test';
      const user = await UserModel.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'RESTAURANT',
        isVerified: isTestEnv, // Auto-verify in test environment
      });

      // Generate verification token
      const verificationToken = this.generateToken({
        userId: user.id,
        type: 'email-verification',
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const response = {
        user: userWithoutPassword,
        verificationToken,
        message: 'Registration successful. Please verify your email.',
      };

      // For test environment, also provide access token
      if (isTestEnv) {
        const accessToken = this.generateToken({
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access',
        });
        response.accessToken = accessToken;
        response.message = 'Registration successful.';
      }

      return response;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if user is verified
      if (!user.isVerified) {
        throw new Error('Please verify your email before logging in');
      }

      // Generate access token
      const accessToken = this.generateToken({
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      });

      // Generate refresh token
      const refreshToken = this.generateToken({
        userId: user.id,
        type: 'refresh',
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
        },
        message: 'Login successful',
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      // Verify token
      const decoded = this.verifyToken(token);
      if (decoded.type !== 'email-verification') {
        throw new Error('Invalid verification token');
      }

      // Update user verification status
      await UserModel.update(decoded.userId, { isVerified: true });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error(`Email verification failed: ${error.message}`);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = this.generateToken({
        userId: user.id,
        type: 'password-reset',
      });

      // In production, send email with reset link
      // await emailService.sendPasswordReset(email, resetToken);

      return {
        resetToken, // Remove this in production
        message: 'Password reset link sent to your email',
      };
    } catch (error) {
      throw new Error(`Password reset request failed: ${error.message}`);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = this.verifyToken(token);
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      await UserModel.update(decoded.userId, { password: hashedPassword });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get user details
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      });

      return {
        accessToken,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Get user profile with role-specific data
   */
  async getUserProfile(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Get role-specific profile
      let roleProfile = null;
      switch (user.role) {
        case 'ADMIN':
          roleProfile = await AdminModel.findByUserId(userId);
          break;
        case 'NGO':
          roleProfile = await NGOModel.findByUserId(userId);
          break;
        case 'RESTAURANT':
          roleProfile = await RestaurantModel.findByUserId(userId);
          break;
      }

      return {
        ...userWithoutPassword,
        roleProfile,
      };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const { password, ...profileData } = updateData;

      // If password is being updated, hash it
      if (password) {
        profileData.password = await this.hashPassword(password);
      }

      const updatedUser = await UserModel.update(userId, profileData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await UserModel.update(userId, { password: hashedNewPassword });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  /**
   * Logout (invalidate token - in production, use token blacklist)
   */
  async logout(userId) {
    try {
      // In production, add token to blacklist or store in Redis with expiration
      // For now, just return success message
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
}
