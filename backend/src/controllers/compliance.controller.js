/**
 * Legal, Privacy & Compliance Controller
 * Implements Indian DPDP Act 2023, GDPR, AP Education Act statutory mandates,
 * Cookie preferences, DPA registry, Data Subject Access Requests (SAR), and Data Breach incident handling.
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { formatSuccess } = require('../utils/apiResponse');
const { ConsentRecord, CONSENT_TYPES } = require('../models/consentRecord.model');
const DataBreachIncident = require('../models/dataBreachIncident.model');
const ThirdPartyDpa = require('../models/thirdPartyDpa.model');
const PolicyVersion = require('../models/policyVersion.model');
const { User } = require('../models/user.model');
const { Student } = require('../models/student.model');
const { AuditLog } = require('../models/auditLog.model');
const auditLicenses = require('../../scripts/audit_licenses');

/**
 * Seed initial third-party DPAs and policy versions if empty
 */
async function ensureComplianceDefaults() {
  try {
    const dpaCount = await ThirdPartyDpa.countDocuments();
    if (dpaCount === 0) {
      await ThirdPartyDpa.insertMany([
        {
          vendorId: 'VND-AWS-MUMBAI',
          name: 'Amazon Web Services India Pvt. Ltd.',
          serviceType: 'CLOUD_HOSTING_INFRASTRUCTURE',
          dataCategoriesShared: ['Encrypted Database Backups', 'ERP Application Binaries', 'Object Storage'],
          serverJurisdiction: 'India (ap-south-1 Mumbai Data Residency)',
          dpaStatus: 'ACTIVE',
          securityCertifications: ['ISO/IEC 27001', 'SOC 1/2/3', 'PCI-DSS Level 1'],
          contactEmail: 'aws-compliance@amazon.com',
          purposeDescription: 'Encrypted cloud compute, database cluster hosting, and cold vault disaster recovery snapshots.',
          dataProtectionOfficerContact: 'aws-dpo@amazon.com',
        },
        {
          vendorId: 'VND-RAZORPAY-IN',
          name: 'Razorpay Software Private Limited',
          serviceType: 'PAYMENT_GATEWAY',
          dataCategoriesShared: ['Student Admission Number', 'Fee Due Amount', 'Payment Transaction Reference'],
          serverJurisdiction: 'India (RBI Regulated / Indian Data Localization)',
          dpaStatus: 'ACTIVE',
          securityCertifications: ['PCI-DSS 4.0 Certified', 'ISO 27001:2013'],
          contactEmail: 'security@razorpay.com',
          purposeDescription: 'Processing school tuition, admission fees, and digital fee receipts.',
          dataProtectionOfficerContact: 'dpo@razorpay.com',
        },
        {
          vendorId: 'VND-WHATSAPP-META',
          name: 'Meta Platforms Inc. / WhatsApp Cloud API',
          serviceType: 'WHATSAPP_BUSINESS_API',
          dataCategoriesShared: ['Guardian Phone Number', 'Scholastic Circulars', 'Fee Due Notices'],
          serverJurisdiction: 'India Data Residency Route (DPDP Section 9 Compliant)',
          dpaStatus: 'ACTIVE',
          securityCertifications: ['SOC 2 Type II', 'ISO 27001'],
          contactEmail: 'enterprise-support@whatsapp.com',
          purposeDescription: 'Direct-to-parent verified attendance notifications, report card alerts, and school emergency announcements.',
          dataProtectionOfficerContact: 'whatsapp-dpo@meta.com',
        },
      ]);
    }

    const policyCount = await PolicyVersion.countDocuments();
    if (policyCount === 0) {
      await PolicyVersion.insertMany([
        {
          policyType: 'PRIVACY_POLICY',
          version: 'v2.0.0',
          title: 'Institutional Data Privacy & Minor Protection Charter',
          effectiveDate: new Date('2026-06-01'),
          changeSummary: 'Harmonized with Indian DPDP Act 2023, minor student non-tracking rules, and AP Education Department guidelines.',
          approvalAuthority: 'Principal Smt. Gorle Varalakshmi & Legal Advisory Directorate',
          isCurrentActive: true,
          legalReviewStatus: 'APPROVED_BY_LEGAL_COUNSEL',
        },
        {
          policyType: 'TERMS_OF_SERVICE',
          version: 'v2.0.0',
          title: 'Sri Vidya ERP Master Terms & Acceptable Use Policy',
          effectiveDate: new Date('2026-06-01'),
          changeSummary: 'Established academic evaluation integrity rules, role-based boundary enforcement, and fee payment terms.',
          approvalAuthority: 'Executive Board & Principal Office',
          isCurrentActive: true,
          legalReviewStatus: 'APPROVED_BY_LEGAL_COUNSEL',
        },
        {
          policyType: 'COOKIE_POLICY',
          version: 'v1.1.0',
          title: 'Cookie Consent & Local Storage Governance Policy',
          effectiveDate: new Date('2026-06-01'),
          changeSummary: 'Categorized strictly essential vs functional vs performance telemetry cookies with opt-in preferences.',
          approvalAuthority: 'Chief Information Security Officer',
          isCurrentActive: true,
          legalReviewStatus: 'APPROVED_BY_LEGAL_COUNSEL',
        },
        {
          policyType: 'FEE_AND_REFUND_POLICY',
          version: 'v1.0.0',
          title: 'Institutional Fee Schedule, Receipts & Concession Policy',
          effectiveDate: new Date('2026-06-01'),
          changeSummary: 'Prescribes official receipt validity, admission fee rules, and statutory fee preservation.',
          approvalAuthority: 'Principal & Trust Financial Directorate',
          isCurrentActive: true,
          legalReviewStatus: 'APPROVED_BY_LEGAL_COUNSEL',
        },
      ]);
    }
  } catch (err) {
    console.warn('Compliance seeding note:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 1. CONSENT MANAGEMENT
// -----------------------------------------------------------------------------
const recordConsent = asyncHandler(async (req, res) => {
  const { consentType, status, policyVersion, metadata, guardianUserId, studentAdmissionNo } = req.body;

  if (!consentType || !CONSENT_TYPES.includes(consentType)) {
    throw ApiError.badRequest(`Invalid consentType. Permitted: [${CONSENT_TYPES.join(', ')}]`);
  }

  const consentStatus = status === 'REVOKED' ? 'REVOKED' : 'GRANTED';
  const rawIp = req.ip || req.connection?.remoteAddress || '';
  const anonymizedIp = rawIp.includes('.') ? rawIp.replace(/\.\d+$/, '.0') : '0.0.0.0';

  let legalBasis = 'EXPLICIT_CONSENT';
  if (consentType === 'PARENTAL_CONSENT_STUDENT_DATA') {
    legalBasis = 'PARENTAL_GUARDIAN_CONSENT';
  } else if (consentType === 'COOKIE_ESSENTIAL' || consentType === 'TERMS_OF_SERVICE') {
    legalBasis = 'CONTRACTUAL_NECESSITY';
  }

  const record = await ConsentRecord.create({
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : 'ANONYMOUS',
    guardianUserId: guardianUserId || null,
    studentAdmissionNo: studentAdmissionNo || null,
    consentType,
    status: consentStatus,
    policyVersion: policyVersion || 'v2.0.0',
    ipAddress: anonymizedIp,
    userAgent: req.get('User-Agent') || '',
    legalBasis,
    withdrawnAt: consentStatus === 'REVOKED' ? new Date() : null,
    metadata: metadata || {},
  });

  AuditLog.create({
    user: req.user ? req.user.fullName || req.user.username : 'Anonymous User',
    userId: req.user ? req.user._id : null,
    role: req.user ? req.user.role : 'ANONYMOUS',
    action: `CONSENT_${consentStatus}`,
    module: 'PERMISSIONS',
    recordReference: consentType,
    reason: `User recorded ${consentStatus.toLowerCase()} for ${consentType}`,
    result: 'SUCCESS',
  }).catch(() => {});

  res.status(201).json(formatSuccess(record, `Consent preference for ${consentType} successfully recorded.`));
});

const getMyConsents = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(200).json(formatSuccess([], 'No user consent records'));
  }
  const records = await ConsentRecord.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(formatSuccess(records, 'User consent records retrieved'));
});

