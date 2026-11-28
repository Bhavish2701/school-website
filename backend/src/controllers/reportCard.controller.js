const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const reportCardService = require('../services/reportCard.service');

const getConfigOptions = asyncHandler(async (req, res) => {
  const data = await reportCardService.getAvailableExams();
  return sendSuccess(res, data, 'Report card configuration options retrieved successfully', 200);
});

const getStudentAcademicData = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { examId } = req.query;
  const data = await reportCardService.retrieveStudentAcademicData(studentId, examId);
  return sendSuccess(res, data, 'Student scholastic data retrieved successfully', 200);
});

const validateClassCohort = asyncHandler(async (req, res) => {
  const { class: className, section, examId } = req.query;
  if (!className) {
    throw ApiError.badRequest('Class parameter is required for validation audit');
  }
  const data = await reportCardService.validateClassData(className, section, examId);
  return sendSuccess(res, data, 'Class cohort validation audit completed successfully', 200);
});

const saveReportCard = asyncHandler(async (req, res) => {
  const report = await reportCardService.saveReportCard(req.body, req.user);
  return sendSuccess(res, { report }, 'Report card draft saved successfully', 201);
});

const verifyReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const report = await reportCardService.verifyReportCard(id, req.user, remarks);
  return sendSuccess(res, { report }, 'Report card academically verified and forwarded for Principal authorization', 200);
});

const authorizeReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, remarks } = req.body;
  if (!decision) {
    throw ApiError.badRequest('Authorization decision (APPROVED, REJECTED, RETURNED) is required');
  }
  const report = await reportCardService.authorizeReportCard(id, req.user, decision, remarks);
  return sendSuccess(res, { report }, `Report card executive decision "${decision}" recorded successfully`, 200);
});

const publishReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await reportCardService.publishReportCard(id, req.user);
  return sendSuccess(res, { report }, 'Report card officially issued and published to institutional registers', 200);
});

const getHistory = asyncHandler(async (req, res) => {
  const data = await reportCardService.getReportCardHistory(req.query);
  return sendSuccess(res, data, 'Report card history register retrieved successfully', 200);
});

module.exports = {
  getConfigOptions,
  getStudentAcademicData,
  validateClassCohort,
  saveReportCard,
  verifyReportCard,
  authorizeReportCard,
  publishReportCard,
  getHistory,
};
