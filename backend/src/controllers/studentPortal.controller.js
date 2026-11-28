const studentPortalService = require('../services/studentPortal.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getDashboard(req.user);
  sendSuccess(res, data, 'Student dashboard retrieved successfully', 200);
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getProfile(req.user);
  sendSuccess(res, data, 'Student profile retrieved successfully', 200);
});

const getMyClasses = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getMyClasses(req.user);
  sendSuccess(res, data, 'Student classes and roster retrieved successfully', 200);
});

const getTimetable = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getTimetable(req.user);
  sendSuccess(res, data, 'Student weekly timetable retrieved successfully', 200);
});

const getAttendance = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getAttendance(req.user);
  sendSuccess(res, data, 'Verified student attendance retrieved successfully', 200);
});

const getAssignments = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getAssignments(req.user);
  sendSuccess(res, data, 'Student assignments retrieved successfully', 200);
});

const submitAssignment = asyncHandler(async (req, res) => {
  const data = await studentPortalService.submitAssignment(req.user, req.params.id, req.body);
  sendSuccess(res, data, 'Assignment submitted successfully', 201);
});

const getStudyMaterials = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getStudyMaterials(req.user);
  sendSuccess(res, data, 'Study materials and syllabus retrieved successfully', 200);
});

const getExamSchedule = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getExamSchedule(req.user);
  sendSuccess(res, data, 'Examination schedule retrieved successfully', 200);
});

const getPublishedResults = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getPublishedResults(req.user);
  sendSuccess(res, data, 'Official published results retrieved successfully', 200);
});

const getNotices = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getNotices(req.user);
  sendSuccess(res, data, 'School notices retrieved successfully', 200);
});

const getEvents = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getEvents(req.user);
  sendSuccess(res, data, 'School events retrieved successfully', 200);
});

const getLibrary = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getLibrary(req.user);
  sendSuccess(res, data, 'Library account details retrieved successfully', 200);
});

const getTransport = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getTransport(req.user);
  sendSuccess(res, data, 'Transport details retrieved successfully', 200);
});

const getHelpSupport = asyncHandler(async (req, res) => {
  const data = await studentPortalService.getHelpSupport(req.user);
  sendSuccess(res, data, 'Help & Support FAQs retrieved successfully', 200);
});

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

