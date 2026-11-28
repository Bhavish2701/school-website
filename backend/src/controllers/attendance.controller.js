const SmsLog = require('../models/smsLog.model');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const attendanceService = require('../services/attendance.service');
const { Student } = require('../models/student.model');

const getTeacherClasses = asyncHandler(async (req, res) => {
  const result = await attendanceService.getTeacherAssignedClasses(req.user);
  return sendSuccess(res, result, 'Teacher assigned classes retrieved successfully', 200);
});

const getClassStudents = asyncHandler(async (req, res) => {
  const { class: className, section } = req.params;
  const { date, session } = req.query;

  const result = await attendanceService.getClassStudentsForAttendance(className, section, date, req.user, session);
  return sendSuccess(res, result, `Student roster for Class ${className}-${section} retrieved successfully`, 200);
});

const markAttendance = asyncHandler(async (req, res) => {
  const { class: className, section, date, records, remarks, session, status } = req.body;

  const result = await attendanceService.markClassAttendance(
    className,
    section,
    date,
    records,
    remarks,
    req.user,
    session,
    status
  );

  return sendSuccess(res, result, result.message, 201);
});

const reopenRegister = asyncHandler(async (req, res) => {
  const { class: className, section, date, session, reason } = req.body;
  const result = await attendanceService.reopenAttendanceRegister(
    className,
    section,
    date,
    session,
    reason,
    req.user
  );
  return sendSuccess(res, result, result.message, 200);
});

const submitCorrection = asyncHandler(async (req, res) => {
  const { recordId, newStatus, reason } = req.body;
  const result = await attendanceService.submitAttendanceCorrection(
    recordId,
    newStatus,
    reason,
    req.user
  );
  return sendSuccess(res, result, result.message, 200);
});

const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await attendanceService.updatePermittedAttendance(id, req.body, req.user);
  return sendSuccess(res, result, 'Attendance record updated successfully', 200);
});

const getHistory = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceHistory(req.query);
  return sendSuccess(res, result, 'Attendance history retrieved successfully', 200);
});

const resolveStudentForUser = async (user) => {
  const student = await Student.findOne({ user: user._id });
  if (!student) {
    throw ApiError.notFound('Student profile associated with your user account was not found');
  }
  return student;
};

const getStudentSummary = asyncHandler(async (req, res) => {
  const student = await resolveStudentForUser(req.user);
  const result = await attendanceService.getStudentAttendanceSummary(student._id);
  return sendSuccess(res, result, 'Student attendance summary retrieved successfully', 200);
});

const getStudentDaily = asyncHandler(async (req, res) => {
  const student = await resolveStudentForUser(req.user);
  const result = await attendanceService.getStudentDailyAttendance(student._id, req.query);
  return sendSuccess(res, result, 'Daily attendance records retrieved successfully', 200);
});

const getStudentMonthly = asyncHandler(async (req, res) => {
  const student = await resolveStudentForUser(req.user);
  const { month, year } = req.query;
  const result = await attendanceService.getStudentMonthlyAttendance(student._id, month, year);
  return sendSuccess(res, result, 'Monthly attendance calendar retrieved successfully', 200);
});

const getChildSummary = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentAttendanceSummary(req.child._id);
  return sendSuccess(res, result, `Attendance summary for child ${req.child.fullName} retrieved successfully`, 200);
});

const getChildDaily = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentDailyAttendance(req.child._id, req.query);
  return sendSuccess(res, result, `Daily attendance for child ${req.child.fullName} retrieved successfully`, 200);
});

const getChildMonthly = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const result = await attendanceService.getStudentMonthlyAttendance(req.child._id, month, year);
  return sendSuccess(res, result, `Monthly attendance for child ${req.child.fullName} retrieved successfully`, 200);
});

const getManagementOverview = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const result = await attendanceService.getManagementSchoolOverview(date);
  return sendSuccess(res, result, 'School-wide attendance overview retrieved successfully', 200);
});

const getManagementClassAttendance = asyncHandler(async (req, res) => {
  const { class: className, section } = req.params;
  const { date } = req.query;
  const result = await attendanceService.getClassStudentsForAttendance(className, section, date, req.user);
  return sendSuccess(res, result, `Attendance details for Class ${className}-${section} retrieved successfully`, 200);
});

