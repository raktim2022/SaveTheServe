import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a cryptographically secure random token for QR payload.
 * @returns {string} 32-byte hex token
 */
export const generatePickupToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a 6-digit numeric OTP.
 * @returns {string}
 */
export const generatePickupOtp = () => {
  return Math.floor(100000 + crypto.randomInt(900000)).toString();
};

/**
 * Generate a QR code as a base64 PNG data-URL.
 * The QR encodes a JSON payload containing the secure token and request metadata.
 *
 * @param {Object} payload - { token, requestId, ngoId }
 * @returns {Promise<string>} base64 data-URL  (data:image/png;base64,...)
 */
export const generateQRCodeDataURL = async (payload) => {
  const content = JSON.stringify(payload);
  return await QRCode.toDataURL(content, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });
};

/**
 * Decode a scanned QR string (from toDataURL content) back to object.
 * Returns null if not valid JSON.
 * @param {string} scannedString
 * @returns {Object|null}
 */
export const decodeQRPayload = (scannedString) => {
  try {
    return JSON.parse(scannedString);
  } catch {
    return null;
  }
};

// ---- Keep legacy exports so existing pickup.service.js doesn't break ----

/**
 * @deprecated Use generateQRCodeDataURL instead.
 */
export const generateQRCode = async (data) => {
  const timestamp = Date.now();
  const qrData = {
    data: JSON.parse(data),
    timestamp,
    hash: crypto.createHash('sha256').update(data + timestamp).digest('hex'),
  };
  return Buffer.from(JSON.stringify(qrData)).toString('base64');
};

/**
 * @deprecated
 */
export const verifyQRCode = async (qrCodeData) => {
  const decoded = Buffer.from(qrCodeData, 'base64').toString('utf8');
  const qrData = JSON.parse(decoded);
  const expectedHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(qrData.data) + qrData.timestamp)
    .digest('hex');
  if (qrData.hash !== expectedHash) throw new Error('QR code verification failed: invalid hash');
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - qrData.timestamp > maxAge) throw new Error('QR code expired');
  return qrData.data;
};

export const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');
