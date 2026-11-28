const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');
const { User } = require('../models/user.model');
const StudentRecord = require('../models/studentRecord.model');
const { Student } = require('../models/student.model');
const { Teacher } = require('../models/teacher.model');
const AcademicYear = require('../models/academicYear.model');
const Notification = require('../models/notification.model');
const Message = require('../models/message.model');
const asyncHandler = require('../utils/asyncHandler');
const liveSyncBus = require('../utils/liveSyncBus');

const dashboardController = require('../controllers/dashboard.controller');

router.get(
  '/dashboard/overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  dashboardController.getManagementDashboard
);

router.get(
  '/overview',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  asyncHandler(async (req, res) => {
    const [totalUsers, studentsCount, teachersCount, parentsCount, recordsCount, activeYearDoc] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Student.countDocuments({ status: 'ACTIVE' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      User.countDocuments({ role: 'PARENT', isActive: true }),
      StudentRecord.countDocuments(),
      AcademicYear.findOne({ isCurrent: true }).lean(),
    ]);

    res.status(200).json({
      success: true,
      message: 'School management dashboard overview retrieved',
      data: {
        authorizedManager: {
          username: req.user.username,
          role: req.user.role,
          fullName: req.user.fullName,
        },
        metrics: {
          totalUsers,
          studentsCount,
          teachersCount,
          parentsCount,
          recordsCount,
          academicYear: activeYearDoc ? activeYearDoc.name : null,
        },
      },
    });
  })
);

router.get(
  '/notifications',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
      $or: [
        { recipientUser: req.user._id },
        { recipientRole: { $in: ['ALL', 'MANAGEMENT', req.user.role] } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
    });
  })
);

router.post(
  '/notifications',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const { title, message, type = 'ANNOUNCEMENT', recipientRole = 'ALL', recipientUser = null } = req.body;
    const created = await Notification.create({
      title,
      message,
      type,
      recipientRole,
      recipientUser,
      senderUser: req.user._id,
    });
    liveSyncBus.emitSync('COMMUNICATION', 'CREATED', { entityId: created._id });
    res.status(201).json({ success: true, data: { notification: created } });
  })
);

router.patch(
  '/notifications/read-all',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    await Notification.updateMany(
      {
        isRead: false,
        $or: [
          { recipientUser: req.user._id },
          { recipientRole: { $in: ['ALL', 'MANAGEMENT', req.user.role] } },
        ],
      },
      { $set: { isRead: true } }
    );
    liveSyncBus.emitSync('COMMUNICATION', 'UPDATED');
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  })
);

router.get(
  '/messages',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'PARENT', 'STUDENT'),
  asyncHandler(async (req, res) => {
    const filter = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'].includes(req.user.role)
      ? {}
      : { $or: [{ sender: req.user._id }, { recipient: req.user._id }] };
    const messages = await Message.find(filter)
      .populate('sender', 'fullName role email')
      .populate('recipient', 'fullName role email')
      .populate('student', 'admissionNo fullName class section')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.status(200).json({ success: true, data: { messages } });
  })
);

router.post(
  '/messages',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER', 'PARENT'),
  asyncHandler(async (req, res) => {
    const { recipientId, studentId, subject, body } = req.body;
    const msg = await Message.create({
      sender: req.user._id,
      recipient: recipientId || req.user._id,
      student: studentId || undefined,
      subject,
      body,
    });
    liveSyncBus.emitSync('COMMUNICATION', 'CREATED', { entityId: msg._id });
    res.status(201).json({ success: true, data: { message: msg } });
  })
);

module.exports = router;
