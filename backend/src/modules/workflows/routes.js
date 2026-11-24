const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { Admission } = require('../../models/admission.model');
const { AttendanceRegister } = require('../../models/attendance.model');
const { Exam } = require('../../models/exam.model');
const Fee = require('../../models/fee.model');
const { Teacher } = require('../../models/teacher.model');
const { Leave } = require('../../models/leave.model');
const { Appointment } = require('../../models/appointment.model');
const { StudentExit } = require('../../models/studentExit.model');
const { Notification } = require('../../models/notification.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  asyncHandler(async (req, res) => {
    const [
      pendingAdmissions,
      todayRegisters,
      activeExams,
      pendingFees,
      totalTeachers,
      pendingLeaves,
      pendingAppointments,
      pendingExits,
      noticesCount,
    ] = await Promise.all([
      Admission.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION'] } }),
      AttendanceRegister.countDocuments({}),
      Exam.countDocuments({ status: { $ne: 'RESULTS_PUBLISHED' } }),
      Fee.countDocuments({ balance: { $gt: 0 } }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Leave.countDocuments({ status: { $in: ['PENDING', 'APPLIED'] } }),
      Appointment.countDocuments({ status: { $in: ['PENDING_APPROVAL', 'CONFIRMED'] } }),
      StudentExit.countDocuments({ status: { $nin: ['TC Issued & Archived', 'Withdrawn & Archived', 'Cancelled'] } }),
      Notification.countDocuments({}),
    ]);

    const workflows = [
      { id: 'WF-A', code: 'Workflow A', title: 'New student admission', category: 'Admissions & Enrolment', activeCount: pendingAdmissions, status: pendingAdmissions > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-B', code: 'Workflow B', title: 'Student attendance', category: 'Daily Turnout', activeCount: todayRegisters, status: todayRegisters > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-C', code: 'Workflow C', title: 'Examinations and results', category: 'Assessment & Tabulation', activeCount: activeExams, status: activeExams > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-D', code: 'Workflow D', title: 'Fees', category: 'Finance & Accounts', activeCount: pendingFees, status: pendingFees > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-E', code: 'Workflow E', title: 'Teacher directory & allocations', category: 'Human Resources', activeCount: totalTeachers, status: 'ACTIVE' },
      { id: 'WF-F', code: 'Workflow F', title: 'Staff leave', category: 'Leave Approvals', activeCount: pendingLeaves, status: pendingLeaves > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-G', code: 'Workflow G', title: 'Principal appointments', category: 'Governance', activeCount: pendingAppointments, status: pendingAppointments > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-H', code: 'Workflow H', title: 'Student transfer & exit', category: 'Admissions & Records', activeCount: pendingExits, status: pendingExits > 0 ? 'ACTIVE' : 'IDLE' },
      { id: 'WF-J', code: 'Workflow J', title: 'School announcements & circulars', category: 'Communication', activeCount: noticesCount, status: noticesCount > 0 ? 'ACTIVE' : 'IDLE' },
    ];
    return sendSuccess(res, workflows, 'Live institutional workflows summary retrieved');
  })
);

module.exports = router;
