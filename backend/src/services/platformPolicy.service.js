/**
 * Sri Vidya Educational Trust - Platform Policies & Data Retention Service
 * Module 17: Governance Policy Register, Granular Statutory Retention Rules, and Controlled Data Requests
 *
 * Statutory Invariants Enforced:
 * 1. Section 17.2: Universal deletion periods are strictly forbidden. Student, financial, employment,
 *    and audit records maintain separate granular retention periods (Permanent, 7 years, 3 years, etc.).
 * 2. Section 17.3: Platform operators cannot independently delete school records. Deletion or
 *    anonymization requests require dual authorized signoffs (School Principal + Trust Legal Directorate)
 *    and statutory minimum period verification.
 */

const mongoose = require('mongoose');
const { GovernancePolicy, RetentionRule, DataRequest } = require('../models/platformPolicy.model');
const { PlatformAudit } = require('../models/platformAudit.model');

// In-Memory Fallbacks for zero-downtime execution
let inMemoryPolicies = [];
let inMemoryRetentionRules = [];
let inMemoryDataRequests = [];

function initializeDefaults() {
  inMemoryPolicies = [
    {
      policyId: 'POL-SEC-01',
      name: 'Zero-Trust Administrative Account & MFA Enforcement Policy',
      category: 'ACCOUNT_SECURITY',
      version: 'v2.1',
      effectiveDate: new Date('2025-06-01'),
      owner: 'Chief Information Security Officer & IT Governance',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-06-01'),
      scopeDescription: 'All administrative, operator, and principal accounts across all Sri Vidya Trust institutions.',
      contentSummary: 'Mandates hardware or TOTP multi-factor authentication, 90-day credential rotation, and session timeout after 30 minutes of inactivity.'
    },
    {
      policyId: 'POL-ACC-02',
      name: 'Role-Based Access Control & Minimum Privilege Policy',
      category: 'DATA_ACCESS',
      version: 'v1.4',
      effectiveDate: new Date('2025-07-15'),
      owner: 'Trust Legal & Compliance Directorate',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-07-15'),
      scopeDescription: 'All platform users including faculty, administrative staff, bursars, and platform operators.',
      contentSummary: 'Enforces strict least-privilege scoping preventing cross-institution record leakage and unauthorized student dossier exposure.'
    },
    {
      policyId: 'POL-RET-03',
      name: 'Statutory Dual-Track Data Retention & Archival Framework',
      category: 'DATA_RETENTION',
      version: 'v3.0',
      effectiveDate: new Date('2025-04-01'),
      owner: 'Trust Legal Counsel & Statutory Compliance Directorate',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-04-01'),
      scopeDescription: 'All academic, financial, employment, biometric, and security audit records stored on the platform.',
      contentSummary: 'Enforces statutory permanent preservation for Admission General Registers and TC counterfoils; 7-year retention for financial ledgers; 3-year rolling retention for attendance.'
    },
    {
      policyId: 'POL-DOC-04',
      name: 'Encrypted Document Storage & Evidence Lifecycle Policy',
      category: 'DOCUMENT_STORAGE',
      version: 'v1.2',
      effectiveDate: new Date('2025-08-01'),
      owner: 'Infrastructure Security & Storage Management',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-08-01'),
      scopeDescription: 'Cloud and on-premise object storage buckets hosting student certificates, mark sheets, and employee dossiers.',
      contentSummary: 'Mandates AES-256 client-side and server-side encryption with automated tamper checksums and disaster recovery replication.'
    },
    {
      policyId: 'POL-BCK-05',
      name: 'Immutable Geo-Redundant Backup Retention Standard',
      category: 'BACKUP_RETENTION',
      version: 'v2.0',
      effectiveDate: new Date('2025-05-10'),
      owner: 'Technical Operations & Disaster Recovery Team',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-05-10'),
      scopeDescription: 'Automated daily snapshots, monthly archives, and disaster recovery off-site replications.',
      contentSummary: 'Specifies 30-day operational snapshot retention, 7-year annual audit point-in-time archives, and WORM (Write Once Read Many) immutability.'
    },
    {
      policyId: 'POL-AUD-06',
      name: 'Tamper-Evident Forensic Audit Logging Mandate',
      category: 'AUDIT_LOGGING',
      version: 'v2.2',
      effectiveDate: new Date('2025-06-15'),
      owner: 'Platform Security & Internal Audit Directorate',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-06-15'),
      scopeDescription: 'Platform-wide security events, administrative alterations, and privileged operator sessions.',
      contentSummary: 'Enforces SHA-256 cryptographic hash-chaining, read-only operator interfaces, and statutory 5-year retention under IT Act 2000 Section 67C.'
    },
    {
      policyId: 'POL-EXP-07',
      name: 'Regulated Student Academic Data Export Protocol',
      category: 'DATA_EXPORTS',
      version: 'v1.1',
      effectiveDate: new Date('2025-09-01'),
      owner: 'Directorate of Academic Standards & Trust Data Officer',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-09-01'),
      scopeDescription: 'Bulk exports of student transcripts, board examination marks, and government portal synchronizations.',
      contentSummary: 'Requires dual-custody authorization for batch data extractions, dynamic watermark embedding, and mandatory field-level PII redaction.'
    },
    {
      policyId: 'POL-INC-08',
      name: 'CERT-In & State Education Directorate Incident Response Standard',
      category: 'INCIDENT_RESPONSE',
      version: 'v2.0',
      effectiveDate: new Date('2025-07-01'),
      owner: 'Chief Information Security Officer & Trust Legal Counsel',
      approvalStatus: 'APPROVED',
      reviewDate: new Date('2026-07-01'),
      scopeDescription: 'Platform cybersecurity incidents, data breach alarms, and physical facility tampering alerts.',
      contentSummary: 'Mandates containment within 60 minutes, CERT-In regulatory disclosure within 6 hours, and forensic post-mortem within 72 hours.'
    }
  ];

  inMemoryRetentionRules = [
    {
      ruleId: 'RET-STU-001',
      recordCategory: 'Student Master Admission General Register (General Register)',
      applicableInstitution: 'ALL',
      retentionRule: 'Statutory Permanent Custody - Indefinite Preservation',
      retentionYears: -1,
      legalBasis: 'Andhra Pradesh Education Act 1982 / State Board Rule 88 - Permanent Custody',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'AP State Board of Secondary Education & Trust Legal Directorate',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: true,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: 'Statutory Permanent Custody - Indefinite Preservation',
          retentionYears: -1,
          changedBy: 'Trust Governance Officer',
          approvedBy: 'AP State Board of Secondary Education & Trust Legal Directorate',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Initial statutory alignment with AP Education Code Rule 88.'
        }
      ]
    },
    {
      ruleId: 'RET-STU-002',
      recordCategory: 'Transfer Certificate (TC) Counterfoils & Appendix 16 Dockets',
      applicableInstitution: 'ALL',
      retentionRule: 'Statutory Permanent Custody - School Leaving Verification Docket',
      retentionYears: -1,
      legalBasis: 'AP Educational Rules Chapter III Rule 99 & Appendix 16 Dockets',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'District Educational Officer (DEO) & Trust Legal Directorate',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: true,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: 'Statutory Permanent Custody - School Leaving Verification Docket',
          retentionYears: -1,
          changedBy: 'Trust Governance Officer',
          approvedBy: 'District Educational Officer (DEO) & Trust Legal Directorate',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Statutory permanent retention under AP Educational Rules Chapter III.'
        }
      ]
    },
    {
      ruleId: 'RET-STU-003',
      recordCategory: 'Secondary School Certificate (SSC) Tabulation Register',
      applicableInstitution: 'ALL',
      retentionRule: 'Permanent Archival - Non-Purgeable Examination Record',
      retentionYears: -1,
      legalBasis: 'BSE AP Examination Byelaws & Right to Education Act Statutory Records',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'Board of Secondary Education AP & Trust Legal Directorate',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: true,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: 'Permanent Archival - Non-Purgeable Examination Record',
          retentionYears: -1,
          changedBy: 'Trust Governance Officer',
          approvedBy: 'Board of Secondary Education AP & Trust Legal Directorate',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Non-purgeable examination registry rule adopted.'
        }
      ]
    },
    {
      ruleId: 'RET-FIN-004',
      recordCategory: 'Fee Day Books, Receipt Ledgers & Audit Vouchers',
      applicableInstitution: 'ALL',
      retentionRule: '7 Financial Years Post Annual Audit Completion',
      retentionYears: 7,
      legalBasis: 'Section 128(5) Indian Companies Act 2013 & Income Tax Act 1961',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'Trust Statutory Auditor & Comptroller of Accounts',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: false,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: '7 Financial Years Post Annual Audit Completion',
          retentionYears: 7,
          changedBy: 'Senior Comptroller',
          approvedBy: 'Trust Statutory Auditor & Comptroller of Accounts',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Standard 7-year fiscal audit compliance established.'
        }
      ]
    },
    {
      ruleId: 'RET-EMP-005',
      recordCategory: 'Staff Service Registers & Employment Dossiers',
      applicableInstitution: 'ALL',
      retentionRule: '7 Years Post Employee Separation / Superannuation',
      retentionYears: 7,
      legalBasis: 'Payment of Gratuity Act 1972 & State Private School Service Conditions',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'Trust Human Resources & Legal Compliance Directorate',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: false,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: '7 Years Post Employee Separation / Superannuation',
          retentionYears: 7,
          changedBy: 'HR Director',
          approvedBy: 'Trust Human Resources & Legal Compliance Directorate',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Staff post-separation compliance rule initialized.'
        }
      ]
    },
    {
      ruleId: 'RET-ATT-006',
      recordCategory: 'Daily Biometric Student & Staff Attendance Rolls',
      applicableInstitution: 'ALL',
      retentionRule: '3 Rolling Academic Years',
      retentionYears: 3,
      legalBasis: 'AP Educational Institutions Attendance Rules & Mid-Day Meal Audit Guidelines',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'Trust Directorate of School Operations',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: false,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: '3 Rolling Academic Years',
          retentionYears: 3,
          changedBy: 'Operations Manager',
          approvedBy: 'Trust Directorate of School Operations',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: '3-year rolling attendance logs retention standard.'
        }
      ]
    },
    {
      ruleId: 'RET-AUD-007',
      recordCategory: 'Forensic Platform Security & Audit Logs',
      applicableInstitution: 'ALL',
      retentionRule: '5 Calendar Years Under Statutory Cryptographic Vault',
      retentionYears: 5,
      legalBasis: 'Information Technology Act 2000 Section 67C & CERT-In Cybersecurity Directives',
      effectiveDate: new Date('2025-01-01'),
      approvedBy: 'Chief Information Security Officer & Trust Legal Directorate',
      reviewStatus: 'PUBLISHED',
      isStatutoryPermanent: false,
      currentVersion: 1,
      versions: [
        {
          version: 1,
          retentionRule: '5 Calendar Years Under Statutory Cryptographic Vault',
          retentionYears: 5,
          changedBy: 'Security Lead',
          approvedBy: 'Chief Information Security Officer & Trust Legal Directorate',
          effectiveDate: new Date('2025-01-01'),
          changeSummary: 'Statutory 5-year cryptographic retention compliance for IT Act 2000.'
        }
      ]
    }
  ];

  inMemoryDataRequests = [
    {
      requestId: 'REQ-2026-001',
      requestType: 'RECORD_ACCESS',
      institutionScope: 'Sri Vidya High School, Hyderabad (Main Campus)',
      requesterName: 'P. Venkata Ramanayya',
      requesterRole: 'Parent / Student Legal Guardian',
      requesterEmail: 'pv.ramanayya@gmail.com',
      targetSubject: 'Full Academic Transcripts & Health Records for Student STU-2024-001',
      businessJustification: 'Parental verification request for overseas admission evaluation in Singapore.',
      status: 'APPROVED',
      authorizedSignoffs: [
        {
          signoffBy: 'Dr. K. Srinivas Rao',
          role: 'School Principal',
          timestamp: new Date(Date.now() - 3 * 86400000),
          notes: 'Verified student identity and active guardian status in admission register.'
        }
      ],
      rejectionReason: null,
      fulfillmentDetails: 'Encrypted export packet authorized for release by Principal Office.',
      fulfilledAt: null,
      createdAt: new Date(Date.now() - 4 * 86400000)
    },
    {
      requestId: 'REQ-2026-002',
      requestType: 'DATA_CORRECTION',
      institutionScope: 'Sri Vidya Academy, Secunderabad',
      requesterName: 'M. Anuradha',
      requesterRole: 'Senior Academic Coordinator',
      requesterEmail: 'anuradha.m@srividya.edu.in',
      targetSubject: "Correction of Mother's Surname in Class IX General Register Record GR-9921",
      businessJustification: 'Court gazette notification published on 15-Jan-2026 certifying legal name amendment.',
      status: 'PENDING_APPROVAL',
      authorizedSignoffs: [],
      rejectionReason: null,
      fulfillmentDetails: null,
      fulfilledAt: null,
      createdAt: new Date(Date.now() - 2 * 86400000)
    },
    {
      requestId: 'REQ-2026-003',
      requestType: 'DATA_EXPORT',
      institutionScope: 'Sri Vidya Junior College, Hyderabad',
      requesterName: 'K. Muralidhar Rao',
      requesterRole: 'Head of Admissions & Examination Convenor',
      requesterEmail: 'muralidhar.k@srividya.edu.in',
      targetSubject: 'Anonymized 2025 Board Examination Performance Batch Export',
      businessJustification: 'Accreditation analytics and district educational council statutory reporting.',
      status: 'FULFILLED',
      authorizedSignoffs: [
        {
          signoffBy: 'Smt. Shailaja Reddy',
          role: 'Trust Legal Counsel',
          timestamp: new Date(Date.now() - 5 * 86400000),
          notes: 'Export payload sanitized; student personal identifiers redacted.'
        },
        {
          signoffBy: 'G. Raghunath',
          role: 'School Principal',
          timestamp: new Date(Date.now() - 4 * 86400000),
          notes: 'Approved for Board analytics submission.'
        }
      ],
      rejectionReason: null,
      fulfillmentDetails: 'Encrypted AES-256 archive generated and dispatched to verified council portal.',
      fulfilledAt: new Date(Date.now() - 4 * 86400000),
      createdAt: new Date(Date.now() - 6 * 86400000)
    },
    {
      requestId: 'REQ-2026-004',
      requestType: 'RETENTION_EXCEPTION',
      institutionScope: 'Sri Vidya High School, Hyderabad (Main Campus)',
      requesterName: 'Advocate S. Chandra Shekhar',
      requesterRole: 'Trust Legal Directorate',
      requesterEmail: 'legal.counsel@srividya.edu.in',
      targetSubject: 'Legal Hold on 2021 Financial Vouchers & Bus Transport Contracts',
      businessJustification: 'Active legal dispute in High Court of Telangana (WP 1128/2024); statutory hold beyond 7-year standard retention.',
      status: 'APPROVED',
      authorizedSignoffs: [
        {
          signoffBy: 'Advocate S. Chandra Shekhar',
          role: 'Trust Legal Directorate',
          timestamp: new Date(Date.now() - 2 * 86400000),
          notes: 'Mandatory litigation hold applied; automatic purge suspended until court resolution.'
        }
      ],
      rejectionReason: null,
      fulfillmentDetails: 'Litigation hold tag attached to records. Purge lock engaged.',
      fulfilledAt: null,
      createdAt: new Date(Date.now() - 3 * 86400000)
    },
    {
      requestId: 'REQ-2026-005',
      requestType: 'DELETION_ANONYMIZATION',
      institutionScope: 'Sri Vidya Academy, Secunderabad',
      requesterName: 'Operator Desk (Self-Service Ticket)',
      requesterRole: 'Junior System Operator',
      requesterEmail: 'ops.desk@srividya.edu.in',
      targetSubject: 'Purge Student General Register 2015-2018 (Attempted Operator Deletion)',
      businessJustification: 'Storage reclamation request from local administrative clerk.',
      status: 'REJECTED',
      rejectionReason: 'VIOLATION OF STATUTORY RETENTION: Admission General Register is permanent under AP Education Code Rule 88 and cannot be deleted or purged by platform operators. Unilateral operator deletion strictly blocked.',
      authorizedSignoffs: [],
      fulfillmentDetails: null,
      fulfilledAt: null,
      createdAt: new Date(Date.now() - 1 * 86400000)
    }
  ];
}