const getConsentLedger = asyncHandler(async (req, res) => {
  const { limit = 50, consentType } = req.query;
  const filter = {};
  if (consentType) filter.consentType = consentType;

  const records = await ConsentRecord.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit, 10) || 50, 100))
    .populate('userId', 'username fullName role email')
    .populate('guardianUserId', 'username fullName role phone');

  const totalConsents = await ConsentRecord.countDocuments();
  const grantedCount = await ConsentRecord.countDocuments({ status: 'GRANTED' });
  const revokedCount = await ConsentRecord.countDocuments({ status: 'REVOKED' });

  res.status(200).json(
    formatSuccess(
      {
        totalConsents,
        grantedCount,
        revokedCount,
        records,
      },
      'Compliance consent ledger retrieved successfully'
    )
  );
});

// -----------------------------------------------------------------------------
// 2. POLICIES & VERSIONS
// -----------------------------------------------------------------------------
const getPolicies = asyncHandler(async (req, res) => {
  await ensureComplianceDefaults();
  const policies = await PolicyVersion.find().sort({ effectiveDate: -1 });
  res.status(200).json(formatSuccess(policies, 'Platform policy versions retrieved'));
});

const publishPolicyVersion = asyncHandler(async (req, res) => {
  const { policyType, version, title, changeSummary, approvalAuthority } = req.body;

  if (!policyType || !version || !title) {
    throw ApiError.badRequest('policyType, version, and title are required.');
  }

  // Mark previous as non-active
  await PolicyVersion.updateMany({ policyType }, { isCurrentActive: false });

  const newPolicy = await PolicyVersion.create({
    policyType,
    version,
    title,
    changeSummary: changeSummary || 'Published updated institutional version.',
    approvalAuthority: approvalAuthority || 'Principal & Legal Directorate',
    isCurrentActive: true,
    legalReviewStatus: 'APPROVED_BY_LEGAL_COUNSEL',
  });

  AuditLog.create({
    user: req.user.fullName || req.user.username,
    userId: req.user._id,
    role: req.user.role,
    action: 'POLICY_VERSION_PUBLISHED',
    module: 'SETTINGS',
    recordReference: `${policyType} (${version})`,
    reason: `Published updated compliance version: ${title}`,
    result: 'SUCCESS',
  }).catch(() => {});

  res.status(201).json(formatSuccess(newPolicy, 'New policy version published successfully.'));
});

