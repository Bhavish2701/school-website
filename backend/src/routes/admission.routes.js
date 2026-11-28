const express = require('express');
const router = express.Router();

const { authenticateUser, optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const {
  validateSubmitApplication,
  validateCheckStatus,
  validateUpdateStatus,
  validateUploadDocument,
} = require('../validators/admission.validator');
const admissionController = require('../controllers/admission.controller');

router.post(
  '/apply',
  validateSubmitApplication,
  admissionController.submitApplication
);

router.get(
  '/status',
  validateCheckStatus,
  admissionController.checkStatus
);

router.post(
  '/:id/documents',
  validateUploadDocument,
  admissionController.uploadDocument
);

router.get(
  '/overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  admissionController.getStatsOverview
);

router.get(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  admissionController.getApplications
);

router.get(
  '/:id',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  admissionController.getApplicationById
);

router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateUpdateStatus,
  admissionController.updateStatus
);

router.post(
  '/:id/enroll',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  admissionController.enrollStudent
);

module.exports = router;
