const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getManagementDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getManagementDashboard(req.user, req.query);
  return sendSuccess(
    res,
    dashboard,
    'School executive management dashboard retrieved successfully',
    200
  );
});

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const requestedTeacherId = req.query.teacherId || null;
  const dashboard = await dashboardService.getTeacherDashboard(req.user, requestedTeacherId);
  return sendSuccess(
    res,
    dashboard,
    'Teacher operational dashboard retrieved successfully',
    200
  );
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const requestedStudentId = req.query.studentId || null;
  const dashboard = await dashboardService.getStudentDashboard(req.user, requestedStudentId);
  return sendSuccess(
    res,
    dashboard,
    'Student academic dashboard retrieved successfully',
    200
  );
});

const getParentDashboard = asyncHandler(async (req, res) => {
  const requestedChildId = req.query.childId || null;
  const dashboard = await dashboardService.getParentDashboard(req.user, requestedChildId);
  return sendSuccess(
    res,
    dashboard,
    'Parent overview dashboard retrieved successfully',
    200
  );
});

const getPlatformDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getPlatformDashboard(req.user, req.query);
  return sendSuccess(
    res,
    dashboard,
    'Multi-tenant platform administration dashboard retrieved successfully',
    200
  );
});

const getManagementTimetable = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getManagementDashboard(req.user, req.query);
  return sendSuccess(res, dashboard.timetable, 'Management timetable retrieved successfully', 200);
});

const getManagementUpcomingExams = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getManagementDashboard(req.user, req.query);
  return sendSuccess(res, dashboard.upcomingExams, 'Management upcoming examinations retrieved successfully', 200);
});

const getManagementFees = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getManagementDashboard(req.user, req.query);
  return sendSuccess(res, dashboard.finances, 'Management fee overview retrieved successfully', 200);
});

module.exports = {
  getManagementDashboard,
  getManagementTimetable,
  getManagementUpcomingExams,
  getManagementFees,
  getTeacherDashboard,
  getStudentDashboard,
  getParentDashboard,
  getPlatformDashboard,
};
