/**
 * Correction Request Mongoose Model
 * Specification 20.2:
 * "Parents should not be able to change verified attendance, examination marks,
 * fee balances or official school records directly. They can submit requests for corrections
 * that authorized staff review."
 */
const mongoose = require('mongoose');

const CORRECTION_MODULES = [
  'ATTENDANCE',
  'RESULTS',
  'FEES',
  'STUDENT_RECORD',
  'COMMUNICATION',
  'GENERAL',
];

const CORRECTION_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'RETURNED_FOR_CORRECTION',
  'COMPLETED',
];

const PRIORITY_LEVELS = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const correctionHistorySchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByName: { type: String, default: 'Authorized Staff' },
    remarks: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const correctionRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, 'Correction Request ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    module: {
      type: String,
      enum: {
        values: CORRECTION_MODULES,
        message: '{VALUE} is not a valid correction module',
      },
      required: [true, 'Target module is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    requesterUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user reference is required'],
      index: true,
    },
    requesterRole: {
      type: String,
      default: 'PARENT',
      index: true,
    },
    requesterName: {
      type: String,
      trim: true,
      default: '',
    },
    recordReference: {
      type: String,
      trim: true,
      default: '', // e.g., 'Term-1 Math Exam', 'Attendance 2026-10-14', 'Receipt REC-2025-012'
    },
    fieldToCorrect: {
      type: String,
      required: [true, 'Field to correct is required'],
      trim: true,
    },
    currentValue: {
      type: String,
      trim: true,
      default: '',
    },
    requestedValue: {
      type: String,
      required: [true, 'Requested corrected value is required'],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason for correction is required'],
      trim: true,
    },
    evidenceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: CORRECTION_STATUSES,
        message: '{VALUE} is not a valid correction status',
      },
      default: 'SUBMITTED',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_LEVELS,
        message: '{VALUE} is not a valid priority',
      },
      default: 'NORMAL',
    },
    currentApprovalStage: {
      type: String,
      default: 'Class Teacher Initial Review',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    history: [correctionHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Fast indexing for parent queries and administration queue
correctionRequestSchema.index({ student: 1, status: 1 });
correctionRequestSchema.index({ requesterUser: 1, createdAt: -1 });

const CorrectionRequest = mongoose.model('CorrectionRequest', correctionRequestSchema);

module.exports = {
  CorrectionRequest,
  CORRECTION_MODULES,
  CORRECTION_STATUSES,
  PRIORITY_LEVELS,
};