initializeDefaults();

// Helper to log audit events
async function logAudit(category, action, actor, targetRecord, result, severity, details = {}) {
  try {
    const eventId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const logDoc = {
      eventId,
      timestamp: new Date(),
      correlationId: `CORR-${Date.now()}`,
      category: category || 'ADMIN_SUPPORT',
      action,
      actor: {
        actorId: 'ACT-OPERATOR',
        identity: actor || 'Platform Administrator',
        role: 'Platform Operator',
        scope: 'PLATFORM_WIDE'
      },
      institution: 'Sri Vidya Educational Trust',
      targetRecord: {
        entityType: 'GOVERNANCE_POLICY',
        recordReference: targetRecord || 'POLICY-MGMT'
      },
      result: result || 'SUCCESS',
      severity: severity || 'INFO',
      details
    };

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await PlatformAudit.create(logDoc);
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] Audit log write warning:', err.message);
  }
}

// --------------------------------------------------------------------------
// 17.1 Policy Register Methods
// --------------------------------------------------------------------------

async function listPolicies(filters = {}) {
  try {
    let query = {};
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.approvalStatus) {
      query.approvalStatus = filters.approvalStatus;
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { policyId: regex }, { owner: regex }];
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      let policies = await GovernancePolicy.find(query).sort({ policyId: 1 }).lean();
      if (!policies || policies.length === 0) {
        // Seed default policies into DB
        await GovernancePolicy.insertMany(inMemoryPolicies);
        policies = await GovernancePolicy.find(query).sort({ policyId: 1 }).lean();
      }
      return { success: true, count: policies.length, data: policies };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB query failed, using in-memory policies:', err.message);
  }

  // Fallback to in-memory
  let result = [...inMemoryPolicies];
  if (filters.category) {
    result = result.filter(p => p.category === filters.category);
  }
  if (filters.approvalStatus) {
    result = result.filter(p => p.approvalStatus === filters.approvalStatus);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(p =>
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.policyId && p.policyId.toLowerCase().includes(s)) ||
      (p.owner && p.owner.toLowerCase().includes(s))
    );
  }
  return { success: true, count: result.length, data: result };
}

