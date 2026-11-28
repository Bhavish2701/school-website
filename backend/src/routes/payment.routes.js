const express = require('express');
const router = express.Router();

const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const {
  validateCreatePaymentOrder,
  validateVerifyPayment,
} = require('../validators/fee.validator');
const paymentController = require('../controllers/payment.controller');

router.post(
  '/create',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  validateCreatePaymentOrder,
  paymentController.createPayment
);

router.post(
  '/verify',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  validateVerifyPayment,
  paymentController.verifyPayment
);

router.get(
  '/history',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  paymentController.getHistory
);

router.get(
  '/receipts/:receiptNumber',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'STUDENT', 'PARENT'),
  paymentController.getReceipt
);

module.exports = router;
