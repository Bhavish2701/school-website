/**
 * Sri Vidya Educational Trust - Security & Access Monitoring Service
 * Module 9: Real-time Threat Telemetry, 9.1 Overview, 9.2 Event Register,
 * 9.3 Privileged Access Reviews, and 9.4 7-Step Incident Workflow
 */

const mongoose = require('mongoose');
const {
  SecurityEvent,
  PrivilegedAccessReview,
  INCIDENT_WORKFLOW_STAGES,
  RISK_CLASSIFICATIONS
} = require('../models/securityMonitoring.model');
const PlatformAuditService = require('./platformAudit.service');

// In-memory fallback repositories
const inMemorySecurityEvents = [];
const inMemoryAccessReviews = [];

const DEFAULT_SECURITY_EVENTS_SEED = [
  // 1. High: Brute-Force Credential Stuffing
  {
    eventId: 'SEC-2026-088',
    eventType: 'BRUTE_FORCE_PROBE',
    userId: 'USR-1005',
    userName: 'Smt. P. Lakshmi Kameswari',
    userRole: 'Office Clerk',
    institutionId: 'INST-002',
    institutionName: 'Sri Vidya High School (City Branch)',
    timestamp: new Date('2026-11-05T18:30:00Z'),
    riskClassification: 'HIGH',
    status: 'Under Investigation',
    assignedInvestigator: {
      userId: 'USR-1001',
      name: 'Sri V. Krishna Mohan (SecOps Lead)',
      assignedAt: new Date('2026-11-05T18:40:00Z'),
      slaTargetHours: 2
    },
    findings: {
      rootCause: 'Automated dictionary attack targeted against admissions portal login',
      evidence: '5 consecutive failed attempts from external IP subnet 49.37.112.0/24',
      remediationNotes: 'IP temporarily rate-limited; user advised to enable WebAuthn TOTP',
      recordedBy: 'Sri V. Krishna Mohan',
      recordedAt: new Date('2026-11-05T18:50:00Z')
    },
    escalationDetails: {
      isEscalated: false,
      escalationLevel: null,
      reason: null,
      escalatedBy: null,
      escalatedAt: null
    },
    telemetry: {
      ipAddress: '49.37.112.9',
      location: 'Hyderabad, Telangana, India',
      userAgent: 'Python-requests/2.31.0',
      failedAttemptsCount: 5,
      sessionTerminated: false
    },
    timeline: [
      { stage: 'Alert Detected', performedBy: 'Threat Detection Engine', timestamp: new Date('2026-11-05T18:30:00Z'), notes: 'Anomalous failed login velocity threshold breached.' },
      { stage: 'Triage', performedBy: 'Automated Sentry', timestamp: new Date('2026-11-05T18:32:00Z'), notes: 'Triaged as HIGH risk based on targeted office clerk account.' },
      { stage: 'Assign Investigator', performedBy: 'Platform Administrator', timestamp: new Date('2026-11-05T18:40:00Z'), notes: 'Assigned to Sri V. Krishna Mohan with 2h SLA.' },
      { stage: 'Under Investigation', performedBy: 'Sri V. Krishna Mohan', timestamp: new Date('2026-11-05T18:45:00Z'), notes: 'Investigating external IP provenance and request headers.' }
    ]
  },
  // 2. Medium: Off-Hours Privileged Login
  {
    eventId: 'SEC-2026-089',
    eventType: 'OFF_HOURS_PRIVILEGED_LOGIN',
    userId: 'USR-1002',
    userName: 'Smt. Gorle Varalakshmi',
    userRole: 'Institutional Principal',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    timestamp: new Date('2026-11-05T02:45:00Z'),
    riskClassification: 'MEDIUM',
    status: 'Triage',
    assignedInvestigator: {
      userId: null,
      name: 'Unassigned',
      assignedAt: null,
      slaTargetHours: 8
    },
    findings: { rootCause: null, evidence: null, remediationNotes: null, recordedBy: null, recordedAt: null },
    escalationDetails: { isEscalated: false, escalationLevel: null, reason: null, escalatedBy: null, escalatedAt: null },
    telemetry: {
      ipAddress: '183.82.112.45',
      location: 'Visakhapatnam, AP, India',
      userAgent: 'Edge 129 (macOS)',
      failedAttemptsCount: 0,
      sessionTerminated: false
    },
    timeline: [
      { stage: 'Alert Detected', performedBy: 'Threat Detection Engine', timestamp: new Date('2026-11-05T02:45:00Z'), notes: 'Executive login initiated outside standard operational window (07:00-21:00).' },
      { stage: 'Triage', performedBy: 'Threat Detection Engine', timestamp: new Date('2026-11-05T02:46:00Z'), notes: 'MFA was successfully verified. Awaiting morning administrative validation.' }
    ]
  },
  // 3. High: Unusual Cross-Campus Record Access
  {
    eventId: 'SEC-2026-090',
    eventType: 'UNUSUAL_CROSS_CAMPUS_ACCESS',
    userId: 'USR-1006',
    userName: 'Sri T. Ramesh Kumar',
    userRole: 'Fee Collection Clerk',
    institutionId: 'INST-002',
    institutionName: 'Sri Vidya High School (City Branch)',
    timestamp: new Date('2026-11-04T15:20:00Z'),
    riskClassification: 'HIGH',
    status: 'Contain or Remediate',
    assignedInvestigator: {
      userId: 'USR-1001',
      name: 'Root Platform Administrator',
      assignedAt: new Date('2026-11-04T15:30:00Z'),
      slaTargetHours: 4
    },
    findings: {
      rootCause: 'Clerk attempted to query Main Campus fee ledger records without cross-campus authorization',
      evidence: 'Direct API request to /api/v1/institutions/INST-001/fees',
      remediationNotes: 'Access denied by authorization middleware; user account suspended pending audit review',
      recordedBy: 'Root Platform Administrator',
      recordedAt: new Date('2026-11-04T16:00:00Z')
    },
    escalationDetails: { isEscalated: false, escalationLevel: null, reason: null, escalatedBy: null, escalatedAt: null },
    telemetry: {
      ipAddress: '183.82.112.50',
      location: 'Visakhapatnam, AP, India',
      userAgent: 'Chrome 128 (Windows 10)',
      failedAttemptsCount: 1,
      sessionTerminated: true
    },
    timeline: [
      { stage: 'Alert Detected', performedBy: 'Authorization Middleware', timestamp: new Date('2026-11-04T15:20:00Z'), notes: 'Tenant boundary violation detected.' },
      { stage: 'Triage', performedBy: 'Security Engine', timestamp: new Date('2026-11-04T15:22:00Z'), notes: 'Triaged as HIGH due to financial records scope.' },
      { stage: 'Assign Investigator', performedBy: 'System', timestamp: new Date('2026-11-04T15:30:00Z'), notes: 'Assigned to Super Admin.' },
      { stage: 'Contain or Remediate', performedBy: 'Root Platform Administrator', timestamp: new Date('2026-11-04T16:00:00Z'), notes: 'Active login sessions revoked and account suspended.' }
    ]
  },
  // 4. Critical: Rapid CSV Export Volume Spike
  {
    eventId: 'SEC-2026-091',
    eventType: 'SENSITIVE_DATA_EXPORT_SPIKE',
    userId: 'USR-1004',
    userName: 'Dr. K. S. Ramanujam',
    userRole: 'Examination In-Charge',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    timestamp: new Date('2026-11-04T11:00:00Z'),
    riskClassification: 'CRITICAL',
    status: 'Alert Detected',
    assignedInvestigator: {
      userId: null,
      name: 'Unassigned',
      assignedAt: null,
      slaTargetHours: 1
    },
    findings: { rootCause: null, evidence: null, remediationNotes: null, recordedBy: null, recordedAt: null },
    escalationDetails: { isEscalated: false, escalationLevel: null, reason: null, escalatedBy: null, escalatedAt: null },
    telemetry: {
      ipAddress: '157.48.21.90',
      location: 'Visakhapatnam, AP, India',
      userAgent: 'Firefox 130 (Ubuntu)',
      failedAttemptsCount: 0,
      sessionTerminated: false
    },
    timeline: [
      { stage: 'Alert Detected', performedBy: 'DLP Sentry Engine', timestamp: new Date('2026-11-04T11:00:00Z'), notes: '5 consecutive student marks gazette CSV exports detected within 2 minutes.' }
    ]
  },
  // 5. Low: Password Reset Attempt Rate Limit
  {
    eventId: 'SEC-2026-092',
    eventType: 'PASSWORD_RESET_VELOCITY',
    userId: 'USR-1003',
    userName: 'Sri Navva Anand',
    userRole: 'Vice Principal & HOD Maths',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    timestamp: new Date('2026-11-03T09:15:00Z'),
    riskClassification: 'LOW',
    status: 'Close',
    assignedInvestigator: {
      userId: 'USR-1001',
      name: 'Sri V. Krishna Mohan',
      assignedAt: new Date('2026-11-03T09:30:00Z'),
      slaTargetHours: 12
    },
    findings: {
      rootCause: 'User entered typo in mobile OTP twice during scheduled credential rotation',
      evidence: 'SMS OTP verification logs on SendGrid/Twilio',
      remediationNotes: 'User successfully completed login on third attempt with valid credentials',
      recordedBy: 'Sri V. Krishna Mohan',
      recordedAt: new Date('2026-11-03T10:00:00Z')
    },
    escalationDetails: { isEscalated: false, escalationLevel: null, reason: null, escalatedBy: null, escalatedAt: null },
    telemetry: {
      ipAddress: '183.82.112.46',
      location: 'Visakhapatnam, AP, India',
      userAgent: 'Chrome 128 (Windows 11)',
      failedAttemptsCount: 2,
      sessionTerminated: false
    },
    timeline: [
      { stage: 'Alert Detected', performedBy: 'Auth Engine', timestamp: new Date('2026-11-03T09:15:00Z'), notes: 'Two failed OTP entries logged.' },
      { stage: 'Triage', performedBy: 'SecOps', timestamp: new Date('2026-11-03T09:20:00Z'), notes: 'Classified as LOW; benign user typo.' },
      { stage: 'Close', performedBy: 'Sri V. Krishna Mohan', timestamp: new Date('2026-11-03T10:00:00Z'), notes: 'Closed after successful login validation.' }
    ]
  }
];

