const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { sendSuccess } = require('../../utils/apiResponse');
const { Appointment } = require('../../models/appointment.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'PARENT'),
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'PARENT') {
      filter.createdBy = req.user._id;
    } else if (req.user.role === 'TEACHER') {
      filter.$or = [
        { createdBy: req.user._id },
        { facultyName: new RegExp(req.user.fullName || req.user.username, 'i') },
      ];
    }
    const appointments = await Appointment.find(filter).sort({ date: 1, createdAt: -1 }).limit(100).lean();
    return sendSuccess(res, appointments, 'Appointments retrieved successfully');
  })
);

router.post(
  '/book',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'PARENT'),
  asyncHandler(async (req, res) => {
    const { parentName, facultyName, date, time, agenda } = req.body;
    if (!parentName || !facultyName || !date || !time || !agenda) {
      throw new ApiError(422, 'parentName, facultyName, date, time, and agenda are required');
    }
    const isMgmt = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'].includes(req.user.role);
    const created = await Appointment.create({
      parentName,
      parentPhone: req.body.parentPhone || '',
      studentName: req.body.studentName || '',
      admissionNo: req.body.admissionNo || '',
      facultyName,
      hostRole: req.body.hostRole || 'Principal',
      date: new Date(date),
      time,
      agenda,
      status: isMgmt ? (req.body.status || 'CONFIRMED') : 'PENDING_APPROVAL',
      notes: req.body.notes || '',
      academicYear: req.body.academicYear || '2026-2027',
      createdBy: req.user._id,
    });
    return sendSuccess(res, created, 'Appointment booked successfully', 201);
  })
);

router.patch(
  '/:id/status',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const doc = await Appointment.findById(req.params.id);
    if (!doc) throw new ApiError(404, 'Appointment not found');
    doc.status = req.body.status || doc.status;
    if (req.body.notes !== undefined) doc.notes = req.body.notes;
    if (req.body.date) doc.date = new Date(req.body.date);
    if (req.body.time) doc.time = req.body.time;
    await doc.save();
    return sendSuccess(res, doc, 'Appointment status updated');
  })
);

module.exports = router;
