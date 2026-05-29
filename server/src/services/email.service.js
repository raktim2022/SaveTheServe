import nodemailer from 'nodemailer';
import { config } from '../config/env.config.js';

export class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.initPromise = this.initTransporter();
  }

  /**
   * Ensure transporter is initialized before use
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
    return this.transporter;
  }

  /**
   * Initialize email transporter
   */
  async initTransporter() {
    try {
      console.log('🚀 Initializing email service...');
      console.log('📧 SMTP Configuration:');
      console.log(`   Host: ${config.SMTP_HOST}`);
      console.log(`   Port: ${config.SMTP_PORT}`);
      console.log(`   User: ${config.SMTP_USER}`);
      console.log(`   Pass: ${config.SMTP_PASS ? '***hidden***' : 'NOT SET'}`);

      if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
        throw new Error('Missing required SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS)');
      }

      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates in development
        },
        // Gmail-specific settings
        service: config.SMTP_HOST === 'smtp.gmail.com' ? 'gmail' : undefined
      });

      // Verify connection configuration
      if (process.env.NODE_ENV !== 'test') {
        console.log('🔍 Verifying SMTP connection...');
        await this.transporter.verify();
        console.log('✅ SMTP connection verified successfully');
        console.log('✅ Email service initialized successfully');
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('⚠️  Email service initialization failed:', error.message);
      console.warn('Email verification will be disabled');
      this.isInitialized = true; // Mark as initialized even if failed
      this.transporter = null;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, verificationToken, userName = '') {
    const transporter = await this.ensureInitialized();
    if (!transporter) {
      console.warn('Email transporter not available, verification email not sent');
      return false;
    }

    try {
      const verificationUrl = `${config.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      const mailOptions = {
        from: {
          name: 'SaveTheServe',
          address: config.SMTP_USER
        },
        to: email,
        subject: 'Verify your SaveTheServe account',
        html: this.getVerificationEmailTemplate(userName, verificationUrl, verificationToken),
        text: `
          Welcome to SaveTheServe, ${userName}!
          
          Thank you for joining our mission to reduce food waste and help communities in need.
          
          Please verify your email address by clicking the following link:
          ${verificationUrl}
          
          Or enter this verification code manually: ${verificationToken.slice(-6)}
          
          This link will expire in 24 hours for your security.
          
          Best regards,
          The SaveTheServe Team
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully to:', email);
      return result;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken, userName = '') {
    const transporter = await this.ensureInitialized();
    if (!transporter) {
      console.warn('Email transporter not available, reset email not sent');
      return false;
    }

    try {
      const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      const mailOptions = {
        from: {
          name: 'SaveTheServe',
          address: config.SMTP_USER
        },
        to: email,
        subject: 'Reset your SaveTheServe password',
        html: this.getPasswordResetEmailTemplate(userName, resetUrl),
        text: `
          Hi ${userName},
          
          You requested to reset your SaveTheServe password.
          
          Click the following link to reset your password:
          ${resetUrl}
          
          This link will expire in 1 hour for your security.
          
          If you didn't request this reset, please ignore this email.
          
          Best regards,
          The SaveTheServe Team
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', email);
      return result;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return false;
    }
  }

  /**
   * Get verification email HTML template
   */
  getVerificationEmailTemplate(userName, verificationUrl, token) {
    const verificationCode = token.slice(-6);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your SaveTheServe account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e7f43, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { 
            display: inline-block; 
            background: #1e7f43; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
            border: none;
            cursor: pointer;
          }
          .button:visited { color: white !important; }
          .button:hover { background: #22c55e; color: white !important; }
          .button:active { color: white !important; }
          .code { background: #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SaveTheServe!</h1>
            <p>Help us reduce food waste and feed communities</p>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Thank you for joining SaveTheServe! You're now part of a community working to reduce food waste and help those in need.</p>
            
            <p>To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: white !important;">Verify Email Address</a>
            </div>
            
            <p>Or enter this verification code manually in the app:</p>
            
            <div class="code">${verificationCode}</div>
            
            <p><strong>This link will expire in 24 hours</strong> for your security.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The SaveTheServe Team</p>
              <p>Together, we're making a difference! 🌱</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset email HTML template
   */
  getPasswordResetEmailTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your SaveTheServe password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { 
            display: inline-block; 
            background: #dc2626; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: bold;
            border: none;
            cursor: pointer;
          }
          .button:visited { color: white !important; }
          .button:hover { background: #ef4444; color: white !important; }
          .button:active { color: white !important; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>SaveTheServe Account Security</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>You requested to reset your SaveTheServe password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white !important;">Reset Password</a>
            </div>
            
            <p><strong>This link will expire in 1 hour</strong> for your security.</p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
              <p>Best regards,<br>The SaveTheServe Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send profile update OTP email
   */
  async sendProfileUpdateOtp(email, otp, userName = '') {
    const transporter = await this.ensureInitialized();
    if (!transporter) {
      console.warn('Email transporter not available, profile OTP email not sent');
      return false;
    }

    try {
      const mailOptions = {
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: 'Profile Update Verification Code – SaveTheServe',
        html: this.getProfileOtpTemplate(userName, otp),
        text: `Hi ${userName},\n\nYour verification code for profile update is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThe SaveTheServe Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Profile update OTP sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send profile OTP email:', error.message);
      return false;
    }
  }

  /**
   * Profile update OTP HTML template
   */
  getProfileOtpTemplate(userName, otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile Update Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:36px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0 0 6px;font-size:22px;font-weight:700;">Verify Profile Update</h1>
            <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">SaveTheServe Account Security</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 8px;">Hi ${userName},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">You requested to update your SaveTheServe profile. Enter the code below to confirm your changes:</p>
            <div style="background:#f9fafb;border:2px dashed #bbf7d0;border-radius:12px;padding:28px;text-align:center;margin:0 0 20px;">
              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;">Verification Code</p>
              <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:10px;color:#16a34a;">${otp}</p>
            </div>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0 0 8px;">⏱ Expires in <strong style="color:#374151;">10 minutes</strong></p>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:0;">Didn't request this? You can safely ignore this email. Your account is secure.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe · Reducing food waste, feeding communities</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ── Volunteer Email Methods ──────────────────────────────────────────────────

  /**
   * Send thank-you email to volunteer after registration
   */
  async sendVolunteerRegistrationThankYou(email, volunteerName, ngoName) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Thank you for registering as a volunteer – ${ngoName}`,
        html: this._volunteerThankYouTemplate(volunteerName, ngoName),
        text: `Hi ${volunteerName},\n\nThank you for registering as a volunteer for ${ngoName} on SaveTheServe!\n\nThe NGO will review your application and verify you soon. You will receive another email with your login credentials once verified.\n\nBest regards,\nThe SaveTheServe Team`,
      });
      console.log('✅ Volunteer thank-you email sent to:', email);
      return true;
    } catch (err) {
      console.error('❌ Failed to send volunteer thank-you email:', err.message);
      return false;
    }
  }

  /**
   * Notify NGO about a new volunteer application
   */
  async sendVolunteerApplicationToNGO(ngoEmail, ngoName, volunteerName, volunteerEmail, volunteerPhone) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      const dashboardUrl = `${config.CLIENT_URL}`;
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: ngoEmail,
        subject: `New Volunteer Application – ${volunteerName} wants to join ${ngoName}`,
        html: this._volunteerApplicationToNGOTemplate(ngoName, volunteerName, volunteerEmail, volunteerPhone, dashboardUrl),
        text: `Hello ${ngoName},\n\n${volunteerName} (${volunteerEmail}) has applied to volunteer with your organisation.\n\nPlease log in to your dashboard to review and verify the application.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Volunteer application notification sent to NGO:', ngoEmail);
      return true;
    } catch (err) {
      console.error('❌ Failed to send volunteer application email to NGO:', err.message);
      return false;
    }
  }

  /**
   * Send credentials email to volunteer after NGO verification
   */
  async sendVolunteerCredentials(email, volunteerName, loginEmail, temporaryPassword, ngoName) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      const loginUrl = `${config.CLIENT_URL}/login`;
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Your SaveTheServe Volunteer Account is Ready – ${ngoName}`,
        html: this._volunteerCredentialsTemplate(volunteerName, loginEmail, temporaryPassword, loginUrl, ngoName),
        text: `Hi ${volunteerName},\n\nGreat news! ${ngoName} has verified your volunteer application.\n\nYour login credentials:\nEmail: ${loginEmail}\nTemporary Password: ${temporaryPassword}\n\nLogin at: ${loginUrl}\n\nPlease change your password after first login and verify your phone number.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Volunteer credentials email sent to:', email);
      return true;
    } catch (err) {
      console.error('❌ Failed to send volunteer credentials email:', err.message);
      return false;
    }
  }

  /**
   * Send phone OTP via email (fallback when Twilio is not configured)
   */
  async sendPhoneOTPEmail(email, volunteerName, otp) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: 'Phone Verification Code – SaveTheServe',
        html: this._phoneOtpTemplate(volunteerName, otp),
        text: `Hi ${volunteerName},\n\nYour phone verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Phone OTP email sent to:', email);
      return true;
    } catch (err) {
      console.error('❌ Failed to send phone OTP email:', err.message);
      return false;
    }
  }

  _volunteerThankYouTemplate(name, ngoName) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">Thank You, ${name}! 🙌</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Volunteer Registration – SaveTheServe</p>
  </div>
  <div style="padding:36px 32px;">
    <p style="font-size:15px;color:#374151;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.7;">Thank you for signing up as a volunteer for <strong style="color:#16a34a;">${ngoName}</strong> on SaveTheServe. Your willingness to help reduce food waste and support communities in need means a lot to us.</p>
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#166534;"><strong>What's next?</strong><br>The NGO will review your application and verify you shortly. Once verified, you will receive another email with your login credentials.</p>
    </div>
    <p style="font-size:13px;color:#9ca3af;text-align:center;margin-top:24px;">Together, we're making a difference 🌱</p>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe · Reducing food waste, feeding communities</p>
  </div>
</div>
</body></html>`;
  }

  _volunteerApplicationToNGOTemplate(ngoName, volunteerName, volunteerEmail, volunteerPhone, dashboardUrl) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:22px;">New Volunteer Application 📋</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">${ngoName} – SaveTheServe</p>
  </div>
  <div style="padding:36px 32px;">
    <p style="font-size:15px;color:#374151;">Hello <strong>${ngoName}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.7;">A new individual has applied to volunteer with your organisation:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
      <tr><td style="padding:10px 12px;background:#f9fafb;border-radius:8px 8px 0 0;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">Name</td><td style="padding:10px 12px;background:#f9fafb;border-radius:0;color:#111827;border-bottom:1px solid #e5e7eb;">${volunteerName}</td></tr>
      <tr><td style="padding:10px 12px;background:#ffffff;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;">Email</td><td style="padding:10px 12px;background:#ffffff;color:#111827;border-bottom:1px solid #e5e7eb;">${volunteerEmail}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;border-radius:0 0 8px 8px;color:#6b7280;font-weight:600;">Phone</td><td style="padding:10px 12px;background:#f9fafb;border-radius:0 0 8px 8px;color:#111827;">${volunteerPhone || 'Not provided'}</td></tr>
    </table>
    <p style="font-size:14px;color:#6b7280;">Please log in to your dashboard to review and take action on this application.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;">Go to Dashboard</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe · Reducing food waste, feeding communities</p>
  </div>
