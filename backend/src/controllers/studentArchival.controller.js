
const studentArchivalService = require('../services/studentArchival.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getArchivalRequests = asyncHandler(async (req, res) => {
  const result = await studentArchivalService.getArchivalRequests(req.query, req.query);
  sendSuccess(res, result, 'Student archival records retrieved successfully', 200);
});

const getArchivalRequestById = asyncHandler(async (req, res) => {
  const record = await studentArchivalService.getArchivalRequestById(req.params.id);
  sendSuccess(res, { record }, 'Student archival record retrieved successfully', 200);
});

const createArchivalRequest = asyncHandler(async (req, res) => {
  const record = await studentArchivalService.createArchivalRequest(req.body, req.user);
  sendSuccess(res, { record }, 'Controlled student archival request initiated successfully', 201);
});

const updateDepartmentClearance = asyncHandler(async (req, res) => {
  const { deptKey } = req.params;
  const record = await studentArchivalService.updateDepartmentClearance(req.params.id, deptKey, req.body, req.user);
  sendSuccess(res, { record }, `Department clearance for ${deptKey} updated successfully`, 200);
});

const executiveApprovalDecision = asyncHandler(async (req, res) => {
  const { decision, remarks } = req.body;
  const record = await studentArchivalService.executiveApprovalDecision(req.params.id, decision, remarks, req.user);
  sendSuccess(res, { record }, `Executive approval decision recorded: ${decision}`, 200);
});

const completeStudentArchival = asyncHandler(async (req, res) => {
  const record = await studentArchivalService.completeStudentArchival(req.params.id, req.user);
  sendSuccess(res, { record }, 'Student archival completed successfully. Historical records permanently preserved.', 200);
});

module.exports = {
  getArchivalRequests,
  getArchivalRequestById,
  createArchivalRequest,
  updateDepartmentClearance,
  executiveApprovalDecision,
  completeStudentArchival,
};
