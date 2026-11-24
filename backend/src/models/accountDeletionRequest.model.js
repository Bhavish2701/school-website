/**
 * Account Deletion Request Model
 * Enforces legal safeguards under Andhra Pradesh Education Act & DPDP Act 2023
 * Requires authorized administrative approval while strictly preserving statutory academic and financial records.
 */
const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason for deletion request is mandatory'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewerName: {
      type: String,
    },
    reviewNotes: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    statutoryNoticeAcknowledged: {
      type: Boolean,
      default: true,
    },
    academicRecordsPreserved: {
      type: Boolean,
      default: true,
    },
    financialRecordsPreserved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

accountDeletionRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
