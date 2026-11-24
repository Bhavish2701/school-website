/**
 * Rate Limiting Middleware
 * Protects APIs against brute-force attacks and denial-of-service
 */
const rateLimit = require('express-rate-limit');
const { formatError } = require('../utils/apiResponse');

/**
 * Standard API Rate Limiter
 * 500 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 100000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatError(
        'Too many requests from this IP. Please try again after 15 minutes.',
        { rateLimit: 'API rate limit exceeded. Please throttle your requests.' }
      )
    );
  },
});

/**
 * Strict Authentication Rate Limiter
 * 15 login attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 50000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatError(
        'Too many authentication attempts. Please try again after 15 minutes.',
        { authLimit: 'Authentication rate limit reached. Access temporarily locked.' }
      )
    );
  },
});

/**
 * 2FA / Login OTP Rate Limiter
 * 5 attempts per 10 minutes per IP
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatError(
        'Too many verification code attempts. Please wait 10 minutes before requesting a new code.',
        { otpLimit: 'OTP attempt rate limit reached.' }
      )
    );
  },
});

/**
 * Password Reset Rate Limiter
 * 5 requests per 15 minutes per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatError(
        'Too many password reset requests. Please check your email or wait 15 minutes.',
        { resetLimit: 'Password reset rate limit exceeded.' }
      )
    );
  },
});

/**
 * Email Verification Rate Limiter
 * 5 attempts per 15 minutes per IP
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      formatError(
        'Too many email verification requests. Please wait 15 minutes.',
        { emailVerificationLimit: 'Email verification request rate limit reached.' }
      )
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
};
