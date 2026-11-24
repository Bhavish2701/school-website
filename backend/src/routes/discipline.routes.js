const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const { DisciplineIncident } = require('../models/discipline.model');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.class) filter.class = req.query.class;
    if (req.user.role === 'TEACHER') {
      const assigned = Array.isArray(req.user.assignedClasses) ? req.user.assignedClasses : [];
      if (assigned.length === 0) {
        return sendSuccess(res, { incidents: [], summary: { total: 0, open: 0, resolved: 0 } }, 'No discipline records in scope');
      }
      filter.$or = assigned.map((c) => ({ class: c.class, section: c.section }));
    }
    const incidents = await DisciplineIncident.find(filter).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    const summary = {
      total: incidents.length,
      open: incidents.filter((i) => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length,
      escalated: incidents.filter((i) => i.status === 'ESCALATED').length,
      resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
    };
    return sendSuccess(res, { incidents, summary }, 'Discipline records retrieved');
  })
);

router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const { studentName, class: cls, section, description } = req.body;
    if (!studentName || !cls || !description) {
      throw new ApiError(422, 'studentName, class, and description are required');
    }
    const doc = await DisciplineIncident.create({
      student: req.body.studentId || null,
      admissionNo: req.body.admissionNo || '',
      studentName,
      class: cls,
      section: section || 'A',
      academicYear: req.body.academicYear || '2026-2027',
      date: req.body.date ? new Date(req.body.date) : new Date(),
      category: req.body.category || 'Classroom Conduct',
      severity: req.body.severity || 'LOW',
      description,
      actionTaken: req.body.actionTaken || '',
      reportedBy: req.user.fullName || req.user.username,
      reportedByUser: req.user._id,
      parentNotified: Boolean(req.body.parentNotified),
      status: req.body.status || 'OPEN',
    });
    return sendSuccess(res, doc, 'Discipline incident recorded', 201);
  })
);

router.patch(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  asyncHandler(async (req, res) => {
    const doc = await DisciplineIncident.findById(req.params.id);
    if (!doc) throw new ApiError(404, 'Discipline incident not found');
    const allowed = ['status', 'actionTaken', 'severity', 'parentNotified', 'category', 'description'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) doc[f] = req.body[f];
    });
    if (req.body.status === 'RESOLVED') {
      doc.resolvedBy = req.user.fullName || req.user.username;
      doc.resolvedAt = new Date();
    }
    await doc.save();
    return sendSuccess(res, doc, 'Discipline incident updated');
  })
);

module.exports = router;

