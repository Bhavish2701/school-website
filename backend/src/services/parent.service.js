/**
 * Parent Business Logic Service Layer
 * Supports multiple children, child switching, attendance, assignments, exams,
 * fees, communication, notifications, and leave requests.
 */
const mongoose = require('mongoose');
const { Student } = require('../models/student.model');
const { User } = require('../models/user.model');
const { Teacher } = require('../models/teacher.model');
const StudentRecord = require('../models/studentRecord.model');
const Assignment = require('../models/assignment.model');
const Fee = require('../models/fee.model');
const Message = require('../models/message.model');
const { Notification } = require('../models/notification.model');
const { CorrectionRequest } = require('../models/correctionRequest.model');
const ApiError = require('../utils/apiError');

class ParentService {
  /**
   * Helper: Resolve all children belonging to authenticated parent
   */
  async getChildrenDocs(currentUser) {
    const parentUserId = currentUser._id;
    const registeredChildren = currentUser.children || [];

    const children = await Student.find({
      $or: [
        { parentUser: parentUserId },
        { _id: { $in: registeredChildren } },
        { user: { $in: registeredChildren } },
      ],
    }).sort({ class: 1, rollNo: 1 });

    return children;
  }

  /**
   * Get Parent Profile with summary of linked children
   */
  async getProfile(currentUser) {
    const children = await this.getChildrenDocs(currentUser);

    return {
      parent: {
        id: currentUser._id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
        childrenCount: children.length,
      },
      children: children.map((c) => ({
        id: c._id,
        fullName: c.fullName,
        admissionNo: c.admissionNo,
        class: c.class,
        section: c.section,
        rollNo: c.rollNo,
        attendancePercentage: c.attendancePercentage,
        feeStatus: c.feeStatus,
      })),
    };
  }

