const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { AcademicYear } = require('../../models/academicYear.model');
const { Student } = require('../../models/student.model');
const { Exam, ExamMark } = require('../../models/exam.model');
const { SchoolConfig } = require('../../models/schoolConfig.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'));

router.get(
  '/academic-overview',
  asyncHandler(async (req, res) => {
    const activeAY =
      (req.query.academicYear
        ? await AcademicYear.findOne({ name: req.query.academicYear }).lean()
        : null) ||
      (await AcademicYear.findOne({ isCurrent: true }).lean()) ||
      (await AcademicYear.findOne({}).sort({ startDate: -1 }).lean());
    const ayName = (req.query.academicYear) || (activeAY ? activeAY.name : null);

    const studentFilter = { status: 'ACTIVE', ...(ayName ? { academicYear: ayName } : {}) };
    const [totalActiveStudents, examsCount, passedMarks, totalMarks, distinctSubjects] = await Promise.all([
      Student.countDocuments(studentFilter),
      Exam.countDocuments(ayName ? { academicYear: ayName } : {}),
      ExamMark.countDocuments({ resultStatus: 'PASSED' }),
      ExamMark.countDocuments({}),
      ExamMark.aggregate([
        { $unwind: '$marks' },
        { $group: { _id: '$marks.subjectName', avgPct: { $avg: { $cond: [{ $gt: ['$marks.maxMarks', 0] }, { $multiply: [{ $divide: ['$marks.marksObtained', '$marks.maxMarks'] }, 100] }, 0] } } } },
        { $sort: { avgPct: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const distinctionMarks = await ExamMark.countDocuments({ overallPercentage: { $gte: 75 } });
    const passRate = totalMarks > 0 ? Number(((passedMarks / totalMarks) * 100).toFixed(1)) : null;
    const distinctionRate = totalMarks > 0 ? Number(((distinctionMarks / totalMarks) * 100).toFixed(1)) : null;
    const topSub = distinctSubjects && distinctSubjects[0] ? `${distinctSubjects[0]._id} (${Number(distinctSubjects[0].avgPct || 0).toFixed(1)}%)` : null;

    return sendSuccess(
      res,
      {
        academicYear: ayName,
        averagePassRate: passRate !== null ? `${passRate}%` : null,
        distinctionRate: distinctionRate !== null ? `${distinctionRate}%` : null,
        topSubject: topSub,
        totalStudentsEvaluated: totalMarks,
        totalActiveStudents,
        examsConducted: examsCount,
      },
      'Academic analytics report retrieved'
    );
  })
);

router.get(
  '/compliance',
  asyncHandler(async (req, res) => {
    const config = await SchoolConfig.findOne({}).lean();
    const affiliation = config?.schoolProfile?.affiliation || {};
    return sendSuccess(
      res,
      {
        board: affiliation.board || null,
        affiliationCode: affiliation.affiliationCode || null,
        recognitionNumber: affiliation.recognitionNumber || null,
        udise: affiliation.udise || null,
        status: config?.schoolProfile?.status || null,
      },
      'Statutory compliance details retrieved'
    );
  })
);

module.exports = router;
