/**
 * Sri Vidya Educational Trust - Support & Issue Management Models
 * Module 14: Support Overview, Ticket Directory, Lifecycle Workflow, and Internal Notes
 */

const mongoose = require('mongoose');

// 14.4 Subdocument Schemas
const ConversationMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String
  },
  senderRole: {
    type: String,
    default: 'Support Agent'
  },
  senderType: {
    type: String,
    enum: ['Requester', 'Support Agent', 'System'],
    default: 'Support Agent'
  },
  message: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    fileSize: String
  }]
}, { _id: false });

const InternalNoteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    default: 'Platform Operations'
  },
  note: {
    type: String,
    required: true
  },
  confidentialityLevel: {
    type: String,
    enum: ['Support Staff Only', 'Engineering / Security Only', 'Confidential Trust Internal'],
    default: 'Support Staff Only'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const RelatedIncidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true
  },
  incidentType: {
    type: String,
    enum: ['SUPPORT_TICKET', 'SECURITY_EVENT', 'DEPLOYMENT', 'BACKGROUND_JOB', 'INTEGRATION_ERROR'],
    default: 'SUPPORT_TICKET'
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Open'
  },
  relationship: {
    type: String,
    enum: ['Caused By', 'Duplicate Of', 'Related To', 'Blocked By', 'Escalated To Security'],
    default: 'Related To'
  }
}, { _id: false });

const ActivityHistorySchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true
  },
  actor: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  fromValue: {
    type: String
  },
  toValue: {
    type: String
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// 14.2 & 14.3 Support Ticket Schema
const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  institution: {
    type: String,
    required: true,
    index: true
  },
  requester: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'School Staff' },
    phone: { type: String, default: '+91 98480 12345' }
  },
  category: {
    type: String,
    enum: [
      'Login and access',
      'Institution configuration',
      'Portal issue',
      'Data import',
      'Email or notification',
      'Integration',
      'Performance',
      'Security incident',
      'Feature request'
    ],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
    index: true
  },
  impact: {
    type: String,
    enum: ['Single User', 'Class or Section', 'Entire School', 'Multi-Campus / Trust-wide'],
    default: 'Single User'
  },
  status: {
    type: String,
    enum: [
      'New',
      'Triaged',
      'Assigned',
      'In Progress',
      'Waiting for Requester',
      'Waiting for Engineering',
      'Resolved',
      'Closed'
    ],
    default: 'New',
    index: true
  },
  assignedAgent: {
    name: { type: String, default: 'Unassigned' },
    email: { type: String, default: null },
    tier: { type: String, default: 'Tier 1 Support' }
  },
  description: {
    type: String,
    required: true
  },
  supportingFiles: [{
    filename: String,
    fileUrl: String,
    fileSize: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: String
  }],
  relatedRecordId: {
    type: String,
    default: null
  },
  isSecurityIncident: {
    type: Boolean,
    default: false,
    index: true
  },
  securityIncidentRef: {
    type: String,
    default: null
  },
  slaDeadline: {
    type: Date,
    required: true,
    index: true
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    default: null
  },
  resolutionSummary: {
    type: String,
    default: null
  },
  reopenReason: {
    type: String,
    default: null
  },
  conversation: [ConversationMessageSchema],
  internalNotes: [InternalNoteSchema],
  relatedIncidents: [RelatedIncidentSchema],
  activityHistory: [ActivityHistorySchema]
}, {
  timestamps: true
});

const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);

module.exports = {
  SupportTicket,
  SupportTicketSchema
};

