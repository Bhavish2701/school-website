const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { Institution } = require('../../models/institution.model');
const { SchoolConfig } = require('../../models/schoolConfig.model');
const { Student } = require('../../models/student.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const [config, institution, activeStrength] = await Promise.all([
      SchoolConfig.findOne({}).lean(),
      Institution.findOne({ status: { $ne: 'Archived' } }).lean(),
      Student.countDocuments({ status: 'ACTIVE' }),
    ]);
    return sendSuccess(
      res,
      {
        schoolConfig: config?.schoolProfile || null,
        academicConfiguration: config?.academicConfiguration || null,
        institution: institution || null,
        currentStrength: activeStrength,
      },
      'Institution profile retrieved from database'
    );
  })
);

router.get(
  '/branches',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const institutions = await Institution.find({ status: { $ne: 'Archived' } })
      .select('institutionId name code board category address contact status')
      .lean();
    return sendSuccess(res, institutions, 'Branches retrieved from database');
  })
);

module.exports = router;