</div>
</body></html>`;
  }

  _volunteerCredentialsTemplate(name, loginEmail, tempPassword, loginUrl, ngoName) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">Your Account is Ready! 🎉</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">SaveTheServe Volunteer Account</p>
  </div>
  <div style="padding:36px 32px;">
    <p style="font-size:15px;color:#374151;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.7;"><strong style="color:#16a34a;">${ngoName}</strong> has verified your volunteer application. Your account is now active!</p>
    <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">Your Login Credentials</p>
      <div style="margin-bottom:12px;"><span style="font-size:12px;color:#6b7280;">Email</span><br><code style="font-size:15px;color:#111827;background:#ffffff;padding:6px 12px;border-radius:6px;border:1px solid #e5e7eb;display:inline-block;margin-top:4px;">${loginEmail}</code></div>
      <div><span style="font-size:12px;color:#6b7280;">Temporary Password</span><br><code style="font-size:15px;color:#111827;background:#ffffff;padding:6px 12px;border-radius:6px;border:1px solid #e5e7eb;display:inline-block;margin-top:4px;">${tempPassword}</code></div>
    </div>
    <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#854d0e;"><strong>⚠️ Important:</strong> Please change your password immediately after your first login, and verify your phone number to activate your account fully.</p>
    </div>
    <div style="text-align:center;">
      <a href="${loginUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">Login to SaveTheServe</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe · Reducing food waste, feeding communities</p>
  </div>
</div>
</body></html>`;
  }

  _phoneOtpTemplate(name, otp) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:22px;">Phone Verification 📱</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:13px;">SaveTheServe</p>
  </div>
  <div style="padding:36px 32px;text-align:center;">
    <p style="font-size:15px;color:#374151;text-align:left;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;text-align:left;margin-bottom:24px;">Enter the code below to verify your phone number:</p>
    <div style="background:#faf5ff;border:2px dashed #d8b4fe;border-radius:12px;padding:28px;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7c3aed;">Your OTP Code</p>
      <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#7c3aed;">${otp}</p>
    </div>
    <p style="font-size:13px;color:#9ca3af;margin-top:20px;">⏱ Expires in <strong style="color:#374151;">10 minutes</strong></p>
    <p style="font-size:13px;color:#9ca3af;">Didn't request this? Ignore this email – your account is safe.</p>
  </div>
  <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
  </div>
