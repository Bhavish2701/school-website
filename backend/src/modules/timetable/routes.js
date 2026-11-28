const express = require('express');
const router = express.Router();
const timetableRoutes = require('../../routes/timetable.routes');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { Teacher } = require('../../models/teacher.model');
const { Timetable } = require('../../models/timetable.model');
const { Substitution } = require('../../models/substitution.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.get(
  '/teacher-allocations',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const filter = { status: 'ACTIVE' };
    if (req.user.role === 'TEACHER') filter.user = req.user._id;
    const teachers = await Teacher.find(filter)
      .select('employeeId fullName specialization assignedClasses timetable')
      .lean();
    const allocations = teachers.map((t) => ({
      teacherId: t._id,
      employeeId: t.employeeId,
      name: t.fullName,
      subject: t.specialization || '',
      weeklyHours: (t.timetable || []).reduce((sum, d) => sum + ((d.periods || []).length), 0),
      classes: (t.assignedClasses || []).map((c) => `${c.class}-${c.section}`),
    }));
    return sendSuccess(res, allocations, 'Teacher allocations retrieved');
  })
);

router.get(
  '/substitutions',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const subs = await Substitution.find({}).sort({ date: -1, periodNumber: 1 }).limit(100).lean();
    return sendSuccess(res, subs, 'Substitutions retrieved');
  })
);

router.get(
  '/room-bookings',
  authenticateUser,
  asyncHandler(async (req, res) => {
    const timetables = await Timetable.find({ isActive: true }).select('class section day periods').lean();
    const rooms = [];
    timetables.forEach((tt) => {
      (tt.periods || []).forEach((p) => {
        if (p.room) {
          rooms.push({ room: p.room, class: `${tt.class}-${tt.section}`, day: tt.day, period: p.periodNumber, subject: p.subject });
        }
      });
    });
    return sendSuccess(res, rooms, 'Room allocations retrieved from active timetables');
  })
);

router.use('/', timetableRoutes);

module.exports = router;
