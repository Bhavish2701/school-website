/**
 * Student Portal HTTP Controller
 * Dispatches requests to StudentPortalService and formats uniform responses.
 */
const studentPortalService = require('../services/studentPortal.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. Dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getDashboard(req.user);
  sendSuccess(res, data, 'Student dashboard retrieved successfully', 200);
});

// 2. Profile
const getProfile = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getProfile(req.user);
  sendSuccess(res, data, 'Student profile retrieved successfully', 200);
});

// 3. Classes
const getMyClasses = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getMyClasses(req.user);
  sendSuccess(res, data, 'Student classes and roster retrieved successfully', 200);
});

// 4. Timetable
const getTimetable = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getTimetable(req.user);
  sendSuccess(res, data, 'Student weekly timetable retrieved successfully', 200);
});

// 5. Attendance
const getAttendance = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getAttendance(req.user);
  sendSuccess(res, data, 'Verified student attendance retrieved successfully', 200);
});

// 6. Assignments
const getAssignments = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getAssignments(req.user);
  sendSuccess(res, data, 'Student assignments retrieved successfully', 200);
});

// 7. Submit Assignment
const submitAssignment = asyncHandler(async (req, res) => {
  const data = await studentPortalService.submitAssignment(req.user, req.params.id, req.body);
  sendSuccess(res, data, 'Assignment submitted successfully', 201);
});

// 8. Study Materials
const getStudyMaterials = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getStudyMaterials(req.user);
  sendSuccess(res, data, 'Study materials and syllabus retrieved successfully', 200);
});

// 9. Examination Schedule
const getExamSchedule = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getExamSchedule(req.user);
  sendSuccess(res, data, 'Examination schedule retrieved successfully', 200);
});

// 10. Published Results
const getPublishedResults = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getPublishedResults(req.user);
  sendSuccess(res, data, 'Official published results retrieved successfully', 200);
});

// 11. School Notices
const getNotices = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getNotices(req.user);
  sendSuccess(res, data, 'School notices retrieved successfully', 200);
});

// 12. Events
const getEvents = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getEvents(req.user);
  sendSuccess(res, data, 'School events retrieved successfully', 200);
});

// 13. Library
const getLibrary = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getLibrary(req.user);
  sendSuccess(res, data, 'Library account details retrieved successfully', 200);
});

// 14. Transport
const getTransport = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getTransport(req.user);
  sendSuccess(res, data, 'Transport details retrieved successfully', 200);
});

// 15. Help & Support
const getHelpSupport = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getHelpSupport(req.user);
  sendSuccess(res, data, 'Help & Support FAQs retrieved successfully', 200);
});

// 16. Submit Support Ticket
const submitHelpSupportQuery = asyncHandler(async (req, res) => {
  const data = await studentPortalService.submitHelpSupportQuery(req.user, req.body);
  sendSuccess(res, data, 'Support ticket submitted successfully', 201);
});

module.exports = {
  getDashboard,
  getProfile,
  getMyClasses,
  getTimetable,
  getAttendance,
  getAssignments,
  submitAssignment,
  getStudyMaterials,
  getExamSchedule,
  getPublishedResults,
  getNotices,
  getEvents,
  getLibrary,
  getTransport,
  getHelpSupport,
  submitHelpSupportQuery,
};
