const mongoose = require('mongoose');

const EXIT_STATUS_VALUES = [
  'Draft',
  'Request Submitted',
  'Under Verification',
  'Clearance Pending',
  'Clearance In Progress',
  'Awaiting Principal Approval',
  'Approved',
  'Rejected',
  'TC Generated',
  'Completed',
  'Cancelled'
];

const studentExitSchema = new mongoose.Schema(
  {
    exitRequestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    admissionNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    studentId: {
      type: String,
      trim: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    class: {
      type: String,
      required: true
    },
    section: {
      type: String,
      default: 'A'
    },
    rollNo: {
      type: String,
      default: ''
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    exitType: {
      type: String,
      enum: ['Formal Transfer', 'Withdrawal'],
      default: 'Formal Transfer',
      required: true
    },
    status: {
      type: String,
      enum: EXIT_STATUS_VALUES,
      default: 'Request Submitted',
      index: true
    },
    requestDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    proposedLastDate: {
      type: String,
      required: true
    },
    officialLeavingDate: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      required: true
    },
    detailedExplanation: {
      type: String,
      default: ''
    },
    destinationSchoolName: {
      type: String,
      default: ''
    },
    destinationSchoolAddress: {
      type: String,
      default: ''
    },
    destinationSchoolAffiliation: {
      type: String,
      default: ''
    },
    parentRemarks: {
      type: String,
      default: ''
    },
    parentVerification: {
      submittedBy: { type: String, default: '' },
      relationship: { type: String, default: 'Father' },
      contactNumber: { type: String, default: '' },
      applicationReceivedDate: { type: String, default: '' },
      applicationReference: { type: String, default: '' },
      signedDocumentUrl: { type: String, default: '' },
      identityVerificationStatus: {
        type: String,
        enum: ['Pending Verification', 'Verified', 'Rejected', 'Correction Required'],
        default: 'Pending Verification'
      },
      verifiedBy: { type: String, default: '' },
      verificationDate: { type: String, default: '' },
      verificationRemarks: { type: String, default: '' }
    },
    departmentClearances: {
      accounts: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri P. Srinivas (Bursar / Accounts Officer)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV-BURSAR-01' },
        verifyingOfficerDesignation: { type: String, default: 'Bursar & Accounts Officer' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        totalDue: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        concession: { type: Number, default: 0 },
        refundStatus: { type: String, default: 'Reconciled' },
        ndcRef: { type: String, default: '' },
        waiverRequested: { type: Boolean, default: false },
        waiverApproved: { type: Boolean, default: false },
        waiverReason: { type: String, default: '' },
        waiverApprovedBy: { type: String, default: '' },
        statutoryUndertakingRef: { type: String, default: '' },
        statutoryNonBlocking: { type: Boolean, default: false },
        assetReturnDetails: { type: String, default: 'All fee receipts, caution deposits and accounts reconciled' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      library: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Smt. S. Padma (Chief Librarian)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV-LIB-01' },
        verifyingOfficerDesignation: { type: String, default: 'Chief Librarian' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        booksBorrowed: { type: Number, default: 0 },
        booksReturned: { type: Number, default: 0 },
        booksMissing: { type: Number, default: 0 },
        finesDue: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        cardSurrendered: { type: Boolean, default: true },
        returnedTitles: { type: String, default: '' },
        assetReturnDetails: { type: String, default: 'All borrowed textbooks and library reference materials surrendered' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      scienceLab: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri K. Ramu (Science Labs In-Charge)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV-SCI-01' },
        verifyingOfficerDesignation: { type: String, default: 'Senior Science Faculty & Lab In-Charge' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        physicsCleared: { type: Boolean, default: true },
        chemistryCleared: { type: Boolean, default: true },
        biologyCleared: { type: Boolean, default: true },
        manualsSurrendered: { type: Boolean, default: true },
        breakageFee: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'Physics apparatus, Chemistry glassware and Biology microscope slides inspected and cleared' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      sports: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri V. Ramesh Babu (Sports Director & PET)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV200011' },
        verifyingOfficerDesignation: { type: String, default: 'Physical Education Director' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        kitReturned: { type: Boolean, default: true },
        equipmentReturned: { type: Boolean, default: true },
        lockerCleared: { type: Boolean, default: true },
        sportsFines: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'School athletics jersey, balls/rackets and sports locker key surrendered' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      transport: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri P. Suresh (Transport Administrator)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV-TRN-01' },
        verifyingOfficerDesignation: { type: String, default: 'Transport In-Charge' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        route: { type: String, default: 'Self Commute' },
        vehicleNo: { type: String, default: '' },
        passSurrendered: { type: Boolean, default: true },
        seatDeallocated: { type: Boolean, default: true },
        transportDues: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'Bus ID pass surrendered and route seat deallocated' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      itLab: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri D. Srinivas (MCA, Computer Lab Incharge)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV200008' },
        verifyingOfficerDesignation: { type: String, default: 'Computer Lab In-Charge & IT Admin' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        workstationCleared: { type: Boolean, default: true },
        accountDeactivated: { type: Boolean, default: true },
        peripheralsReturned: { type: Boolean, default: true },
        itDamageCharges: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'Computer workstation inspected, school network/portal credentials flagged, peripherals surrendered' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      hostel: {
        status: { type: String, default: 'Not Applicable' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Sri M. Koteswara Rao (Hostel Warden & Residential Head)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV-HST-01' },
        verifyingOfficerDesignation: { type: String, default: 'Hostel Warden' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        roomNo: { type: String, default: '' },
        keysSurrendered: { type: Boolean, default: true },
        furnitureLinenCleared: { type: Boolean, default: true },
        messDues: { type: Number, default: 0 },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'Hostel room inspected, room & wardrobe keys surrendered, mess account settled' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: false },
        naJustification: { type: String, default: 'Student is an enrolled Day Scholar (Non-Hostelite)' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      academic: {
        status: { type: String, default: 'Pending Verification' },
        referenceNo: { type: String, default: '' },
        inCharge: { type: String, default: 'Smt. K. Sarada (Class Teacher) & Sri Navva Anand (VP)' },
        verifiedBy: { type: String, default: '' },
        verifyingOfficerId: { type: String, default: 'SV200002' },
        verifyingOfficerDesignation: { type: String, default: 'Vice Principal & Academic Director' },
        verifiedDate: { type: String, default: '' },
        verifiedTime: { type: String, default: '' },
        marksFinalized: { type: Boolean, default: true },
        attendancePercentage: { type: String, default: '94.5%' },
        attendanceDays: { type: String, default: '172 / 182 Days' },
        attendanceVerified: { type: Boolean, default: true },
        promotionStatus: { type: String, default: 'Qualified for Next Class' },
        conductGrade: { type: String, default: 'Exemplary' },
        duesAmount: { type: Number, default: 0 },
        assetReturnDetails: { type: String, default: 'CCE marks tabulation finalized, cumulative attendance audited, progress report signed' },
        remarks: { type: String, default: '' },
        supportingDocName: { type: String, default: '' },
        supportingDocUrl: { type: String, default: '' },
        isRevoked: { type: Boolean, default: false },
        revokedReason: { type: String, default: '' },
        revokedBy: { type: String, default: '' },
        revokedDate: { type: String, default: '' },
        isApplicable: { type: Boolean, default: true },
        naJustification: { type: String, default: '' },
        history: [{ type: mongoose.Schema.Types.Mixed, default: [] }]
      },
      labAndSports: {
        status: { type: String, default: 'Pending Verification' },
        inCharge: { type: String, default: 'Sri K. Ramu (Science Labs & Sports)' },
        verifiedBy: { type: String, default: '' },
        verifiedDate: { type: String, default: '' },
        equipmentReturned: { type: Boolean, default: true },
        isNotApplicable: { type: Boolean, default: false },
        naJustification: { type: String, default: '' },
        remarks: { type: String, default: '' }
      },
      administration: {
        status: { type: String, default: 'Pending Verification' },
        inCharge: { type: String, default: 'Sri Ch. Venkat (Head Clerk / Admin)' },
        verifiedBy: { type: String, default: '' },
        verifiedDate: { type: String, default: '' },
        certificatesReturned: { type: Boolean, default: true },
        idCardSurrendered: { type: Boolean, default: true },
        remarks: { type: String, default: '' }
      }
    },
    conductEvaluation: {
      conduct: { type: String, default: 'Exemplary' },
      behaviour: { type: String, default: 'Courteous & Disciplined' },
      disciplineRecordVerified: { type: Boolean, default: true },
      activities: { type: String, default: 'Co-curricular & Sports Participant' },
      outstandingMatters: { type: String, default: 'None' },
      teacherRemarks: { type: String, default: '' },
      principalRemarks: { type: String, default: '' }
    },
    approval: {
      principalDecision: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Returned for Correction'],
        default: 'Pending'
      },
      decisionDate: { type: String, default: '' },
      decidedBy: { type: String, default: '' },
      remarks: { type: String, default: '' }
    },
    transferCertificate: {
      tcNumber: { type: String, default: '', index: true },
      issueDate: { type: String, default: '' },
      leavingDate: { type: String, default: '' },
      admissionNo: { type: String, default: '' },
      studentName: { type: String, default: '' },
      class: { type: String, default: '' },
      academicYear: { type: String, default: '2025-2026' },
      signatoryName: { type: String, default: 'Smt. Gorle Varalakshmi' },
      signatoryDesignation: { type: String, default: 'Executive Principal & Headmistress' },
      signatoryEmployeeId: { type: String, default: 'SV200001' },
      digitalSignatureHash: { type: String, default: '' },
      officialSchoolSeal: { type: String, default: 'Proceedings of DEO R.C.No. 72 B1 / 79 Dt. 30-5-80' },
      conduct: {
        type: String,
        enum: ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement', 'Not Evaluated'],
        default: 'Excellent'
      },
      conductRemarks: { type: String, default: 'Exemplary conduct and character throughout the academic period.' },
      academicVerification: {
        lastClassStudied: { type: String, default: '' },
        lastAcademicYear: { type: String, default: '2025-2026' },
        lastExamCompleted: { type: String, default: '' },
        examResult: { type: String, default: '' },
        promotionEligibility: { type: String, default: 'Qualified for Promotion to Next Higher Class' },
        attendanceVerification: { type: String, default: '' },
        recordsPreserved: { type: Boolean, default: true }
      },
      authorizationChecklist: {
        departmentalClearances: { type: Boolean, default: true },
        parentVerification: { type: Boolean, default: true },
        financialClearance: { type: Boolean, default: true },
        studentDocuments: { type: Boolean, default: true },
        principalApproval: { type: Boolean, default: true }
      },
      status: { type: String, default: 'Not Generated' },
      printableHtml: { type: String, default: '' },
      issuedBy: { type: String, default: '' },
      issuedTimestamp: { type: String, default: '' },
      isAmended: { type: Boolean, default: false },
      amendmentReason: { type: String, default: '' },
      amendedBy: { type: String, default: '' },
      amendedDate: { type: String, default: '' }
    },
    auditHistory: [
      {
        timestamp: { type: String, default: () => new Date().toLocaleString() },
        actor: { type: String, default: 'System' },
        role: { type: String, default: 'office' },
        field: { type: String, default: '' },
        oldValue: { type: String, default: '' },
        newValue: { type: String, default: '' },
        reason: { type: String, default: '' }
      }
    ],
    notifications: [
      {
        timestamp: { type: String, default: () => new Date().toLocaleString() },
        channel: { type: String, default: 'In-App' },
        recipient: { type: String, default: '' },
        message: { type: String, default: '' },
        status: { type: String, default: 'Sent' }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudentExit', studentExitSchema);