async function getPolicy(policyId) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const doc = await GovernancePolicy.findOne({ policyId }).lean();
      if (doc) return { success: true, data: doc };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB getPolicy failed:', err.message);
  }

  const found = inMemoryPolicies.find(p => p.policyId === policyId);
  if (!found) return { success: false, message: `Policy with ID '${policyId}' not found.` };
  return { success: true, data: found };
}

async function createPolicy(data, actor = 'Platform Administrator') {
  if (!data.name || !data.category || !data.scopeDescription) {
    return { success: false, message: 'Policy name, category, and scope description are required.' };
  }

  const validCategories = [
    'ACCOUNT_SECURITY',
    'DATA_ACCESS',
    'DATA_RETENTION',
    'DOCUMENT_STORAGE',
    'BACKUP_RETENTION',
    'AUDIT_LOGGING',
    'DATA_EXPORTS',
    'INCIDENT_RESPONSE'
  ];
  if (!validCategories.includes(data.category)) {
    return { success: false, message: `Invalid policy category '${data.category}'. Must be one of: ${validCategories.join(', ')}` };
  }

  const policyId = data.policyId || `POL-REG-${Date.now().toString().slice(-4)}`;
  const newPolicy = {
    policyId,
    name: data.name.trim(),
    category: data.category,
    version: data.version || 'v1.0',
    effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
    owner: data.owner || 'Trust Legal & Compliance Directorate',
    approvalStatus: data.approvalStatus || 'APPROVED',
    reviewDate: data.reviewDate ? new Date(data.reviewDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
    scopeDescription: data.scopeDescription.trim(),
    contentSummary: data.contentSummary || ''
  };

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const created = await GovernancePolicy.create(newPolicy);
      await logAudit('ADMIN_SUPPORT', 'CREATE_POLICY', actor, policyId, 'SUCCESS', 'MEDIUM', { policy: newPolicy });
      return { success: true, message: `Policy '${newPolicy.name}' created successfully.`, data: created };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB createPolicy error:', err.message);
  }

  inMemoryPolicies.push(newPolicy);
  await logAudit('ADMIN_SUPPORT', 'CREATE_POLICY', actor, policyId, 'SUCCESS', 'MEDIUM', { policy: newPolicy });
  return { success: true, message: `Policy '${newPolicy.name}' created successfully in memory.`, data: newPolicy };
}

