/**
 * Timetable Controller
 * REST handlers for timetable inspection, conflict validation, and assignments.
 */
const timetableService = require('../services/timetable.service');
const { formatSuccess, formatError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getClassTimetable = asyncHandler(async (req, res) => {
  const { className } = req.params;
  const { academicYear } = req.query;

  const timetable = await timetableService.getClassTimetable(className, academicYear);

  return res.status(200).json(
    formatSuccess({
      className,
      totalPeriods: timetable.length,
      schedule: timetable,
    }, `Retrieved timetable for ${className}`)
  );
});

const validateConflict = asyncHandler(async (req, res) => {
  const result = await timetableService.checkConflict(req.body);

  if (result.hasConflict) {
    return res.status(409).json(
      formatError(result.message, 409, { conflict: result })
    );
  }

  return res.status(200).json(
    formatSuccess({ hasConflict: false }, 'No scheduling conflict detected. Allocation is valid.')
  );
});

const assignPeriod = asyncHandler(async (req, res) => {
  const assignment = await timetableService.assignPeriod(req.body);

  return res.status(201).json(
    formatSuccess(assignment, 'Timetable period successfully assigned.')
  );
});

const getTodayTimetable = asyncHandler(async (req, res) => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = req.query.day || days[now.getDay()];
  const className = req.query.className || 'Class X-A';
  const academicYear = req.query.academicYear || '2025-2026';

  const timetable = await timetableService.getTodayTimetable(day, className, academicYear);

  return res.status(200).json(
    formatSuccess(timetable, `Retrieved today's timetable for ${day}`)
  );
});

const createSubstitution = asyncHandler(async (req, res) => {
  const substitution = await timetableService.createSubstitution(req.body);

  return res.status(201).json(
    formatSuccess(substitution, 'Teacher substitution created/updated successfully.')
  );
});

const getSubstitutions = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const list = await timetableService.getSubstitutions(date);

  return res.status(200).json(
    formatSuccess(list, 'Retrieved active substitutions')
  );
});

module.exports = {
  getClassTimetable,
  validateConflict,
  assignPeriod,
  getTodayTimetable,
  createSubstitution,
  getSubstitutions,
};
