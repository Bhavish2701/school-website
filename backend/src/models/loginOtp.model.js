const mongoose = require('mongoose');

const loginOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    preAuthToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    plainOtp: {
      type: String,
      default: '',
    },
    destination: {
      type: String,
      default: '',
    },
    destinationType: {
      type: String,
      enum: ['mobile', 'email'],
      default: 'mobile',
    },
    requestedPortal: {
      type: String,
      default: '',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginOtp', loginOtpSchema);
