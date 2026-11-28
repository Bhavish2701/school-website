
const mongoose = require('mongoose');

const ARCHIVAL_REASONS = [
  'Formal Transfer to Another School',
  'Student Withdrawal',
  'Discontinued Studies',
  'Completion of Schooling',
  'Duplicate Student Record',
  'Incorrect Admission Record',
  'Administrative Record Correction',
  'Other'
];

const APPROVAL_STATUSES = [
  'Pending Review',
  'Under Review',
  'Returned for Correction',
  'Approved',
  'Rejected',
  'Cancelled'
];

const ARCHIVAL_STATUSES = [
  'Draft',
  'Pending Review',
  'Under Review',
  'Returned for Correction',
  'Approved',
  'Rejected',
  'Completed',
  'Cancelled'
];

const departmentClearanceSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Cleared', 'Not Applicable', 'Correction Required', 'Waiver Requested', 'Waiver Approved'],
      default: 'Cleared',
    },
    officer: { type: String, default: 'Assigned Officer' },
    verifiedDate: { type: Date, default: Date.now },
    verifiedBy: { type: String, default: 'Authorized Verifier' },
    outstanding: { type: String, default: 'None' },
    remarks: { type: String, default: 'Statutory departmental review satisfied.' },
    waiverApproved: { type: Boolean, default: false },
  },
  { _id: false }
);

const recordPreservationItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    availability: { type: String, default: 'Available - 100% Intact' },
    preservationStatus: { type: String, default: 'Permanently Retained' },
    lastUpdated: { type: String, default: 'AY 2025-26' },
    accessRestriction: { type: String, default: 'Authorized Staff & Leadership' },
  },
  { _id: false }
);

const studentArchivalSchema = new mongoose.Schema(
  {
    archivalRequestId: {
      type: String,
      required: [true, 'Archival Request Reference is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    admissionNo: {
      type: String,
      required: [true, 'Permanent Admission Number is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student Full Name is required'],
      trim: true,
    },
    class: {
      type: String,
      required: [true, 'Current Class is required'],
    },
    section: {
      type: String,
      default: 'A',
    },
    rollNo: {
      type: String,
      required: [true, 'Roll Number is required'],
    },
    academicYear: {
      type: String,
      default: '2025-26',
    },
    admissionDate: {
      type: String,
      default: '12-06-2021',
    },
    currentStatus: {
      type: String,
      default: 'ACTIVE',
    },
    guardianName: {
      type: String,
      default: 'Parent / Guardian',
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      enum: {
        values: ARCHIVAL_REASONS,
        message: '{VALUE} is not a recognized archival reason',
      },
      required: [true, 'Reason for Archival / Inactivation is required'],
    },
    reasonExplanation: {
      type: String,
      required: [true, 'Detailed explanation and justification is required'],
      trim: true,
    },
    parentAppRef: {
      type: String,
      default: '',
    },
    tcNumber: {
      type: String,
      default: '',
    },
    leavingDate: {
      type: Date,
      default: Date.now,
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date of record inactivation is required'],
      default: Date.now,
    },
    supportingDocuments: [
      {
        docName: { type: String, required: true },
        fileUrl: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: String, default: 'Authorized Staff' },
      },
    ],
    administrativeRemarks: {
      type: String,
      default: '',
    },
    departmentalClearances: {
      library: { type: departmentClearanceSchema, default: () => ({ officer: 'Smt. S. Padma (Librarian)' }) },
      accounts: { type: departmentClearanceSchema, default: () => ({ officer: 'Sri P. Srinivas (Accounts Officer)' }) },
      academic: { type: departmentClearanceSchema, default: () => ({ officer: 'Smt. K. Sarada (Class Teacher)' }) },
      examination: { type: departmentClearanceSchema, default: () => ({ officer: 'Sri Navva Anand (Examination Controller)' }) },
      labAndSports: { type: departmentClearanceSchema, default: () => ({ officer: 'Sri K. Ramu (Physical Director & Lab In-charge)' }) },
      transport: { type: departmentClearanceSchema, default: () => ({ officer: 'Sri P. Suresh (Transport Supervisor)', status: 'Not Applicable' }) },
      administration: { type: departmentClearanceSchema, default: () => ({ officer: 'Sri Ch. Venkat (Administrative Officer)' }) },
    },
    recordPreservationSnapshot: {
      type: [recordPreservationItemSchema],
      default: [
        { category: 'Student Admission Records', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Admissions Office & Leadership' },
        { category: 'Student Personal Information', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Class Teacher & Leadership' },
        { category: 'Guardian Information', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Authorized Administration' },
        { category: 'Enrolment & Class History', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Academic Council' },
        { category: 'Attendance History', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Attendance Register Vault' },
        { category: 'Examination Records', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Examination Controller' },
        { category: 'Academic Results', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Academic Tabulation Council' },
        { category: 'Fee Ledger', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Accounts Officer & Audit' },
        { category: 'Payment Receipts', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Finance & Accounts' },
        { category: 'Transfer Certificate', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'AP Board Statutory Vault' },
        { category: 'Student Documents', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Document Registry' },
        { category: 'Discipline History', availability: 'Protected - High Security', preservationStatus: 'Permanently Retained', accessRestriction: 'Executive Principal Jurisdiction' },
        { category: 'Previous Administrative Actions', availability: 'Available - 100% Intact', preservationStatus: 'Permanently Retained', accessRestriction: 'Administrative Officer' },
        { category: 'Audit History', availability: 'Immutable Log', preservationStatus: 'Permanently Retained', accessRestriction: 'System Auditor & Principal' },
      ],
    },
    executiveAuthorization: {
      requestedBy: { type: String, default: 'Authorized Staff' },
      requestingEmployeeId: { type: String, default: 'SV100012' },
      requestDate: { type: Date, default: Date.now },
      reviewedBy: { type: String, default: 'Vice Principal' },
      reviewingAuthority: { type: String, default: 'Principal Executive Office' },
      approvalStatus: { type: String, enum: APPROVAL_STATUSES, default: 'Pending Review' },
      approvalDate: { type: Date },
      approvalReference: { type: String },
      approvalRemarks: { type: String, default: '' },
      effectiveDate: { type: Date },
    },
    confirmationConsent: {
      confirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date },
      confirmedBy: { type: String },
    },
    status: {
      type: String,
      enum: ARCHIVAL_STATUSES,
      default: 'Pending Review',
      index: true,
    },
    auditHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        actor: { type: String, default: 'System' },
        role: { type: String, default: 'staff' },
        action: { type: String, required: true },
        oldValue: { type: String },
        newValue: { type: String },
        remarks: { type: String },
      },
    ],
    institutionId: {
      type: String,
      default: 'SRI_VIDYA_SKLM',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentArchival', studentArchivalSchema);