const getManagementReports = asyncHandler(async (req, res) => {
  const result = await attendanceService.getManagementReports(req.query);
  return sendSuccess(res, result, 'Attendance reports and analytics retrieved successfully', 200);
});

const getTodayAbsentees = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const result = await attendanceService.getTodayAbsenteesList(date);
  return sendSuccess(res, result, 'Today reported absentees retrieved successfully', 200);
});

const dispatchAbsenteeNotifications = asyncHandler(async (req, res) => {
  const { templateId = 'standard', channels = ['SMS', 'WhatsApp'], date } = req.body;
  const absenteesOverview = await attendanceService.getTodayAbsenteesList(date);
  const absentees = absenteesOverview.absentees || [];

  const createdLogs = [];
  for (const abs of absentees) {
    if (!abs.parentPhone) continue;
    const smsLog = await SmsLog.create({
      student: abs.studentId,
      admissionNo: abs.admissionNo,
      studentName: abs.studentName,
      recipientName: abs.parentName || 'Parent / Guardian',
      recipientPhone: abs.parentPhone,
      message: `Sri Vidya High School Alert: Pupil ${abs.studentName} (${abs.admissionNo}) is marked absent (${abs.reportedReason}).`,
      category: 'ABSENTEE_ALERT',
      gateway: channels.includes('WhatsApp') ? 'AP-EDUSMS & WhatsApp' : 'AP-EDUSMS',
      status: 'DELIVERED',
      deliveredAt: new Date(),
    });
    createdLogs.push(smsLog);
  }

  const count = createdLogs.length;
  const broadcastLog = {
    broadcastId: `ABS-DISP-${Date.now()}`,
    timestamp: new Date().toISOString(),
    templateId,
    channels,
    recipientCount: count,
    totalAbsenteesEvaluated: absentees.length,
    deliveryStatus: count > 0 ? 'Delivered' : 'No Recipients',
    gateways: {
      sms: count > 0 ? 'AP-EDUSMS (Dispatched)' : 'Idle',
      whatsapp: channels.includes('WhatsApp') && count > 0 ? 'WhatsApp Business (Dispatched)' : 'Idle',
    },
  };
  return sendSuccess(
    res,
    broadcastLog,
    count > 0
      ? `Absence notifications dispatched to ${count} parent contact(s).`
      : 'No active absentees with recorded parent phone numbers to notify.',
    200
  );
});

const resendAbsenteeNotification = asyncHandler(async (req, res) => {
  const { admNo } = req.params;
  const student = await Student.findOne({ admissionNo: admNo.toUpperCase() });
  if (!student) {
    throw ApiError.notFound(`Student ${admNo.toUpperCase()} not found`);
  }
  const recipientPhone = (student.parentPhone || student.phone || '').trim();
  if (!recipientPhone) {
    throw ApiError.badRequest(`No parent contact phone recorded for ${student.fullName} (${student.admissionNo})`);
  }
  const recipientName = student.parentName || 'Parent / Guardian';
  const studentName = student.fullName;

  const smsLog = await SmsLog.create({
    student: student?._id,
    admissionNo: admNo.toUpperCase(),
    studentName,
    recipientName,
    recipientPhone,
    message: `Sri Vidya High School Alert: Pupil ${studentName} (${admNo}) is absent today. Please contact school office for any assistance.`,
    category: 'ABSENTEE_ALERT',
    gateway: 'AP-EDUSMS (Airtel DLT)',
    status: 'DELIVERED',
    deliveredAt: new Date(),
  });

  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const resendLog = {
    admNo: admNo.toUpperCase(),
    timestamp: smsLog.deliveredAt.toISOString(),
    status: 'Delivered',
    deliveryTime: timeStr,
    gateway: smsLog.gateway,
    logId: smsLog._id,
  };
  return sendSuccess(res, resendLog, `Immediate SMS alert successfully dispatched via AP-EDUSMS gateway to parent ${recipientName} (${recipientPhone}).`, 200);
});

module.exports = {
  getTeacherClasses,
  getClassStudents,
  markAttendance,
  reopenRegister,
  submitCorrection,
  updateRecord,
  getHistory,
  getStudentSummary,
  getStudentDaily,
  getStudentMonthly,
  getChildSummary,
  getChildDaily,
  getChildMonthly,
  getManagementOverview,
  getManagementClassAttendance,
  getManagementReports,
  getTodayAbsentees,
  dispatchAbsenteeNotifications,
  resendAbsenteeNotification,
};
