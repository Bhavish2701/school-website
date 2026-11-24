/**
 * Payment Express Router
 * Implements:
 * POST /api/v1/payments/create - Initiates server-side payment order
 * POST /api/v1/payments/verify - Cryptographically verifies payment server-side
 * GET /api/v1/payments/history - Transaction history
 * GET /api/v1/payments/receipts/:receiptNumber - Official receipt details
 */
const express = require('express');
const router = express.Router();

const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const {
  validateCreatePaymentOrder,
  validateVerifyPayment,
} = require('../validators/fee.validator');
const paymentController = require('../controllers/payment.controller');

// 1. Initiate Payment Order
router.post(
  '/create',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  validateCreatePaymentOrder,
  paymentController.createPayment
);

// 2. Cryptographic Payment Verification (Server-Side)
router.post(
  '/verify',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  validateVerifyPayment,
  paymentController.verifyPayment
);

// 3. Payment History
router.get(
  '/history',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  paymentController.getHistory
);

// 4. Official Receipt Details
router.get(
  '/receipts/:receiptNumber',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  paymentController.getReceipt
);

module.exports = router;
