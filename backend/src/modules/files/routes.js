const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { SchoolConfig } = require('../../models/schoolConfig.model');
const { authenticateUser } = require('../../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const config = await SchoolConfig.findOne({}).select('documentTemplates').lean();
    const downloadsDir = path.resolve(__dirname, '../../../../frontend/downloads');
    let diskFiles = [];
    if (fs.existsSync(downloadsDir)) {
      diskFiles = fs.readdirSync(downloadsDir).map((name) => {
        const stat = fs.statSync(path.join(downloadsDir, name));
        return {
          name,
          category: 'Downloads',
          sizeBytes: stat.size,
          url: `/downloads/${name}`,
          updatedAt: stat.mtime,
        };
      });
    }
    return sendSuccess(
      res,
      {
        templates: config?.documentTemplates || [],
        downloads: diskFiles,
      },
      'Documents retrieved'
    );
  })
);

module.exports = router;
