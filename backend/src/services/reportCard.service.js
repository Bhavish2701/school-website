const crypto = require('crypto');
const mongoose = require('mongoose');
const { ReportCard } = require('../models/reportCard.model');
const { Exam, ExamMark, calculateSubjectGrade, calculateOverallGrade } = require('../models/exam.model');
const { Student } = require('../models/student.model');
const { AttendanceRecord } = require('../models/attendance.model');
const ClassSection = require('../models/classSection.model');
const AcademicYear = require('../models/academicYear.model');
const ApiError = require('../utils/apiError');

const getAvailableExams = async () => {
  const exams = await Exam.find({}).sort({ startDate: -1 });
  const academicYears = await AcademicYear.find({}).sort({ isCurrent: -1 });
  const classSections = await ClassSection.find({}).sort({ className: 1, section: 1 });

  return {
    exams: exams.map((e) => ({
      id: e._id,
      name: e.name,
      examType: e.examType,
      academicYear: e.academicYear,
      startDate: e.startDate,
      endDate: e.endDate,
      classes: e.classes,
      isPublished: e.isPublished,
      status: e.status,
    })),
    academicYears: academicYears.map((ay) => ({
      name: ay.name,
      isCurrent: ay.isCurrent,
      terms: ay.terms,
    })),
    classes: classSections.map((cs) => ({
      className: cs.className,
      section: cs.section,
      academicYear: cs.academicYear,
      roomNumber: cs.roomNumber,
    })),
  };
};

const calculatePromotionDetails = (className, resultStatus) => {
  const classNum = parseInt(className, 10);
  let nextClass = '';
  if (classNum === 10) {
    nextClass = 'Class XI / Intermediate 1st Year (College Entrance)';
  } else if (!isNaN(classNum)) {
    nextClass = `Class ${classNum + 1} - Section A`;
  } else {
    nextClass = 'Next Academic Cohort';
  }

  let promotionStatus = 'Promoted';
  if (resultStatus === 'FAILED') {
    promotionStatus = 'Detained';
  } else if (resultStatus === 'WITHHELD' || resultStatus === 'PENDING') {
    promotionStatus = 'Result Awaited';
  }

  return {
    currentClass: `Class ${className}`,
    nextClass,
    promotionStatus,
    resultStatus: resultStatus === 'PASSED' ? 'Passed' : resultStatus,
    examinationCompletionStatus: 'Certified & Verified by Examination Cell',
    resultDeclarationDate: new Date(),
  };
};

