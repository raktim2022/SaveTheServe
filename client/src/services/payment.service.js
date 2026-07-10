import axios from '@/lib/axios';

/**
 * Initiate a payment for donating to an NGO
 * @param {string|number} ngoId - The ID of the NGO receiving the donation
 * @param {number} amount - The amount to donate in INR
 * @returns {Promise<Object>} The Razorpay order details
 */
export const initiatePayment = async (ngoId, amount) => {
  const res = await axios.post('/users/payment/initiate', { ngoId, amount });
  return res.data;
};

/**
 * Verify a completed Razorpay payment and store the record
 * @param {Object} payload - The payment verification data
 * @param {string} payload.orderId
 * @param {string} payload.paymentId
 * @param {string} payload.signature
 * @param {string|number} payload.ngoId
 * @param {number} payload.amount
 * @returns {Promise<Object>} Verification success
 */
export const verifyPayment = async (payload) => {
  const res = await axios.post('/users/payment/verify', payload);
  return res.data;
};

/**
 * Get payment history for the logged-in donor
 * @returns {Promise<Array>} List of payments
 */
export const getPaymentHistory = async () => {
  const res = await axios.get('/users/payment/history');
  return res.data;
};
