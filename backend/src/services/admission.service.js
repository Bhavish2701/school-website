const mongoose = require('mongoose');
const crypto = require('crypto');
const { Admission } = require('../models/admission.model');
const { Student } = require('../models/student.model');
const { User } = require('../models/user.model');
const Fee = require('../models/fee.model');
const { Notification } = require('../models/notification.model');
const ApiError = require('../utils/apiError');

const generateApplicationNumber = async (year = new Date().getFullYear().toString()) => {
  const prefix = `SV${year}`;
  const regex = new RegExp(`^${prefix}\\d{5}$`);
  const last = await Admission.findOne({ applicationNumber: regex }).sort({ applicationNumber: -1 });
  let nextSeq = 1;
  if (last && last.applicationNumber) {
    const numPart = parseInt(last.applicationNumber.slice(prefix.length), 10);
    if (!Number.isNaN(numPart) && numPart >= nextSeq) nextSeq = numPart + 1;
  }
  const padded = String(nextSeq).padStart(5, '0');
  return `${prefix}${padded}`;
};

const submitApplication = async (applicationData) => {
  const {
    studentName,
    dob,
    gender,
    applyingClass,
    academicYear = '2025-2026',
    parentName,
    phone,
    email,
    prevSchool,
    address,
    bloodGroup,
    documents = [],
  } = applicationData;

  const appYear = academicYear.split('-')[0] || '2025';
  const applicationNumber = await generateApplicationNumber(appYear);

  const application = await Admission.create({
    applicationNumber,
    studentName,
    dob: new Date(dob),
    gender,
    applyingClass,
    academicYear,
    parentName,
    phone: phone.trim(),
    email: email ? email.toLowerCase().trim() : '',
    prevSchool: prevSchool || '',
    address: address || '',
    bloodGroup: bloodGroup || '',
    status: 'SUBMITTED',
    reviewerRemarks: 'After filling this form, please visit the school and contact the Principal or Vice Principal for the confirmation of your admission.',
    documents: documents || [],
    admissionSource: applicationData.admissionSource || 'ONLINE',
  });

  try {
    const { dispatchApplicationSubmitted } = require('./notificationDispatcher.service');
    await dispatchApplicationSubmitted({ application });
  } catch (e) {
  }

  try {
    const auditLogService = require('./auditLog.service');
    await auditLogService.logSensitiveChange({
      user: application.parentName || 'Online Applicant',
      role: 'PARENT',
      action: 'ADMISSION_APPLICATION_SUBMITTED',
      module: 'ADMISSIONS',
      recordReference: `${application.applicationNumber} (${application.studentName})`,
      reason: `New ${application.admissionSource} admission application registered for Class ${application.applyingClass}`,
      changedFields: [{ field: 'status', oldValue: null, newValue: 'SUBMITTED' }],
      result: 'SUCCESS',
    });
  } catch (e) {
  }

  return application;
};

const checkApplicationStatus = async (applicationNumber, phone) => {
  const application = await Admission.findOne({
    applicationNumber: applicationNumber.toUpperCase().trim(),
    phone: phone.trim(),
  }).select(
    'applicationNumber studentName applyingClass academicYear status requestedDocuments reviewerRemarks createdAt documents rejectionReason'
  );

  if (!application) {
    throw ApiError.notFound(
      `No admission application found matching reference '${applicationNumber}' and registered phone '${phone}'. Please verify your credentials.`
    );
  }

  return {
    applicationNumber: application.applicationNumber,
    studentName: application.studentName,
    applyingClass: application.applyingClass,
    academicYear: application.academicYear,
    status: application.status,
    submissionDate: application.createdAt,
    documentsUploadedCount: application.documents ? application.documents.length : 0,
    requestedDocuments: application.requestedDocuments || [],
    reviewerRemarks: application.reviewerRemarks || '',
    rejectionReason: application.status === 'REJECTED' ? application.rejectionReason : null,
  };
};

