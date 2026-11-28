const express = require('express');
const router = express.Router();
const studentPortalController = require('../controllers/studentPortal.controller');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');

router.use(authenticateUser);
router.use(authorizeRoles('STUDENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'));

router.get('/dashboard', studentPortalController.getDashboard);

router.get('/profile', studentPortalController.getProfile);

router.get('/classes', studentPortalController.getMyClasses);

router.get('/timetable', studentPortalController.getTimetable);

router.get('/attendance', studentPortalController.getAttendance);

router.get('/assignments', studentPortalController.getAssignments);
router.post('/assignments/:id/submit', studentPortalController.submitAssignment);

router.get('/study-materials', studentPortalController.getStudyMaterials);

router.get('/exam-schedule', studentPortalController.getExamSchedule);

router.get('/results', studentPortalController.getPublishedResults);

router.get('/notices', studentPortalController.getNotices);

router.get('/events', studentPortalController.getEvents);

router.get('/library', studentPortalController.getLibrary);

router.get('/transport', studentPortalController.getTransport);

router.get('/help-support', studentPortalController.getHelpSupport);
router.post('/help-support', studentPortalController.submitHelpSupportQuery);

module.exports = router;

