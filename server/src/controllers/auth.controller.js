import { AuthService } from '../services/auth.service.js';
import { validationResult } from 'express-validator';
import emailService from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';
import logger from '../utils/logger.js';

const authService = new AuthService();

export class AuthController {

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const result = await authService.register(req.body);

      // Send welcome notification
      try {
        await createNotification(
          result.user.id,
          'registration_welcome',
          'Welcome to SaveTheServe',
          `Hi ${result.user.name}, welcome to SaveTheServe! Your account has been created successfully.`,
          { role: result.user.role },
          'IN_APP'
        );
      } catch (notifError) {
        logger.warn('Failed to send welcome notification:', notifError.message);
      }

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          token: result.tokens.accessToken,
          message: result.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      console.log('📧 Verify email request body:', req.body);
      
      // Joi validation is handled by middleware, so we don't need validationResult here
      const { userId, email, code } = req.body;
      console.log('✅ Processing verification for:', { userId, email, code });
      
      const result = await authService.verifyEmailWithCode(userId, email, code);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('❌ Email verification error:', error.message);
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async requestPasswordReset(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: result.message,
        // Remove resetToken in production
        ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken }),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          message: result.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getUserProfile(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const updatedUser = await authService.updateProfile(userId, req.body);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.logout(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authentication status
   * GET /api/auth/status
   */
  async getAuthStatus(req, res, next) {
    try {
      // If middleware passes, user is authenticated
      res.json({
        success: true,
        data: {
          isAuthenticated: true,
          user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      // Generate new verification token
      const user = await authService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Store OTP on user record
      const { UserModel } = await import('../models/index.js');
      await UserModel.update(user.id, {
        verificationToken: verificationOtp,
        verificationTokenExpiry: verificationExpiry,
      });

      // Send verification email with the OTP
      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationOtp,
        user.name
      );

      res.json({
        success: true,
        message: emailSent 
          ? 'Verification email sent successfully' 
          : 'Failed to send verification email. Please try again.',
        emailSent,
        userId: user.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test email service
   * GET /api/auth/test-email
   */
  async testEmail(req, res, next) {
    try {
      const result = await emailService.testConnection();
      
      res.json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Request OTP for profile update (settings page)
   * POST /api/auth/settings/request-otp
   */
  async requestSettingsOtp(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.requestSettingsOtp(userId);

      res.json({
        success: true,
        message: result.message,
        maskedEmail: result.maskedEmail,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile with OTP verification (settings page)
   * PUT /api/auth/settings/profile
   */
  async updateSettingsProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const { otp, ...updateData } = req.body;

      const result = await authService.updateSettingsProfile(userId, otp, updateData);

      res.json({
        success: true,
        data: result.user,
        message: result.message,
        emailChanged: result.emailChanged,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth login
   * POST /api/auth/google-login
   */
  async googleLogin(req, res, next) {
    try {
      const { firebaseToken, role } = req.body;

      if (!firebaseToken) {
        return res.status(400).json({
          success: false,
          message: 'Firebase token required',
        });
      }

      const result = await authService.googleLogin(firebaseToken, role);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
          token: result.tokens.accessToken,
          isNewUser: result.isNewUser,
          needsRoleSetup: result.needsRoleSetup,
          message: result.message,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
// Create controller instance
export const authController = new AuthController();