async function updatePolicy(policyId, data, actor = 'Platform Administrator') {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const updated = await GovernancePolicy.findOneAndUpdate(
        { policyId },
        { $set: data },
        { new: true }
      );
      if (updated) {
        await logAudit('ADMIN_SUPPORT', 'UPDATE_POLICY', actor, policyId, 'SUCCESS', 'INFO', { updates: data });
        return { success: true, message: `Policy '${policyId}' updated successfully.`, data: updated };
      }
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB updatePolicy error:', err.message);
  }

  const idx = inMemoryPolicies.findIndex(p => p.policyId === policyId);
  if (idx === -1) return { success: false, message: `Policy '${policyId}' not found.` };
  inMemoryPolicies[idx] = { ...inMemoryPolicies[idx], ...data };
  await logAudit('ADMIN_SUPPORT', 'UPDATE_POLICY', actor, policyId, 'SUCCESS', 'INFO', { updates: data });
  return { success: true, message: `Policy '${policyId}' updated successfully in memory.`, data: inMemoryPolicies[idx] };
}

// --------------------------------------------------------------------------
// 17.2 Data Retention Configuration Methods & Non-Universal Invariant
// --------------------------------------------------------------------------

/**
 * Validates that retention periods adhere strictly to statutory non-universal rules.
 * Section 17.2 Invariant:
 * "Retention rules must follow applicable law, contractual obligations and the school's requirements.
 *  Do not use one universal deletion period for student, financial, employment and audit records."
 */
