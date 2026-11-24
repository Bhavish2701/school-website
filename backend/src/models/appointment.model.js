const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      index: true,
      default: () => `APT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, trim: true, default: '' },
    studentName: { type: String, trim: true, default: '' },
    admissionNo: { type: String, trim: true, default: '' },
    facultyName: { type: String, required: true, trim: true },
    hostRole: { type: String, trim: true, default: 'Principal' },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true, trim: true },
    agenda: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
    notes: { type: String, trim: true, default: '' },
    academicYear: { type: String, default: '2026-2027' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = { Appointment };

