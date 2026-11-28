const express = require('express');
const router = express.Router();

const { authenticateUser, optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const { verifyParentChildAccess } = require('../middleware/parentChild.middleware');
const {
  validateMarkAttendance,
  validateUpdateRecord,
} = require('../validators/attendance.validator');
const attendanceController = require('../controllers/attendance.controller');

router.get(
  '/teacher/classes',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  attendanceController.getTeacherClasses
);

router.get(
  '/classes/:class/:section/students',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getClassStudents
);

router.post(
  '/mark',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateMarkAttendance,
  attendanceController.markAttendance
);

router.post(
  '/reopen',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.reopenRegister
);

router.post(
  '/corrections',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.submitCorrection
);

router.patch(
  '/records/:id',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  validateUpdateRecord,
  attendanceController.updateRecord
);

router.get(
  '/history',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getHistory
);

router.get(
  '/student/me',
  authenticateUser,
  authorizeRoles('STUDENT'),
  attendanceController.getStudentSummary
);

router.get(
  '/student/me/daily',
  authenticateUser,
  authorizeRoles('STUDENT'),
  attendanceController.getStudentDaily
);

router.get(
  '/student/me/monthly',
  authenticateUser,
  authorizeRoles('STUDENT'),
  attendanceController.getStudentMonthly
);

router.get(
  '/parent/child/:childId',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL'),
  verifyParentChildAccess('childId'),
  attendanceController.getChildSummary
);

router.get(
  '/parent/child/:childId/daily',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL'),
  verifyParentChildAccess('childId'),
  attendanceController.getChildDaily
);

router.get(
  '/parent/child/:childId/monthly',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL'),
  verifyParentChildAccess('childId'),
  attendanceController.getChildMonthly
);

router.get(
  '/management/absentees',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getTodayAbsentees
);

router.get(
  '/management/overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getManagementOverview
);

router.get(
  '/management/class/:class/:section',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getManagementClassAttendance
);

router.get(
  '/management/reports',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.getManagementReports
);

router.post(
  '/absentees/dispatch',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.dispatchAbsenteeNotifications
);

router.post(
  '/absentees/:admNo/resend',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  attendanceController.resendAbsenteeNotification
);

module.exports = router;
