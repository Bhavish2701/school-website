/**
 * SMS Gateway Log Model
 * Tracks official SMS delivery logs dispatched via AP-EDUSMS Gateway
 */
const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    admissionNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['ABSENTEE_ALERT', 'CIRCULAR', 'FEE_REMINDER', 'GENERAL'],
      default: 'ABSENTEE_ALERT',
      index: true,
    },
    gateway: {
      type: String,
      default: 'AP-EDUSMS (Airtel DLT)',
    },
    status: {
      type: String,
      enum: ['DELIVERED', 'SENT', 'FAILED', 'PENDING'],
      default: 'DELIVERED',
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

smsLogSchema.index({ admissionNo: 1, createdAt: -1 });
smsLogSchema.index({ createdAt: -1 });

const SmsLog = mongoose.model('SmsLog', smsLogSchema);

module.exports = SmsLog;
