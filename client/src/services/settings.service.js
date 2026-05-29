import axios from '@/lib/axios';

/**
 * Request a 6-digit OTP sent to the user's current email.
 * Must be called before updateProfileWithOtp.
 */
export const requestProfileOtp = async () => {
  const response = await axios.post('/auth/settings/request-otp');
  return response.data;
};

/**
 * Apply profile changes after verifying OTP.
 * @param {Object} profileData - { name, email, phone, ngoName|shopName|shopType, address, coverageRadiusKm }
 * @param {string} otp - 6-digit code from email
 */
export const updateProfileWithOtp = async (profileData, otp) => {
  const response = await axios.put('/auth/settings/profile', { ...profileData, otp });
  return response.data;
};

/**
 * Trigger a new email verification to be sent (for unverified accounts).
 * @param {string} email
 */
export const resendEmailVerification = async (email) => {
  const response = await axios.post('/auth/resend-verification', { email });
  return response.data;
};
