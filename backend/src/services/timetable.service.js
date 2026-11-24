/**
 * Timetable & Substitution Service
 * Business logic for class timetable generation, interval conflict verification,
 * and emergency substitution coordination.
 */
const Timetable = require('../models/timetable.model');
const Substitution = require('../models/substitution.model');
const { ApiError } = require('../utils/apiError');

// Helper to convert "08:50 AM" to minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const meridiem = (match[3] || '').toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

/**
 * Validate scheduling conflict for a proposed assignment
 * Time overlap condition: A.start < B.end && B.start < A.end
 */
async function checkConflict({
  className,
  day,
  startTime,
  endTime,
  teacher,
  room,
  academicYear = '2025-2026',
  excludeId = null,
}) {
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  // Check teacher overlap
  const teacherConflict = await Timetable.findOne({
    _id: { $ne: excludeId },
    academicYear,
    day,
    teacher,
    status: 'ACTIVE',
    startMinutes: { $lt: endMins },
    endMinutes: { $gt: startMins },
  });

  if (teacherConflict) {
    return {
      hasConflict: true,
      conflictType: 'TEACHER',
      message: `Teacher ${teacher} has an overlapping assignment with ${teacherConflict.className} (${teacherConflict.startTime} – ${teacherConflict.endTime}) on ${day}`,
      conflictingRecord: teacherConflict,
    };
  }

  // Check room overlap
  const roomConflict = await Timetable.findOne({
    _id: { $ne: excludeId },
    academicYear,
    day,
    room,
    className: { $ne: className },
    status: 'ACTIVE',
    startMinutes: { $lt: endMins },
    endMinutes: { $gt: startMins },
  });

  if (roomConflict) {
    return {
      hasConflict: true,
      conflictType: 'ROOM',
      message: `Room ${room} is already allocated to ${roomConflict.className} (${roomConflict.startTime} – ${roomConflict.endTime}) on ${day}`,
      conflictingRecord: roomConflict,
    };
  }

  return { hasConflict: false };
}

/**
 * Get full weekly schedule for a specific class
 */
async function getClassTimetable(className, academicYear = '2025-2026') {
  const items = await Timetable.find({
    className,
    academicYear,
    status: 'ACTIVE',
  }).sort({ periodNumber: 1 });

  return items;
}

/**
 * Create or update a timetable assignment with conflict check
 */
async function assignPeriod(data) {
  const {
    className,
    day,
    periodNumber,
    periodName,
    startTime,
    endTime,
    subject,
    teacher,
    room,
    academicYear = '2025-2026',
  } = data;

  const conflictCheck = await checkConflict({
    className,
    day,
    startTime,
    endTime,
    teacher,
    room,
    academicYear,
  });

  if (conflictCheck.hasConflict) {
    throw new ApiError(409, conflictCheck.message, { conflict: conflictCheck });
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  const assignment = await Timetable.findOneAndUpdate(
    { className, day, periodNumber, academicYear },
    {
      ...data,
      startMinutes,
      endMinutes,
      status: 'ACTIVE',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return assignment;
}

/**
 * Get approved timetable for a specific day and class (or all classes for today)
 */
async function getTodayTimetable(day, className = 'Class X-A', academicYear = '2025-2026') {
  const query = {
    day: day === 'Sunday' ? 'Monday' : day,
    academicYear,
    status: 'ACTIVE',
    isBreak: false,
  };
  if (className) query.className = className;

  const periods = await Timetable.find(query).sort({ periodNumber: 1 }).lean();

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const activeSub = await Substitution.findOne({
    date: { $gte: startOfToday, $lte: endOfToday },
    status: 'CONFIRMED',
  }).sort({ createdAt: -1 }).lean();

  return {
    day,
    isSunday: day === 'Sunday',
    className,
    academicYear,
    periods,
    activeSubstitution: activeSub,
  };
}

/**
 * Create or update a substitution
 */
async function createSubstitution(data) {
  const date = data.date ? new Date(data.date) : new Date();
  const dateUtc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const subId = data.substitutionId || `SUB-${date.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const sub = await Substitution.findOneAndUpdate(
    { substitutionId: subId },
    {
      ...data,
      substitutionId: subId,
      date: dateUtc,
      status: data.status || 'CONFIRMED',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return sub;
}

/**
 * Get active substitutions for today or given date
 */
async function getSubstitutions(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

  return Substitution.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ periodNumber: 1 }).lean();
}

module.exports = {
  checkConflict,
  getClassTimetable,
  assignPeriod,
  parseTimeToMinutes,
  getTodayTimetable,
  createSubstitution,
  getSubstitutions,
};