const retrieveStudentAcademicData = async (studentAdmNoOrId, examId) => {
  const student = await Student.findOne({
    $or: [
      { admissionNo: studentAdmNoOrId },
      { _id: mongoose.Types.ObjectId.isValid(studentAdmNoOrId) ? studentAdmNoOrId : null },
    ],
  });

  if (!student) {
    throw ApiError.notFound(`Student record ${studentAdmNoOrId} not found in official directory`);
  }

  let exam = null;
  if (examId && mongoose.Types.ObjectId.isValid(examId)) {
    exam = await Exam.findById(examId);
  }
  if (!exam) {
    exam = await Exam.findOne({ isPublished: true }).sort({ startDate: -1 }) || await Exam.findOne({}).sort({ startDate: -1 });
  }

  if (!exam) {
    throw ApiError.notFound('No examination cycle configured for report card generation');
  }

  const examMark = await ExamMark.findOne({ exam: exam._id, student: student._id });

  const [totalRecordedAtt, presentRecordedAtt, absentRecordedAtt, excusedRecordedAtt] = await Promise.all([
    AttendanceRecord.countDocuments({ student: student._id }),
    AttendanceRecord.countDocuments({ student: student._id, status: { $in: ['PRESENT', 'LATE', 'HALF_DAY', 'EXCUSED'] } }),
    AttendanceRecord.countDocuments({ student: student._id, status: 'ABSENT' }),
    AttendanceRecord.countDocuments({ student: student._id, status: 'EXCUSED' }),
  ]);

  const totalWorkingDays = totalRecordedAtt;
  const daysPresent = presentRecordedAtt;
  const daysAbsent = absentRecordedAtt;
  const attendancePercentage = totalWorkingDays > 0
    ? Math.round((daysPresent / totalWorkingDays) * 1000) / 10
    : (student.attendancePercentage ?? null);
  const standing = attendancePercentage === null
    ? 'No Attendance Recorded'
    : attendancePercentage >= 95
      ? 'Exemplary'
      : attendancePercentage >= 85
        ? 'Good'
        : 'Needs Regularity';

  const attendanceSummary = {
    totalWorkingDays,
    daysPresent,
    daysAbsent,
    approvedLeaves: excusedRecordedAtt,
    attendancePercentage,
    standing,
  };

  const subjects = [];
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  let totalGradePoints = 0;
  let hasIncompleteMarks = false;
  let missingSubjects = [];

  if (examMark && examMark.subjectMarks && examMark.subjectMarks.length > 0) {
    for (const sm of examMark.subjectMarks) {
      const maxM = sm.maxMarks || 100;
      const obtainedM = sm.marksObtained;
      const internalM = Math.min(20, Math.round(obtainedM * 0.2));
      const externalM = obtainedM - internalM;

      totalMaxMarks += maxM;
      totalObtainedMarks += obtainedM;
      totalGradePoints += sm.gradePoint;

      subjects.push({
        subjectName: sm.subject,
        maxMarks: maxM,
        internalMarks: internalM,
        externalMarks: externalM,
        totalMarks: obtainedM,
        percentage: Math.round((obtainedM / maxM) * 1000) / 10,
        grade: sm.grade,
        gradePoint: sm.gradePoint,
        resultStatus: sm.isAbsent ? 'ABSENT' : (obtainedM >= (sm.passMarks || 35) ? 'PASSED' : 'FAILED'),
        teacherRemarks: sm.remarks || 'Satisfactory grasp of core concepts',
      });
    }
  } else {
    hasIncompleteMarks = true;
    missingSubjects.push('Marks memo not yet finalized in Examination module');
  }

  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 1000) / 10 : 0;
  const gpa = subjects.length > 0 ? Math.round((totalGradePoints / subjects.length) * 10) / 10 : 0;
  const overallGrade = calculateOverallGrade(overallPercentage);
  const resultStatus = subjects.some((s) => s.resultStatus === 'FAILED' || s.resultStatus === 'ABSENT')
    ? 'FAILED'
    : (overallPercentage >= 85 ? 'PASSED WITH DISTINCTION' : 'PASSED');

  const rankInClass = (examMark && examMark.rankInClass) ? examMark.rankInClass : 1;

  const scholasticSummary = {
    totalMaxMarks,
    totalObtainedMarks,
    overallPercentage,
    overallGrade,
    gpa,
    rankInClass,
    resultStatus,
    performanceSummary: overallPercentage >= 90 ? 'Outstanding Academic Distinction' : overallPercentage >= 75 ? 'First Class with Honors' : 'Second Class',
  };

  const classSectionDoc = await ClassSection.findOne({ className: student.class, section: student.section })
    .populate('classTeacher', 'fullName')
    .lean();

  const existingReportCard = await ReportCard.findOne({ student: student._id, exam: exam._id }).lean();
  const coScholasticAssessment = existingReportCard?.coScholastic?.length
    ? existingReportCard.coScholastic
    : [];

  const remarks = {
    classTeacherRemarks: (examMark && examMark.classTeacherRemarks) || existingReportCard?.remarks?.classTeacherRemarks || '',
    subjectTeacherRemarks: existingReportCard?.remarks?.subjectTeacherRemarks || '',
    strengths: existingReportCard?.remarks?.strengths || '',
    areasForImprovement: existingReportCard?.remarks?.areasForImprovement || '',
    principalRemarks: existingReportCard?.remarks?.principalRemarks || '',
    achievements: existingReportCard?.remarks?.achievements || '',
    recommendationsNextTerm: existingReportCard?.remarks?.recommendationsNextTerm || '',
  };

  const promotionDetails = calculatePromotionDetails(student.class, resultStatus);

  const verificationPayload = `${student.admissionNo}|${exam.name}|${totalObtainedMarks}|${overallGrade}`;
  const verificationCode = 'SV-VER-' + crypto.createHash('md5').update(verificationPayload).digest('hex').substring(0, 10).toUpperCase();

  const isEligible = !hasIncompleteMarks && subjects.length > 0;

  return {
    student: {
      id: student._id,
      admissionNo: student.admissionNo,
      fullName: student.fullName,
      studentId: student.studentId || `STU-${student.admissionNo}`,
      class: student.class,
      section: student.section,
      rollNo: student.rollNo,
      dob: student.dob || '',
      fatherName: student.parentName || student.guardianDetails?.name || '',
      motherName: student.motherName || '',
      classTeacher: classSectionDoc?.classTeacher?.fullName || '',
    },
    exam: {
      id: exam._id,
      name: exam.name,
      academicYear: exam.academicYear,
      examType: exam.examType,
      isPublished: exam.isPublished,
    },
    subjects,
    scholasticSummary,
    attendanceSummary,
    coScholasticAssessment,
    remarks,
    promotionDetails,
    verificationCode,
    validation: {
      isEligible,
      hasIncompleteMarks,
      missingSubjects,
      warningMessage: hasIncompleteMarks ? 'Academic marks incomplete. Check examination marks memo before official publication.' : null,
    },
  };
};

