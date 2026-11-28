const express = require('express');
const router = express.Router();

const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const { verifyParentChildAccess } = require('../middleware/parentChild.middleware');
const {
  validateCreateExam,
  validateCreateSchedule,
  validateEnterMarks,
} = require('../validators/exam.validator');
const examController = require('../controllers/exam.controller');

router.get(
  '/student/me/results',
  authenticateUser,
  authorizeRoles('STUDENT'),
  examController.getStudentOwnResults
);

router.get(
  '/:id/student/me',
  authenticateUser,
  authorizeRoles('STUDENT'),
  examController.getStudentOwnExamResult
);

router.get(
  '/parent/child/:childId/results',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL'),
  verifyParentChildAccess('childId'),
  examController.getChildResults
);

router.get(
  '/:id/parent/child/:childId',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL'),
  verifyParentChildAccess('childId'),
  examController.getChildExamResult
);

router.post(
  '/:id/marks',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateEnterMarks,
  examController.enterMarks
);

router.patch(
  '/marks/:markId/subject',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  examController.modifyMark
);

router.get(
  '/:id/class/:class/:section/dossier',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  examController.getClassMarksDossier
);

router.post(
  '/',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateCreateExam,
  examController.createExam
);

router.put(
  '/:id',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  examController.updateExam
);

router.post(
  '/:id/schedule',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateCreateSchedule,
  examController.createSchedule
);

router.post(
  '/:id/calculate-results',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  examController.calculateResults
);

router.post(
  '/:id/publish',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  examController.publishResults
);

router.get('/', authenticateUser, examController.getExams);

router.get('/:id/schedule', authenticateUser, examController.getExamSchedule);

router.get('/:id', authenticateUser, examController.getExamById);

module.exports = router;
