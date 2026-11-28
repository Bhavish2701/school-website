const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const reportCardController = require('../controllers/reportCard.controller');

router.get(
  ['/config', '/config-options'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getConfigOptions
);

router.get(
  ['/student/:studentId', '/data/:studentId'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getStudentAcademicData
);

router.get(
  ['/validate', '/validate-class'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.validateClassCohort
);

router.post(
  ['/', '/save', '/generate'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.saveReportCard
);

router.post(
  '/:id/verify',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
  reportCardController.verifyReportCard
);

router.post(
  '/:id/authorize',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  reportCardController.authorizeReportCard
);

router.post(
  '/:id/publish',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  reportCardController.publishReportCard
);

router.get(
  '/history',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getHistory
);

module.exports = router;
