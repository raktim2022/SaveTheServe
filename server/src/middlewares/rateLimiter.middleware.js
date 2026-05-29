import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config.js';
import logger from '../utils/logger.js';

// Create rate limiter with configuration from environment
export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes default
  max: config.RATE_LIMIT_MAX || 300, // 300 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((config.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000) / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Custom key generator (can be enhanced for different user types)
  keyGenerator: (req) => {
    return req.ip; // Use IP address as key
  },
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.',
      retryAfter: Math.ceil((config.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000) / 1000),
    });
  },
  
  // Skip rate limiting for certain conditions
  skip: (req) => {
    // Never rate-limit Socket.IO — polling makes ~1 req/25s per client and
    // would exhaust the window immediately. Socket.IO has its own auth guard.
    if (req.path.startsWith('/socket.io')) return true;

    // Skip rate limiting for health checks
    if (req.path === '/health' || req.path === '/api/health') return true;

    // In development, skip rate limiting for loopback / localhost traffic so
    // hot-reloading and local browser sessions aren't blocked by a tight limit.
    if (config.NODE_ENV !== 'production') {
      const ip = req.ip || req.socket?.remoteAddress || '';
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') return true;
    }

    return false;
  },
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      retryAfter: 900,
    });
  },
});

// Export default for backward compatibility
export default rateLimiter;