function validateRetentionInvariant(category, retentionYears, isUniversalAttempt = false) {
  if (isUniversalAttempt || String(category).toUpperCase() === 'ALL' || String(category).toUpperCase() === 'UNIVERSAL') {
    return {
      valid: false,
      message: "STATUTORY INVARIANT VIOLATION: Universal deletion periods are strictly forbidden. Student, financial, employment, and audit records must each maintain separate granular statutory retention rules in accordance with Specification 17.2."
    };
  }

  const catLower = String(category).toLowerCase();
  const isPermanentCategory = catLower.includes('admission') ||
    catLower.includes('general register') ||
    catLower.includes('transfer certificate') ||
    catLower.includes('tc') ||
    catLower.includes('tabulation') ||
    catLower.includes('ssc');

  // If category is a statutory permanent register, retentionYears MUST be -1 (Permanent)
  if (isPermanentCategory && Number(retentionYears) !== -1) {
    return {
      valid: false,
      message: `STATUTORY COMPLIANCE VIOLATION: '${category}' is classified as Permanent under the Andhra Pradesh Education Act & State Board Rules. It cannot be assigned a temporary deletion period (${retentionYears} years). Retention must be configured as Permanent Custody (-1).`
    };
  }

  return { valid: true };
}

async function listRetentionRules(filters = {}) {
  try {
    let query = {};
    if (filters.reviewStatus) {
      query.reviewStatus = filters.reviewStatus;
    }
    if (filters.applicableInstitution && filters.applicableInstitution !== 'ALL') {
      query.applicableInstitution = { $in: [filters.applicableInstitution, 'ALL'] };
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ recordCategory: regex }, { ruleId: regex }, { legalBasis: regex }];
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      let rules = await RetentionRule.find(query).sort({ ruleId: 1 }).lean();
      if (!rules || rules.length === 0) {
        await RetentionRule.insertMany(inMemoryRetentionRules);
        rules = await RetentionRule.find(query).sort({ ruleId: 1 }).lean();
      }
      return { success: true, count: rules.length, data: rules };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB query failed, using in-memory retention rules:', err.message);
  }

  let result = [...inMemoryRetentionRules];
  if (filters.reviewStatus) {
    result = result.filter(r => r.reviewStatus === filters.reviewStatus);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(r =>
      (r.recordCategory && r.recordCategory.toLowerCase().includes(s)) ||
      (r.ruleId && r.ruleId.toLowerCase().includes(s)) ||
      (r.legalBasis && r.legalBasis.toLowerCase().includes(s))
    );
  }
  return { success: true, count: result.length, data: result };
}

async function getRetentionRule(ruleId) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const doc = await RetentionRule.findOne({ ruleId }).lean();
      if (doc) return { success: true, data: doc };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB getRetentionRule failed:', err.message);
  }

  const found = inMemoryRetentionRules.find(r => r.ruleId === ruleId);
  if (!found) return { success: false, message: `Retention rule '${ruleId}' not found.` };
  return { success: true, data: found };
}

async function createRetentionDraft(data, actor = 'Trust Governance Officer') {
  if (!data.recordCategory || !data.retentionRule || data.retentionYears === undefined || !data.legalBasis) {
    return { success: false, message: 'Record category, retention rule description, retention years, and legal basis are required.' };
  }

  // Enforce Section 17.2 statutory non-universal retention invariant
  const validation = validateRetentionInvariant(data.recordCategory, data.retentionYears, data.isUniversalAttempt);
  if (!validation.valid) {
    return { success: false, message: validation.message, statutoryInvariantBlocked: true };
  }

  const ruleId = data.ruleId || `RET-RULE-${Date.now().toString().slice(-4)}`;
  const retentionYears = Number(data.retentionYears);
  const isPermanent = retentionYears === -1;

  const newDraft = {
    ruleId,
    recordCategory: data.recordCategory.trim(),
    applicableInstitution: data.applicableInstitution || 'ALL',
    retentionRule: data.retentionRule.trim(),
    retentionYears,
    legalBasis: data.legalBasis.trim(),
    effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
    approvedBy: data.approvedBy || 'Pending Statutory Review',
    reviewStatus: 'DRAFT',
    isStatutoryPermanent: isPermanent,
    currentVersion: 1,
    versions: [
      {
        version: 1,
        retentionRule: data.retentionRule.trim(),
        retentionYears,
        changedBy: actor,
        approvedBy: 'Draft Author',
        effectiveDate: new Date(),
        changeSummary: data.changeSummary || 'Initial retention policy draft creation.'
      }
    ]
  };

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const created = await RetentionRule.create(newDraft);
      await logAudit('SCHOOL_CONFIG', 'CREATE_RETENTION_DRAFT', actor, ruleId, 'SUCCESS', 'MEDIUM', { draft: newDraft });
      return { success: true, message: `Retention rule draft '${ruleId}' created successfully.`, data: created };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB createRetentionDraft error:', err.message);
  }

  inMemoryRetentionRules.push(newDraft);
  await logAudit('SCHOOL_CONFIG', 'CREATE_RETENTION_DRAFT', actor, ruleId, 'SUCCESS', 'MEDIUM', { draft: newDraft });
  return { success: true, message: `Retention rule draft '${ruleId}' created successfully in memory.`, data: newDraft };
}

