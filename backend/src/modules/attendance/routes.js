const express = require('express');
const router = express.Router();
const attendanceRoutes = require('../../routes/attendance.routes');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { sendSuccess } = require('../../utils/apiResponse');
const { AttendanceRecord, AttendanceRegister } = require('../../models/attendance.model');
const CorrectionRequest = require('../../models/correctionRequest.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');
const attendanceService = require('../../services/attendance.service');

router.get(
  '/late-arrivals',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(targetDate); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setUTCHours(23, 59, 59, 999);
    const records = await AttendanceRecord.find({
      date: { $gte: start, $lte: end },
      status: 'LATE',
    })
      .populate('student', 'fullName admissionNo rollNumber class section')
      .lean();
    return sendSuccess(res, records, 'Late arrivals retrieved');
  })
);

router.get(
  '/absences',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(targetDate); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(targetDate); end.setUTCHours(23, 59, 59, 999);
    const records = await AttendanceRecord.find({
      date: { $gte: start, $lte: end },
      status: { $in: ['ABSENT', 'LEAVE', 'EXCUSED'] },
    })
      .populate('student', 'fullName admissionNo rollNumber class section')
      .lean();
    return sendSuccess(res, records, 'Absences records retrieved');
  })
);

router.get(
  '/corrections',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const filter = { module: 'ATTENDANCE' };
    if (req.query.status) filter.status = req.query.status;
    const docs = await CorrectionRequest.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return sendSuccess(res, docs, 'Attendance corrections retrieved');
  })
);

router.post(
  '/corrections',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'PARENT'),
  asyncHandler(async (req, res) => {
    if (!req.body.recordId || !req.body.newStatus || !req.body.reason) {
      throw new ApiError(422, 'recordId, newStatus, and reason are required');
    }
    const created = await attendanceService.submitAttendanceCorrection(
      req.body.recordId,
      req.body.newStatus,
      req.body.reason,
      req.user
    );
    return sendSuccess(res, created, 'Attendance correction submitted', 201);
  })
);

router.get(
  '/summaries',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const overview = await attendanceService.getManagementSchoolOverview(req.query.date);
    return sendSuccess(res, overview, 'Attendance summary retrieved');
  })
);

router.use('/', attendanceRoutes);

module.exports = router;