const validateClassData = async (className, section, examId) => {
  const query = { class: className, status: 'ACTIVE' };
  if (section && section !== 'ALL') {
    query.section = section;
  }

  const students = await Student.find(query).sort({ rollNo: 1 });
  const totalStudents = students.length;

  let exam = null;
  if (examId && mongoose.Types.ObjectId.isValid(examId)) {
    exam = await Exam.findById(examId);
  }
  if (!exam) {
    exam = await Exam.findOne({ isPublished: true }).sort({ startDate: -1 }) || await Exam.findOne({}).sort({ startDate: -1 });
  }

  const examIdRef = exam ? exam._id : null;
  const marksList = examIdRef ? await ExamMark.find({ exam: examIdRef, class: className }) : [];
  const marksMap = {};
  marksList.forEach((m) => {
    marksMap[m.student.toString()] = m;
  });

  let eligibleCount = 0;
  let incompleteMarksCount = 0;
  let missingAttendanceCount = 0;
  let pendingApprovalsCount = 0;
  const studentAudits = [];

  for (const s of students) {
    const mark = marksMap[s._id.toString()];
    const hasMarks = mark && mark.subjectMarks && mark.subjectMarks.length >= 4;
    const attPct = typeof s.attendancePercentage === 'number' ? s.attendancePercentage : null;
    const hasAttendance = attPct !== null && attPct > 0;
    const isReady = hasMarks && hasAttendance;

    if (isReady) eligibleCount++;
    if (!hasMarks) incompleteMarksCount++;
    if (!hasAttendance) missingAttendanceCount++;

    studentAudits.push({
      studentId: s._id,
      admissionNo: s.admissionNo,
      fullName: s.fullName,
      class: s.class,
      section: s.section,
      rollNo: s.rollNo,
      hasMarks,
      subjectCount: mark && mark.subjectMarks ? mark.subjectMarks.length : 0,
      totalMarks: mark ? mark.totalMarksObtained : 0,
      percentage: mark ? mark.percentage : 0,
      overallGrade: mark ? mark.overallGrade : 'N/A',
      attendancePercentage: attPct,
      status: isReady ? 'READY' : 'INCOMPLETE',
      exceptionReason: !hasMarks ? 'Marks memo pending subject submissions' : (!hasAttendance ? 'Attendance records missing or zero' : 'None'),
    });
  }

  return {
    examName: exam ? exam.name : 'All Examinations',
    class: className,
    section: section || 'ALL',
    totalStudents,
    eligibleCount,
    incompleteMarksCount,
    missingAttendanceCount,
    pendingApprovalsCount,
    readyCount: eligibleCount,
    readinessPercentage: totalStudents > 0 ? Math.round((eligibleCount / totalStudents) * 100) : 0,
    studentAudits,
  };
};

const saveReportCard = async (reportData, user) => {
  const admissionNo = reportData.admissionNo || reportData.studentAdmNo || reportData.admNo;
  let examId = reportData.examId;
  const format = reportData.format || 'AP_SSC_CCE';
  const componentsIncluded = reportData.componentsIncluded;
  const remarks = reportData.remarks;
  const coScholasticAssessment = reportData.coScholasticAssessment;

  const student = await Student.findOne({ admissionNo });
  if (!student) {
    throw ApiError.notFound(`Student with admission number ${admissionNo} not found`);
  }

  let exam = null;
  if (examId) {
    exam = await Exam.findById(examId);
  }
  if (!exam) {
    exam = await Exam.findOne({ isPublished: true }).sort({ createdAt: -1 }) || await Exam.findOne();
  }
  if (!exam) {
    throw ApiError.notFound('Examination cycle not found');
  }

  const yearSuffix = (exam.academicYear || '2025-2026').substring(0, 4);
  const rcNumber = `RC-${yearSuffix}-${student.class}-${student.admissionNo.replace('SV-', '')}`;

  let report = await ReportCard.findOne({ student: student._id, exam: exam._id });

  const data = await retrieveStudentAcademicData(student.admissionNo, exam._id);

  if (!report) {
    report = new ReportCard({
      reportCardNumber: rcNumber,
      student: student._id,
      admissionNo: student.admissionNo,
      studentName: student.fullName,
      studentId: student.studentId || `STU-${student.admissionNo}`,
      class: student.class,
      section: student.section,
      rollNo: student.rollNo,
      dob: student.dob,
      fatherName: student.parentName,
      classTeacher: 'P. Sunitha (Class Teacher)',
      exam: exam._id,
      examName: exam.name,
      academicYear: exam.academicYear,
      format: format || 'AP_SSC_CCE',
      subjects: data.subjects,
      scholasticSummary: data.scholasticSummary,
      attendanceSummary: data.attendanceSummary,
      coScholasticAssessment: coScholasticAssessment || data.coScholasticAssessment,
      remarks: remarks || data.remarks,
      promotionDetails: data.promotionDetails,
      componentsIncluded: componentsIncluded || undefined,
      verificationCode: data.verificationCode,
      workflowStage: 'VALIDATED',
      approval: {
        status: 'DRAFT',
      },
      publication: {
        isPublished: false,
      },
      createdBy: user ? user._id : undefined,
    });
  } else {
    report.revisionHistory.push({
      versionNumber: report.version,
      revisedBy: user ? user.name || user.username : 'Administrator',
      revisedAt: new Date(),
      justification: reportData.justification || 'Administrative update of report card components',
      previousSnapshot: report.toObject(),
    });

    report.version += 1;
    report.subjects = data.subjects;
    report.scholasticSummary = data.scholasticSummary;
    report.attendanceSummary = data.attendanceSummary;
    if (remarks) report.remarks = remarks;
    if (coScholasticAssessment) report.coScholasticAssessment = coScholasticAssessment;
    if (componentsIncluded) report.componentsIncluded = componentsIncluded;
    if (format) report.format = format;
  }

  await report.save();
  return report;
};

