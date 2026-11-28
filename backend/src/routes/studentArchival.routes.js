
const express = require('express');
const router = express.Router();
const studentArchivalController = require('../controllers/studentArchival.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.get(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentArchivalController.getArchivalRequests
);

router.post(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentArchivalController.createArchivalRequest
);

router.get(
  '/:id',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentArchivalController.getArchivalRequestById
);

router.put(
  '/:id/clearance/:deptKey',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  studentArchivalController.updateDepartmentClearance
);

router.put(
  '/:id/executive-decision',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentArchivalController.executiveApprovalDecision
);

router.post(
  '/:id/complete',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  studentArchivalController.completeStudentArchival
);

module.exports = router;
