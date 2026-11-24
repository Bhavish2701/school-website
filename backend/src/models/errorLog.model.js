/**
 * Centralized Error Log Model
 * Tracks unhandled backend errors and forwarded frontend runtime errors
 */
const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['backend', 'frontend'],
      default: 'backend',
      index: true,
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'fatal'],
      default: 'error',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    errorType: {
      type: String,
      default: 'UNHANDLED_EXCEPTION',
    },
    stack: {
      type: String,
    },
    endpoint: {
      type: String,
    },
    method: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    user: {
      id: String,
      username: String,
      role: String,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

errorLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ErrorLog', errorLogSchema);