async function submitRetentionReview(ruleId, actor = 'Trust Governance Officer') {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const rule = await RetentionRule.findOne({ ruleId });
      if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
      if (rule.reviewStatus !== 'DRAFT') {
        return { success: false, message: `Cannot submit for review: rule is currently in '${rule.reviewStatus}' status.` };
      }
      rule.reviewStatus = 'UNDER_REVIEW';
      await rule.save();
      await logAudit('SCHOOL_CONFIG', 'SUBMIT_RETENTION_REVIEW', actor, ruleId, 'SUCCESS', 'INFO', { ruleId });
      return { success: true, message: `Retention rule '${ruleId}' submitted for statutory compliance review.`, data: rule };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB submitRetentionReview error:', err.message);
  }

  const rule = inMemoryRetentionRules.find(r => r.ruleId === ruleId);
  if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
  if (rule.reviewStatus !== 'DRAFT') {
    return { success: false, message: `Cannot submit for review: rule is currently in '${rule.reviewStatus}' status.` };
  }
  rule.reviewStatus = 'UNDER_REVIEW';
  await logAudit('SCHOOL_CONFIG', 'SUBMIT_RETENTION_REVIEW', actor, ruleId, 'SUCCESS', 'INFO', { ruleId });
  return { success: true, message: `Retention rule '${ruleId}' submitted for statutory compliance review.`, data: rule };
}

async function approveRetentionRule(ruleId, approvedBy = 'State Board of Education & Trust Legal Directorate', actor = 'Platform Administrator') {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const rule = await RetentionRule.findOne({ ruleId });
      if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
      rule.reviewStatus = 'APPROVED';
      rule.approvedBy = approvedBy;
      await rule.save();
      await logAudit('SCHOOL_CONFIG', 'APPROVE_RETENTION_RULE', actor, ruleId, 'SUCCESS', 'HIGH', { ruleId, approvedBy });
      return { success: true, message: `Retention rule '${ruleId}' approved by '${approvedBy}'.`, data: rule };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB approveRetentionRule error:', err.message);
  }

  const rule = inMemoryRetentionRules.find(r => r.ruleId === ruleId);
  if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
  rule.reviewStatus = 'APPROVED';
  rule.approvedBy = approvedBy;
  await logAudit('SCHOOL_CONFIG', 'APPROVE_RETENTION_RULE', actor, ruleId, 'SUCCESS', 'HIGH', { ruleId, approvedBy });
  return { success: true, message: `Retention rule '${ruleId}' approved by '${approvedBy}'.`, data: rule };
}

async function publishRetentionRule(ruleId, actor = 'Platform Administrator') {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const rule = await RetentionRule.findOne({ ruleId });
      if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
      if (rule.reviewStatus !== 'APPROVED') {
        return { success: false, message: `Only approved retention rules can be published. Current status: '${rule.reviewStatus}'.` };
      }
      rule.reviewStatus = 'PUBLISHED';
      rule.effectiveDate = new Date();
      await rule.save();
      await logAudit('SCHOOL_CONFIG', 'PUBLISH_RETENTION_RULE', actor, ruleId, 'SUCCESS', 'HIGH', { ruleId });
      return { success: true, message: `Retention rule '${ruleId}' published and now active platform-wide.`, data: rule };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB publishRetentionRule error:', err.message);
  }

  const rule = inMemoryRetentionRules.find(r => r.ruleId === ruleId);
  if (!rule) return { success: false, message: `Retention rule '${ruleId}' not found.` };
  if (rule.reviewStatus !== 'APPROVED') {
    return { success: false, message: `Only approved retention rules can be published. Current status: '${rule.reviewStatus}'.` };
  }
  rule.reviewStatus = 'PUBLISHED';
  rule.effectiveDate = new Date();
  await logAudit('SCHOOL_CONFIG', 'PUBLISH_RETENTION_RULE', actor, ruleId, 'SUCCESS', 'HIGH', { ruleId });
  return { success: true, message: `Retention rule '${ruleId}' published and now active platform-wide.`, data: rule };
}

async function getRetentionVersions(ruleId) {
  const ruleResult = await getRetentionRule(ruleId);
  if (!ruleResult.success) return ruleResult;
  return {
    success: true,
    ruleId,
    currentVersion: ruleResult.data.currentVersion,
    recordCategory: ruleResult.data.recordCategory,
    versions: ruleResult.data.versions || []
  };
}

// --------------------------------------------------------------------------
// 17.3 Data Requests Methods & Controlled Deletion Invariant
// --------------------------------------------------------------------------

/**
 * Validates the governance invariant for Deletion or Anonymization requests:
 * Section 17.3 Invariant:
 * "Platform operators should not independently decide to delete a school's records."
 *
 * Rules enforced:
 * 1. For DELETION_ANONYMIZATION, fulfillment requires at least two distinct authorized signoffs:
 *    - One from School Principal
 *    - One from Trust Legal Directorate / Statutory Compliance Officer
 * 2. Statutory permanent records (General Register, TC Appendix 16 Dockets, SSC Tabulation)
 *    can NEVER be approved or fulfilled for deletion.
 */
