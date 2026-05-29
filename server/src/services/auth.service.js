import { UserModel, AdminModel, RestaurantModel, NGOModel } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';
import crypto from 'crypto';
import emailService from './email.service.js';

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
   * Get user by email
   */
  async getUserByEmail(email) {
    return await UserModel.findByEmail(email);
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const { 
        email, 
        password, 
        name, 
        phone, 
        role, 
        organizationName,
        description,
        address,
        latitude,
        longitude,
        coverageRadiusKm,
        shopType
      } = userData;

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

      // Create role-specific profile
      let roleProfile = null;
      if (role === 'NGO' && organizationName && address && latitude !== undefined && longitude !== undefined) {
        roleProfile = await NGOModel.create({
          userId: user.id,
          ngoName: organizationName,
          address,
          latitude,
          longitude,
          coverageRadiusKm: coverageRadiusKm || 10, // Default 10km coverage
        });
      } else if (role === 'RESTAURANT' && organizationName && address && latitude !== undefined && longitude !== undefined) {
        roleProfile = await RestaurantModel.create({
          userId: user.id,
          shopName: organizationName,
          shopType: shopType || 'Restaurant',
          address,
          latitude,
          longitude,
          verified: false,
        });
      }

      // Generate 6-digit OTP for email verification
      const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store OTP on the user record
      await UserModel.update(user.id, {
        verificationToken: verificationOtp,
        verificationTokenExpiry: verificationExpiry,
      });

      // Generate JWT token (for URL-based verification fallback)
      const verificationToken = this.generateToken({
        userId: user.id,
        type: 'email-verification',
      });

      // Send verification email with OTP
      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationOtp,
        name
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      const response = {
        user: userWithoutPassword,
        roleProfile,
        verificationToken,
        emailSent,
        message: emailSent 
          ? 'Registration successful. Please check your email for verification instructions.' 
          : 'Registration successful. Email verification temporarily unavailable.',
      };

      // For test and development environment, also provide access token
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isTestEnv || isDevelopment) {
        const accessToken = this.generateToken({
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access',
        });
        response.token = accessToken;
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

      // Check if user is verified - TEMPORARILY DISABLED
      // if (!user.isVerified) {
      //   throw new Error('Please verify your email before logging in');
      // }

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
   * Verify email with code
   */
  async verifyEmailWithCode(userId, email, code) {
    try {
      let user;

      // Look up by userId if provided (and non-empty), otherwise fall back to email
      if (userId && String(userId).trim() !== '') {
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        user = await UserModel.findById(userIdNum);
        if (user && user.email !== email) {
          throw new Error('Email mismatch');
        }
      }

      // Fall back to email lookup
      if (!user) {
        user = await UserModel.findByEmail(email);
      }

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      // Validate code format
      if (!code || code.length !== 6 || !/^[0-9]+$/.test(code)) {
        throw new Error('Invalid verification code format');
      }

      // Verify the OTP matches what was stored
      if (user.verificationToken !== code) {
        throw new Error('Invalid verification code');
      }

      // Check expiry
      if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
        throw new Error('Verification code has expired. Please request a new one.');
      }

      // Mark user as verified and clear the token
      await UserModel.update(user.id, {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      console.error('❌ Email verification service error:', error.message);
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

      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        email, 
        resetToken, 
        user.name
      );

      return {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined, // Remove this in production
        emailSent,
        message: emailSent 
          ? 'Password reset link sent to your email' 
          : 'Failed to send reset email. Please try again.',
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

  /**
   * Mask email for display (e.g. "jo***@example.com")
   */
  maskEmail(email) {
    const [local, domain] = email.split('@');
    const masked = local.slice(0, 2) + '***';
    return `${masked}@${domain}`;
  }

  /**
   * Request OTP for profile update
   * Generates a 6-digit OTP, stores in verificationToken, and emails the user.
   */
  async requestSettingsOtp(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await UserModel.update(userId, {
        verificationToken: otp,
        verificationTokenExpiry: expiry,
      });

      await emailService.sendProfileUpdateOtp(user.email, otp, user.name);

      return {
        message: 'Verification code sent to your email',
        maskedEmail: this.maskEmail(user.email),
      };
    } catch (error) {
      throw new Error(`Failed to send verification code: ${error.message}`);
    }
  }

  /**
   * Update profile with OTP verification (settings flow)
   * Verifies the OTP, updates user + role-specific profile, then clears the token.
   */
  async updateSettingsProfile(userId, otp, updateData) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      // Verify OTP
      if (!user.verificationToken || user.verificationToken !== otp) {
        throw new Error('Invalid verification code');
      }
      if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
        throw new Error('Verification code has expired. Please request a new one.');
      }

      // Separate user fields from role-specific fields
      const { ngoName, address, coverageRadiusKm, shopName, shopType, ...userFields } = updateData;

      // Handle email change
      const emailChanging = userFields.email && userFields.email !== user.email;
      if (emailChanging) {
        const existing = await UserModel.findByEmail(userFields.email);
        if (existing && existing.id !== userId) {
          throw new Error('This email address is already in use by another account');
        }
        userFields.isVerified = false;
      }

      // Convert empty phone to null
      if (userFields.phone === '') userFields.phone = null;

      // Update user record and clear OTP
      await UserModel.update(userId, {
        ...userFields,
        verificationToken: null,
        verificationTokenExpiry: null,
      });

      // Update role-specific profile
      if (user.role === 'NGO' && user.ngo) {
        const ngoUpdates = {};
        if (ngoName !== undefined) ngoUpdates.ngoName = ngoName;
        if (address !== undefined) ngoUpdates.address = address;
        if (coverageRadiusKm !== undefined) ngoUpdates.coverageRadiusKm = coverageRadiusKm;
        if (Object.keys(ngoUpdates).length > 0) {
          await NGOModel.update(user.ngo.id, ngoUpdates);
        }
      } else if (user.role === 'RESTAURANT' && user.restaurant) {
        const restUpdates = {};
        if (shopName !== undefined) restUpdates.shopName = shopName;
        if (shopType !== undefined) restUpdates.shopType = shopType || null;
        if (address !== undefined) restUpdates.address = address;
        if (Object.keys(restUpdates).length > 0) {
          await RestaurantModel.update(user.restaurant.id, restUpdates);
        }
      }

      // Return fresh profile
      const updatedUser = await UserModel.findById(userId);
      const { password: _, ...userWithoutPassword } = updatedUser;

      return {
        user: userWithoutPassword,
        emailChanged: emailChanging,
        message: emailChanging
          ? 'Profile updated. Please verify your new email address.'
          : 'Profile updated successfully.',
      };
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }
}
