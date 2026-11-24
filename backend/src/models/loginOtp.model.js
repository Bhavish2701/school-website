/**
 * Login OTP Verification Model
 * Stores short-lived cryptographic hashes of 2FA login verification codes.
 */
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
      expires: 600, // MongoDB TTL index: 10 minutes auto-cleanup
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginOtp', loginOtpSchema);
