/**
 * Timetable Routes
 */
const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

// Authenticated reads
router.get('/today', authenticateUser, timetableController.getTodayTimetable);
router.get('/substitutions', authenticateUser, timetableController.getSubstitutions);
router.get('/class/:className', authenticateUser, timetableController.getClassTimetable);

// Conflict validation check (for frontend interactive form checks)
router.post(
  '/validate-conflict',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  timetableController.validateConflict
);

// Assignment creation/update (Authorized staff)
router.post(
  '/assign',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  timetableController.assignPeriod
);

// Substitution creation/update (Authorized staff)
router.post(
  '/substitution',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  timetableController.createSubstitution
);

module.exports = router;
