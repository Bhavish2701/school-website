const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema(
  {
    substitutionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
      index: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    room: {
      type: String,
      default: 'Room 204',
      trim: true,
    },
    periodNumber: {
      type: Number,
      required: true,
    },
    periodName: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
    },
    originalSubject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    absentTeacher: {
      type: String,
      required: true,
    },
    absentTeacherDept: {
      type: String,
      default: 'Physical Science',
    },
    absentReason: {
      type: String,
      default: 'on Medical Leave',
    },
    substituteTeacher: {
      type: String,
      required: true,
    },
    substituteSubject: {
      type: String,
      default: 'General Science',
    },
    substituteRole: {
      type: String,
      default: 'Senior Faculty',
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    approvedBy: {
      type: String,
      default: 'Principal Smt. Gorle Varalakshmi',
    },
  },
  {
    timestamps: true,
  }
);

const Substitution = mongoose.model('Substitution', substitutionSchema);
module.exports = Substitution;
