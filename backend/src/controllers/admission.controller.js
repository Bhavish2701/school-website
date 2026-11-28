const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const admissionService = require('../services/admission.service');

const submitApplication = asyncHandler(async (req, res) => {
  const application = await admissionService.submitApplication(req.body);
  return sendSuccess(
    res,
    {
      applicationNumber: application.applicationNumber,
      studentName: application.studentName,
      applyingClass: application.applyingClass,
      status: application.status,
      application,
    },
    `Application submitted successfully. Your reference number is ${application.applicationNumber}`,
    201
  );
});

const checkStatus = asyncHandler(async (req, res) => {
  const { applicationNumber, phone } = req.query;
  const result = await admissionService.checkApplicationStatus(applicationNumber, phone);
  return sendSuccess(res, result, 'Application status retrieved successfully', 200);
});

const uploadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await admissionService.uploadDocument(id, req.body);
  return sendSuccess(res, { application }, 'Document attached to application successfully', 200);
});

const getApplications = asyncHandler(async (req, res) => {
  const result = await admissionService.getApplications(req.query);
  return sendSuccess(res, result, 'Admissions applications retrieved successfully', 200);
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await admissionService.getApplicationById(req.params.id);
  return sendSuccess(res, { application }, 'Application details retrieved successfully', 200);
});

const updateStatus = asyncHandler(async (req, res) => {
  const application = await admissionService.updateApplicationStatus(req.params.id, req.body, req.user);
  return sendSuccess(
    res,
    { application },
    `Application ${application.applicationNumber} updated to '${application.status}'`,
    200
  );
});

const getStatsOverview = asyncHandler(async (req, res) => {
  const result = await admissionService.getAdmissionStatsOverview();
  return sendSuccess(res, result, 'Admissions dashboard statistics retrieved successfully', 200);
});

const enrollStudent = asyncHandler(async (req, res) => {
  const result = await admissionService.convertToStudent(req.params.id, req.body, req.user);
  return sendSuccess(res, result, result.message, 201);
});

module.exports = {
  submitApplication,
  checkStatus,
  uploadDocument,
  getApplications,
  getApplicationById,
  updateStatus,
  getStatsOverview,
  enrollStudent,
};
