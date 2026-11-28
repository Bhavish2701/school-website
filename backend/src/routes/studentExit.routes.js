const express = require('express');
const router = express.Router();
const studentExitController = require('../controllers/studentExit.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.get(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentExitController.getExitRequests
);
router.post(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentExitController.createExitRequest
);

router.get(
  '/:id',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentExitController.getExitRequestById
);

router.put(
  '/:id/verify-parent',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentExitController.verifyParentRequest
);

router.put(
  '/:id/clearance',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  studentExitController.updateDepartmentClearance
);

router.put(
  '/:id/waiver',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentExitController.requestOrApproveWaiver
);

router.put(
  '/:id/principal-decision',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentExitController.principalDecision
);

router.post(
  '/:id/issue-tc',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentExitController.issueTransferCertificate
);

router.put(
  '/:id/amend-tc',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentExitController.amendTransferCertificate
);

router.post(
  '/:id/complete',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentExitController.completeStudentExit
);

module.exports = router;
