/**
 * Student Portal Express Router
 * Specification 20.1:
 * "Students should be able to see their own information and perform only permitted actions."
 *
 * Enforces:
 * - Authentication (JWT)
 * - Role Authorization: STUDENT (Super admin and Principal may also preview)
 * - Object-Level tenant isolation
 */
const express = require('express');
const router = express.Router();
const studentPortalController = require('../controllers/studentPortal.controller');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');

// Protect all Student Portal endpoints
router.use(authenticateUser);
router.use(authorizeRoles('STUDENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

// 1. Dashboard
router.get('/dashboard', studentPortalController.getDashboard);

// 2. Profile
router.get('/profile', studentPortalController.getProfile);

// 3. Classes
router.get('/classes', studentPortalController.getMyClasses);

// 4. Timetable
router.get('/timetable', studentPortalController.getTimetable);

// 5. Attendance (Read-only verified records)
router.get('/attendance', studentPortalController.getAttendance);

// 6. Assignments
router.get('/assignments', studentPortalController.getAssignments);
router.post('/assignments/:id/submit', studentPortalController.submitAssignment);

// 7. Study Materials
router.get('/study-materials', studentPortalController.getStudyMaterials);

// 8. Examination Schedule
router.get('/exam-schedule', studentPortalController.getExamSchedule);

// 9. Published Results (STRICTLY PUBLISHED ONLY)
router.get('/results', studentPortalController.getPublishedResults);

// 10. School Notices
router.get('/notices', studentPortalController.getNotices);

// 11. Events
router.get('/events', studentPortalController.getEvents);

// 12. Library (If implemented)
router.get('/library', studentPortalController.getLibrary);

// 13. Transport (If applicable)
router.get('/transport', studentPortalController.getTransport);

// 14. Help & Support
router.get('/help-support', studentPortalController.getHelpSupport);
router.post('/help-support', studentPortalController.submitHelpSupportQuery);

module.exports = router;
