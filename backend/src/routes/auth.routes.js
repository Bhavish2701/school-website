/**
 * Authentication Routes
 * Base mount path: /api/v1/auth
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators/auth.validator');
const {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} = require('../middleware/rateLimiter.middleware');

// Public Authentication Endpoints (with rate limiting on sensitive routes)
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/resend-otp', otpLimiter, authController.resendOtp);
router.get('/dev-otp', authController.getDevOtp);
router.post('/dev-otp', authController.getDevOtp);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Password Recovery & Reset Flow
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, authController.resetPassword);

// Email Verification Flow (OTP & Link Verification)
router.post('/send-verification-email', emailVerificationLimiter, authController.sendVerificationEmail);
router.post('/verify-email', emailVerificationLimiter, authController.verifyEmail);

// Future Portal Activation Endpoints (Specification 20.3)
router.post('/parent/activate', authLimiter, authController.activateParentAccount);
router.post('/student/activate', authLimiter, authController.activateStudentAccount);

// Protected Authentication Endpoints
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.patch('/me', authenticate, authController.updateMe);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.post('/complete-onboarding', authenticate, authController.completeOnboarding);

module.exports = router;
