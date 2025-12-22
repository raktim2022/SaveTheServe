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
export default emailService;