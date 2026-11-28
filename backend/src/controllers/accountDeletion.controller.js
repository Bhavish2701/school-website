const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { formatSuccess } = require('../utils/apiResponse');
const AccountDeletionRequest = require('../models/accountDeletionRequest.model');
const { User } = require('../models/user.model');
const { AuditLog } = require('../models/auditLog.model');

const requestDeletion = asyncHandler(async (req, res) => {
  const { reason, userId } = req.body;
  if (!reason || reason.trim().length < 5) {
    throw ApiError.badRequest('A clear reason (at least 5 characters) is required for deactivation requests.');
  }

  let targetUserId = req.user._id;
  const isExecutive = ['SUPER_ADMIN', 'PRINCIPAL'].includes(req.user.role);
  if (userId && isExecutive) {
    targetUserId = userId;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user account not found.');
  }

  const existing = await AccountDeletionRequest.findOne({
    userId: targetUser._id,
    status: 'PENDING',
  });
  if (existing) {
    return res.status(200).json(
      formatSuccess(
        existing,
        'A deactivation request for this account is already pending executive review.'
      )
    );
  }

  const deletionRequest = await AccountDeletionRequest.create({
    userId: targetUser._id,
    username: targetUser.username,
    userRole: targetUser.role,
    requestedBy: req.user._id,
    requesterName: req.user.fullName || req.user.username,
    reason: reason.trim(),
    status: 'PENDING',
    statutoryNoticeAcknowledged: true,
    academicRecordsPreserved: true,
    financialRecordsPreserved: true,
  });

  AuditLog.create({
    user: req.user.fullName || req.user.username,
    userId: req.user._id,
    role: req.user.role,
    action: 'DELETION_REQUESTED',
    module: 'AUTH',
    recordReference: targetUser.username,
    reason: `Account deactivation requested: ${reason.trim()}`,
    result: 'SUCCESS',
  }).catch(() => {});

  res.status(201).json(
    formatSuccess(
      {
        requestId: deletionRequest._id,
        status: deletionRequest.status,
        statutoryNotice:
          'Under Andhra Pradesh Education Department regulations, immutable academic evaluation records and official financial receipts are permanently preserved for audit and verification.',
      },
      'Deactivation request submitted successfully. It will be reviewed by the Principal or Platform Administrator.'
    )
  );
});

const listDeletionRequests = asyncHandler(async (req, res) => {
  const requests = await AccountDeletionRequest.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'username fullName role email phone isActive accountStatus')
    .populate('requestedBy', 'username fullName role');

  res.status(200).json(formatSuccess(requests, 'Account deletion requests retrieved.'));
});

const reviewDeletionRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, reviewNotes } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    throw ApiError.badRequest('Decision must be either APPROVED or REJECTED.');
  }

  const request = await AccountDeletionRequest.findById(id);
  if (!request) {
    throw ApiError.notFound('Account deletion request not found.');
  }

  if (request.status !== 'PENDING') {
    throw ApiError.badRequest(`This request has already been ${request.status.toLowerCase()}.`);
  }

  request.status = decision;
  request.reviewedBy = req.user._id;
  request.reviewerName = req.user.fullName || req.user.username;
  request.reviewNotes = reviewNotes || `Decision recorded by ${req.user.role}`;
  request.reviewedAt = new Date();

  if (decision === 'APPROVED') {
    const user = await User.findById(request.userId).select('+refreshToken');
    if (user) {
      user.isActive = false;
      user.accountStatus = 'Deactivated';
      user.refreshToken = undefined;
      user.phone = '+91 00000 00000';
      user.email = `deactivated_${user._id}@srividya.school.local`;
      await user.save({ validateBeforeSave: false });
    }
  }

  await request.save();

  AuditLog.create({
    user: req.user.fullName || req.user.username,
    userId: req.user._id,
    role: req.user.role,
    action: `DELETION_${decision}`,
    module: 'AUTH',
    recordReference: request.username,
    reason: `Deactivation request ${decision}: ${reviewNotes || 'Administrative review completed'}`,
    result: 'SUCCESS',
  }).catch(() => {});

  res.status(200).json(
    formatSuccess(
      request,
      `Deactivation request has been successfully ${decision.toLowerCase()}.`
    )
  );
});

module.exports = {
  requestDeletion,
  listDeletionRequests,
  reviewDeletionRequest,
};
