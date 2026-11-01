/**
 * Attendance Mongoose Model
 *
 * Implements:
 * 1. AttendanceRecord - Individual student daily attendance with compound unique index { student: 1, date: 1 }
 * 2. AttendanceRegister - Classroom daily session summary with compound unique index { class: 1, section: 1, date: 1 }
 */
const mongoose = require('mongoose');

const ATTENDANCE_STATUS = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED'];
const ATTENDANCE_SESSIONS = ['FULL_DAY', 'MORNING', 'AFTERNOON'];
const REGISTER_STATUS = ['SUBMITTED', 'DRAFT', 'REOPENED'];

/**
 * Attendance Record Schema (Per Student Per Date)
 */
const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ATTENDANCE_STATUS,
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'PRESENT',
      index: true,
    },
    session: {
      type: String,
      enum: {
        values: ATTENDANCE_SESSIONS,
        message: '{VALUE} is not a valid attendance session',
      },
      default: 'FULL_DAY',
      index: true,
    },
    arrivalTime: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    isPermitted: {
      type: Boolean,
      default: false,
    },
    correctionHistory: [
      {
        previousStatus: String,
        newStatus: String,
        reason: String,
        correctedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        correctedAt: {
          type: Date,
          default: Date.now,
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// DUPLICATE PREVENTION: A student can only have 1 attendance record per calendar date and session (Full Day / Morning / Afternoon)
attendanceRecordSchema.index({ student: 1, date: 1, session: 1 }, { unique: true });

// Query optimizations for classroom views and student timeline
attendanceRecordSchema.index({ class: 1, section: 1, date: 1 });
attendanceRecordSchema.index({ student: 1, date: -1 });

/**
 * Attendance Register Schema (Classroom Session Header)
 */
const attendanceRegisterSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalStudents: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    halfDayCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    excusedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    attendanceRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: REGISTER_STATUS,
      default: 'SUBMITTED',
      index: true,
    },
    session: {
      type: String,
      enum: ATTENDANCE_SESSIONS,
      default: 'FULL_DAY',
      index: true,
    },
    reopenedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reopenedAt: {
      type: Date,
    },
    reopenReason: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// DUPLICATE PREVENTION: Only 1 official register per class-section per calendar date and session
attendanceRegisterSchema.index({ class: 1, section: 1, date: 1, session: 1 }, { unique: true });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
const AttendanceRegister = mongoose.model('AttendanceRegister', attendanceRegisterSchema);

module.exports = {
  AttendanceRecord,
  AttendanceRegister,
  ATTENDANCE_STATUS,
  ATTENDANCE_SESSIONS,
  REGISTER_STATUS,
};