const uploadDocument = async (applicationId, docData) => {
  let application;
  if (mongoose.Types.ObjectId.isValid(applicationId)) {
    application = await Admission.findById(applicationId);
  } else {
    application = await Admission.findOne({ applicationNumber: applicationId.toUpperCase() });
  }

  if (!application) {
    throw ApiError.notFound('Admission application not found');
  }

  const { docType = 'OTHER', docName, docUrl } = docData;

  application.documents.push({
    docType,
    docName,
    docUrl,
    uploadedAt: new Date(),
    verified: false,
  });

  if (application.status === 'DOCUMENT_VERIFICATION') {
    application.status = 'UNDER_REVIEW';
    application.reviewerRemarks = 'Additional documents received from applicant. Under review by Admissions Office.';
  }

  await application.save();
  return application;
};

const getApplications = async (query = {}) => {
  const {
    search,
    status,
    applyingClass,
    academicYear,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = -1,
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (applyingClass) filter.applyingClass = applyingClass;
  if (academicYear) filter.academicYear = academicYear;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { applicationNumber: { $regex: search, $options: 'i' } },
      { parentName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const parsedLimit = Math.max(1, parseInt(limit, 10));
  const sort = { [sortBy]: parseInt(sortOrder, 10) === 1 ? 1 : -1 };

  const [applications, total] = await Promise.all([
    Admission.find(filter)
      .populate('reviewedBy', 'fullName role')
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit),
    Admission.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parsedLimit),
      limit: parsedLimit,
    },
  };
};

const getApplicationById = async (applicationId) => {
  const application = await Admission.findById(applicationId)
    .populate('reviewedBy', 'fullName role employeeId email')
    .populate('enrolledStudent', 'admissionNo fullName class section rollNo');

  if (!application) {
    throw ApiError.notFound('Admission application not found');
  }

  return application;
};

const updateApplicationStatus = async (applicationId, updateData, user) => {
  const application = await Admission.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Admission application not found');
  }

  const { status, reviewerRemarks, rejectionReason, requestedDocuments } = updateData;

  application.status = status;
  if (reviewerRemarks !== undefined) {
    application.reviewerRemarks = reviewerRemarks;
  } else if (status === 'APPROVED') {
    application.reviewerRemarks = 'Congratulations! Your application has been approved by the Principal / Vice Principal. Your admission is officially confirmed to go forward in Sri Vidya E.M High School.';
  }
  if (rejectionReason !== undefined) application.rejectionReason = rejectionReason;
  if (requestedDocuments && Array.isArray(requestedDocuments)) {
    application.requestedDocuments = requestedDocuments;
  }

  application.reviewedBy = user._id;
  application.reviewedAt = new Date();

  await application.save();

  try {
    const { dispatchAdmissionApproved, dispatchDocumentRejected } = require('./notificationDispatcher.service');
    if (status === 'APPROVED') {
      await dispatchAdmissionApproved({
        application,
        classOffered: application.applyingClass,
        approvedBy: user.fullName || 'Principal',
      });
    } else if (status === 'REJECTED') {
      await dispatchDocumentRejected({
        application,
        documentName: 'Admission Eligibility / Application Dossier',
        rejectionReason: rejectionReason || reviewerRemarks || 'Academic criteria or age eligibility threshold not satisfied',
        reviewer: user.fullName || 'Admissions Review Board',
      });
    }
  } catch (e) {
  }

  try {
    const auditLogService = require('./auditLog.service');
    await auditLogService.logSensitiveChange({
      user: user.fullName || user.email || 'Admissions Officer',
      userId: user._id,
      role: user.role || 'PRINCIPAL',
      action: `ADMISSION_STATUS_${status}`,
      module: 'ADMISSIONS',
      recordReference: `${application.applicationNumber} (${application.studentName})`,
      reason: reviewerRemarks || rejectionReason || `Application status changed to ${status}`,
      changedFields: [{ field: 'status', oldValue: 'PREVIOUS', newValue: status }],
      result: 'SUCCESS',
    });
  } catch (e) {
  }

  return application;
};

