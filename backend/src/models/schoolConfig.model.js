/**
 * School Configuration Model
 * Scope: Institution-wide environmental configuration, academic parameters,
 * operational defaults, document & report templates, and immutable history.
 * Compliant with Sri Vidya Educational Trust Multi-Tenant Standards.
 */
const mongoose = require('mongoose');

const signatorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  signatureUrl: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { _id: false });

const documentTemplateSchema = new mongoose.Schema({
  templateId: { type: String, required: true },
  name: { type: String, required: true },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Admission Form',
      'Student ID Card',
      'Transfer Certificate',
      'Bonafide Certificate',
      'Report Card',
      'Fee Receipt',
      'Official Circular',
      'Staff Letter'
    ]
  },
  version: { type: String, default: 'v1.0' },
  applicableInstitution: { type: String, default: 'All Trust Schools' },
  status: { type: String, enum: ['Published', 'Draft', 'Deprecated'], default: 'Published' },
  effectiveDate: { type: String, default: '2026-06-01' },
  changeHistory: [{
    version: String,
    modifiedBy: String,
    timestamp: String,
    note: String
  }]
}, { _id: false });

const schoolConfigSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // 4.1 School Profile
  schoolProfile: {
    name: { type: String, required: true },
    displayName: { type: String, default: '' },
    logoUrl: { type: String, default: '/assets/images/logo.png' },
    address: {
      street: { type: String, default: '1-23 Main Road, Tilak Nagar' },
      city: { type: String, default: 'Guntur' },
      state: { type: String, default: 'Andhra Pradesh' },
      postalCode: { type: String, default: '522002' },
      country: { type: String, default: 'India' }
    },
    contact: {
      phone: { type: String, default: '+91 863 2234567' },
      alternatePhone: { type: String, default: '+91 9440123456' },
      email: { type: String, default: 'srividyaschools2017@gmail.com' },
      supportEmail: { type: String, default: 'helpdesk@srividya.edu.in' },
      website: { type: String, default: 'https://srividya.edu.in' }
    },
    affiliation: {
      board: { type: String, default: 'Andhra Pradesh State SSC Board' },
      affiliationCode: { type: String, default: 'AP-SSC-GUN-1923' },
      recognitionNumber: { type: String, default: 'RC.No. 4521/B2/2017' },
      udise: { type: String, default: '28172901923' },
      category: { type: String, default: 'Primary & High School (Class I to X)' }
    },
    officialEmailDomain: { type: String, default: 'srividya.edu.in' },
    signatories: [signatorySchema],
    branding: {
      primaryColor: { type: String, default: '#1E3A8A' },
      accentColor: { type: String, default: '#F59E0B' },
      crestUrl: { type: String, default: '/assets/images/crest.png' },
      headerTitle: { type: String, default: 'SRI VIDYA ENGLISH MEDIUM HIGH SCHOOL' },
      headerSubtitle: { type: String, default: 'Recognized by Govt. of Andhra Pradesh' }
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Published'],
      default: 'Published'
    },
    version: { type: Number, default: 1 },
    changeHistory: [{
      version: Number,
      modifiedBy: String,
      timestamp: String,
      changesSummary: String,
      approvalStatus: String
    }]
  },

  // 4.2 Academic Configuration
  academicConfiguration: {
    academicYearStructure: { type: String, default: 'June – April (10 Months Calendar)' },
    currentAcademicYear: { type: String, default: '2026–2027' },
    terms: [{
      name: { type: String, required: true },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      weightage: { type: String, default: '50%' }
    }],
    classNamingConvention: { type: String, default: 'Roman Numerals (Class I to Class X)' },
    sectionNamingRule: { type: String, default: 'Standard Alphabetical Sections (A, B, C, D)' },
    subjectCodeFormat: { type: String, default: 'SUB-LEVEL-SEQ (e.g. MAT-X-01, TEL-X-02)' },
    rollNumberPolicy: { type: String, default: 'Class-Section Alphabetical Sort (01 to 60)' },
    admissionNumberPolicy: {
      prefix: { type: String, default: 'SV-' },
      format: { type: String, default: 'SV-YYYY-NNNN' },
      startingNumber: { type: Number, default: 1001 },
      autoUniqueCheck: { type: Boolean, default: true }
    },
    examinationCategories: [{
      code: String,
      name: String,
      maxMarks: Number,
      weightage: String
    }],
    gradingScales: [{
      grade: String,
      minMarks: Number,
      maxMarks: Number,
      gpa: Number,
      remarks: String
    }],
    passingCriteria: {
      minSubjectPct: { type: Number, default: 35 },
      minAggregatePct: { type: Number, default: 35 },
      coreSubjectMandatory: { type: Boolean, default: true }
    },
    attendanceRules: {
      calculationMode: { type: String, default: 'Twice Daily (Morning & Afternoon Register)' },
      minExamEligibilityPct: { type: Number, default: 75 },
      condonationAllowancePct: { type: Number, default: 10 }
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Published'],
      default: 'Published'
    },
    version: { type: Number, default: 1 },
    versionsHistory: [{
      version: Number,
      academicYear: String,
      publishedAt: String,
      publishedBy: String,
      configSnapshot: mongoose.Schema.Types.Mixed
    }]
  },

  // 4.3 Operational Defaults
  operationalDefaults: {
    workingDays: [{ type: String }],
    attendanceSessions: [{
      sessionName: String,
      startTime: String,
      endTime: String
    }],
    timetablePeriods: {
      periodsPerDay: { type: Number, default: 8 },
      periodDurationMins: { type: Number, default: 45 },
      morningRecessMins: { type: Number, default: 15 },
      lunchBreakMins: { type: Number, default: 45 }
    },
    feeInstalments: {
      convention: { type: String, default: 'Quarterly (4 Instalments)' },
      count: { type: Number, default: 4 },
      schedule: [{ type: String }]
    },
    documentCategories: [{ type: String }],
    approvalWorkflows: [{
      workflowName: String,
      stages: [{ type: String }]
    }],
    notificationTemplates: [{
      templateId: String,
      title: String,
      channel: String,
      content: String
    }],
    holidayConventions: [{
      name: String,
      durationDays: Number,
      type: String
    }],
    status: { type: String, default: 'Published' }
  },

  // 4.4 Document & Report Templates
  documentTemplates: [documentTemplateSchema]
}, {
  timestamps: true
});

const SchoolConfig = mongoose.models.SchoolConfig || mongoose.model('SchoolConfig', schoolConfigSchema);

module.exports = {
  SchoolConfig
};

