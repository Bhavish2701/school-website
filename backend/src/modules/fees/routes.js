const express = require('express');
const router = express.Router();
const feeRoutes = require('../../routes/fee.routes');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const Fee = require('../../models/fee.model');
const feeService = require('../../services/fee.service');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.get(
  '/pending-dues',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const dues = await Fee.find({ balance: { $gt: 0 } })
      .populate('student', 'fullName admissionNo class section rollNumber parentPhone')
      .sort({ balance: -1 })
      .limit(200)
      .lean();
    return sendSuccess(res, dues, 'Pending dues retrieved');
  })
);

router.get(
  '/concessions',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const concessions = await Fee.find({ discountAmount: { $gt: 0 } })
      .populate('student', 'fullName admissionNo class section')
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return sendSuccess(res, concessions, 'Fee concessions retrieved');
  })
);

router.get(
  '/financial-reports',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const overview = await feeService.getFeeDashboardOverview({
      academicYear: req.query.academicYear,
    });
    return sendSuccess(res, overview, 'Financial summary report retrieved');
  })
);

router.use('/', feeRoutes);

module.exports = router;