// -----------------------------------------------------------------------------
// 3. THIRD-PARTY DPAS & PROCESSOR REGISTRY
// -----------------------------------------------------------------------------
const getThirdPartyDpas = asyncHandler(async (req, res) => {
  await ensureComplianceDefaults();
  const dpas = await ThirdPartyDpa.find().sort({ name: 1 });
  res.status(200).json(formatSuccess(dpas, 'Third-party Data Processing Agreements retrieved'));
});

const registerDpa = asyncHandler(async (req, res) => {
  const { vendorId, name, serviceType, dataCategoriesShared, serverJurisdiction, purposeDescription, contactEmail } = req.body;

  if (!vendorId || !name || !serviceType || !purposeDescription) {
    throw ApiError.badRequest('vendorId, name, serviceType, and purposeDescription are required.');
  }

  const dpa = await ThirdPartyDpa.findOneAndUpdate(
    { vendorId },
    {
      vendorId,
      name,
      serviceType,
      dataCategoriesShared: dataCategoriesShared || [],
      serverJurisdiction: serverJurisdiction || 'India (ap-south-1 Mumbai)',
      purposeDescription,
      contactEmail: contactEmail || '',
      dpaStatus: 'ACTIVE',
      dpaExecutionDate: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(201).json(formatSuccess(dpa, 'Third-party DPA saved successfully.'));
});

// -----------------------------------------------------------------------------
// 4. DATA BREACH MANAGEMENT
// -----------------------------------------------------------------------------
const listBreachIncidents = asyncHandler(async (req, res) => {
  const incidents = await DataBreachIncident.find().sort({ detectedAt: -1 });
  res.status(200).json(formatSuccess(incidents, 'Data breach incidents retrieved'));
});

const createBreachIncident = asyncHandler(async (req, res) => {
  const { title, severity, affectedCategories, estimatedAffectedUsers, description, containmentActions } = req.body;

  if (!title || !description) {
    throw ApiError.badRequest('title and description are required for incident registration.');
  }

  const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const incident = await DataBreachIncident.create({
    incidentId,
    title,
    severity: severity || 'LOW',
    status: 'INVESTIGATING',
    affectedCategories: affectedCategories || ['TECHNICAL_METADATA'],
    estimatedAffectedUsers: estimatedAffectedUsers || 0,
    description,
    containmentActions: containmentActions || 'Initial firewall and token revocation triggered.',
    leadInvestigator: {
      userId: String(req.user._id),
      name: req.user.fullName || req.user.username,
      designation: req.user.role,
    },
  });

  AuditLog.create({
    user: req.user.fullName || req.user.username,
    userId: req.user._id,
    role: req.user.role,
    action: 'BREACH_INCIDENT_LOGGED',
    module: 'SETTINGS',
    recordReference: incidentId,
    reason: `Registered security incident [${severity}]: ${title}`,
    result: 'SUCCESS',
  }).catch(() => {});

  res.status(201).json(formatSuccess(incident, 'Incident registered. Initiate containment and notify CERT-In within 6 hours if critical.'));
});

const updateBreachIncident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const incident = await DataBreachIncident.findById(id);
  if (!incident) {
    throw ApiError.notFound('Breach incident not found.');
  }

  if (updates.status === 'CONTAINED' && !incident.containedAt) {
    incident.containedAt = new Date();
  }
  if (updates.status === 'RESOLVED' && !incident.resolvedAt) {
    incident.resolvedAt = new Date();
  }

  Object.assign(incident, updates);
  await incident.save();

  res.status(200).json(formatSuccess(incident, 'Breach incident status updated.'));
});

