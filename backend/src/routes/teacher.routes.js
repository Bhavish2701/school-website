/**
 * Teacher Module Routes
 *
 * Architecture:
 * Route → Middleware → Controller → Service → Model
 */
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const {
  authenticateUser,
  optionalAuthenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');
const {
  validateCreateTeacher,
  validateUpdateTeacher,
  validateApplyLeave,
  validateReviewLeave,
  validateCreateNotification,
} = require('../validators/teacher.validator');

// 1. Current Teacher Self-Service & Workspace Routes (Restricted to Faculty & Management)
router.get(
  '/me',
  authenticateUser,
  authorizeRoles('TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN'),
  teacherController.getMyProfile
);
router.get(
  '/me/timetable',
  authenticateUser,
  authorizeRoles('TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN'),
  teacherController.getTimetable
);
router.get(
  '/dashboard',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  teacherController.getDashboard
);

// 2. Leave Management Routes (Faculty & Management)
router
  .route('/leaves')
  .get(
    optionalAuthenticateUser,
    teacherController.getLeaves
  )
  .post(
    authenticateUser,
    authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    validateApplyLeave,
    teacherController.applyLeave
  );

router.patch(
  '/leaves/:id/status',
  optionalAuthenticateUser,
  validateReviewLeave,
  teacherController.reviewLeave
);

// 3. Notifications & Announcements Routes
router
  .route('/notifications')
  .get(
    authenticateUser,
    teacherController.getNotifications
  )
  .post(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
    validateCreateNotification,
    teacherController.createNotification
  );

router.patch(
  '/notifications/:id/read',
  authenticateUser,
  authorizeRoles('TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'SUPER_ADMIN'),
  teacherController.markNotificationRead
);

// 4. Timetable Management Routes
router
  .route('/:id/timetable')
  .get(
    authenticateUser,
    authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    teacherController.getTimetable
  )
  .put(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
    teacherController.updateTimetable
  );

// 5. Teacher CRUD Routes
router
  .route('/')
  .get(
    authenticateUser,
    authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    teacherController.getTeachers
  )
  .post(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    validateCreateTeacher,
    teacherController.createTeacher
  );

router
  .route('/:id')
  .get(
    authenticateUser,
    authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
    teacherController.getTeacherById
  )
  .patch(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
    validateUpdateTeacher,
    teacherController.updateTeacher
  )
  .delete(
    authenticateUser,
    authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
    teacherController.deleteTeacher
  );

module.exports = router;
