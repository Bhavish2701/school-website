const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const { SchoolEvent } = require('../models/event.model');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const events = await SchoolEvent.find(filter).sort({ startDate: 1 }).limit(100).lean();
    return sendSuccess(res, { events, total: events.length }, 'School events retrieved');
  })
);

router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const { title, startDate } = req.body;
    if (!title || !startDate) {
      throw new ApiError(422, 'title and startDate are required');
    }
    const event = await SchoolEvent.create({
      title,
      category: req.body.category || 'Academic',
      startDate: new Date(startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : new Date(startDate),
      startTime: req.body.startTime || '',
      endTime: req.body.endTime || '',
      venue: req.body.venue || 'Main Campus',
      organizer: req.body.organizer || req.user.fullName || 'Management',
      targetAudience: req.body.targetAudience || 'All Students & Staff',
      description: req.body.description || '',
      status: req.body.status || 'UPCOMING',
      academicYear: req.body.academicYear || '2026-2027',
      createdBy: req.user._id,
    });
    return sendSuccess(res, event, 'School event scheduled', 201);
  })
);

router.patch(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const doc = await SchoolEvent.findById(req.params.id);
    if (!doc) throw new ApiError(404, 'Event not found');
    const allowed = ['title', 'category', 'startDate', 'endDate', 'startTime', 'endTime', 'venue', 'organizer', 'targetAudience', 'description', 'status'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    });
    await doc.save();
    return sendSuccess(res, doc, 'School event updated');
  })
);

router.delete(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  asyncHandler(async (req, res) => {
    const doc = await SchoolEvent.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Event not found');
    return sendSuccess(res, doc, 'School event removed');
  })
);

module.exports = router;

