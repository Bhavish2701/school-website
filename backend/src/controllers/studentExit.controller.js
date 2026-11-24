/**
 * Student Exit & Transfer Certificate Controller
 */
const studentExitService = require('../services/studentExit.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getExitRequests = asyncHandler(async (req, res) => {
  const records = await studentExitService.getExitRequests(req.query);
  sendSuccess(res, { records, count: records.length }, 'Exit records retrieved successfully', 200);
});

const getExitRequestById = asyncHandler(async (req, res) => {
  const record = await studentExitService.getExitRequestById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Exit record not found' });
  }
  sendSuccess(res, { record }, 'Exit record details retrieved', 200);
});

const createExitRequest = asyncHandler(async (req, res) => {
  const record = await studentExitService.createExitRequest(req.body, req.user);
  sendSuccess(res, { record }, 'Student exit request initiated successfully', 201);
});

const verifyParentRequest = asyncHandler(async (req, res) => {
  const record = await studentExitService.verifyParentRequest(req.params.id, req.body, req.user);
  sendSuccess(res, { record }, 'Parent request verification updated', 200);
});

const updateDepartmentClearance = asyncHandler(async (req, res) => {
  const { deptKey, ...clearanceData } = req.body;
  const record = await studentExitService.updateDepartmentClearance(req.params.id, deptKey, clearanceData, req.user);
  sendSuccess(res, { record }, `${deptKey} clearance updated successfully`, 200);
});

const requestOrApproveWaiver = asyncHandler(async (req, res) => {
  const record = await studentExitService.requestOrApproveWaiver(req.params.id, req.body, req.user);
  sendSuccess(res, { record }, 'Fee waiver status updated', 200);
});

const principalDecision = asyncHandler(async (req, res) => {
  const record = await studentExitService.principalDecision(req.params.id, req.body, req.user);
  sendSuccess(res, { record }, 'Principal decision recorded successfully', 200);
});

const issueTransferCertificate = asyncHandler(async (req, res) => {
  const record = await studentExitService.issueTransferCertificate(req.params.id, req.body, req.user);
  sendSuccess(res, { record }, 'Transfer Certificate generated successfully', 200);
});

const amendTransferCertificate = asyncHandler(async (req, res) => {
  const record = await studentExitService.amendTransferCertificate(req.params.id, req.body, req.user);
  sendSuccess(res, { record }, 'Transfer Certificate amended successfully with statutory audit trail', 200);
});

const completeStudentExit = asyncHandler(async (req, res) => {
  const record = await studentExitService.completeStudentExit(req.params.id, req.user);
  sendSuccess(res, { record }, 'Student exit process completed and archived with zero deletion', 200);
});

module.exports = {
  getExitRequests,
  getExitRequestById,
  createExitRequest,
  verifyParentRequest,
  updateDepartmentClearance,
  requestOrApproveWaiver,
  principalDecision,
  issueTransferCertificate,
  amendTransferCertificate,
  completeStudentExit
};
