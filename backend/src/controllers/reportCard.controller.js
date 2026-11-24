/**
 * Scholastic Report Card Controller
 * Sri Vidya English Medium High School
 */
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const reportCardService = require('../services/reportCard.service');

/**
 * 1. Get Configuration Options (Exams, Classes, Academic Years)
 */
const getConfigOptions = asyncHandler(async (req, res) => {
  const data = await reportCardService.getAvailableExams();
  return sendSuccess(res, data, 'Report card configuration options retrieved successfully', 200);
});

/**
 * 2. Retrieve Verified Student Academic Data
 */
const getStudentAcademicData = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { examId } = req.query;
  const data = await reportCardService.retrieveStudentAcademicData(studentId, examId);
  return sendSuccess(res, data, 'Student scholastic data retrieved successfully', 200);
});

/**
 * 3. Validate Class/Cohort Readiness & Bulk Exception Breakdown
 */
const validateClassCohort = asyncHandler(async (req, res) => {
  const { class: className, section, examId } = req.query;
  if (!className) {
    throw ApiError.badRequest('Class parameter is required for validation audit');
  }
  const data = await reportCardService.validateClassData(className, section, examId);
  return sendSuccess(res, data, 'Class cohort validation audit completed successfully', 200);
});

/**
 * 4. Save / Create Report Card Draft
 */
const saveReportCard = asyncHandler(async (req, res) => {
  const report = await reportCardService.saveReportCard(req.body, req.user);
  return sendSuccess(res, { report }, 'Report card draft saved successfully', 201);
});

/**
 * 5. Academic Verification by Faculty (Stage 4)
 */
const verifyReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const report = await reportCardService.verifyReportCard(id, req.user, remarks);
  return sendSuccess(res, { report }, 'Report card academically verified and forwarded for Principal authorization', 200);
});

/**
 * 6. Executive Principal Authorization (Stage 5)
 */
const authorizeReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, remarks } = req.body;
  if (!decision) {
    throw ApiError.badRequest('Authorization decision (APPROVED, REJECTED, RETURNED) is required');
  }
  const report = await reportCardService.authorizeReportCard(id, req.user, decision, remarks);
  return sendSuccess(res, { report }, `Report card executive decision "${decision}" recorded successfully`, 200);
});

/**
 * 7. Official Issuance & Publication (Stage 6)
 */
const publishReportCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const report = await reportCardService.publishReportCard(id, req.user);
  return sendSuccess(res, { report }, 'Report card officially issued and published to institutional registers', 200);
});

/**
 * 8. Report Card History & Registry
 */
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
