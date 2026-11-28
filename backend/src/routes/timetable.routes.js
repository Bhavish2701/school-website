const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.get('/today', authenticateUser, timetableController.getTodayTimetable);
router.get('/substitutions', authenticateUser, timetableController.getSubstitutions);
router.get('/class/:className', authenticateUser, timetableController.getClassTimetable);

router.post(
  '/validate-conflict',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  timetableController.validateConflict
);

router.post(
  '/assign',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  timetableController.assignPeriod
);

router.post(
  '/substitution',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  timetableController.createSubstitution
);

module.exports = router;
