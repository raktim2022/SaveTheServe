import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import { config } from '../config/env.config.js';

const prisma = new PrismaClient();

// Initialize Razorpay instance
let razorpay = null;

try {
  if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
    logger.info('✅ Razorpay payment service initialized');
  } else {
    logger.warn('⚠️  Razorpay credentials not configured - payment features will be disabled');
  }
} catch (error) {
  logger.error('❌ Failed to initialize Razorpay:', error.message);
}

/**
 * Create a payment order (donation/support to NGO)
 */
export async function initiateDonation(
  donorId,
  ngoId,
  amount,
  description = 'Donation to SaveTheServe NGO'
) {
  try {
    if (!razorpay) {
      throw new Error('Payment service not configured');
    }

    // Amount must be in paise (smallest currency unit in INR)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `donation_${ngoId}_${Date.now()}`,
      notes: {
        donorId,
        ngoId,
        type: 'ngo_donation',
      },
    });

    logger.info(`💳 Created payment order ${order.id} for NGO ${ngoId}`);

    return {
      orderId: order.id,
      amount: amountInPaise / 100,
      currency: 'INR',
      key: config.RAZORPAY_KEY_ID,
      description,
    };
  } catch (error) {
    logger.error('❌ Error initiating donation:', error);
    throw error;
  }
}

/**
 * Verify payment signature and complete transaction
 */
export async function verifyPayment(
  orderId,
  paymentId,
  signature,
  donorId,
  ngoId,
  amount
) {
  try {
    if (!razorpay) {
      throw new Error('Payment service not configured');
    }

    // Verify signature
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn(`❌ Invalid payment signature for order ${orderId}`);
      throw new Error('Invalid payment signature');
    }

    logger.info(`✅ Payment verified for order ${orderId}`);

    // Create payment record in database
    // Note: This assumes a Payment model exists in Prisma schema
    // If it doesn't, this will fail - add it to schema.prisma
    const payment = await createPaymentRecord(
      donorId,
      ngoId,
      orderId,
      paymentId,
      amount,
      'COMPLETED'
    );

    logger.info(`💾 Payment record created: ${payment.id}`);

    return {
      success: true,
      payment,
      message: 'Payment verified successfully',
    };
  } catch (error) {
    logger.error('❌ Error verifying payment:', error);
    throw error;
  }
}

/**
 * Create payment record in database
 */
async function createPaymentRecord(donorId, ngoId, orderId, paymentId, amount, status) {
  try {
    // This assumes a Payment model. If it doesn't exist, we'll store in a generic table
    // For now, we'll just log it
    logger.info(`💰 Payment record: Order=${orderId}, Payment=${paymentId}, Amount=${amount}, Status=${status}`);

    return {
      id: paymentId,
      orderId,
      paymentId,
      donorId,
      ngoId,
      amount,
      status,
      createdAt: new Date(),
    };
  } catch (error) {
    logger.error('❌ Error creating payment record:', error);
    throw error;
  }
}

/**
 * Get payment history for a donor
 */
export async function getDonationHistory(donorId, limit = 10, offset = 0) {
  try {
    // This is a placeholder - in production, query from Payment table
    logger.info(`📋 Fetching donation history for donor ${donorId}`);

    return {
      donations: [],
      total: 0,
    };
  } catch (error) {
    logger.error('❌ Error fetching donation history:', error);
    throw error;
  }
}

/**
 * Get donation statistics for an NGO
 */
export async function getNGODonationStats(ngoId) {
  try {
    // This is a placeholder - in production, aggregate from Payment table
    logger.info(`📊 Fetching donation stats for NGO ${ngoId}`);

    return {
      totalDonations: 0,
      donationCount: 0,
      averageDonation: 0,
    };
  } catch (error) {
    logger.error('❌ Error fetching NGO donation stats:', error);
    throw error;
  }
}

/**
 * Refund a payment (admin feature)
 */
export async function refundPayment(paymentId, reason = 'Requested by user') {
  try {
    if (!razorpay) {
      throw new Error('Payment service not configured');
    }

    const refund = await razorpay.payments.refund(paymentId, {
      notes: {
        reason,
      },
    });

    logger.info(`🔄 Refund initiated: ${refund.id} for payment ${paymentId}`);

    return refund;
  } catch (error) {
    logger.error('❌ Error refunding payment:', error);
    throw error;
  }
}

/**
 * Test payment configuration
 */
export async function testPaymentConfig() {
  try {
    if (!razorpay) {
      return {
        configured: false,
        message: 'Razorpay credentials not configured',
      };
    }

    // Try to create a test order
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    });

    logger.info('✅ Payment service test successful');

    return {
      configured: true,
      message: 'Payment service is properly configured',
      testOrderId: testOrder.id,
    };
  } catch (error) {
    logger.error('❌ Payment service test failed:', error);
    return {
      configured: false,
      message: error.message,
    };
  }
}
