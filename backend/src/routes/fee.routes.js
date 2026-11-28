const express = require('express');
const router = express.Router();

const { authenticateUser, optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const {
  validateCreateFeeStructure,
  validateAssignStudentFee,
} = require('../validators/fee.validator');
const feeController = require('../controllers/fee.controller');

router.post(
  '/structures',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateCreateFeeStructure,
  feeController.createStructure
);

router.get('/structures', authenticateUser, feeController.getStructures);

router.post(
  '/assign',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateAssignStudentFee,
  feeController.assignFee
);

router.get(
  '/pending',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.getPendingFees
);

router.get('/student/:studentId', authenticateUser, feeController.getStudentFees);

router.get(
  '/dashboard-overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.getFeeDashboardOverview
);

router.post(
  '/reminders/send',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.sendFeeReminder
);

router.post(
  '/reminders/broadcast',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.broadcastFeeReminders
);

module.exports = router;
