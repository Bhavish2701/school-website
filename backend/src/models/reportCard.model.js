const mongoose = require('mongoose');

const REPORT_FORMATS = [
  'AP_SSC_CCE',
  'SCHOOL_STANDARD',
  'SCHOLASTIC_PROGRESS',
  'CCE_COMPREHENSIVE',
  'CUSTOM_INSTITUTIONAL'
];

const WORKFLOW_STAGES = [
  'CONFIGURATION',
  'VALIDATED',
  'PREVIEWED',
  'ACADEMIC_VERIFIED',
  'PRINCIPAL_AUTHORIZED',
  'PUBLISHED'
];

const APPROVAL_STATUSES = [
  'DRAFT',
  'AWAITING_VERIFICATION',
  'VERIFIED',
  'AWAITING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'RETURNED'
];

const PROMOTION_STATUSES = [
  'Promoted',
  'Detained',
  'Passed',
  'Failed',
  'Result Awaited',
  'Supplementary Examination Required',
  'Not Applicable'
];

const subjectReportSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, trim: true },
  maxMarks: { type: Number, default: 100 },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  grade: { type: String, required: true, trim: true },
  gradePoint: { type: Number, default: 0 },
  resultStatus: { type: String, default: 'PASSED' },
  teacherRemarks: { type: String, trim: true, default: '' },
});

const coScholasticSchema = new mongoose.Schema({
  category: { type: String, required: true },
  grade: { type: String, default: 'A' },
  descriptiveRemarks: { type: String, default: '' },
  evaluatingTeacher: { type: String, default: 'Class Teacher' },
  assessmentDate: { type: Date, default: Date.now },
});

const revisionRecordSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  revisedBy: { type: String, required: true },
  revisedAt: { type: Date, default: Date.now },
  justification: { type: String, required: true },
  previousSnapshot: { type: mongoose.Schema.Types.Mixed },
});

const reportCardSchema = new mongoose.Schema(
  {
    reportCardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    admissionNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, trim: true },
    class: { type: String, required: true, trim: true, index: true },
    section: { type: String, required: true, trim: true, default: 'A', index: true },
    rollNo: { type: String, trim: true },
    dob: { type: String, trim: true },
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    classTeacher: { type: String, trim: true },

    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    examName: { type: String, required: true, trim: true },
    academicYear: { type: String, default: '2025-2026', trim: true, index: true },
    term: { type: String, default: 'Term 1', trim: true },
    format: {
      type: String,
      enum: REPORT_FORMATS,
      default: 'AP_SSC_CCE',
    },

    subjects: [subjectReportSchema],
    scholasticSummary: {
      totalMaxMarks: { type: Number, default: 600 },
      totalObtainedMarks: { type: Number, default: 0 },
      overallPercentage: { type: Number, default: 0 },
      overallGrade: { type: String, default: 'A' },
      gpa: { type: Number, default: 0 },
      rankInClass: { type: Number, default: null },
      resultStatus: { type: String, default: 'PASSED' },
      performanceSummary: { type: String, default: 'First Class with Distinction' },
    },

    attendanceSummary: {
      totalWorkingDays: { type: Number, default: 114 },
      daysPresent: { type: Number, default: 110 },
      daysAbsent: { type: Number, default: 4 },
      approvedLeaves: { type: Number, default: 0 },
      attendancePercentage: { type: Number, default: 96.5 },
      standing: { type: String, default: 'Exemplary' },
    },

    coScholasticAssessment: [coScholasticSchema],

    remarks: {
      classTeacherRemarks: { type: String, trim: true, default: '' },
      subjectTeacherRemarks: { type: String, trim: true, default: '' },
      strengths: { type: String, trim: true, default: '' },
      areasForImprovement: { type: String, trim: true, default: '' },
      principalRemarks: { type: String, trim: true, default: '' },
      achievements: { type: String, trim: true, default: '' },
      recommendationsNextTerm: { type: String, trim: true, default: '' },
    },

    promotionDetails: {
      resultStatus: { type: String, default: 'Passed' },
      promotionStatus: { type: String, enum: PROMOTION_STATUSES, default: 'Promoted' },
      currentClass: { type: String, default: 'Class X - A' },
      nextClass: { type: String, default: 'Class XI / Intermediate 1st Year' },
      academicYear: { type: String, default: '2025-2026' },
      resultDeclarationDate: { type: Date, default: Date.now },
      examinationCompletionStatus: { type: String, default: 'Completed & Certified' },
    },

    componentsIncluded: {
      studentInfo: { type: Boolean, default: true },
      subjectMarks: { type: Boolean, default: true },
      internalAssessment: { type: Boolean, default: true },
      externalAssessment: { type: Boolean, default: true },
      subjectGrades: { type: Boolean, default: true },
      overallPercentage: { type: Boolean, default: true },
      attendanceSummary: { type: Boolean, default: true },
      coScholastic: { type: Boolean, default: true },
      competencyObjectives: { type: Boolean, default: true },
      teacherFeedback: { type: Boolean, default: true },
      principalRemarks: { type: Boolean, default: true },
      promotionDetails: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      schoolSeal: { type: Boolean, default: true },
      authorizedSignatures: { type: Boolean, default: true },
      qrCode: { type: Boolean, default: true },
    },

    workflowStage: {
      type: String,
      enum: WORKFLOW_STAGES,
      default: 'CONFIGURATION',
    },
    approval: {
      status: {
        type: String,
        enum: APPROVAL_STATUSES,
        default: 'DRAFT',
      },
      verifiedBy: { type: String, default: '' },
      verifiedAt: { type: Date },
      verificationRemarks: { type: String, default: '' },
      approvedBy: { type: String, default: '' },
      approvedAt: { type: Date },
      approvalRemarks: { type: String, default: '' },
    },

    publication: {
      isPublished: { type: Boolean, default: false, index: true },
      publishedAt: { type: Date },
      publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      publicPortalEligible: { type: Boolean, default: true },
    },

    version: { type: Number, default: 1 },
    revisionHistory: [revisionRecordSchema],

    verificationCode: { type: String, trim: true, index: true },
    pdfStoragePath: { type: String, default: '' },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

reportCardSchema.index({ student: 1, exam: 1, version: 1 }, { unique: true });
reportCardSchema.index({ class: 1, section: 1, academicYear: 1 });
reportCardSchema.index({ 'publication.isPublished': 1, student: 1 });

const ReportCard = mongoose.model('ReportCard', reportCardSchema);

module.exports = {
  ReportCard,
  REPORT_FORMATS,
  WORKFLOW_STAGES,
  APPROVAL_STATUSES,
  PROMOTION_STATUSES,
};