// -----------------------------------------------------------------------------
// 5. DATA SUBJECT ACCESS REQUEST (SAR / DATA PORTABILITY)
// -----------------------------------------------------------------------------
const exportUserDataDossier = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Authorization check: User can export self, or Principal/Super Admin can export anyone
  const isSelf = String(req.user._id) === String(userId);
  const isExecutive = ['SUPER_ADMIN', 'PRINCIPAL'].includes(req.user.role);
  if (!isSelf && !isExecutive) {
    throw ApiError.forbidden('You are only authorized to export your own personal data dossier.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User record not found.');
  }

  let studentProfile = null;
  if (user.role === 'STUDENT' || user.studentProfile?.admissionNo) {
    studentProfile = await Student.findOne({ admissionNo: user.studentProfile?.admissionNo || user.username });
  }

  const consents = await ConsentRecord.find({ userId: user._id });

  const dossier = {
    exportDate: new Date().toISOString(),
    governingLegislation: 'Indian Digital Personal Data Protection Act 2023 & GDPR Article 15/20',
    dataFiduciary: 'Sri Vidya English Medium High School',
    subject: {
      userId: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
    academicProfile: studentProfile
      ? {
          admissionNo: studentProfile.admissionNo,
          name: studentProfile.name,
          class: studentProfile.class,
          section: studentProfile.section,
          rollNumber: studentProfile.rollNumber,
          gender: studentProfile.gender,
          guardian: studentProfile.guardian,
          emergencyContact: studentProfile.emergencyContact,
          status: studentProfile.status,
        }
      : null,
    recordedConsents: consents.map((c) => ({
      consentType: c.consentType,
      status: c.status,
      legalBasis: c.legalBasis,
      policyVersion: c.policyVersion,
      timestamp: c.createdAt,
    })),
    dataPortabilityNotice:
      'This machine-readable personal data dossier is provided in compliance with data portability regulations. Official permanent academic marksheets and statutory registers remain preserved at the Principal Office.',
  };

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Disposition', `attachment; filename="srividya_data_dossier_${user.username}.json"`);
  }
  res.status(200).json(formatSuccess(dossier, 'Data Subject Access Request (SAR) exported successfully'));
});

// -----------------------------------------------------------------------------
// 6. OPEN SOURCE LICENSES AUDIT
// -----------------------------------------------------------------------------
const getLicenseAudit = asyncHandler(async (req, res) => {
  const report = auditLicenses();
  res.status(200).json(formatSuccess(report, 'Open-source software license audit retrieved'));
});

module.exports = {
  recordConsent,
  getMyConsents,
  getConsentLedger,
  getPolicies,
  publishPolicyVersion,
  getThirdPartyDpas,
  registerDpa,
  listBreachIncidents,
  createBreachIncident,
  updateBreachIncident,
  exportUserDataDossier,
  getLicenseAudit,
};
