/**
 * Scholastic Report Card Express Router
 * Sri Vidya English Medium High School
 */
const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const reportCardController = require('../controllers/reportCard.controller');

// 1. Configuration & Options (Authenticated Staff & Management)
router.get(
  ['/config', '/config-options'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getConfigOptions
);

// 2. Retrieve Student Scholastic Data
router.get(
  ['/student/:studentId', '/data/:studentId'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getStudentAcademicData
);

// 3. Class Cohort Validation & Bulk Exception Audit
router.get(
  ['/validate', '/validate-class'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.validateClassCohort
);

// 4. Save Report Card Draft
router.post(
  ['/', '/save', '/generate'],
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.saveReportCard
);

// 5. Academic Verification by Faculty (Stage 4)
router.post(
  '/:id/verify',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
  reportCardController.verifyReportCard
);

// 6. Principal Executive Authorization (Stage 5)
router.post(
  '/:id/authorize',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  reportCardController.authorizeReportCard
);

// 7. Official Issuance & Publication (Stage 6)
router.post(
  '/:id/publish',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  reportCardController.publishReportCard
);

// 8. Report Card History & Registry
router.get(
  '/history',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  reportCardController.getHistory
);

module.exports = router;