const verifyReportCard = async (reportCardId, user, remarks) => {
  const report = await ReportCard.findById(reportCardId);
  if (!report) {
    throw ApiError.notFound('Report card record not found');
  }

  report.workflowStage = 'ACADEMIC_VERIFIED';
  report.approval.status = 'AWAITING_APPROVAL';
  report.approval.verifiedBy = user ? (user.name || user.username) : 'P. Sunitha (Class Teacher)';
  report.approval.verifiedAt = new Date();
  report.approval.verificationRemarks = remarks || 'Scholastic marks, subject rubrics and co-scholastic grades verified.';

  await report.save();
  return report;
};

const authorizeReportCard = async (reportCardId, user, decision, remarks) => {
  const report = await ReportCard.findById(reportCardId);
  if (!report) {
    throw ApiError.notFound('Report card record not found');
  }

  if (decision === 'APPROVED') {
    report.workflowStage = 'PRINCIPAL_AUTHORIZED';
    report.approval.status = 'APPROVED';
    report.approval.approvedBy = user ? (user.name || 'Smt. Gorle Varalakshmi (Principal)') : 'Smt. Gorle Varalakshmi (Principal)';
    report.approval.approvedAt = new Date();
    report.approval.approvalRemarks = remarks || 'Official scholastic progress report approved for institutional certification.';
  } else if (decision === 'RETURNED') {
    report.workflowStage = 'CONFIGURATION';
    report.approval.status = 'RETURNED';
    report.approval.approvalRemarks = remarks || 'Returned to Class Teacher for mark and remark corrections.';
  } else {
    report.approval.status = 'REJECTED';
    report.approval.approvalRemarks = remarks || 'Report card authorization declined.';
  }

  await report.save();
  return report;
};

const publishReportCard = async (reportCardId, user) => {
  const report = await ReportCard.findById(reportCardId);
  if (!report) {
    throw ApiError.notFound('Report card record not found');
  }

  if (report.approval.status !== 'APPROVED') {
    throw ApiError.badRequest('Prerequisite Error: Report card must receive Principal Executive Authorization before official publication.');
  }

  report.workflowStage = 'PUBLISHED';
  report.publication.isPublished = true;
  report.publication.publishedAt = new Date();
  report.publication.publishedBy = user ? user._id : undefined;

  await report.save();
  return report;
};

const getReportCardHistory = async (filters = {}) => {
  const query = {};
  if (filters.class) query.class = filters.class;
  if (filters.section) query.section = filters.section;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.search) {
    query.$or = [
      { studentName: { $regex: filters.search, $options: 'i' } },
      { admissionNo: { $regex: filters.search, $options: 'i' } },
      { reportCardNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const reports = await ReportCard.find(query)
    .populate('student', 'admissionNo fullName class section rollNo')
    .sort({ createdAt: -1 });

  return {
    totalRecords: reports.length,
    reports: reports.map((r) => ({
      id: r._id,
      reportCardNumber: r.reportCardNumber,
      studentName: r.studentName,
      admissionNo: r.admissionNo,
      class: r.class,
      section: r.section,
      rollNo: r.rollNo,
      examName: r.examName,
      academicYear: r.academicYear,
      percentage: r.scholasticSummary.overallPercentage,
      grade: r.scholasticSummary.overallGrade,
      resultStatus: r.scholasticSummary.resultStatus,
      workflowStage: r.workflowStage,
      approvalStatus: r.approval.status,
      isPublished: r.publication.isPublished,
      version: r.version,
      generatedDate: r.createdAt,
    })),
  };
};

module.exports = {
  getAvailableExams,
  retrieveStudentAcademicData,
  validateClassData,
  saveReportCard,
  verifyReportCard,
  authorizeReportCard,
  publishReportCard,
  getReportCardHistory,
};
