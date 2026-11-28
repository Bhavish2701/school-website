const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic.controller');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');
const {
  validateCreateAcademicYear,
  validateCreateClass,
  validateCreateSubject,
  validateAssignTeacher,
  validateCreateAssignment,
} = require('../validators/academic.validator');

router.use(authenticateUser);

router.get('/dashboard', academicController.getAcademicDashboard);

router
  .route('/years')
  .get(academicController.getAcademicYears)
  .post(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
    validateCreateAcademicYear,
    academicController.createAcademicYear
  );

router.patch(
  '/years/:id/set-current',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  academicController.setCurrentYear
);

router
  .route('/classes')
  .get(academicController.getClasses)
  .post(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    validateCreateClass,
    academicController.createClass
  );

router
  .route('/classes/:id')
  .get(academicController.getClassById)
  .patch(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    academicController.updateClass
  );

router.post(
  '/classes/:id/assign-teacher',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  validateAssignTeacher,
  academicController.assignTeacher
);

router
  .route('/subjects')
  .get(academicController.getSubjects)
  .post(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    validateCreateSubject,
    academicController.createSubject
  );

router
  .route('/subjects/:id')
  .patch(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
    academicController.updateSubject
  )
  .delete(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
    academicController.deleteSubject
  );

router
  .route('/assignments')
  .get(academicController.getAssignments)
  .post(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
    validateCreateAssignment,
    academicController.createAssignment
  );

router
  .route('/assignments/:id')
  .get(academicController.getAssignmentById)
  .patch(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
    academicController.updateAssignment
  )
  .delete(
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'TEACHER'),
    academicController.deleteAssignment
  );

module.exports = router;
