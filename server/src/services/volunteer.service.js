import { VolunteerModel } from '../models/Volunteer.model.js';
import { NGOModel } from '../models/NGO.model.js';
import { UserModel } from '../models/User.model.js';
import { getPrismaClient } from '../config/db.config.js';
import emailService from './email.service.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class VolunteerService {

  /**
   * Register as a volunteer for a specific NGO (public – no auth required)
   */
  async registerVolunteer({ ngoId, name, email, phone }) {
    // Check if email already used as a volunteer application
    const existing = await VolunteerModel.findByEmail(email);
    if (existing) {
      throw new Error('An application with this email already exists');
    }

    // Check if email already used as a system user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('This email is already registered as a system user');
    }

    // Confirm NGO exists
    const ngo = await NGOModel.findById(ngoId);
    if (!ngo) throw new Error('NGO not found');

    const volunteer = await VolunteerModel.create({ ngoId, name, email, phone });

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
   * NGO verifies a volunteer, creates User account, sends credentials email
   */
  async verifyVolunteer(volunteerId, ngoUserId, temporaryPassword) {
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

    if (!temporaryPassword || temporaryPassword.length < 8) {
      throw new Error('Temporary password must be at least 8 characters');
    }

    // Hash temporary password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

    // Create the User account
    const prisma = getPrismaClient();
    const user = await prisma.user.create({
      data: {
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        password: hashedPassword,
        role: 'VOLUNTEER',
        isVerified: true, // pre-verified by NGO
      },
    });

    // Update Volunteer record: link userId, set VERIFIED, require password change
    const updated = await VolunteerModel.update(volunteerId, {
      userId: user.id,
      status: 'VERIFIED',
      mustChangePassword: true,
    });

    // Send credentials email to volunteer
    await emailService.sendVolunteerCredentials(
      volunteer.email,
      volunteer.name,
      volunteer.email,
      temporaryPassword,
      ngo.ngoName
    );

    return updated;
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
