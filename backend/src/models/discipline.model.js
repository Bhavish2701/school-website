const mongoose = require('mongoose');

const disciplineIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      unique: true,
      index: true,
      default: () => `DISC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    admissionNo: { type: String, trim: true, index: true },
    studentName: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    section: { type: String, default: 'A', trim: true },
    academicYear: { type: String, default: '2026-2027', index: true },
    date: { type: Date, default: Date.now, index: true },
    category: {
      type: String,
      enum: ['Attendance/Punctuality', 'Uniform/Dress Code', 'Classroom Conduct', 'Academic Integrity', 'Property Damage', 'Positive Commendation', 'Other'],
      default: 'Classroom Conduct',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    description: { type: String, required: true, trim: true },
    actionTaken: { type: String, trim: true, default: '' },
    reportedBy: { type: String, required: true, trim: true },
    reportedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    parentNotified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED'],
      default: 'OPEN',
      index: true,
    },
    resolvedBy: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

const DisciplineIncident = mongoose.model('DisciplineIncident', disciplineIncidentSchema);
module.exports = { DisciplineIncident };