const getAdmissionStatsOverview = async () => {
  const [
    totalApplications,
    submittedCount,
    underReviewCount,
    docVerificationCount,
    approvedCount,
    rejectedCount,
    waitlistedCount,
  ] = await Promise.all([
    Admission.countDocuments(),
    Admission.countDocuments({ status: 'SUBMITTED' }),
    Admission.countDocuments({ status: 'UNDER_REVIEW' }),
    Admission.countDocuments({ status: 'DOCUMENT_VERIFICATION' }),
    Admission.countDocuments({ status: 'APPROVED' }),
    Admission.countDocuments({ status: 'REJECTED' }),
    Admission.countDocuments({ status: 'WAITLISTED' }),
  ]);

  const classBreakdown = await Admission.aggregate([
    {
      $group: {
        _id: '$applyingClass',
        count: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    overview: {
      totalApplications,
      submitted: submittedCount,
      underReview: underReviewCount,
      documentVerification: docVerificationCount,
      approved: approvedCount,
      rejected: rejectedCount,
      waitlisted: waitlistedCount,
    },
    classDistribution: classBreakdown,
  };
};

const convertToStudent = async (applicationId, enrollmentData = {}, user) => {
  const application = await Admission.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Admission application not found');
  }

  if (application.status !== 'APPROVED') {
    throw ApiError.badRequest(
      `Cannot enroll student: Application is currently in '${application.status}' status. Only APPROVED applications can be enrolled.`
    );
  }

  if (application.enrolledStudent) {
    const existingStudent = await Student.findById(application.enrolledStudent);
    return {
      alreadyEnrolled: true,
      application,
      student: existingStudent,
      message: 'Student was already enrolled for this application',
    };
  }

  const year = new Date().getFullYear();
  const randNum = Math.floor(100 + Math.random() * 900);
  const admissionNo = enrollmentData.admissionNo || `SV-${year}-${randNum}`;

  const studentActivationCode = 'ACT-STU-' + Math.floor(100000 + Math.random() * 900000);
  const parentActivationCode = 'ACT-PAR-' + Math.floor(100000 + Math.random() * 900000);

  let parentUser = null;
  if (application.phone || application.email) {
    const queries = [];
    if (application.phone) queries.push({ phone: application.phone });
    if (application.email) queries.push({ email: application.email });
    parentUser = await User.findOne({ $or: queries, role: 'PARENT' });
  }

  const student = await Student.create({
    admissionNo,
    fullName: application.studentName,
    gender: application.gender.toLowerCase(),
    class: enrollmentData.class || application.applyingClass,
    section: enrollmentData.section || 'A',
    rollNo: enrollmentData.rollNo || String(Math.floor(1 + Math.random() * 45)),
    dob: application.dob.toISOString().split('T')[0],
    bloodGroup: application.bloodGroup || undefined,
    parentName: application.parentName,
    parentPhone: application.phone,
    email: application.email,
    address: application.address,
    academicYear: application.academicYear || `${year}-${year + 1}`,
    status: 'ACTIVE',
    parentUser: parentUser ? parentUser._id : undefined,
    guardianDetails: {
      name: application.parentName,
      relation: 'Parent',
      phone: application.phone,
      email: application.email || '',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: user ? user._id : undefined,
    },
    studentPortalAccess: {
      isEligible: true,
      isActivated: false,
      username: admissionNo.toLowerCase(),
      activationToken: studentActivationCode,
    },
    parentPortalAccess: {
      isEligible: true,
      isActivated: !!parentUser,
      primaryPhone: application.phone,
      activationToken: parentActivationCode,
    },
  });

  if (parentUser) {
    if (!parentUser.children) parentUser.children = [];
    if (!parentUser.children.includes(student._id)) {
      parentUser.children.push(student._id);
      await parentUser.save({ validateBeforeSave: false });
    }
  }

  const FeeStructure = require('../models/feeStructure.model');
  const structure = await FeeStructure.findOne({
    class: student.class,
    academicYear: student.academicYear,
  }).lean() || await FeeStructure.findOne({ class: student.class }).sort({ createdAt: -1 }).lean();

  if (structure) {
    const totalAnnualFee = structure.totalAmount || 0;
    await Fee.create({
      student: student._id,
      feeStructure: structure._id,
      academicYear: student.academicYear,
      term: structure.name || 'Annual & Term 1',
      totalAmount: totalAnnualFee,
      concessionAmount: 0,
      paidAmount: 0,
      dueAmount: totalAnnualFee,
      dueDate: structure.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: totalAnnualFee > 0 ? 'Pending' : 'Paid',
      breakdown: Array.isArray(structure.breakdown) ? structure.breakdown : [],
      remarks: 'Auto-provisioned from official Fee Structure upon admission confirmation',
    });
  }

  try {
    const liveSyncBus = require('../utils/liveSyncBus');
    liveSyncBus.emitSync('ADMISSIONS', 'ENROLLED', { entityId: application._id, academicYear: student.academicYear });
    liveSyncBus.emitSync('STUDENTS', 'CREATED', { entityId: student._id, academicYear: student.academicYear });
  } catch (e) {}

  application.enrolledStudent = student._id;
  application.decisionRecord = {
    status: 'APPROVED',
    decisionBy: user ? user._id : undefined,
    decisionDate: new Date(),
    remarks: 'Formal admission confirmed; Student ID allocated and fee records created.',
    communicationSent: {
      channel: 'SMS & Email',
      sentAt: new Date(),
      status: 'DELIVERED',
    },
  };
  application.portalActivation = {
    studentAccount: {
      isEligible: true,
      isActivated: false,
      username: admissionNo.toLowerCase(),
      activationCode: studentActivationCode,
    },
    guardianAccount: {
      isEligible: true,
      isActivated: !!parentUser,
      username: application.phone,
      activationCode: parentActivationCode,
    },
  };
  await application.save();

  try {
    await Notification.create({
      title: `New Student Enrolled: ${student.fullName} (${student.admissionNo})`,
      message: `Student enrolled in Class ${student.class}-${student.section}. Guardian: ${application.parentName} (${application.phone}). Records are now accessible in teacher rosters.`,
      type: 'ANNOUNCEMENT',
      recipientRole: 'TEACHER',
      metadata: {
        studentId: student._id.toString(),
        admissionNo: student.admissionNo,
        class: student.class,
        section: student.section,
      },
    });
  } catch (e) {
  }

  try {
    const auditLogService = require('./auditLog.service');
    await auditLogService.logSensitiveChange({
      user: user?.fullName || 'Registrar Office',
      userId: user?._id,
      role: user?.role || 'REGISTRAR',
      action: 'STUDENT_ENROLMENT_COMPLETED',
      module: 'STUDENTS',
      recordReference: `${student.admissionNo} (${student.fullName})`,
      reason: `Formally converted approved application ${application.applicationNumber} to enrolled student in Class ${student.class}-${student.section}`,
      changedFields: [
        { field: 'admissionNo', oldValue: null, newValue: student.admissionNo },
        { field: 'class', oldValue: null, newValue: student.class },
        { field: 'section', oldValue: null, newValue: student.section },
        { field: 'status', oldValue: null, newValue: 'ACTIVE' },
      ],
      result: 'SUCCESS',
    });
  } catch (e) {
  }

  return {
    application,
    student,
    portalActivation: {
      studentUsername: admissionNo.toLowerCase(),
      studentActivationCode,
      guardianPhone: application.phone,
      guardianActivationCode: parentActivationCode,
      guardianAccountLinked: !!parentUser,
    },
    message: `Applicant ${application.studentName} enrolled successfully as Student (${student.admissionNo}, Class ${student.class}-${student.section}). Guardian verified and fee records initialized.`,
  };
};

module.exports = {
  submitApplication,
  checkApplicationStatus,
  uploadDocument,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getAdmissionStatsOverview,
  convertToStudent,
};
