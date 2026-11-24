/**
 * Fee Controller
 * Handles HTTP endpoints for fee structures, student fee accounts, and pending fee reports
 */
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const feeService = require('../services/fee.service');

/**
 * 1. Create Fee Structure (Management)
 */
const createStructure = asyncHandler(async (req, res) => {
  const structure = await feeService.createFeeStructure(req.body, req.user);
  return sendSuccess(res, { structure }, 'Fee structure created successfully', 201);
});

/**
 * 2. Get Fee Structures
 */
const getStructures = asyncHandler(async (req, res) => {
  const structures = await feeService.getFeeStructures(req.query);
  return sendSuccess(res, { structures }, 'Fee structures retrieved successfully', 200);
});

/**
 * 3. Assign Fee to Student (Management)
 */
const assignFee = asyncHandler(async (req, res) => {
  const fee = await feeService.assignStudentFee(req.body, req.user);
  return sendSuccess(res, { fee }, 'Fee assigned to student successfully', 201);
});

/**
 * 4. Get Student Fees
 */
const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const result = await feeService.getStudentFees(studentId, req.user);
  return sendSuccess(res, result, 'Student fees retrieved successfully', 200);
});

/**
 * 5. Get Pending / Overdue Fees (Management & Office)
 */
const getPendingFees = asyncHandler(async (req, res) => {
  const result = await feeService.getPendingFees(req.query);
  return sendSuccess(res, result, 'Pending fees report retrieved successfully', 200);
});

/**
 * 6. Get Fee Dashboard Overview (Management)
 */
const getFeeDashboardOverview = asyncHandler(async (req, res) => {
  const result = await feeService.getFeeDashboardOverview();
  return sendSuccess(res, result, 'Fee dashboard overview retrieved successfully', 200);
});

/**
 * 7. Send Single Student Fee Reminder via AP-EDUSMS
 */
const sendFeeReminder = asyncHandler(async (req, res) => {
  const result = await feeService.sendFeeReminder(req.body, req.user);
  return sendSuccess(
    res,
    result,
    `Fee payment reminder successfully dispatched to parent ${result.parentName} (${result.parentPhone}) via AP-EDUSMS.`,
    200
  );
});

/**
 * 8. Broadcast Fee Reminders to All Defaulters via AP-EDUSMS
 */
const broadcastFeeReminders = asyncHandler(async (req, res) => {
  const result = await feeService.broadcastFeeReminders(req.user);
  return sendSuccess(
    res,
    result,
    `Fee payment reminder broadcast dispatched to parents of ${result.recipientCount} defaulters via AP-EDUSMS.`,
    200
  );
});

module.exports = {
  createStructure,
  getStructures,
  assignFee,
  getStudentFees,
  getPendingFees,
  getFeeDashboardOverview,
  sendFeeReminder,
  broadcastFeeReminders,
};
