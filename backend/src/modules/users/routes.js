const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { sendSuccess } = require('../../utils/apiResponse');
const { User } = require('../../models/user.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = String(req.query.role).toUpperCase();
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const users = await User.find(filter)
      .select('username email fullName role phone isActive assignedClasses createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return sendSuccess(res, users, 'Users retrieved successfully');
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('username email fullName role phone isActive assignedClasses studentProfile createdAt')
      .lean();
    if (!user) throw new ApiError(404, 'User not found');
    return sendSuccess(res, user, 'User details retrieved');
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (req.body.isActive !== undefined) user.isActive = Boolean(req.body.isActive);
    else if (req.body.status) user.isActive = req.body.status === 'ACTIVE';
    await user.save({ validateBeforeSave: false });
    return sendSuccess(
      res,
      { id: user._id, username: user.username, role: user.role, isActive: user.isActive },
      'User status updated'
    );
  })
);

module.exports = router;