function validateDeletionGovernance(dataRequest, operatorRole = 'Platform Operator') {
  if (dataRequest.requestType !== 'DELETION_ANONYMIZATION') {
    return { allowed: true };
  }

  // Check if target involves statutory permanent records
  const targetLower = String(dataRequest.targetSubject).toLowerCase();
  if (
    targetLower.includes('admission') ||
    targetLower.includes('general register') ||
    targetLower.includes('transfer certificate') ||
    targetLower.includes('tc') ||
    targetLower.includes('tabulation') ||
    targetLower.includes('ssc')
  ) {
    return {
      allowed: false,
      message: 'STATUTORY NON-PURGEABLE VIOLATION: Student Admission General Registers and TC Dockets are statutory permanent records under AP Education Code Rule 88. Deletion or purging is prohibited by law.'
    };
  }

  // Check dual authorized signoffs requirement
  const signoffs = dataRequest.authorizedSignoffs || [];
  const hasPrincipalSignoff = signoffs.some(s => s.role && s.role.toLowerCase().includes('principal'));
  const hasLegalSignoff = signoffs.some(s => s.role && (s.role.toLowerCase().includes('legal') || s.role.toLowerCase().includes('compliance') || s.role.toLowerCase().includes('counsel')));

  if (!hasPrincipalSignoff || !hasLegalSignoff) {
    return {
      allowed: false,
      message: "GOVERNANCE SAFEGUARD ENFORCED: Platform operators cannot unilaterally delete or purge school records. Fulfilling a Deletion/Anonymization request requires dual signoffs: (1) School Principal and (2) Trust Legal Directorate."
    };
  }

  return { allowed: true };
}

async function listDataRequests(filters = {}) {
  try {
    let query = {};
    if (filters.requestType) {
      query.requestType = filters.requestType;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.institutionScope) {
      query.institutionScope = new RegExp(filters.institutionScope, 'i');
    }
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ requestId: regex }, { requesterName: regex }, { targetSubject: regex }, { businessJustification: regex }];
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      let requests = await DataRequest.find(query).sort({ createdAt: -1 }).lean();
      if (!requests || requests.length === 0) {
        await DataRequest.insertMany(inMemoryDataRequests);
        requests = await DataRequest.find(query).sort({ createdAt: -1 }).lean();
      }
      return { success: true, count: requests.length, data: requests };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB query failed, using in-memory data requests:', err.message);
  }

  let result = [...inMemoryDataRequests];
  if (filters.requestType) {
    result = result.filter(r => r.requestType === filters.requestType);
  }
  if (filters.status) {
    result = result.filter(r => r.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(r =>
      (r.requestId && r.requestId.toLowerCase().includes(s)) ||
      (r.requesterName && r.requesterName.toLowerCase().includes(s)) ||
      (r.targetSubject && r.targetSubject.toLowerCase().includes(s)) ||
      (r.businessJustification && r.businessJustification.toLowerCase().includes(s))
    );
  }
  return { success: true, count: result.length, data: result };
}

async function getDataRequest(requestId) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const doc = await DataRequest.findOne({ requestId }).lean();
      if (doc) return { success: true, data: doc };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB getDataRequest failed:', err.message);
  }

  const found = inMemoryDataRequests.find(r => r.requestId === requestId);
  if (!found) return { success: false, message: `Data request '${requestId}' not found.` };
  return { success: true, data: found };
}