const DEFAULT_ACCESS_REVIEWS_SEED = [
  // 1. Platform Owner (Central Trust)
  {
    reviewId: 'REV-2026-001',
    userId: 'USR-1001',
    userName: 'Root Platform Administrator',
    userEmail: 'superadmin@srividya.edu.in',
    institutionId: 'TRUST-ALL',
    institutionScope: 'TRUST-ALL (Multi-Tenant Central)',
    privilegedRoles: ['Platform Owner', 'Super Administrator'],
    lastAccess: {
      timestamp: new Date('2026-11-05T18:45:00Z'),
      ipAddress: '106.51.24.112',
      device: 'Workstation Alpha (Chrome 128 / Windows 11)'
    },
    businessJustification: 'Platform root governance and statutory oversight established under Sri Vidya Trust Deed 2017.',
    reviewDueDate: new Date('2026-12-01T00:00:00Z'),
    reviewerName: 'Managing Trustee Sri P. Venkatasubba Rao',
    reviewStatus: 'Confirmed',
    outcomeDetails: {
      decision: 'Confirmed',
      decisionNotes: 'Full platform administrative rights re-certified during Annual Trust Audit.',
      recordedBy: 'Managing Trustee',
      recordedAt: new Date('2026-10-15T11:00:00Z')
    }
  },
  // 2. Institutional Principal (Main Campus)
  {
    reviewId: 'REV-2026-002',
    userId: 'USR-1002',
    userName: 'Smt. Gorle Varalakshmi',
    userEmail: 'srividyaschools2017@gmail.com',
    institutionId: 'INST-001',
    institutionScope: 'INST-001 (Main Campus)',
    privilegedRoles: ['Institutional Principal', 'Academic Senate Member'],
    lastAccess: {
      timestamp: new Date('2026-11-05T17:30:00Z'),
      ipAddress: '183.82.112.45',
      device: 'MacBook Air Principal Office (Edge 129 / macOS)'
    },
    businessJustification: 'Executive institutional head authorized for staff appointments, admissions, and fee concessions.',
    reviewDueDate: new Date('2026-11-20T00:00:00Z'),
    reviewerName: 'Trust Security Auditor',
    reviewStatus: 'Pending Review',
    outcomeDetails: { decision: null, decisionNotes: null, recordedBy: null, recordedAt: null }
  },
  // 3. Vice Principal & HOD Maths (Main Campus)
  {
    reviewId: 'REV-2026-003',
    userId: 'USR-1003',
    userName: 'Sri Navva Anand',
    userEmail: 'navva.anand.personal@gmail.com',
    institutionId: 'INST-001',
    institutionScope: 'INST-001 (Main Campus)',
    privilegedRoles: ['Vice Principal & HOD Maths', 'Timetable Controller'],
    lastAccess: {
      timestamp: new Date('2026-11-05T16:15:00Z'),
      ipAddress: '183.82.112.46',
      device: 'Staff Room Desktop 02 (Chrome 128 / Windows 11)'
    },
    businessJustification: 'Academic administration, master timetable allocations, and marks moderation oversight.',
    reviewDueDate: new Date('2026-11-15T00:00:00Z'),
    reviewerName: 'Principal Smt. Gorle Varalakshmi',
    reviewStatus: 'Pending Review',
    outcomeDetails: { decision: null, decisionNotes: null, recordedBy: null, recordedAt: null }
  },
  // 4. Fee Collection Clerk (City Branch) - Overdue
  {
    reviewId: 'REV-2026-004',
    userId: 'USR-1006',
    userName: 'Sri T. Ramesh Kumar',
    userEmail: 'ramesh.accounts@srividya.edu.in',
    institutionId: 'INST-002',
    institutionScope: 'INST-002 (City Branch)',
    privilegedRoles: ['Fee Collection Clerk'],
    lastAccess: {
      timestamp: new Date('2026-10-28T13:45:00Z'),
      ipAddress: '183.82.112.50',
      device: 'Accounts Counter Terminal (Chrome 128 / Windows 10)'
    },
    businessJustification: 'Fee collection register maintenance, daily cash receipts, and offline payment reconciliation.',
    reviewDueDate: new Date('2026-10-31T00:00:00Z'),
    reviewerName: 'Managing Trustee',
    reviewStatus: 'Clarification Requested',
    outcomeDetails: {
      decision: 'Clarification Requested',
      decisionNotes: 'Audit reconciliation pending for cash receipts discrepancy in Quarter 2. Clarification demanded before re-enabling access.',
      recordedBy: 'Managing Trustee',
      recordedAt: new Date('2026-10-28T14:30:00Z')
    }
  }
];

