const mongoose = require('mongoose');

const dataBreachIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Incident title is mandatory'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    status: {
      type: String,
      enum: ['DETECTED', 'INVESTIGATING', 'CONTAINED', 'REPORTED', 'RESOLVED'],
      default: 'DETECTED',
      index: true,
    },
    affectedCategories: [
      {
        type: String,
        enum: [
          'STUDENT_ACADEMIC_DATA',
          'GUARDIAN_CONTACT_INFO',
          'STAFF_PAYROLL_DATA',
          'FEE_PAYMENT_RECORDS',
          'SYSTEM_CREDENTIALS',
          'TECHNICAL_METADATA',
        ],
      },
    ],
    estimatedAffectedUsers: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    containmentActions: {
      type: String,
      default: '',
    },
    rootCauseAnalysis: {
      type: String,
      default: '',
    },
    leadInvestigator: {
      userId: String,
      name: String,
      designation: String,
    },
    notifiedCertIn: {
      type: Boolean,
      default: false,
    },
    certInNotificationRef: {
      type: String,
      default: null,
    },
    notifiedDpbi: {
      type: Boolean,
      default: false,
    },
    notifiedAffectedUsers: {
      type: Boolean,
      default: false,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    containedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dataBreachIncidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DataBreachIncident', dataBreachIncidentSchema);
