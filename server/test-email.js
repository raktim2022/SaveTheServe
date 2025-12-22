#!/usr/bin/env node
import { EmailService } from './src/services/email.service.js';
import { config } from './src/config/env.config.js';

async function testEmailService() {
  try {
    console.log('=== Testing Email Service ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Config check:');
    console.log('- SMTP_HOST:', config.SMTP_HOST);
    console.log('- SMTP_PORT:', config.SMTP_PORT);
    console.log('- SMTP_USER:', config.SMTP_USER);
    console.log('- SMTP_PASS:', config.SMTP_PASS ? '***hidden***' : 'NOT SET');
    console.log('');
    
    console.log('Creating EmailService instance...');
    const emailService = new EmailService();
    
    // Wait for initialization to complete
    console.log('Waiting for initialization...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test sending verification email
    const testEmail = 'raktimbanerjee05@gmail.com';
    const testOtp = '123456';
    
    console.log('Attempting to send verification email...');
    const result = await emailService.sendVerificationEmail(testEmail, testOtp, 'Test User');
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log(`📧 Verification email sent to: ${testEmail}`);
      console.log(`🔢 OTP: ${testOtp}`);
      console.log('Result:', result.messageId || 'No message ID');
    } else {
      console.log('❌ Email sending failed - check logs above');
    }
    
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      response: error.response
    });
  }
}

// Run the test
testEmailService();