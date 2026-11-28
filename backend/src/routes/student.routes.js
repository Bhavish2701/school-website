const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const {
  authenticateUser,
  optionalAuthenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');
const {
  validateCreateStudent,
  validateUpdateStudent,
} = require('../validators/student.validator');

router.get(
  '/dashboard/stats',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  studentController.getDashboardStats
);

router
  .route('/')
  .get(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'STUDENT', 'PARENT'),
    studentController.getStudents
  )
  .post(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    validateCreateStudent,
    studentController.createStudent
  );

router
  .route('/:id')
  .get(authenticateUser, studentController.getStudentById)
  .patch(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
    validateUpdateStudent,
    studentController.updateStudent
  )
  .delete(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
    studentController.deleteStudent
  );

router.patch(
  '/documents/:docId/status',
  optionalAuthenticateUser,
  studentController.updateDocumentStatus
);
router.post(
  '/documents/:docId/status',
  optionalAuthenticateUser,
  studentController.updateDocumentStatus
);

module.exports = router;
