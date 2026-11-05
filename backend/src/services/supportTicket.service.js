/**
 * Sri Vidya Educational Trust - Support & Issue Management Service
 * Module 14: Support Overview, Ticket Directory, Lifecycle Workflow, and Internal Notes
 */

const mongoose = require('mongoose');
const { SupportTicket } = require('../models/supportTicket.model');
const { PlatformAuditLog } = require('../models/platformAudit.model');

const DEFAULT_SUPPORT_TICKETS_SEED = [
  {
    ticketId: 'TICK-2026-001',
    subject: 'Faculty Portal Authentication Failure for High School Science Staff',
    institution: 'SV-MAIN',
    requester: {
      name: 'Dr. K. V. Rao',
      email: 'principal.main@srividya.edu.in',
      role: 'Principal',
      phone: '+91 98480 11001'
    },
    category: 'Login and access',
    priority: 'High',
    impact: 'Class or Section',
    status: 'New',
    assignedAgent: {
      name: 'Unassigned',
      email: null,
      tier: 'Tier 1 Support'
    },
    description: 'Teachers in the science department cannot authenticate through SSO. They encounter error ERR-SSO-OIDC-TIMEOUT when attempting to access the Faculty Portal.',
    supportingFiles: [
      {
        filename: 'sso_auth_error_screenshot.png',
        fileUrl: '/uploads/support/sso_auth_error_screenshot.png',
        fileSize: '412 KB',
        uploadedAt: new Date(Date.now() - 3600000 * 2),
        uploadedBy: 'Dr. K. V. Rao'
      }
    ],
    relatedRecordId: 'SV-MAIN-TEACHER-DEPT',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() + 3600000 * 10), // 10 hrs remaining
    conversation: [
      {
        messageId: 'MSG-001',
        senderName: 'Dr. K. V. Rao',
        senderEmail: 'principal.main@srividya.edu.in',
        senderRole: 'Principal',
        senderType: 'Requester',
        message: 'Science faculty members cannot submit attendance or assignment grades today. Please check the identity relay urgently.',
        sentAt: new Date(Date.now() - 3600000 * 2),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-001',
        authorName: 'Triage Automation',
        authorRole: 'Platform Bot',
        note: 'Initial triage: Microsoft Entra SSO token cert was rotated yesterday. Verifying thumbprint synchronization.',
        confidentialityLevel: 'Support Staff Only',
        createdAt: new Date(Date.now() - 3600000 * 1.8)
      }
    ],
    relatedIncidents: [
      {
        incidentId: 'INT-IDP-05',
        incidentType: 'INTEGRATION_ERROR',
        title: 'Microsoft Entra ID Relay Handshake Warning',
        status: 'Investigating',
        relationship: 'Related To'
      }
    ],
    activityHistory: [
      {
        activityId: 'ACT-001',
        actor: 'Dr. K. V. Rao',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Ticket logged from Principal Portal',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-002',
    subject: 'Bulk Student Roll CSV Import Validation Error on Fee Category Field',
    institution: 'SV-PRIMARY',
    requester: {
      name: 'S. Meenakshi',
      email: 'office.primary@srividya.edu.in',
      role: 'Office Staff',
      phone: '+91 98480 22002'
    },
    category: 'Data import',
    priority: 'High',
    impact: 'Class or Section',
    status: 'Assigned',
    assignedAgent: {
      name: 'K. Sudhir',
      email: 'sudhir.k@srividya.edu.in',
      tier: 'Tier 2 Support'
    },
    description: 'Student roll spreadsheet fails at row 42 with invalid fee opening balance category. 120 primary students awaiting roll allocation.',
    supportingFiles: [
      {
        filename: 'primary_grade2_students_import.csv',
        fileUrl: '/uploads/support/primary_grade2_students_import.csv',
        fileSize: '84 KB',
        uploadedAt: new Date(Date.now() - 3600000 * 6),
        uploadedBy: 'S. Meenakshi'
      }
    ],
    relatedRecordId: 'IMPORT-JOB-102',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() + 3600000 * 6),
    conversation: [
      {
        messageId: 'MSG-002',
        senderName: 'S. Meenakshi',
        senderEmail: 'office.primary@srividya.edu.in',
        senderRole: 'Office Staff',
        senderType: 'Requester',
        message: 'The import center indicates "Fee category RTE-GOVT not recognized". We need this resolved for mid-term registry.',
        sentAt: new Date(Date.now() - 3600000 * 6),
        attachments: []
      },
      {
        messageId: 'MSG-003',
        senderName: 'K. Sudhir',
        senderEmail: 'sudhir.k@srividya.edu.in',
        senderRole: 'Tier 2 Support',
        senderType: 'Support Agent',
        message: 'Hello Meenakshi garu, we are reviewing the fee category master table for SV-PRIMARY to ensure RTE concession codes are active.',
        sentAt: new Date(Date.now() - 3600000 * 4),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-002',
        authorName: 'K. Sudhir',
        authorRole: 'Tier 2 Support',
        note: 'Internal Note: The fee structure template for Primary was missing RTE concession ledger code #402. Patching via school config.',
        confidentialityLevel: 'Support Staff Only',
        createdAt: new Date(Date.now() - 3600000 * 3.8)
      }
    ],
    relatedIncidents: [],
    activityHistory: [
      {
        activityId: 'ACT-002',
        actor: 'S. Meenakshi',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Ticket logged via Helpdesk',
        timestamp: new Date(Date.now() - 3600000 * 6)
      },
      {
        activityId: 'ACT-003',
        actor: 'Platform Triage',
        action: 'ASSIGNED',
        fromValue: 'Unassigned',
        toValue: 'K. Sudhir',
        details: 'Assigned to Data Migration Specialist',
        timestamp: new Date(Date.now() - 3600000 * 5)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-003',
    subject: 'Razorpay Webhook Callback Gateway 504 Timeout',
    institution: 'SV-MAIN',
    requester: {
      name: 'R. Srinivas',
      email: 'accounts.main@srividya.edu.in',
      role: 'Accounts Staff',
      phone: '+91 98480 33003'
    },
    category: 'Integration',
    priority: 'Critical',
    impact: 'Entire School',
    status: 'Waiting for Engineering',
    assignedAgent: {
      name: 'P. Swetha',
      email: 'swetha.p@srividya.edu.in',
      tier: 'Tier 3 Engineering'
    },
    description: 'Fee portal online payments are succeeding on gateway but webhook timeouts prevent ledger reconciliation in real-time.',
    supportingFiles: [
      {
        filename: 'webhook_timeout_logs.txt',
        fileUrl: '/uploads/support/webhook_timeout_logs.txt',
        fileSize: '1.2 MB',
        uploadedAt: new Date(Date.now() - 3600000 * 28),
        uploadedBy: 'R. Srinivas'
      }
    ],
    relatedRecordId: 'INT-PAY-01',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() - 3600000 * 4), // OVERDUE SLA by 4 hours
    conversation: [
      {
        messageId: 'MSG-004',
        senderName: 'R. Srinivas',
        senderEmail: 'accounts.main@srividya.edu.in',
        senderRole: 'Accounts Staff',
        senderType: 'Requester',
        message: 'Parents are presenting Razorpay payment success receipts, but fees show pending in the school ledger.',
        sentAt: new Date(Date.now() - 3600000 * 28),
        attachments: []
      },
      {
        messageId: 'MSG-005',
        senderName: 'P. Swetha',
        senderEmail: 'swetha.p@srividya.edu.in',
        senderRole: 'Tier 3 Engineering',
        senderType: 'Support Agent',
        message: 'We have identified an ingress gateway rate-limiting bottleneck. Engineering is adjusting socket timeout limits.',
        sentAt: new Date(Date.now() - 3600000 * 12),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-003',
        authorName: 'P. Swetha',
        authorRole: 'Tier 3 Engineering',
        note: 'Internal Note: Nginx proxy timeout was set to 15s; Razorpay retry spikes overwhelmed queue. Increasing to 60s.',
        confidentialityLevel: 'Engineering / Security Only',
        createdAt: new Date(Date.now() - 3600000 * 10)
      }
    ],
    relatedIncidents: [
      {
        incidentId: 'EVT-9011',
        incidentType: 'INTEGRATION_ERROR',
        title: 'Razorpay Webhook Callback Ingress',
        status: 'Open',
        relationship: 'Caused By'
      }
    ],
    activityHistory: [
      {
        activityId: 'ACT-004',
        actor: 'R. Srinivas',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Critical issue reported',
        timestamp: new Date(Date.now() - 3600000 * 28)
      },
      {
        activityId: 'ACT-005',
        actor: 'K. Sudhir',
        action: 'ESCALATED',
        fromValue: 'Assigned',
        toValue: 'Waiting for Engineering',
        details: 'Escalated to Tier 3 Infrastructure Engineering',
        timestamp: new Date(Date.now() - 3600000 * 20)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-004',
    subject: 'Brute Force Login Spike Detected from Suspicious Range 185.220.101.4',
    institution: 'TRUST_CENTRAL',
    requester: {
      name: 'Security Guardian Daemon',
      email: 'security-daemon@srividya.edu.in',
      role: 'Platform Operator',
      phone: '+91 98480 99999'
    },
    category: 'Security incident',
    priority: 'Critical',
    impact: 'Multi-Campus / Trust-wide',
    status: 'Triaged',
    assignedAgent: {
      name: 'Security Response Team',
      email: 'soc@srividya.edu.in',
      tier: 'Security Response Team'
    },
    description: 'Over 450 rapid failed authentication requests targeting administrative accounts in 5 minutes from Tor exit node IP.',
    supportingFiles: [
      {
        filename: 'soc_ip_packet_dump.log',
        fileUrl: '/uploads/support/soc_ip_packet_dump.log',
        fileSize: '2.4 MB',
        uploadedAt: new Date(Date.now() - 3600000 * 1),
        uploadedBy: 'Security Guardian'
      }
    ],
    relatedRecordId: 'SEC-2026-004',
    isSecurityIncident: true,
    securityIncidentRef: 'SEC-2026-004',
    slaDeadline: new Date(Date.now() + 3600000 * 3),
    conversation: [
      {
        messageId: 'MSG-006',
        senderName: 'Security Guardian Daemon',
        senderEmail: 'security-daemon@srividya.edu.in',
        senderRole: 'Platform Operator',
        senderType: 'System',
        message: 'Security Alert: Automated honeypot trigger activated for admin portal endpoints.',
        sentAt: new Date(Date.now() - 3600000 * 1),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-004',
        authorName: 'SOC Lead',
        authorRole: 'Security Lead',
        note: 'Section 14.5 Invariant: Dedicated security workflow initiated. IP 185.220.101.4 dropped at perimeter WAF.',
        confidentialityLevel: 'Engineering / Security Only',
        createdAt: new Date(Date.now() - 3600000 * 0.9)
      }
    ],
    relatedIncidents: [
      {
        incidentId: 'SEC-2026-004',
        incidentType: 'SECURITY_EVENT',
        title: 'Brute Force Credential Stuffing Attempt',
        status: 'Under Investigation',
        relationship: 'Escalated To Security'
      }
    ],
    activityHistory: [
      {
        activityId: 'ACT-006',
        actor: 'Security Daemon',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Automated honeypot alert created',
        timestamp: new Date(Date.now() - 3600000 * 1)
      },
      {
        activityId: 'ACT-007',
        actor: 'Platform Administrator',
        action: 'TRIAGED',
        fromValue: 'New',
        toValue: 'Triaged',
        details: 'Transferred to Section 9.4 Security Incident Workflow',
        timestamp: new Date(Date.now() - 3600000 * 0.8)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-005',
    subject: 'Request to Configure Term-2 Academic Assessment Grading Scale',
    institution: 'SV-VILLAGE',
    requester: {
      name: 'B. Apparao',
      email: 'principal.village@srividya.edu.in',
      role: 'Principal',
      phone: '+91 98480 44004'
    },
    category: 'Institution configuration',
    priority: 'Medium',
    impact: 'Entire School',
    status: 'Waiting for Requester',
    assignedAgent: {
      name: 'N. Latha',
      email: 'latha.n@srividya.edu.in',
      tier: 'Tier 1 Support'
    },
    description: 'Need to update grading tiers for Class 10 term exams as per latest state board curriculum circular.',
    supportingFiles: [],
    relatedRecordId: 'CONFIG-SV-VILLAGE',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() + 3600000 * 24),
    conversation: [
      {
        messageId: 'MSG-007',
        senderName: 'B. Apparao',
        senderEmail: 'principal.village@srividya.edu.in',
        senderRole: 'Principal',
        senderType: 'Requester',
        message: 'We need A1/A2 grading boundaries shifted by 2 marks for rural branch exams.',
        sentAt: new Date(Date.now() - 3600000 * 14),
        attachments: []
      },
      {
        messageId: 'MSG-008',
        senderName: 'N. Latha',
        senderEmail: 'latha.n@srividya.edu.in',
        senderRole: 'Tier 1 Support',
        senderType: 'Support Agent',
        message: 'Could you please upload the official DEO circular copy so we can verify compliance before updating configuration?',
        sentAt: new Date(Date.now() - 3600000 * 8),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-005',
        authorName: 'N. Latha',
        authorRole: 'Tier 1 Support',
        note: 'Internal Note: Awaiting signed approval letter from district education officer before altering grade cutoffs.',
        confidentialityLevel: 'Support Staff Only',
        createdAt: new Date(Date.now() - 3600000 * 7.9)
      }
    ],
    relatedIncidents: [],
    activityHistory: [
      {
        activityId: 'ACT-008',
        actor: 'B. Apparao',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Configuration request submitted',
        timestamp: new Date(Date.now() - 3600000 * 14)
      },
      {
        activityId: 'ACT-009',
        actor: 'N. Latha',
        action: 'STATUS_CHANGED',
        fromValue: 'In Progress',
        toValue: 'Waiting for Requester',
        details: 'Requested supporting circular document from Principal',
        timestamp: new Date(Date.now() - 3600000 * 8)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-006',
    subject: 'High Latency During Morning Attendance Biometric Sync',
    institution: 'SV-MAIN',
    requester: {
      name: 'M. Venkat',
      email: 'admin.main@srividya.edu.in',
      role: 'School Staff',
      phone: '+91 98480 55005'
    },
    category: 'Performance',
    priority: 'Medium',
    impact: 'Entire School',
    status: 'In Progress',
    assignedAgent: {
      name: 'T. Harish',
      email: 'harish.t@srividya.edu.in',
      tier: 'Tier 2 Support'
    },
    description: 'Between 08:30 and 09:15 AM, biometric sync takes over 45 seconds to update attendance sheets due to concurrent queries.',
    supportingFiles: [],
    relatedRecordId: 'INT-BIO-06',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() + 3600000 * 18),
    conversation: [
      {
        messageId: 'MSG-009',
        senderName: 'M. Venkat',
        senderEmail: 'admin.main@srividya.edu.in',
        senderRole: 'School Staff',
        senderType: 'Requester',
        message: 'Teachers are having to wait at the gates while biometric device sync buffer clears.',
        sentAt: new Date(Date.now() - 3600000 * 10),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-006',
        authorName: 'T. Harish',
        authorRole: 'Tier 2 Support',
        note: 'Internal Note: Adding Redis cache layer for student RFID tags to avoid querying Mongo cluster on every punch.',
        confidentialityLevel: 'Engineering / Security Only',
        createdAt: new Date(Date.now() - 3600000 * 4)
      }
    ],
    relatedIncidents: [],
    activityHistory: [
      {
        activityId: 'ACT-010',
        actor: 'M. Venkat',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Performance ticket logged',
        timestamp: new Date(Date.now() - 3600000 * 10)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-007',
    subject: 'Parent Portal Notification Delivery Discrepancy on SMS Gateway',
    institution: 'SV-PRIMARY',
    requester: {
      name: 'G. Sujatha',
      email: 'vp.primary@srividya.edu.in',
      role: 'Vice Principal',
      phone: '+91 98480 66006'
    },
    category: 'Email or notification',
    priority: 'Low',
    impact: 'Class or Section',
    status: 'Resolved',
    assignedAgent: {
      name: 'P. Swetha',
      email: 'swetha.p@srividya.edu.in',
      tier: 'Tier 2 Support'
    },
    description: 'Bus arrival notifications were arriving late by 15 minutes due to NIC DLT queue throttling.',
    supportingFiles: [],
    relatedRecordId: 'INT-SMS-02',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() - 3600000 * 48),
    resolvedAt: new Date(Date.now() - 3600000 * 2), // Recently resolved
    resolvedBy: 'P. Swetha',
    resolutionSummary: 'DLT template ID was re-mapped on NIC gateway. Priority routing configured for transport alerts. SMS delivery resumed at 99.8% fidelity.',
    conversation: [
      {
        messageId: 'MSG-010',
        senderName: 'G. Sujatha',
        senderEmail: 'vp.primary@srividya.edu.in',
        senderRole: 'Vice Principal',
        senderType: 'Requester',
        message: 'Primary school parents reported transport alerts delayed.',
        sentAt: new Date(Date.now() - 3600000 * 50),
        attachments: []
      },
      {
        messageId: 'MSG-011',
        senderName: 'P. Swetha',
        senderEmail: 'swetha.p@srividya.edu.in',
        senderRole: 'Tier 2 Support',
        senderType: 'Support Agent',
        message: 'The issue has been resolved. Transport alerts are now assigned high-priority delivery queue.',
        sentAt: new Date(Date.now() - 3600000 * 2),
        attachments: []
      }
    ],
    internalNotes: [
      {
        noteId: 'NOTE-007',
        authorName: 'P. Swetha',
        authorRole: 'Tier 2 Support',
        note: 'Internal Note: NIC DLT provider fixed the template hash mismatch. Closed after verifying delivery logs.',
        confidentialityLevel: 'Support Staff Only',
        createdAt: new Date(Date.now() - 3600000 * 2.1)
      }
    ],
    relatedIncidents: [],
    activityHistory: [
      {
        activityId: 'ACT-011',
        actor: 'G. Sujatha',
        action: 'CREATED',
        fromValue: null,
        toValue: 'New',
        details: 'Ticket logged',
        timestamp: new Date(Date.now() - 3600000 * 50)
      },
      {
        activityId: 'ACT-012',
        actor: 'P. Swetha',
        action: 'RESOLVED',
        fromValue: 'In Progress',
        toValue: 'Resolved',
        details: 'Ticket resolved with template remapping',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ]
  },
  {
    ticketId: 'TICK-2026-008',
    subject: 'Feature Request: Export Term Report Cards in Bilingual Telugu/English PDF',
    institution: 'SV-VILLAGE',
    requester: {
      name: 'B. Apparao',
      email: 'principal.village@srividya.edu.in',
      role: 'Principal',
      phone: '+91 98480 44004'
    },
    category: 'Feature request',
    priority: 'Low',
    impact: 'Entire School',
    status: 'Closed',
    assignedAgent: {
      name: 'Product Operations',
      email: 'product@srividya.edu.in',
      tier: 'Product Team'
    },
    description: 'Village parents request bilingual Telugu script on term report cards for easier guardian comprehension.',
    supportingFiles: [],
    relatedRecordId: 'FEAT-2026-088',
    isSecurityIncident: false,
    securityIncidentRef: null,
    slaDeadline: new Date(Date.now() - 3600000 * 120),
    resolvedAt: new Date(Date.now() - 3600000 * 72),
    resolvedBy: 'Product Operations',
    resolutionSummary: 'Added to Q1-2027 Trust product roadmap. Specification doc shared with Trust Academic Board.',
    conversation: [],
    internalNotes: [],
    relatedIncidents: [],
    activityHistory: [
      {
        activityId: 'ACT-013',
        actor: 'Product Operations',
        action: 'CLOSED',
        fromValue: 'Resolved',
        toValue: 'Closed',
        details: 'Logged into product backlog roadmap',
        timestamp: new Date(Date.now() - 3600000 * 72)
      }
    ]
  }
];

let inMemoryTickets = JSON.parse(JSON.stringify(DEFAULT_SUPPORT_TICKETS_SEED));

class SupportTicketService {
  static isMongoReady() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  static async seedIfEmpty() {
    if (this.isMongoReady()) {
      try {
        const count = await SupportTicket.countDocuments();
        if (count === 0) {
          await SupportTicket.insertMany(DEFAULT_SUPPORT_TICKETS_SEED);
        }
      } catch (e) {
        console.warn('Mongo seed support tickets note:', e.message);
      }
    }
  }

  /**
   * 14.1 Support Overview Metrics
   */
  static async getSupportOverview() {
    await this.seedIfEmpty();
    let tickets = [];

    if (!this.isMongoReady()) {
      tickets = inMemoryTickets;
    } else {
      try {
        tickets = await SupportTicket.find();
      } catch (e) {
        tickets = inMemoryTickets;
      }
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

    const openIssues = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status));
    const highPriorityIssues = openIssues.filter(t => ['Critical', 'High'].includes(t.priority));
    const awaitingTrustOrSchool = openIssues.filter(t => ['Waiting for Requester', 'Waiting for Engineering'].includes(t.status));
    const overdueIssues = openIssues.filter(t => t.slaDeadline && new Date(t.slaDeadline) < now);
    const recentlyResolved = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status) && (
      (t.resolvedAt && new Date(t.resolvedAt) >= sevenDaysAgo) ||
      (t.updatedAt && new Date(t.updatedAt) >= sevenDaysAgo)
    ));

    return {
      success: true,
      data: {
        openIssuesCount: openIssues.length,
        highPriorityCount: highPriorityIssues.length,
        awaitingCount: awaitingTrustOrSchool.length,
        overdueCount: overdueIssues.length,
        recentlyResolvedCount: recentlyResolved.length,
        totalTicketsCount: tickets.length,
        metricsCalculatedAt: now.toISOString()
      }
    };
  }

  /**
   * 14.2 Support Ticket Directory
   */
  static async listTickets(query = {}) {
    await this.seedIfEmpty();
    let tickets = [];

    if (!this.isMongoReady()) {
      tickets = inMemoryTickets;
    } else {
      try {
        tickets = await SupportTicket.find().sort({ createdAt: -1 });
      } catch (e) {
        tickets = inMemoryTickets;
      }
    }

    const search = (query.search || '').toLowerCase().trim();
    const category = query.category || '';
    const priority = query.priority || '';
    const status = query.status || '';
    const institution = query.institution || '';
    const isSecurity = query.isSecurityIncident !== undefined ? (String(query.isSecurityIncident) === 'true') : null;

    const filtered = tickets.filter(t => {
      const matchSearch = !search ||
        (t.ticketId && t.ticketId.toLowerCase().includes(search)) ||
        (t.subject && t.subject.toLowerCase().includes(search)) ||
        (t.requester?.name && t.requester.name.toLowerCase().includes(search)) ||
        (t.requester?.email && t.requester.email.toLowerCase().includes(search)) ||
        (t.institution && t.institution.toLowerCase().includes(search)) ||
        (t.assignedAgent?.name && t.assignedAgent.name.toLowerCase().includes(search));

      const matchCategory = !category || t.category === category;
      const matchPriority = !priority || t.priority === priority;
      const matchStatus = !status || t.status === status;
      const matchInst = !institution || t.institution === institution;
      const matchSec = isSecurity === null || t.isSecurityIncident === isSecurity;

      return matchSearch && matchCategory && matchPriority && matchStatus && matchInst && matchSec;
    });

    return {
      success: true,
      count: filtered.length,
      data: filtered
    };
  }

  /**
   * 14.4 Get Single Ticket
   */
  static async getTicketById(ticketId) {
    await this.seedIfEmpty();
    let ticket = null;

    if (!this.isMongoReady()) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
    } else {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
      } catch (e) {
        ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      }
    }

    if (!ticket) return { success: false, message: 'Support ticket not found.' };
    return { success: true, data: ticket };
  }

  /**
   * 14.3 Create Support Ticket
   */
  static async createTicket(payload, actor = 'School Staff') {
    await this.seedIfEmpty();
    const now = new Date();

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const ticketId = payload.ticketId || `TICK-2026-${randomSuffix}`;

    // Calculate SLA
    let slaHours = 48;
    if (payload.priority === 'Critical') slaHours = 4;
    else if (payload.priority === 'High') slaHours = 12;
    else if (payload.priority === 'Medium') slaHours = 48;
    else if (payload.priority === 'Low') slaHours = 96;

    const slaDeadline = new Date(now.getTime() + slaHours * 3600000);

    // Section 14.5 Invariant: Dedicated Security Incident Response
    const isSecurity = payload.category === 'Security incident' || payload.isSecurityIncident === true;
    const secRef = isSecurity ? (payload.securityIncidentRef || `SEC-2026-${randomSuffix}`) : null;

    const newTicket = {
      ticketId,
      subject: payload.subject,
      institution: payload.institution || 'SV-MAIN',
      requester: {
        name: payload.requesterName || payload.requester?.name || actor,
        email: payload.requesterEmail || payload.requester?.email || 'staff@srividya.edu.in',
        role: payload.requesterRole || payload.requester?.role || 'School Staff',
        phone: payload.requesterPhone || payload.requester?.phone || '+91 98480 12345'
      },
      category: payload.category || 'Portal issue',
      priority: payload.priority || 'Medium',
      impact: payload.impact || 'Single User',
      status: isSecurity ? 'Triaged' : 'New',
      assignedAgent: isSecurity ? {
        name: 'Security Response Team',
        email: 'soc@srividya.edu.in',
        tier: 'Security Response Team'
      } : {
        name: payload.assignedAgentName || 'Unassigned',
        email: payload.assignedAgentEmail || null,
        tier: payload.assignedAgentTier || 'Tier 1 Support'
      },
      description: payload.description || 'No description provided.',
      supportingFiles: payload.supportingFiles || (payload.attachmentName ? [{
        filename: payload.attachmentName,
        fileUrl: `/uploads/support/${payload.attachmentName}`,
        fileSize: '320 KB',
        uploadedAt: now,
        uploadedBy: actor
      }] : []),
      relatedRecordId: payload.relatedRecordId || null,
      isSecurityIncident: isSecurity,
      securityIncidentRef: secRef,
      slaDeadline,
      conversation: [
        {
          messageId: `MSG-${Date.now().toString().slice(-4)}`,
          senderName: payload.requesterName || payload.requester?.name || actor,
          senderEmail: payload.requesterEmail || payload.requester?.email || '',
          senderRole: payload.requesterRole || payload.requester?.role || 'Requester',
          senderType: 'Requester',
          message: payload.description || 'Ticket initialized.',
          sentAt: now,
          attachments: []
        }
      ],
      internalNotes: isSecurity ? [
        {
          noteId: `NOTE-${Date.now().toString().slice(-4)}`,
          authorName: 'Security Automation',
          authorRole: 'Platform Bot',
          note: 'Section 14.5 Invariant: Security incident routed to dedicated SOC workflow. Threat classification active.',
          confidentialityLevel: 'Engineering / Security Only',
          createdAt: now
        }
      ] : [],
      relatedIncidents: isSecurity ? [
        {
          incidentId: secRef,
          incidentType: 'SECURITY_EVENT',
          title: `Security Triage for ${payload.subject}`,
          status: 'Open',
          relationship: 'Escalated To Security'
        }
      ] : [],
      activityHistory: [
        {
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'CREATED',
          fromValue: null,
          toValue: isSecurity ? 'Triaged' : 'New',
          details: `Ticket created with ${payload.priority || 'Medium'} priority`,
          timestamp: now
        }
      ]
    };

    if (this.isMongoReady()) {
      try {
        const created = await SupportTicket.create(newTicket);
        await this._logSupportAudit('SUPPORT_TICKET_CREATED', created.ticketId, created.subject, actor, `Created ticket [${created.ticketId}]`);
        return { success: true, data: created };
      } catch (e) {
        console.warn('Mongo create support ticket note:', e.message);
      }
    }

    inMemoryTickets.unshift(newTicket);
    await this._logSupportAudit('SUPPORT_TICKET_CREATED', newTicket.ticketId, newTicket.subject, actor, `Created ticket [${newTicket.ticketId}]`);
    return { success: true, data: newTicket };
  }

  /**
   * 14.4 Action: Assign Ticket
   */
  static async assignTicket(ticketId, { agentName, agentEmail, tier }, actor = 'Platform Administrator') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          const oldAgent = ticket.assignedAgent?.name || 'Unassigned';
          ticket.assignedAgent = {
            name: agentName || 'Assigned Support Agent',
            email: agentEmail || 'support@srividya.edu.in',
            tier: tier || 'Tier 1 Support'
          };
          if (['New', 'Triaged'].includes(ticket.status)) {
            ticket.status = 'Assigned';
          }
          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'ASSIGNED',
            fromValue: oldAgent,
            toValue: agentName,
            details: `Assigned to ${agentName} (${tier || 'Support'})`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        const oldAgent = ticket.assignedAgent?.name || 'Unassigned';
        ticket.assignedAgent = {
          name: agentName || 'Assigned Support Agent',
          email: agentEmail || 'support@srividya.edu.in',
          tier: tier || 'Tier 1 Support'
        };
        if (['New', 'Triaged'].includes(ticket.status)) {
          ticket.status = 'Assigned';
        }
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'ASSIGNED',
          fromValue: oldAgent,
          toValue: agentName,
          details: `Assigned to ${agentName} (${tier || 'Support'})`,
          timestamp: now
        });
      }
    }

    await this._logSupportAudit('SUPPORT_TICKET_ASSIGNED', ticketId, ticket.subject, actor, `Assigned ticket to [${agentName}]`);
    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Change Priority
   */
  static async changePriority(ticketId, { priority, reason }, actor = 'Platform Administrator') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          const oldPriority = ticket.priority;
          ticket.priority = priority;

          let slaHours = 48;
          if (priority === 'Critical') slaHours = 4;
          else if (priority === 'High') slaHours = 12;
          else if (priority === 'Medium') slaHours = 48;
          else if (priority === 'Low') slaHours = 96;
          ticket.slaDeadline = new Date(now.getTime() + slaHours * 3600000);

          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'PRIORITY_CHANGED',
            fromValue: oldPriority,
            toValue: priority,
            details: reason || `Priority changed to ${priority}`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        const oldPriority = ticket.priority;
        ticket.priority = priority;
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'PRIORITY_CHANGED',
          fromValue: oldPriority,
          toValue: priority,
          details: reason || `Priority changed to ${priority}`,
          timestamp: now
        });
      }
    }

    await this._logSupportAudit('SUPPORT_PRIORITY_CHANGED', ticketId, ticket.subject, actor, `Changed priority to [${priority}]`);
    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Reply (School Visible Message)
   */
  static async addReply(ticketId, { message, senderName, senderRole, senderType, attachments }, actor = 'Support Agent') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    const msgObj = {
      messageId: `MSG-${Date.now().toString().slice(-4)}`,
      senderName: senderName || actor,
      senderEmail: 'support@srividya.edu.in',
      senderRole: senderRole || 'Support Agent',
      senderType: senderType || 'Support Agent',
      message: message,
      sentAt: now,
      attachments: attachments || []
    };

    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          ticket.conversation.push(msgObj);
          if (senderType === 'Requester') {
            ticket.status = 'In Progress';
          } else {
            ticket.status = 'In Progress';
          }
          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'REPLY_SENT',
            fromValue: null,
            toValue: null,
            details: `Public response sent by ${senderName || actor}`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        ticket.conversation.push(msgObj);
        ticket.status = 'In Progress';
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'REPLY_SENT',
          fromValue: null,
          toValue: null,
          details: `Public response sent by ${senderName || actor}`,
          timestamp: now
        });
      }
    }

    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Add Internal Note (Strict Invariant: Internal only, isolated from school)
   */
  static async addInternalNote(ticketId, { note, confidentialityLevel }, actor = 'Platform Administrator') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    const noteObj = {
      noteId: `NOTE-${Date.now().toString().slice(-4)}`,
      authorName: actor,
      authorRole: 'Platform Operations',
      note: note,
      confidentialityLevel: confidentialityLevel || 'Support Staff Only',
      createdAt: now
    };

    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          ticket.internalNotes.push(noteObj);
          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'INTERNAL_NOTE_ADDED',
            fromValue: null,
            toValue: null,
            details: `Internal note added (${confidentialityLevel || 'Support Staff Only'})`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        ticket.internalNotes.push(noteObj);
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'INTERNAL_NOTE_ADDED',
          fromValue: null,
          toValue: null,
          details: `Internal note added (${confidentialityLevel || 'Support Staff Only'})`,
          timestamp: now
        });
      }
    }

    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Request Additional Information
   */
  static async requestAdditionalInfo(ticketId, { message }, actor = 'Support Agent') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    const msgObj = {
      messageId: `MSG-${Date.now().toString().slice(-4)}`,
      senderName: actor,
      senderEmail: 'support@srividya.edu.in',
      senderRole: 'Support Agent',
      senderType: 'Support Agent',
      message: message || 'We require additional information to proceed with investigation. Please provide details.',
      sentAt: now,
      attachments: []
    };

    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          ticket.conversation.push(msgObj);
          ticket.status = 'Waiting for Requester';
          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'STATUS_CHANGED',
            fromValue: 'In Progress',
            toValue: 'Waiting for Requester',
            details: 'Requested additional diagnostic details from school',
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        ticket.conversation.push(msgObj);
        ticket.status = 'Waiting for Requester';
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'STATUS_CHANGED',
          fromValue: 'In Progress',
          toValue: 'Waiting for Requester',
          details: 'Requested additional diagnostic details from school',
          timestamp: now
        });
      }
    }

    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Escalate Ticket (Engineering or Security)
   */
  static async escalateTicket(ticketId, { escalationTier, reason }, actor = 'Platform Support') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    const isSecurityEscalation = escalationTier === 'Security Team';

    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          const oldStatus = ticket.status;
          ticket.status = isSecurityEscalation ? 'Triaged' : 'Waiting for Engineering';
          if (isSecurityEscalation) {
            ticket.isSecurityIncident = true;
            ticket.category = 'Security incident';
            ticket.securityIncidentRef = ticket.securityIncidentRef || `SEC-2026-${Date.now().toString().slice(-3)}`;
            ticket.assignedAgent = {
              name: 'Security Response Team',
              email: 'soc@srividya.edu.in',
              tier: 'Security Response Team'
            };
          } else {
            ticket.assignedAgent.tier = escalationTier || 'Tier 3 Engineering';
          }

          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'ESCALATED',
            fromValue: oldStatus,
            toValue: ticket.status,
            details: `Escalated to ${escalationTier || 'Engineering'}. Reason: ${reason || 'Technical complexity'}`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        const oldStatus = ticket.status;
        ticket.status = isSecurityEscalation ? 'Triaged' : 'Waiting for Engineering';
        if (isSecurityEscalation) {
          ticket.isSecurityIncident = true;
          ticket.category = 'Security incident';
          ticket.securityIncidentRef = ticket.securityIncidentRef || `SEC-2026-${Date.now().toString().slice(-3)}`;
          ticket.assignedAgent = {
            name: 'Security Response Team',
            email: 'soc@srividya.edu.in',
            tier: 'Security Response Team'
          };
        }
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'ESCALATED',
          fromValue: oldStatus,
          toValue: ticket.status,
          details: `Escalated to ${escalationTier || 'Engineering'}. Reason: ${reason || 'Technical complexity'}`,
          timestamp: now
        });
      }
    }

    await this._logSupportAudit('SUPPORT_TICKET_ESCALATED', ticketId, ticket.subject, actor, `Escalated ticket to [${escalationTier}]`);
    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Resolve Ticket
   */
  static async resolveTicket(ticketId, { resolutionSummary }, actor = 'Platform Support') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          const oldStatus = ticket.status;
          ticket.status = 'Resolved';
          ticket.resolvedAt = now;
          ticket.resolvedBy = actor;
          ticket.resolutionSummary = resolutionSummary || 'Issue resolved successfully.';

          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'RESOLVED',
            fromValue: oldStatus,
            toValue: 'Resolved',
            details: `Resolved: ${ticket.resolutionSummary}`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        const oldStatus = ticket.status;
        ticket.status = 'Resolved';
        ticket.resolvedAt = now;
        ticket.resolvedBy = actor;
        ticket.resolutionSummary = resolutionSummary || 'Issue resolved successfully.';
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'RESOLVED',
          fromValue: oldStatus,
          toValue: 'Resolved',
          details: `Resolved: ${ticket.resolutionSummary}`,
          timestamp: now
        });
      }
    }

    await this._logSupportAudit('SUPPORT_TICKET_RESOLVED', ticketId, ticket.subject, actor, `Resolved ticket with summary: [${ticket.resolutionSummary}]`);
    return { success: true, data: ticket };
  }

  /**
   * 14.4 Action: Reopen Ticket
   */
  static async reopenTicket(ticketId, { reason }, actor = 'School Staff') {
    const res = await this.getTicketById(ticketId);
    if (!res.success || !res.data) return { success: false, message: 'Ticket not found.' };

    const now = new Date();
    let ticket = null;

    if (this.isMongoReady()) {
      try {
        ticket = await SupportTicket.findOne({ ticketId });
        if (ticket) {
          const oldStatus = ticket.status;
          ticket.status = 'In Progress';
          ticket.reopenReason = reason || 'Issue re-occurred or requires additional validation.';
          ticket.resolvedAt = null;

          ticket.activityHistory.push({
            activityId: `ACT-${Date.now().toString().slice(-4)}`,
            actor,
            action: 'REOPENED',
            fromValue: oldStatus,
            toValue: 'In Progress',
            details: `Ticket reopened: ${ticket.reopenReason}`,
            timestamp: now
          });
          await ticket.save();
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!ticket) {
      ticket = inMemoryTickets.find(t => t.ticketId === ticketId);
      if (ticket) {
        const oldStatus = ticket.status;
        ticket.status = 'In Progress';
        ticket.reopenReason = reason || 'Issue re-occurred or requires additional validation.';
        ticket.resolvedAt = null;
        ticket.activityHistory.push({
          activityId: `ACT-${Date.now().toString().slice(-4)}`,
          actor,
          action: 'REOPENED',
          fromValue: oldStatus,
          toValue: 'In Progress',
          details: `Ticket reopened: ${ticket.reopenReason}`,
          timestamp: now
        });
      }
    }

    await this._logSupportAudit('SUPPORT_TICKET_REOPENED', ticketId, ticket.subject, actor, `Reopened ticket. Reason: [${ticket.reopenReason}]`);
    return { success: true, data: ticket };
  }

  static async _logSupportAudit(action, recordRef, targetName, actor, details) {
    if (this.isMongoReady()) {
      try {
        await PlatformAuditLog.create({
          eventId: `AUD-SUP-${Date.now().toString().slice(-6)}`,
          timestamp: new Date(),
          actor: {
            userId: 'USR-OP-ADMIN',
            username: actor,
            role: 'Platform Operations',
            scope: 'TRUST_CENTRAL'
          },
          institution: 'ALL_CAMPUSES',
          module: 'Support & Issue Management',
          action,
          targetRecord: {
            entityType: 'SUPPORT_TICKET',
            recordId: recordRef,
            recordReference: targetName
          },
          result: 'SUCCESS',
          severity: 'INFO',
          correlationId: `req-sup-${Date.now()}`,
          reason: details
        });
      } catch (e) {
        // Fallback
      }
    }
  }
}

module.exports = SupportTicketService;