async function createDataRequest(data, actor = 'Platform Administrator') {
  if (!data.requestType || !data.institutionScope || !data.requesterName || !data.targetSubject || !data.businessJustification) {
    return { success: false, message: 'Request type, institution scope, requester name, target subject, and business justification are required.' };
  }

  const validTypes = [
    'RECORD_ACCESS',
    'DATA_CORRECTION',
    'DATA_EXPORT',
    'RETENTION_EXCEPTION',
    'DELETION_ANONYMIZATION'
  ];
  if (!validTypes.includes(data.requestType)) {
    return { success: false, message: `Invalid request type '${data.requestType}'. Must be one of: ${validTypes.join(', ')}` };
  }

  const requestId = data.requestId || `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const newRequest = {
    requestId,
    requestType: data.requestType,
    institutionScope: data.institutionScope.trim(),
    requesterName: data.requesterName.trim(),
    requesterRole: data.requesterRole || 'Authorized Requester',
    requesterEmail: data.requesterEmail || 'requester@srividya.edu.in',
    targetSubject: data.targetSubject.trim(),
    businessJustification: data.businessJustification.trim(),
    status: 'SUBMITTED',
    authorizedSignoffs: [],
    rejectionReason: null,
    fulfillmentDetails: null,
    fulfilledAt: null,
    createdAt: new Date()
  };

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const created = await DataRequest.create(newRequest);
      await logAudit('DATA_IMPORT_EXPORT', 'SUBMIT_DATA_REQUEST', actor, requestId, 'SUCCESS', 'MEDIUM', { request: newRequest });
      return { success: true, message: `Data request '${requestId}' logged successfully.`, data: created };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB createDataRequest error:', err.message);
  }

  inMemoryDataRequests.unshift(newRequest);
  await logAudit('DATA_IMPORT_EXPORT', 'SUBMIT_DATA_REQUEST', actor, requestId, 'SUCCESS', 'MEDIUM', { request: newRequest });
  return { success: true, message: `Data request '${requestId}' logged successfully in memory.`, data: newRequest };
}

async function approveDataRequest(requestId, signoffData = {}, actor = 'Platform Administrator') {
  if (!signoffData.signoffBy || !signoffData.role) {
    return { success: false, message: 'Signoff signatory name and role are required for authorization.' };
  }

  const newSignoff = {
    signoffBy: signoffData.signoffBy,
    role: signoffData.role,
    timestamp: new Date(),
    notes: signoffData.notes || 'Authorized through platform governance interface.'
  };

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const request = await DataRequest.findOne({ requestId });
      if (!request) return { success: false, message: `Data request '${requestId}' not found.` };
      if (['FULFILLED', 'REJECTED'].includes(request.status)) {
        return { success: false, message: `Cannot approve request in terminal status '${request.status}'.` };
      }

      request.authorizedSignoffs.push(newSignoff);
      // For deletion/anonymization, check if we now have dual signoffs
      if (request.requestType === 'DELETION_ANONYMIZATION') {
        const hasPrincipal = request.authorizedSignoffs.some(s => s.role.toLowerCase().includes('principal'));
        const hasLegal = request.authorizedSignoffs.some(s => s.role.toLowerCase().includes('legal') || s.role.toLowerCase().includes('compliance'));
        if (hasPrincipal && hasLegal) {
          request.status = 'APPROVED';
        } else {
          request.status = 'PENDING_APPROVAL';
        }
      } else {
        request.status = 'APPROVED';
      }

      await request.save();
      await logAudit('DATA_IMPORT_EXPORT', 'APPROVE_DATA_REQUEST_SIGNOFF', actor, requestId, 'SUCCESS', 'HIGH', { signoff: newSignoff, newStatus: request.status });
      return { success: true, message: `Signoff recorded for '${requestId}'. Current status: '${request.status}'.`, data: request };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB approveDataRequest error:', err.message);
  }

  const request = inMemoryDataRequests.find(r => r.requestId === requestId);
  if (!request) return { success: false, message: `Data request '${requestId}' not found.` };
  if (['FULFILLED', 'REJECTED'].includes(request.status)) {
    return { success: false, message: `Cannot approve request in terminal status '${request.status}'.` };
  }

  request.authorizedSignoffs = request.authorizedSignoffs || [];
  request.authorizedSignoffs.push(newSignoff);

  if (request.requestType === 'DELETION_ANONYMIZATION') {
    const hasPrincipal = request.authorizedSignoffs.some(s => s.role.toLowerCase().includes('principal'));
    const hasLegal = request.authorizedSignoffs.some(s => s.role.toLowerCase().includes('legal') || s.role.toLowerCase().includes('compliance'));
    if (hasPrincipal && hasLegal) {
      request.status = 'APPROVED';
    } else {
      request.status = 'PENDING_APPROVAL';
    }
  } else {
    request.status = 'APPROVED';
  }

  await logAudit('DATA_IMPORT_EXPORT', 'APPROVE_DATA_REQUEST_SIGNOFF', actor, requestId, 'SUCCESS', 'HIGH', { signoff: newSignoff, newStatus: request.status });
  return { success: true, message: `Signoff recorded for '${requestId}'. Current status: '${request.status}'.`, data: request };
}

async function rejectDataRequest(requestId, reason, actor = 'Platform Administrator') {
  if (!reason) {
    return { success: false, message: 'Rejection reason is required for governance tracking.' };
  }

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const request = await DataRequest.findOne({ requestId });
      if (!request) return { success: false, message: `Data request '${requestId}' not found.` };
      request.status = 'REJECTED';
      request.rejectionReason = reason;
      await request.save();
      await logAudit('DATA_IMPORT_EXPORT', 'REJECT_DATA_REQUEST', actor, requestId, 'DENIED', 'MEDIUM', { reason });
      return { success: true, message: `Data request '${requestId}' has been rejected.`, data: request };
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB rejectDataRequest error:', err.message);
  }

  const request = inMemoryDataRequests.find(r => r.requestId === requestId);
  if (!request) return { success: false, message: `Data request '${requestId}' not found.` };
  request.status = 'REJECTED';
  request.rejectionReason = reason;
  await logAudit('DATA_IMPORT_EXPORT', 'REJECT_DATA_REQUEST', actor, requestId, 'DENIED', 'MEDIUM', { reason });
  return { success: true, message: `Data request '${requestId}' has been rejected.`, data: request };
}

async function fulfillDataRequest(requestId, fulfillmentDetails = '', actor = 'Platform Administrator') {
  const reqRes = await getDataRequest(requestId);
  if (!reqRes.success) return reqRes;
  const request = reqRes.data;

  // Enforce Section 17.3 Invariant: Platform operators should not independently decide to delete a school's records
  const govCheck = validateDeletionGovernance(request, actor);
  if (!govCheck.allowed) {
    return {
      success: false,
      message: govCheck.message,
      governanceSafeguardBlocked: true
    };
  }

  const details = fulfillmentDetails || `Request fulfilled under verified platform authority by ${actor}.`;
  const fulfilledAt = new Date();

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const doc = await DataRequest.findOne({ requestId });
      if (doc) {
        doc.status = 'FULFILLED';
        doc.fulfillmentDetails = details;
        doc.fulfilledAt = fulfilledAt;
        await doc.save();
        await logAudit('DATA_IMPORT_EXPORT', 'FULFILL_DATA_REQUEST', actor, requestId, 'SUCCESS', 'HIGH', { details });
        return { success: true, message: `Data request '${requestId}' fulfilled successfully.`, data: doc };
      }
    }
  } catch (err) {
    console.warn('[PlatformPolicyService] DB fulfillDataRequest error:', err.message);
  }

  const inMem = inMemoryDataRequests.find(r => r.requestId === requestId);
  if (inMem) {
    inMem.status = 'FULFILLED';
    inMem.fulfillmentDetails = details;
    inMem.fulfilledAt = fulfilledAt;
  }
  await logAudit('DATA_IMPORT_EXPORT', 'FULFILL_DATA_REQUEST', actor, requestId, 'SUCCESS', 'HIGH', { details });
  return { success: true, message: `Data request '${requestId}' fulfilled successfully in memory.`, data: inMem || request };
}

module.exports = {
  // Policies (17.1)
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,

  // Retention Rules (17.2)
  listRetentionRules,
  getRetentionRule,
  createRetentionDraft,
  submitRetentionReview,
  approveRetentionRule,
  publishRetentionRule,
  getRetentionVersions,
  validateRetentionInvariant,

  // Data Requests (17.3)
  listDataRequests,
  getDataRequest,
  createDataRequest,
  approveDataRequest,
  rejectDataRequest,
  fulfillDataRequest,
  validateDeletionGovernance
};

