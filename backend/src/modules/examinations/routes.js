const express = require('express');
const router = express.Router();
const examRoutes = require('../../routes/exam.routes');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { Exam } = require('../../models/exam.model');
const { ReportCard } = require('../../models/reportCard.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.get(
  '/schedules',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const exams = await Exam.find(filter)
      .select('name examType academicYear startDate endDate status applicableClasses timetable')
      .sort({ startDate: 1 })
      .lean();
    return sendSuccess(res, exams, 'Exam schedules retrieved');
  })
);

router.get(
  '/moderation',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const exams = await Exam.find({})
      .select('name academicYear status updatedAt')
      .sort({ updatedAt: -1 })
      .lean();
    return sendSuccess(res, exams, 'Moderation status retrieved');
  })
);

router.get(
  '/publications',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const [publishedExams, publishedCards] = await Promise.all([
      Exam.find({ status: 'RESULTS_PUBLISHED' }).select('name academicYear updatedAt status').lean(),
      ReportCard.countDocuments({ status: 'PUBLISHED' }),
    ]);
    return sendSuccess(res, { publishedExams, publishedReportCardsCount: publishedCards }, 'Result publications retrieved');
  })
);

// Base exam routes
router.use('/', examRoutes);

module.exports = router;
