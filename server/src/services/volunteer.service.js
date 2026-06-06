import { VolunteerModel } from '../models/Volunteer.model.js';
import { NGOModel } from '../models/NGO.model.js';
import { UserModel } from '../models/User.model.js';
import { getPrismaClient } from '../config/db.config.js';
import emailService from './email.service.js';
import { createNotification } from './notification.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export class VolunteerService {

  /**
   * Register as a volunteer for a specific NGO (public – no auth required)
   */
  async registerVolunteer({ ngoId, name, email, phone, currentUserId = null }) {
    // Check if email already used as a volunteer application
    const existing = await VolunteerModel.findByEmail(email);
    if (existing && existing.userId !== currentUserId) {
      throw new Error('An application with this email already exists');
    }

    // Check if email already used as a system user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.id !== currentUserId) {
      throw new Error('This email is already registered as a system user');
    }

    // Confirm NGO exists
    const ngo = await NGOModel.findById(ngoId);
    if (!ngo) throw new Error('NGO not found');

    const volunteer = await VolunteerModel.create({ ngoId, name, email, phone });

    if (currentUserId) {
      const currentUser = await UserModel.findById(currentUserId);
      if (!currentUser) {
        throw new Error('Authenticated user not found');
      }
      if (currentUser.role !== 'VOLUNTEER') {
        await UserModel.update(currentUserId, {
          role: 'VOLUNTEER',
          phone: phone || currentUser.phone,
        });
      }
    }

    // Email to volunteer
    await emailService.sendVolunteerRegistrationThankYou(email, name, ngo.ngoName);

    // Email to NGO
    await emailService.sendVolunteerApplicationToNGO(
      ngo.user.email,
      ngo.ngoName,
      name,
      email,
      phone
    );

    await createNotification(
      ngo.userId,
      'volunteer:application',
      'New volunteer application',
      `${name} has applied to volunteer with your NGO.`,
      {
        volunteerId: volunteer.id,
        ngoId: ngo.id,
        name,
        email,
        phone: phone || null,
      },
      'IN_APP'
    );

    return volunteer;
  }

  /**
   * Get all volunteers for an NGO (NGO role)
   */
  async getVolunteersByNGO(ngoUserId) {
    const ngo = await NGOModel.findByUserId(ngoUserId);
    if (!ngo) throw new Error('NGO profile not found');
    return await VolunteerModel.findByNGO(ngo.id);
  }

  /**
   * NGO accepts a volunteer, creates a login account, sends setup invite
   */
  async verifyVolunteer(volunteerId, ngoUserId) {
    const volunteer = await VolunteerModel.findById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');

    // Ensure this NGO owns the volunteer record
    const ngo = await NGOModel.findByUserId(ngoUserId);
    if (!ngo || ngo.id !== volunteer.ngoId) {
      throw new Error('Unauthorized: volunteer does not belong to your NGO');
    }

    if (volunteer.status !== 'PENDING') {
      throw new Error('Volunteer application is no longer pending');
    }

    const prisma = getPrismaClient();

    // If the volunteer email already exists as a user, reuse that account rather than creating a duplicate.
    let user = await UserModel.findByEmail(volunteer.email);

    if (user) {
      if (user.role !== 'VOLUNTEER') {
        await UserModel.update(user.id, {
          role: 'VOLUNTEER',
          isVerified: true,
        });
        user = await UserModel.findById(user.id);
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          password: null,
          role: 'VOLUNTEER',
          isVerified: true, // pre-verified by NGO
        },
      });
    }

    // Update Volunteer record: link userId and set VERIFIED until phone verification activates them
    const updated = await VolunteerModel.update(volunteerId, {
      userId: user.id,
      status: 'VERIFIED',
      mustChangePassword: false,
    });

    const inviteToken = jwt.sign(
      {
        type: 'volunteer-invite',
        userId: user.id,
        volunteerId: volunteer.id,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await emailService.sendVolunteerInvite(
      volunteer.email,
      volunteer.name,
      ngo.ngoName,
      inviteToken
    );

    return updated;
  }

  /**
   * Volunteer completes an NGO-approved invite by setting their password
   */
  async completeInvite(token, password) {
    if (!token) throw new Error('Invite token is required');
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch {
      throw new Error('Invalid or expired invite token');
    }

    if (decoded.type !== 'volunteer-invite') {
      throw new Error('Invalid invite token');
    }

    const volunteer = await VolunteerModel.findById(decoded.volunteerId);
    if (!volunteer || volunteer.userId !== decoded.userId) {
      throw new Error('Volunteer invite not found');
    }

    if (volunteer.status !== 'VERIFIED' && volunteer.status !== 'ACTIVE') {
      throw new Error('Volunteer invite is not active');
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user || user.role !== 'VOLUNTEER') {
      throw new Error('Volunteer account not found');
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await UserModel.update(user.id, { password: hashedPassword });

    return { message: 'Volunteer account setup complete. You can now log in.' };
  }

  /**
   * NGO rejects a volunteer application
   */
  async rejectVolunteer(volunteerId, ngoUserId) {
    const volunteer = await VolunteerModel.findById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');

    const ngo = await NGOModel.findByUserId(ngoUserId);
    if (!ngo || ngo.id !== volunteer.ngoId) {
      throw new Error('Unauthorized: volunteer does not belong to your NGO');
    }

    if (volunteer.status !== 'PENDING') {
      throw new Error('Volunteer application is no longer pending');
    }

    return await VolunteerModel.update(volunteerId, { status: 'REJECTED' });
  }

  /**
   * Get volunteer record for the currently logged-in volunteer user
   */
  async getMyProfile(userId) {
    const volunteer = await VolunteerModel.findByUserId(userId);
    if (!volunteer) throw new Error('Volunteer profile not found');
    return volunteer;
  }

  /**
   * Volunteer changes their password (enforced on first login)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters');

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    await UserModel.update(userId, { password: hashed });

    // Clear mustChangePassword flag
    const volunteer = await VolunteerModel.findByUserId(userId);
    if (volunteer) {
      await VolunteerModel.update(volunteer.id, { mustChangePassword: false });
    }

    return { message: 'Password updated successfully' };
  }

  /**
   * Request a phone OTP (stored in DB; SMS via Twilio if configured, else email fallback)
   */
  async requestPhoneOTP(userId, phone) {
    const volunteer = await VolunteerModel.findByUserId(userId);
    if (!volunteer) throw new Error('Volunteer profile not found');

    if (volunteer.phoneVerified) throw new Error('Phone is already verified');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP and optionally update phone
    await VolunteerModel.update(volunteer.id, {
      phone: phone || volunteer.phone,
      phoneOtp: otp,
      phoneOtpExpiry: expiry,
    });

    // Attempt SMS via Twilio; fall back to email
    const smsResult = await this._sendSmsOtp(phone || volunteer.phone, otp);
    if (!smsResult) {
      await emailService.sendPhoneOTPEmail(volunteer.email, volunteer.name, otp);
    }

    return { message: 'OTP sent to your phone' };
  }

  /**
   * Verify the phone OTP
   */
  async verifyPhoneOTP(userId, otp) {
    const volunteer = await VolunteerModel.findByUserId(userId);
    if (!volunteer) throw new Error('Volunteer profile not found');

    if (volunteer.phoneVerified) throw new Error('Phone already verified');
    if (!volunteer.phoneOtp) throw new Error('No OTP requested');
    if (new Date() > volunteer.phoneOtpExpiry) throw new Error('OTP has expired. Request a new one.');
    if (volunteer.phoneOtp !== otp) throw new Error('Invalid OTP');

    await VolunteerModel.update(volunteer.id, {
      phoneVerified: true,
      phoneOtp: null,
      phoneOtpExpiry: null,
      status: 'ACTIVE',
    });

    return { message: 'Phone verified successfully' };
  }

  /**
   * Send SMS via Twilio (optional). Returns true on success, false on failure/unconfigured.
   */
  async _sendSmsOtp(phone, otp) {
    const { config } = await import('../config/env.config.js');
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
      return false;
    }
    try {
      const twilio = (await import('twilio')).default;
      const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your SaveTheServe phone verification code is: ${otp}. Valid for 10 minutes.`,
        from: config.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return true;
    } catch (err) {
      console.warn('⚠️  Twilio SMS failed, falling back to email OTP:', err.message);
      return false;
    }
  }

  /**
   * List all NGOs for the public registration dropdown
   */
  async listNGOs() {
    const prisma = getPrismaClient();
    const ngos = await prisma.nGO.findMany({
      select: {
        id: true,
        ngoName: true,
        address: true,
        coverageRadiusKm: true,
      },
      orderBy: { ngoName: 'asc' },
    });
    return ngos;
  }
}
