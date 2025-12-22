import crypto from 'crypto';

/**
 * Generate QR code data for pickup verification
 * @param {string} data - Data to encode in QR code
 * @returns {string} - Base64 encoded QR code data
 */
export const generateQRCode = async (data) => {
  try {
    // For now, we'll create a simple encrypted string
    // In production, you might want to use a proper QR code library
    const timestamp = Date.now();
    const qrData = {
      data: JSON.parse(data),
      timestamp,
      hash: crypto.createHash('sha256').update(data + timestamp).digest('hex')
    };
    
    // Convert to base64 for storage
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + error.message);
  }
};

/**
 * Verify QR code data
 * @param {string} qrCodeData - QR code data to verify
 * @returns {Object} - Parsed and verified data
 */
export const verifyQRCode = async (qrCodeData) => {
  try {
    // Decode from base64
    const decoded = Buffer.from(qrCodeData, 'base64').toString('utf8');
    const qrData = JSON.parse(decoded);
    
    // Verify hash
    const expectedHash = crypto.createHash('sha256')
      .update(JSON.stringify(qrData.data) + qrData.timestamp)
      .digest('hex');
      
    if (qrData.hash !== expectedHash) {
      throw new Error('QR code verification failed: invalid hash');
    }
    
    // Check if QR code is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - qrData.timestamp > maxAge) {
      throw new Error('QR code expired');
    }
    
    return qrData.data;
  } catch (error) {
    throw new Error('Failed to verify QR code: ' + error.message);
  }
};

/**
 * Generate a simple verification token
 * @returns {string} - Random verification token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};