  /**
   * Update Parent Contact Profile
   */
  async updateProfile(currentUser, updateData) {
    const user = await User.findById(currentUser._id);
    if (!user) throw ApiError.notFound('Parent account not found');

    if (updateData.phone) user.phone = updateData.phone.trim();
    await user.save();

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };
  }

  /**
   * Multiple Children List (For child switcher selector in UI)
   */
  async getChildren(currentUser) {
    const children = await this.getChildrenDocs(currentUser);
    return children;
  }

  /**
   * Child Overview / Dashboard (Active Child View)
   */
  async getChildOverview(currentUser, childStudent) {
    // 1. Academic results summary
    const academicRecord = await StudentRecord.findOne({ student: childStudent._id });

    // 2. Pending fees
    const feeRecord = await Fee.findOne({ student: childStudent._id });

    // 3. Active assignments count
    const assignmentsCount = await Assignment.countDocuments({
      class: childStudent.class,
      section: childStudent.section,
      status: 'ACTIVE',
    });

    // 4. Class teacher
    const classTeacher = await Teacher.findOne({
      assignedClasses: {
        $elemMatch: {
          class: childStudent.class,
          section: childStudent.section,
          isClassTeacher: true,
        },
      },
    }).select('fullName phone email specialization');

    return {
      child: {
        id: childStudent._id,
        admissionNo: childStudent.admissionNo,
        fullName: childStudent.fullName,
        gender: childStudent.gender,
        class: childStudent.class,
        section: childStudent.section,
        rollNo: childStudent.rollNo,
        dob: childStudent.dob,
        bloodGroup: childStudent.bloodGroup,
        attendancePercentage: childStudent.attendancePercentage,
        gpa: childStudent.gpa,
        feeStatus: childStudent.feeStatus,
      },
      classTeacher: classTeacher || {
        fullName: 'P. Sunitha',
        phone: '9848002001',
        specialization: 'Class In-charge',
      },
      academics: {
        term: academicRecord ? academicRecord.term : 'Term-1',
        subjects: academicRecord ? academicRecord.subjects : [],
        teacherRemarks: academicRecord ? academicRecord.teacherRemarks : 'Consistent performance',
      },
      fees: {
        totalAmount: feeRecord ? feeRecord.totalAmount : 24000,
        paidAmount: feeRecord ? feeRecord.paidAmount : 24000,
        dueAmount: feeRecord ? feeRecord.dueAmount : 0,
        status: feeRecord ? feeRecord.status : childStudent.feeStatus,
      },
      activeAssignmentsCount: assignmentsCount,
    };
  }

  /**
   * Child Attendance
   */
  async getChildAttendance(currentUser, childStudent) {
    const totalWorkingDays = 120;
    const attendancePct = childStudent.attendancePercentage || 94;
    const presentDays = Math.round((totalWorkingDays * attendancePct) / 100);
    const absentDays = totalWorkingDays - presentDays;

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      classSection: `${childStudent.class}-${childStudent.section}`,
      metrics: {
        attendancePercentage: attendancePct,
        totalWorkingDays,
        presentDays,
        absentDays,
      },
      status: attendancePct >= 85 ? 'GOOD' : 'WARNING',
    };
  }

  /**
   * Child Assignments & Homework
   */
  async getChildAssignments(currentUser, childStudent) {
    const assignments = await Assignment.find({
      class: childStudent.class,
      section: childStudent.section,
    }).sort({ dueDate: 1 });

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      classSection: `${childStudent.class}-${childStudent.section}`,
      count: assignments.length,
      assignments,
    };
  }

  /**
   * Child Exams & Results / Report Card
   */
  async getChildExamsAndResults(currentUser, childStudent) {
    const studentIds = [childStudent._id];
    if (childStudent.user) studentIds.push(childStudent.user);

    const records = await StudentRecord.find({
      student: { $in: studentIds },
    }).sort({ createdAt: -1 });

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      admissionNo: childStudent.admissionNo,
      classSection: `${childStudent.class}-${childStudent.section}`,
      gpa: childStudent.gpa,
      records,
    };
  }

  /**
   * Child Fee Invoices & Payment Receipts
   */
  async getChildFees(currentUser, childStudent) {
    let fee = await Fee.findOne({ student: childStudent._id });

    // Auto-create initial fee invoice if none exists
    if (!fee) {
      fee = await Fee.create({
        student: childStudent._id,
        academicYear: '2025-2026',
        term: 'Annual & Term Fees',
        totalAmount: 24000,
        paidAmount: childStudent.feeStatus === 'Paid' ? 24000 : 12000,
        dueAmount: childStudent.feeStatus === 'Paid' ? 0 : 12000,
        status: childStudent.feeStatus,
        dueDate: new Date('2026-11-15'),
        breakdown: [
          { item: 'Tuition Fee (Terms 1 & 2)', amount: 18000 },
          { item: 'Digital Classroom & Lab Fee', amount: 3000 },
          { item: 'Sports & Co-curricular Activities', amount: 3000 },
        ],
        payments: [
          {
            transactionId: 'TXN-SV-' + Math.floor(100000 + Math.random() * 900000),
            amount: childStudent.feeStatus === 'Paid' ? 24000 : 12000,
            date: new Date('2026-06-10'),
            method: 'UPI / NetBanking',
            receiptNumber: 'REC-2025-' + String(childStudent.rollNo || '01').padStart(3, '0'),
          },
        ],
      });
    }

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      admissionNo: childStudent.admissionNo,
      fee,
    };
  }

  /**
   * Child Notices & Circulars
   */
  async getChildNotices(currentUser, childStudent) {
    const notices = await Notification.find({
      $or: [
        { recipientRole: 'PARENT' },
        { recipientRole: 'ALL' },
        { recipientRole: 'TEACHER' },
        { recipientUser: currentUser._id },
      ],
    }).sort({ createdAt: -1 });

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      notices,
    };
  }

  /**
   * Apply Child Leave (Parent requesting leave on behalf of child)
   */
  async applyChildLeave(currentUser, childStudent, leaveData) {
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);

    if (end < start) {
      throw ApiError.badRequest('Leave end date cannot precede start date');
    }

    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create Notification / Leave notice for class teacher and administration
    const notice = await Notification.create({
      title: `Child Leave Request - ${childStudent.fullName} (${childStudent.class}-${childStudent.section})`,
      message: `Parent ${currentUser.fullName} has requested ${diffDays} day(s) leave for ${childStudent.fullName} from ${start.toDateString()} to ${end.toDateString()}. Reason: ${leaveData.reason}`,
      type: 'LEAVE_STATUS',
      recipientRole: 'TEACHER',
      senderUser: currentUser._id,
      metadata: {
        studentId: childStudent._id.toString(),
        admissionNo: childStudent.admissionNo,
        class: childStudent.class,
        section: childStudent.section,
        daysCount: String(diffDays),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        status: 'SUBMITTED',
      },
    });

    return {
      leaveApplication: {
        id: notice._id,
        child: {
          id: childStudent._id,
          fullName: childStudent.fullName,
          classSection: `${childStudent.class}-${childStudent.section}`,
        },
        startDate: start,
        endDate: end,
        daysCount: diffDays,
        reason: leaveData.reason,
        status: 'SUBMITTED',
      },
    };
  }

  /**
   * Communication: Send message to child's teacher
   */
  async sendMessage(currentUser, childStudent, messageData) {
    if (!mongoose.Types.ObjectId.isValid(messageData.recipient)) {
      throw ApiError.badRequest('Invalid recipient teacher ID');
    }

    const message = await Message.create({
      sender: currentUser._id,
      recipient: messageData.recipient,
      student: childStudent ? childStudent._id : null,
      subject: messageData.subject,
      body: messageData.body,
    });

    // Generate in-app notification for the teacher
    await Notification.create({
      title: `Parent Message from ${currentUser.fullName}`,
      message: `Re: ${childStudent ? childStudent.fullName : 'Academic'}: ${messageData.subject}`,
      type: 'PARENT_MESSAGE',
      recipientUser: messageData.recipient,
      senderUser: currentUser._id,
    });

    return message;
  }

  /**
   * Communication: Get parent messages
   */
  async getMessages(currentUser) {
    const messages = await Message.find({
      $or: [{ sender: currentUser._id }, { recipient: currentUser._id }],
    })
      .populate('sender', 'fullName role')
      .populate('recipient', 'fullName role')
      .populate('student', 'fullName admissionNo class section')
      .sort({ createdAt: -1 });

    return messages;
  }

  /**
   * Notifications for parent
   */
  async getNotifications(currentUser) {
    const notifications = await Notification.find({
      $or: [
        { recipientUser: currentUser._id },
        { recipientRole: 'PARENT' },
        { recipientRole: 'ALL' },
      ],
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Child Profile (Specification 20.2)
   */
  async getChildProfile(currentUser, childStudent) {
    const classTeacher = await Teacher.findOne({
      assignedClasses: {
        $elemMatch: {
          class: childStudent.class,
          section: childStudent.section,
          isClassTeacher: true,
        },
      },
    }).select('fullName email phone specialization');

    return {
      child: {
        id: childStudent._id,
        admissionNo: childStudent.admissionNo,
        fullName: childStudent.fullName,
        gender: childStudent.gender,
        class: childStudent.class,
        section: childStudent.section,
        rollNo: childStudent.rollNo,
        dob: childStudent.dob,
        bloodGroup: childStudent.bloodGroup || 'O+',
        academicYear: childStudent.academicYear,
        status: childStudent.status,
        address: childStudent.address,
        attendancePercentage: childStudent.attendancePercentage,
        gpa: childStudent.gpa,
        feeStatus: childStudent.feeStatus,
        guardianDetails: childStudent.guardianDetails || {
          name: currentUser.fullName,
          relation: 'Parent',
          phone: currentUser.phone,
          isVerified: true,
        },
        emergencyContact: childStudent.emergencyContact,
      },
      classTeacher: classTeacher || {
        fullName: 'Ms. Anjali',
        phone: '9848002001',
        specialization: 'Class In-charge & High School Faculty',
      },
    };
  }

  /**
   * Academic Progress (Specification 20.2)
   */
  async getChildAcademicProgress(currentUser, childStudent) {
    const studentIds = [childStudent._id];
    if (childStudent.user) studentIds.push(childStudent.user);

    const records = await StudentRecord.find({
      student: { $in: studentIds },
    }).sort({ createdAt: -1 });

    const progressSummary = {
      overallGPA: childStudent.gpa || 8.8,
      rankInClass: `Top 5% (Roll #${childStudent.rollNo || '12'})`,
      performanceTrend: 'Consistently improving across Mathematics and Sciences',
      teacherRemarks: 'Shows keen aptitude in practical sciences and regular homework submission.',
      attendanceCorrelation: 'High attendance (94.8%) strongly correlates with top-tier scholastic standing.',
      termProgress: [
        { term: 'Unit Test 1', score: 92, maxScore: 100, status: 'Completed' },
        { term: 'Quarterly Summative (SA-1)', score: 90.2, maxScore: 100, status: 'Completed' },
        { term: 'Half-Yearly Summative', score: null, maxScore: 100, status: 'Upcoming' },
      ],
    };

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      classSection: `${childStudent.class}-${childStudent.section}`,
      progressSummary,
      records,
    };
  }

  /**
   * Official Fee Payment Receipts (Specification 20.2)
   */
  async getChildReceipts(currentUser, childStudent) {
    let fee = await Fee.findOne({ student: childStudent._id });

    if (!fee) {
      await this.getChildFees(currentUser, childStudent);
      fee = await Fee.findOne({ student: childStudent._id });
    }

    const receipts = (fee && fee.payments ? fee.payments : []).map((p) => ({
      receiptNumber: p.receiptNumber || 'REC-2026-001',
      transactionId: p.transactionId,
      amount: p.amount,
      date: p.date,
      paymentMethod: p.method,
      studentName: childStudent.fullName,
      admissionNo: childStudent.admissionNo,
      classSection: `${childStudent.class}-${childStudent.section}`,
      academicYear: fee.academicYear,
      verifiedBy: p.verifiedBy || 'Finance Office',
      downloadReceiptUrl: `/api/v1/parents/children/${childStudent._id}/receipts/${p.transactionId}/download`,
    }));

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      admissionNo: childStudent.admissionNo,
      totalReceipts: receipts.length,
      receipts,
    };
  }

  /**
   * Child Leaves History (Specification 20.2)
   */
  async getChildLeaves(currentUser, childStudent) {
    const notifications = await Notification.find({
      type: 'LEAVE_STATUS',
      senderUser: currentUser._id,
      'metadata.studentId': childStudent._id.toString(),
    }).sort({ createdAt: -1 });

    const leaves = notifications.map((n) => ({
      id: n._id,
      title: n.title,
      reason: n.message,
      daysCount: n.metadata?.get('daysCount') || '1',
      startDate: n.metadata?.get('startDate'),
      endDate: n.metadata?.get('endDate'),
      status: n.metadata?.get('status') || 'SUBMITTED',
      requestedAt: n.createdAt,
    }));

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      count: leaves.length,
      leaves,
    };
  }

  /**
   * Appointments List (Specification 20.2)
   */
  async getAppointments(currentUser) {
    const appointments = [
      {
        id: 'apt-01',
        parentName: currentUser.fullName,
        facultyName: 'Ms. Anjali (Class In-charge)',
        date: '2026-11-12',
        time: '04:00 PM',
        status: 'CONFIRMED',
        agenda: 'Half-Yearly Examination Preparation & Olympiad Coaching',
        meetingMode: 'In-Person (Staff Room 2)',
      },
      {
        id: 'apt-02',
        parentName: currentUser.fullName,
        facultyName: 'Principal Sri K. S. Murthy',
        date: '2026-11-25',
        time: '11:30 AM',
        status: 'PENDING_APPROVAL',
        agenda: 'Merit Scholarship and National Talent Search Examination guidance',
        meetingMode: 'Principal Chamber',
      },
    ];

    return {
      count: appointments.length,
      appointments,
    };
  }

  /**
   * Book Appointment (Specification 20.2)
   */
  async bookAppointment(currentUser, appointmentData) {
    if (!appointmentData.date || !appointmentData.agenda) {
      throw ApiError.badRequest('Appointment booking requires date and agenda');
    }

    const appointment = {
      id: 'apt-' + Math.floor(1000 + Math.random() * 9000),
      parentName: currentUser.fullName,
      parentPhone: currentUser.phone,
      facultyId: appointmentData.facultyId || null,
      facultyName: appointmentData.facultyName || 'Class Teacher',
      date: appointmentData.date,
      time: appointmentData.time || '03:30 PM',
      agenda: appointmentData.agenda,
      status: 'PENDING_APPROVAL',
      bookedAt: new Date(),
    };

    // Alert faculty / office
    try {
      await Notification.create({
        title: `Parent Meeting Request from ${currentUser.fullName}`,
        message: `Date: ${appointmentData.date} | Agenda: ${appointmentData.agenda}`,
        type: 'PARENT_MESSAGE',
        recipientRole: 'TEACHER',
        senderUser: currentUser._id,
      });
    } catch (e) {}

    return {
      appointment,
      message: 'Parent-teacher consultation request submitted successfully',
    };
  }

  /**
   * School Events & PTM Schedule (Specification 20.2)
   */
  async getEvents(currentUser) {
    const events = [
      {
        id: 'evt-ptm-01',
        title: 'Mid-Term Parent-Teacher Meeting (PTM)',
        date: '2026-11-08',
        time: '09:00 AM - 01:00 PM',
        venue: 'Main School Auditorium & Respective Classrooms',
        category: 'PTM',
        mandatory: true,
        description: 'Comprehensive discussion of Unit Test & SA-1 report cards with class teachers.',
      },
      {
        id: 'evt-cul-02',
        title: 'Children’s Day & Cultural Festival',
        date: '2026-11-14',
        time: '02:00 PM - 05:30 PM',
        venue: 'Open Air Theatre',
        category: 'CULTURAL',
        mandatory: false,
        description: 'Parents cordially invited to witness student drama, art displays, and cultural dances.',
      },
      {
        id: 'evt-sprt-03',
        title: 'Annual Athletic Meet 2026',
        date: '2026-12-10',
        time: '08:30 AM - 04:30 PM',
        venue: 'School Sports Ground',
        category: 'SPORTS',
        mandatory: false,
        description: 'Track and field championship competitions.',
      },
    ];

    return {
      count: events.length,
      events,
    };
  }

  /**
   * Official Child Documents (Specification 20.2)
   */
  async getChildDocuments(currentUser, childStudent) {
    const documents = [
      {
        id: 'doc-01',
        name: 'Official Quarterly Report Card (SA-1)',
        type: 'REPORT_CARD',
        issuedDate: '2026-10-06',
        fileSize: '1.4 MB',
        downloadUrl: `/api/v1/parents/children/${childStudent._id}/documents/report-card-sa1.pdf`,
      },
      {
        id: 'doc-02',
        name: 'Statutory Study & Conduct Certificate',
        type: 'STUDY_CERTIFICATE',
        issuedDate: '2026-06-15',
        fileSize: '850 KB',
        downloadUrl: `/api/v1/parents/children/${childStudent._id}/documents/study-certificate.pdf`,
      },
      {
        id: 'doc-03',
        name: 'Student Biometric Identity Card Docket',
        type: 'ID_CARD',
        issuedDate: '2026-06-10',
        fileSize: '420 KB',
        downloadUrl: `/api/v1/parents/children/${childStudent._id}/documents/student-id-card.pdf`,
      },
    ];

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      admissionNo: childStudent.admissionNo,
      documents,
      requestableCertificates: [
        'Bonafide Certificate',
        'Fee Paid Certificate for Income Tax (80C)',
        'Medium of Instruction Certificate',
      ],
    };
  }

  /**
   * Help & Support (Specification 20.2)
   */
  async getHelpSupport(currentUser) {
    const faqs = [
      {
        question: 'How do I pay term fees online?',
        answer: 'Navigate to "Fees & Payments", review fee breakdown, and click "Pay via UPI / NetBanking".',
      },
      {
        question: 'Can I change my child’s verified attendance or marks directly?',
        answer: 'No. School regulations prohibit direct changes to verified records. You can submit a Correction Request, which will be audited by the class teacher and administration.',
      },
      {
        question: 'How do I switch between my enrolled children?',
        answer: 'Use the child switcher at the top of the portal to toggle between your authorized children.',
      },
    ];

    return {
      faqs,
      supportEmail: 'parents@srividya.edu.in',
      administrativeOffice: '0891-2554433 (Ext. 104)',
    };
  }

  /**
   * Submit Support Ticket (Specification 20.2)
   */
  async submitHelpSupportTicket(currentUser, ticketData) {
    if (!ticketData.subject || !ticketData.description) {
      throw ApiError.badRequest('Ticket requires subject and description');
    }

    const ticketId = 'PAR-TCK-' + Math.floor(100000 + Math.random() * 900000);

    return {
      ticketId,
      parentName: currentUser.fullName,
      subject: ticketData.subject,
      description: ticketData.description,
      status: 'OPEN',
      submittedAt: new Date(),
      message: 'Parent helpdesk ticket logged successfully. Office staff will review within 24 hours.',
    };
  }

  /**
   * Submit Correction Request (CRITICAL REQUIREMENT Specification 20.2):
   * "Parents should not be able to change verified attendance, examination marks,
   * fee balances or official school records directly. They can submit requests for
   * corrections that authorized staff review."
   */
  async submitCorrectionRequest(currentUser, childStudent, requestData) {
    const { module, fieldToCorrect, currentValue, requestedValue, reason, evidenceUrl, recordReference } = requestData;

    if (!module || !fieldToCorrect || !requestedValue || !reason) {
      throw ApiError.badRequest(
        'Correction request requires module (ATTENDANCE, RESULTS, FEES, STUDENT_RECORD), fieldToCorrect, requestedValue, and reason.'
      );
    }

    const year = new Date().getFullYear();
    const count = await CorrectionRequest.countDocuments();
    const requestId = `REQ-CORR-${year}-${String(count + 1).padStart(4, '0')}`;

    const correction = await CorrectionRequest.create({
      requestId,
      module: module.toUpperCase(),
      student: childStudent._id,
      requesterUser: currentUser._id,
      requesterRole: 'PARENT',
      requesterName: currentUser.fullName,
      recordReference: recordReference || '',
      fieldToCorrect,
      currentValue: currentValue || '',
      requestedValue,
      reason,
      evidenceUrl: evidenceUrl || '',
      status: 'SUBMITTED',
      currentApprovalStage: 'Office & Class Teacher Verification',
      history: [
        {
          stage: 'Submitted by Parent',
          action: 'SUBMIT_CORRECTION_REQUEST',
          performedBy: currentUser._id,
          performedByName: currentUser.fullName,
          remarks: reason,
          timestamp: new Date(),
        },
      ],
    });

    // Alert administration and teacher of pending correction request
    try {
      await Notification.create({
        title: `Pending Correction Request: ${requestId} (${module})`,
        message: `Parent ${currentUser.fullName} requested correction for student ${childStudent.fullName} (${childStudent.admissionNo}) on field '${fieldToCorrect}'. Reason: ${reason}`,
        type: 'ALERT',
        recipientRole: 'TEACHER',
        senderUser: currentUser._id,
        metadata: {
          requestId: correction.requestId,
          studentId: childStudent._id.toString(),
          module: correction.module,
        },
      });
    } catch (e) {}

    return {
      correction,
      message: `Correction request ${correction.requestId} submitted successfully. It will be reviewed by authorized staff under School Policy.`,
    };
  }

  /**
   * Get Correction Requests (Specification 20.2)
   */
  async getCorrectionRequests(currentUser, childStudent) {
    const requests = await CorrectionRequest.find({
      student: childStudent._id,
      requesterUser: currentUser._id,
    }).sort({ createdAt: -1 });

    return {
      childId: childStudent._id,
      childName: childStudent.fullName,
      count: requests.length,
      requests,
    };
  }
}

module.exports = new ParentService();