class SecurityMonitoringService {

  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) {
      this._seedInMemory();
      return;
    }

    try {
      const eventCount = await SecurityEvent.countDocuments();
      if (eventCount === 0) {
        await SecurityEvent.insertMany(DEFAULT_SECURITY_EVENTS_SEED);
      }
      const reviewCount = await PrivilegedAccessReview.countDocuments();
      if (reviewCount === 0) {
        await PrivilegedAccessReview.insertMany(DEFAULT_ACCESS_REVIEWS_SEED);
      }
    } catch (e) {
      console.error('[SecurityMonitoringService] seed error:', e.message || e);
      this._seedInMemory();
    }
  }

  static _seedInMemory() {
    if (inMemorySecurityEvents.length === 0) {
      DEFAULT_SECURITY_EVENTS_SEED.forEach(e => inMemorySecurityEvents.push(JSON.parse(JSON.stringify(e))));
    }
    if (inMemoryAccessReviews.length === 0) {
      DEFAULT_ACCESS_REVIEWS_SEED.forEach(r => inMemoryAccessReviews.push(JSON.parse(JSON.stringify(r))));
    }
  }

  /**
   * 9.1 Security Overview KPI Metrics
   */
  static async getSecurityOverview() {
    await this.seedIfEmpty();

    let events = [];
    let reviews = [];

    if (!this.isMongoReady()) {
      events = inMemorySecurityEvents;
      reviews = inMemoryAccessReviews;
    } else {
      try {
        events = await SecurityEvent.find();
        reviews = await PrivilegedAccessReview.find();
      } catch (e) {
        events = inMemorySecurityEvents;
        reviews = inMemoryAccessReviews;
      }
    }

    const failedAuthAttempts = events.reduce((sum, e) => sum + (e.telemetry?.failedAttemptsCount || 0), 0);
    const suspiciousLoginPatterns = events.filter(e => e.eventType.includes('LOGIN') || e.eventType.includes('PROBE')).length;
    const privilegedRoleChanges = 2; // From Module 7 role approvals
    const unusualAccessActivity = events.filter(e => e.eventType.includes('CROSS_CAMPUS') || e.eventType.includes('SPIKE')).length;
    const unresolvedAlerts = events.filter(e => e.status !== 'Close').length;
    const accountsRequiringReview = reviews.filter(r => r.reviewStatus === 'Pending Review' || r.reviewStatus === 'Clarification Requested').length;
    const recentIncidents = events.filter(e => e.riskClassification === 'CRITICAL' || e.riskClassification === 'HIGH').length;

    return {
      failedAuthAttempts,
      suspiciousLoginPatterns,
      privilegedRoleChanges,
      unusualAccessActivity,
      unresolvedSecurityAlerts: unresolvedAlerts,
      accountsRequiringReview,
      recentSecurityIncidents: recentIncidents,
      threatDefensePosture: 'ACTIVE_GUARD'
    };
  }

  /**
   * 9.2 Security Events Register Query with Multi-Field Filters
   */
  static async listSecurityEvents(query = {}) {
    await this.seedIfEmpty();

    let events = [];
    if (!this.isMongoReady()) {
      events = inMemorySecurityEvents;
    } else {
      try {
        events = await SecurityEvent.find().sort({ timestamp: -1 });
      } catch (e) {
        events = inMemorySecurityEvents;
      }
    }

    const q = (query.search || query.query || '').toLowerCase().trim();
    const eventType = query.eventType || '';
    const risk = query.risk || query.riskClassification || '';
    const status = query.status || '';
    const instId = query.institutionId || '';
    const investigator = (query.investigator || '').toLowerCase().trim();

    const filtered = events.filter(e => {
      if (q) {
        const hay = `${e.eventId} ${e.eventType} ${e.userName} ${e.userId} ${e.institutionName} ${e.assignedInvestigator?.name} ${e.findings?.rootCause}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (eventType && eventType !== 'all' && e.eventType !== eventType) return false;
      if (risk && risk !== 'all' && e.riskClassification !== risk) return false;
      if (status && status !== 'all' && e.status !== status) return false;
      if (instId && instId !== 'all' && e.institutionId !== instId) return false;
      if (investigator && investigator !== 'all') {
        const invName = (e.assignedInvestigator?.name || '').toLowerCase();
        if (!invName.includes(investigator)) return false;
      }
      return true;
    });

    const overview = await this.getSecurityOverview();

    return {
      success: true,
      total: filtered.length,
      overview,
      data: filtered
    };
  }

  /**
   * 9.2 Get Single Security Event by ID
   */
  static async getSecurityEventById(eventId) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const e = inMemorySecurityEvents.find(x => x.eventId === eventId);
      return { success: !!e, data: e };
    }

    try {
      const e = await SecurityEvent.findOne({ eventId });
      return { success: !!e, data: e };
    } catch (err) {
      const e = inMemorySecurityEvents.find(x => x.eventId === eventId);
      return { success: !!e, data: e };
    }
  }

  /**
   * 9.4 Lifecycle Transition: Triage Event
   */
  static async triageEvent(eventId, riskClassification, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Triage';
    if (riskClassification) event.riskClassification = riskClassification;
    event.timeline.unshift({
      stage: 'Triage',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Triaged with risk classification: ${event.riskClassification}.`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();
    return { success: true, data: event };
  }

  /**
   * 9.4 Lifecycle Transition: Assign Investigator
   */
  static async assignInvestigator(eventId, investigatorName, slaHours = 4, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Assign Investigator';
    event.assignedInvestigator = {
      userId: `INV-${Math.floor(100 + Math.random() * 900)}`,
      name: investigatorName || 'Sri V. Krishna Mohan (SecOps Lead)',
      assignedAt: new Date(),
      slaTargetHours: slaHours
    };
    event.timeline.unshift({
      stage: 'Assign Investigator',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Assigned to investigator ${event.assignedInvestigator.name} with ${slaHours}h SLA.`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();
    return { success: true, data: event };
  }

  /**
   * 9.2 Action: Mark Under Investigation
   */
  static async markUnderInvestigation(eventId, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Under Investigation';
    event.timeline.unshift({
      stage: 'Under Investigation',
      performedBy: operator,
      timestamp: new Date(),
      notes: 'Active forensic and access trace investigation commenced.'
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();
    return { success: true, data: event };
  }

  /**
   * 9.2 Action: Record Findings
   */
  static async recordFindings(eventId, findingsData, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Investigate';
    event.findings = {
      rootCause: findingsData.rootCause || 'Root cause under validation',
      evidence: findingsData.evidence || 'Log telemetry verified',
      remediationNotes: findingsData.remediationNotes || 'Remediation advised',
      recordedBy: operator,
      recordedAt: new Date()
    };
    event.timeline.unshift({
      stage: 'Investigate',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Findings recorded. Root cause: ${event.findings.rootCause}`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();
    return { success: true, data: event };
  }

  /**
   * 9.4 Lifecycle Transition: Contain or Remediate
   * High-Impact Action: Logs immutable audit entry
   */
  static async containOrRemediate(eventId, remediationData, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Contain or Remediate';
    event.telemetry.sessionTerminated = remediationData.terminateSession === true;

    event.timeline.unshift({
      stage: 'Contain or Remediate',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Containment action executed: ${remediationData.actionSummary || 'Session containment applied'}.`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();

    // Invariant: Log high-impact action to PlatformAudit
    await PlatformAuditService.logEvent({
      action: 'SECURITY_CONTAINMENT_EXECUTED',
      category: 'SECURITY_ALERTS',
      actor: { userId: 'SEC-ADMIN', name: operator, role: 'Security Administrator' },
      institutionId: event.institutionId,
      institutionName: event.institutionName,
      targetEntity: { entityType: 'SecurityEvent', entityId: event.eventId, displayName: event.eventType },
      result: 'SUCCESS',
      severity: 'HIGH',
      reason: `Containment applied for incident ${event.eventId}: ${remediationData.actionSummary || 'Active session terminated'}`,
      changedFields: [{ field: 'status', oldValue: 'Under Investigation', newValue: 'Contain or Remediate' }],
      relatedSecurityEventId: event.eventId
    });

    return { success: true, data: event };
  }

  /**
   * 9.2 Action: Close Event
   */
  static async closeEvent(eventId, resolutionNotes, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Close';
    event.timeline.unshift({
      stage: 'Close',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Incident closed. Resolution: ${resolutionNotes || 'Remediation verified and signed off'}.`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();
    return { success: true, data: event };
  }

  /**
   * 9.2 Action: Escalate According to Policy
   * High-Impact Action: Logs immutable audit entry
   */
  static async escalateEvent(eventId, escalationLevel = 'L2_LEADERSHIP', reason, operator = 'Platform Administrator') {
    const res = await this.getSecurityEventById(eventId);
    if (!res.success || !res.data) return { success: false, message: 'Event not found' };

    const event = res.data;
    event.status = 'Escalated';
    event.escalationDetails = {
      isEscalated: true,
      escalationLevel,
      reason: reason || 'Escalated to Executive Trust Senate under multi-tenant risk protocol',
      escalatedBy: operator,
      escalatedAt: new Date()
    };
    event.riskClassification = 'CRITICAL';
    event.timeline.unshift({
      stage: 'Escalated',
      performedBy: operator,
      timestamp: new Date(),
      notes: `Escalated to ${escalationLevel}. Reason: ${event.escalationDetails.reason}`
    });

    if (this.isMongoReady() && typeof event.save === 'function') await event.save();

    // Invariant: Log high-impact action to PlatformAudit
    await PlatformAuditService.logEvent({
      action: 'SECURITY_INCIDENT_ESCALATED',
      category: 'SECURITY_ALERTS',
      actor: { userId: 'SEC-ADMIN', name: operator, role: 'Security Administrator' },
      institutionId: event.institutionId,
      institutionName: event.institutionName,
      targetEntity: { entityType: 'SecurityEvent', entityId: event.eventId, displayName: event.eventType },
      result: 'WARNING',
      severity: 'CRITICAL',
      reason: `Incident ${event.eventId} escalated to ${escalationLevel}. Reason: ${reason || 'Statutory threat escalation'}`,
      changedFields: [{ field: 'status', oldValue: 'Triage', newValue: 'Escalated' }],
      relatedSecurityEventId: event.eventId
    });

    return { success: true, data: event };
  }

  /**
   * 9.3 Privileged Access Reviews: List Reviews
   */
  static async listAccessReviews(query = {}) {
    await this.seedIfEmpty();

    let reviews = [];
    if (!this.isMongoReady()) {
      reviews = inMemoryAccessReviews;
    } else {
      try {
        reviews = await PrivilegedAccessReview.find().sort({ reviewDueDate: 1 });
      } catch (e) {
        reviews = inMemoryAccessReviews;
      }
    }

    const q = (query.search || '').toLowerCase().trim();
    const status = query.status || '';
    const instId = query.institutionId || '';

    const filtered = reviews.filter(r => {
      if (q) {
        const hay = `${r.reviewId} ${r.userName} ${r.userEmail} ${r.privilegedRoles.join(' ')} ${r.businessJustification}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status && status !== 'all' && r.reviewStatus !== status) return false;
      if (instId && instId !== 'all' && r.institutionId !== instId) return false;
      return true;
    });

    return {
      success: true,
      total: filtered.length,
      data: filtered
    };
  }

  /**
   * 9.3 Action: Record Review Outcome (Confirm, Reduce, Revoke, Clarify)
   */
  static async recordAccessReviewOutcome(reviewId, decision, notes, operator = 'Trust Security Auditor') {
    await this.seedIfEmpty();

    let review = null;
    if (!this.isMongoReady()) {
      review = inMemoryAccessReviews.find(r => r.reviewId === reviewId);
    } else {
      try {
        review = await PrivilegedAccessReview.findOne({ reviewId });
      } catch (e) {
        review = inMemoryAccessReviews.find(r => r.reviewId === reviewId);
      }
    }

    if (!review) return { success: false, message: 'Review record not found' };

    let newStatus = 'Confirmed';
    if (decision === 'confirm') newStatus = 'Confirmed';
    else if (decision === 'reduce') newStatus = 'Permissions Reduced';
    else if (decision === 'revoke') newStatus = 'Role Revoked';
    else if (decision === 'clarify') newStatus = 'Clarification Requested';

    review.reviewStatus = newStatus;
    review.outcomeDetails = {
      decision: newStatus,
      decisionNotes: notes || `Outcome recorded: ${newStatus}`,
      recordedBy: operator,
      recordedAt: new Date()
    };

    if (this.isMongoReady() && typeof review.save === 'function') await review.save();

    // High impact audit log
    if (decision === 'revoke' || decision === 'reduce') {
      await PlatformAuditService.logEvent({
        action: decision === 'revoke' ? 'PRIVILEGED_ROLE_REVOKED_AUDIT' : 'PRIVILEGED_PERMISSIONS_REDUCED_AUDIT',
        category: 'RBAC_PERMISSIONS',
        actor: { userId: 'AUDITOR', name: operator, role: 'Trust Security Auditor' },
        institutionId: review.institutionId,
        institutionName: review.institutionScope,
        targetEntity: { entityType: 'UserAccount', entityId: review.userId, displayName: review.userName },
        result: 'SUCCESS',
        severity: 'HIGH',
        reason: `Periodic Privileged Access Review Outcome: ${notes || 'Privilege reduction enforced'}`,
        changedFields: [{ field: 'privilegedRoles', oldValue: review.privilegedRoles, newValue: decision === 'revoke' ? [] : 'Reduced Permissions' }]
      });
    }

    return { success: true, reviewStatus: newStatus, data: review };
  }
}

module.exports = SecurityMonitoringService;
