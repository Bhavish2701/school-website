/**
 * Sri Vidya Educational Trust - Platform User & Account Management Schema
 * Module 6: User Directory, Account Lifecycle, 7-Tab Dossier, and Session Security
 */

const mongoose = require('mongoose');

const SessionRecordSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  device: { type: String, default: 'Desktop Computer' },
  browser: { type: String, default: 'Chrome 128 (Windows)' },
  os: { type: String, default: 'Windows 11' },
  ipAddress: { type: String, default: '106.51.24.112' },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  authMethod: { type: String, default: 'Password + TOTP MFA' },
  isCurrent: { type: Boolean, default: false }
}, { _id: false });

const InvitationHistorySchema = new mongoose.Schema({
  invitationId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  channel: { type: String, default: 'Official Email (SMTP)' },
  dispatchedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Dispatched', 'Verified', 'Expired', 'Revoked'],
    default: 'Dispatched'
  },
  dispatchedBy: { type: String, default: 'Platform Super Administrator' },
  notes: { type: String, default: '' }
}, { _id: false });

const UserAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String, default: '' },
  previousState: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const UserAccountSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: { type: String, default: '' },
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  institutionName: { type: String, required: true },
  department: { type: String, default: 'Administration' },
  employeeRecordId: { type: String, default: null }, // Linkage to staff cadre record
  roles: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Pending Invitation', 'Suspended', 'Deactivated'],
    default: 'Pending Invitation',
    index: true
  },
  suspensionDetails: {
    reason: { type: String, default: '' },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: String, default: null }
  },
  mfa: {
    enabled: { type: Boolean, default: true },
    method: { type: String, enum: ['totp', 'sms', 'none'], default: 'totp' },
    enforcedAt: { type: Date, default: Date.now },
    requiresSetupOnLogin: { type: Boolean, default: false }
  },
  securitySettings: {
    enforceMfaOnLogin: { type: Boolean, default: true },
    require90DayPasswordRotation: { type: Boolean, default: true },
    bindToRegisteredDevices: { type: Boolean, default: false },
    mustChangePasswordOnNextLogin: { type: Boolean, default: false }
  },
  lastLogin: {
    timestamp: { type: Date, default: null },
    ipAddress: { type: String, default: 'N/A' },
    device: { type: String, default: 'N/A' }
  },
  invitation: {
    activeTokenHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['None', 'Dispatched', 'Verified', 'Expired'],
      default: 'None'
    },
    history: [InvitationHistorySchema]
  },
  sessions: [SessionRecordSchema],
  auditHistory: [UserAuditSchema]
}, {
  timestamps: true,
  collection: 'user_accounts'
});

const UserAccount = mongoose.models.UserAccount || mongoose.model('UserAccount', UserAccountSchema);

module.exports = {
  UserAccount
};