</div>
</body></html>`;
  }

  /**
   * Send volunteer pickup assignment email (QR code + OTP to volunteer)
   * @param {string} email
   * @param {string} volunteerName
   * @param {string} foodName
   * @param {string} donorShopName
   * @param {string} donorAddress
   * @param {string} otp - 6-digit OTP
   * @param {string} qrDataURL - base64 PNG data-URL of QR image
   * @param {string} pickupTime
   */
  async sendVolunteerPickupAssignment(email, volunteerName, foodName, donorShopName, donorAddress, otp, qrDataURL, pickupTime) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      const pickupDateStr = pickupTime
        ? new Date(pickupTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'As soon as possible';

      // email clients block data-URLs in <img src> — use a CID inline attachment instead
      const base64Match = qrDataURL?.match(/^data:image\/png;base64,(.+)$/s);
      const qrBase64 = base64Match ? base64Match[1] : null;
      const cidRef = 'pickup-qr@savetheserve';

      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Pickup Assignment: ${foodName} – SaveTheServe`,
        html: this._volunteerPickupTemplate(volunteerName, foodName, donorShopName, donorAddress, otp, `cid:${cidRef}`, pickupDateStr),
        text: `Hi ${volunteerName},\n\nYou have been assigned to pick up "${foodName}" from ${donorShopName}.\nAddress: ${donorAddress}\nPickup time: ${pickupDateStr}\n\nShow this OTP to the donor to confirm your identity: ${otp}\n\nThe SaveTheServe Team`,
        attachments: qrBase64 ? [{
          filename: 'pickup-qr.png',
          content: qrBase64,
          encoding: 'base64',
          cid: cidRef,
        }] : [],
      });
      console.log('✅ Volunteer pickup assignment email sent to:', email);
      return true;
    } catch (err) {
      console.error('❌ Failed to send volunteer pickup email:', err.message);
      return false;
    }
  }

  /**
   * Send donor notification that a volunteer is coming (OTP the donor should expect)
   */
  async sendDonorPickupNotification(email, donorName, foodName, volunteerName, otp, pickupTime) {
    const transporter = await this.ensureInitialized();
    if (!transporter) { console.warn('Email transporter not available'); return false; }
    try {
      const pickupDateStr = pickupTime
        ? new Date(pickupTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Soon';
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Volunteer Coming for Pickup: ${foodName} – SaveTheServe`,
        html: this._donorPickupNotificationTemplate(donorName, foodName, volunteerName, otp, pickupDateStr),
        text: `Hi ${donorName},\n\nA volunteer "${volunteerName}" will pick up "${foodName}" on ${pickupDateStr}.\nWhen they arrive, ask for the OTP: ${otp}\nEnter it in your dashboard to confirm the pickup.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Donor pickup notification email sent to:', email);
      return true;
    } catch (err) {
      console.error('❌ Failed to send donor pickup notification:', err.message);
      return false;
    }
  }

  _volunteerPickupTemplate(name, foodName, shopName, address, otp, qrDataURL, pickupDate) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:Arial,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">🚚 You've Been Assigned a Pickup!</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">SaveTheServe Volunteer Pickup</p>
  </div>
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#374151;margin:0 0 6px;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 20px;">Your NGO has assigned you to collect the following donation. Show the QR code or OTP to the donor when you arrive to confirm your identity.</p>
    <!-- Pickup details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;font-size:14px;color:#374151;margin-bottom:24px;">
      <tr><td style="padding:14px 16px 4px;"><span style="color:#6b7280;">🍱 Food Item</span></td></tr>
      <tr><td style="padding:0 16px 12px;"><strong>${foodName}</strong></td></tr>
      <tr><td style="padding:0 16px 4px;border-top:1px solid #ccfbf1;"><span style="color:#6b7280;">🏪 Donor</span></td></tr>
      <tr><td style="padding:0 16px 12px;"><strong>${shopName}</strong></td></tr>
      <tr><td style="padding:0 16px 4px;border-top:1px solid #ccfbf1;"><span style="color:#6b7280;">📍 Address</span></td></tr>
      <tr><td style="padding:0 16px 12px;">${address}</td></tr>
      <tr><td style="padding:0 16px 4px;border-top:1px solid #ccfbf1;"><span style="color:#6b7280;">⏰ Pickup Time</span></td></tr>
      <tr><td style="padding:0 16px 14px;">${pickupDate}</td></tr>
    </table>
    <!-- OTP block (full width) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:16px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#0d9488;font-weight:700;">Your OTP Code</p>
          <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#0f172a;">${otp}</p>
          <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Show this to the donor when you arrive</p>
        </td>
      </tr>
    </table>
    <!-- QR block (full width, centered, large) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:20px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#0d9488;font-weight:700;">Or Scan QR Code</p>
          <img src="${qrDataURL}" alt="Pickup QR Code" width="220" height="220" style="display:block;margin:0 auto;border-radius:10px;border:2px solid #e5e7eb;" />
          <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">The donor can scan this from your phone screen</p>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">This code is valid until the pickup is completed. Keep it confidential.</p>
  </div>
  <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
  </div>
</div>
</body></html>`;
  }

  _donorPickupNotificationTemplate(donorName, foodName, volunteerName, otp, pickupDate) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#2563eb,#3b82f6);padding:36px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;">🙌 Volunteer Pickup Confirmed!</h1>
    <p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">SaveTheServe – Pickup Notification</p>
  </div>
  <div style="padding:36px 32px;">
    <p style="font-size:15px;color:#374151;">Hi <strong>${donorName}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.7;">A volunteer has been assigned to collect <strong style="color:#2563eb;">${foodName}</strong> from your location.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:20px 0;">
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;width:40%">👤 Volunteer</td><td style="padding:6px 0;font-weight:600;">${volunteerName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">⏰ Pickup Time</td><td style="padding:6px 0;">${pickupDate}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#374151;margin-bottom:8px;font-weight:600;">When the volunteer arrives, ask for their OTP:</p>
    <div style="background:#fafafa;border:2px dashed #93c5fd;border-radius:12px;padding:24px;text-align:center;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#2563eb;font-weight:700;">Expected OTP</p>
      <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#1e3a8a;">${otp}</p>
    </div>
    <p style="font-size:13px;color:#6b7280;line-height:1.7;">Enter this OTP (or scan their QR code) in your <strong>Pickup Requests</strong> dashboard to confirm the handoff and complete the donation.</p>
    <p style="font-size:12px;color:#9ca3af;">If no volunteer shows up or you don't recognise them, do not hand over the food and contact your NGO immediately.</p>
  </div>
  <div style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
  </div>
</div>
</body></html>`;
  }

  /**
   * Send listing expired notification to restaurant
   */
  async sendListingExpiredEmail(email, restaurantName, foodName, pendingRequests) {
    const transporter = await this.ensureInitialized();
    if (!transporter) return false;
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Your food listing "${foodName}" has expired`,
        html: this._listingExpiredTemplate(restaurantName, foodName, pendingRequests),
        text: `Hi ${restaurantName},\n\nYour listing for ${foodName} has expired.\n\n${pendingRequests} pending requests have been automatically rejected.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Listing expired email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send listing expired email:', error.message);
      return false;
    }
  }

  /**
   * Send listing expiring soon warning
   */
  async sendListingExpiringWarning(email, restaurantName, foodName, minutesUntilExpiry) {
    const transporter = await this.ensureInitialized();
    if (!transporter) return false;
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `⏳ Your listing "${foodName}" expires in ${minutesUntilExpiry} minutes`,
        html: this._listingExpiringWarningTemplate(restaurantName, foodName, minutesUntilExpiry),
        text: `Hi ${restaurantName},\n\nYour listing for ${foodName} will expire in ${minutesUntilExpiry} minutes.\n\nIf it's not picked up by then, it will be marked as expired and all pending requests will be cancelled.\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Listing expiring warning sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send listing expiring warning:', error.message);
      return false;
    }
  }

  /**
   * Send request rejected notification to NGO
   */
  async sendRequestRejectedEmail(email, ngoName, foodName, reason) {
    const transporter = await this.ensureInitialized();
    if (!transporter) return false;
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Your request for "${foodName}" has been rejected`,
        html: this._requestRejectedTemplate(ngoName, foodName, reason),
        text: `Hi ${ngoName},\n\nYour request for ${foodName} has been rejected.\n\nReason: ${reason}\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Request rejected email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send request rejected email:', error.message);
      return false;
    }
  }

  /**
   * Send daily impact report
   */
  async sendDailyImpactReport(email, orgName, kgHandled, pickups, role, peopleFed = 0) {
    const transporter = await this.ensureInitialized();
    if (!transporter) return false;
    try {
      await transporter.sendMail({
        from: { name: 'SaveTheServe', address: config.SMTP_USER },
        to: email,
        subject: `Your SaveTheServe impact summary for today`,
        html: this._dailyImpactReportTemplate(orgName, kgHandled, pickups, role, peopleFed),
        text: `Hi ${orgName},\n\nHere's your SaveTheServe impact summary for today:\n\nFood handled: ${kgHandled}kg\nPickups: ${pickups}\n${role === 'NGO' ? `People fed: ${peopleFed}` : ''}\n\nThank you for being part of SaveTheServe!\n\nThe SaveTheServe Team`,
      });
      console.log('✅ Daily impact report sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send daily impact report:', error.message);
      return false;
    }
  }

  /**
   * HTML template: Listing expired
   */
  _listingExpiredTemplate(restaurantName, foodName, pendingRequests) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Listing Expired</title></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:36px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;">Listing Expired</h1>
            <p style="margin:0;opacity:0.9;">Your food listing has expired</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 16px;">Hi ${restaurantName},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">Your listing for <strong>${foodName}</strong> has expired and is no longer visible to NGOs.</p>
            <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:4px;">
              <p style="margin:0;font-size:14px;color:#7f1d1d;"><strong>${pendingRequests}</strong> pending request(s) have been automatically rejected.</p>
            </div>
            <p style="font-size:14px;color:#6b7280;margin:0;">Visit your dashboard to create new listings for your surplus food!</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
          </div>
        </div>
      </body></html>
    `;
  }

  /**
   * HTML template: Listing expiring soon warning
   */
  _listingExpiringWarningTemplate(restaurantName, foodName, minutesUntilExpiry) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Listing Expiring Soon</title></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#f59e0b,#fbbf24);padding:36px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;">⏳ Listing Expiring Soon</h1>
            <p style="margin:0;opacity:0.9;">Your food listing expires in ${minutesUntilExpiry} minutes</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 16px;">Hi ${restaurantName},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">Your listing for <strong>${foodName}</strong> will expire in <strong>${minutesUntilExpiry} minutes</strong>.</p>
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:20px 0;border-radius:4px;">
              <p style="margin:0;font-size:14px;color:#92400e;"><strong>Actions needed:</strong> If the food hasn't been picked up yet and is still available, you can extend the listing from your dashboard.</p>
            </div>
            <p style="font-size:13px;color:#6b7280;margin:0;">Once expired, pending requests will be automatically rejected.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
          </div>
        </div>
      </body></html>
    `;
  }

  /**
   * HTML template: Request rejected
   */
  _requestRejectedTemplate(ngoName, foodName, reason) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Request Rejected</title></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:36px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;">Request Status Update</h1>
            <p style="margin:0;opacity:0.9;">Your request has been rejected</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 16px;">Hi ${ngoName},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">Your request for <strong>${foodName}</strong> has been rejected.</p>
            <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin:20px 0;border-radius:4px;">
              <p style="margin:0;font-size:14px;color:#7f1d1d;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p style="font-size:14px;color:#6b7280;margin:0;">Please check for other available listings in your service area.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
          </div>
        </div>
      </body></html>
    `;
  }

  /**
   * HTML template: Daily impact report
   */
  _dailyImpactReportTemplate(orgName, kgHandled, pickups, role, peopleFed = 0) {
    const isRestaurant = role === 'RESTAURANT';
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Daily Impact Report</title></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:36px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;">Your Daily Impact Summary</h1>
            <p style="margin:0;opacity:0.9;">SaveTheServe - Making a Difference Every Day</p>
          </div>
          <div style="padding:36px 32px;">
            <p style="font-size:15px;color:#374151;margin:0 0 24px;">Hi ${orgName},</p>
            <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Here's your impact summary for today:</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;">
              <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#16a34a;font-weight:700;">Food Handled</p>
                <p style="margin:0;font-size:32px;font-weight:800;color:#16a34a;">${kgHandled}kg</p>
              </div>
              <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#16a34a;font-weight:700;">Pickups</p>
                <p style="margin:0;font-size:32px;font-weight:800;color:#16a34a;">${pickups}</p>
              </div>
            </div>
            ${!isRestaurant ? `<div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#16a34a;font-weight:700;">People Fed</p>
              <p style="margin:0;font-size:32px;font-weight:800;color:#16a34a;">${peopleFed}</p>
            </div>` : ''}
            <p style="font-size:13px;color:#6b7280;margin:24px 0 0;text-align:center;">Thank you for being part of SaveTheServe! Together, we're reducing food waste and helping communities in need. 🌱</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} SaveTheServe</p>
          </div>
        </div>
      </body></html>
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }
      
      await this.transporter.verify();
      return { success: true, message: 'Email service is working properly' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export function for initializing email service
export const startEmailService = async () => {
  try {
    await emailService.ensureInitialized();
    console.log('✅ Email service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error.message);
    throw error;
  }
};

export default emailService;