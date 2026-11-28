
const mongoose = require('mongoose');

const ActionPermissionsSchema = new mongoose.Schema({
  view: { type: Boolean, default: false },
  create_edit: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
  export: { type: Boolean, default: false },
  manage_access: { type: Boolean, default: false }
}, { _id: false });

const RoleTemplateSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  scope: {
    type: String,
    enum: ['Platform', 'Institution'],
    required: true,
    default: 'Institution'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isBuiltIn: {
    type: Boolean,
    default: false
  },
  isPrivileged: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Pending Review', 'Inactive'],
    default: 'Active'
  },
  assignedUsersCount: {
    type: Number,
    default: 0
  },
  permissions: {
    institutions: { type: ActionPermissionsSchema, default: () => ({}) },
    user_accounts: { type: ActionPermissionsSchema, default: () => ({}) },
    school_config: { type: ActionPermissionsSchema, default: () => ({}) },
    system_health: { type: ActionPermissionsSchema, default: () => ({}) },
    audit_logs: { type: ActionPermissionsSchema, default: () => ({}) },
    integrations: { type: ActionPermissionsSchema, default: () => ({}) }
  },
  recordScope: {
    type: String,
    enum: ['all_records', 'own_campus', 'assigned_department', 'assigned_classes', 'own_records'],
    default: 'own_campus'
  },
  sensitiveFields: {
    type: [String],
    default: []
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  delegatedAuthority: {
    type: String,
    enum: ['can_delegate', 'no_delegation'],
    default: 'no_delegation'
  },
  exportRestrictions: {
    type: String,
    enum: ['unrestricted', 'masked_pii', 'approval_required', 'prohibited'],
    default: 'masked_pii'
  },
  reviewDetails: {
    isPendingReview: { type: Boolean, default: false },
    requestedBy: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    rationale: { type: String, default: null },
    changesDiff: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  changeHistory: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
    oldPermissions: { type: mongoose.Schema.Types.Mixed },
    newPermissions: { type: mongoose.Schema.Types.Mixed }
  }]
}, {
  timestamps: true
});

const RoleTemplate = mongoose.models.RoleTemplate || mongoose.model('RoleTemplate', RoleTemplateSchema);

module.exports = {
  RoleTemplate,
  RoleTemplateSchema
};

