/**
 * Fee Management Express Router
 */
const express = require('express');
const router = express.Router();

const { authenticateUser, optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const {
  validateCreateFeeStructure,
  validateAssignStudentFee,
} = require('../validators/fee.validator');
const feeController = require('../controllers/fee.controller');

// 1. Fee Structures (Management)
router.post(
  '/structures',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateCreateFeeStructure,
  feeController.createStructure
);

router.get('/structures', authenticateUser, feeController.getStructures);

// 2. Assign Fee to Student (Management)
router.post(
  '/assign',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateAssignStudentFee,
  feeController.assignFee
);

// 3. Pending & Overdue Fees Report (Management & Office)
router.get(
  '/pending',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.getPendingFees
);

// 4. Student Specific Fee Records
router.get('/student/:studentId', authenticateUser, feeController.getStudentFees);

// 5. Dashboard Fee Overview (Management)
router.get(
  '/dashboard-overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.getFeeDashboardOverview
);

// 6. Send Single Student Fee Reminder
router.post(
  '/reminders/send',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.sendFeeReminder
);

// 7. Broadcast Fee Reminders
router.post(
  '/reminders/broadcast',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  feeController.broadcastFeeReminders
);

module.exports = router;
