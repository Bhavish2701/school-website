const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { Notification } = require('../../models/notification.model');
const { Message } = require('../../models/message.model');
const { Student } = require('../../models/student.model');
const { Teacher } = require('../../models/teacher.model');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

router.use(authenticateUser);

router.get(
  '/circulars',
  asyncHandler(async (req, res) => {
    const circulars = await Notification.find({
      type: { $in: ['NOTICE', 'ANNOUNCEMENT', 'GENERAL', 'EVENT'] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return sendSuccess(res, circulars, 'Circulars retrieved from database');
  })
);

router.post(
  '/broadcast',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  asyncHandler(async (req, res) => {
    const title = req.body.title || req.body.subject || 'Institutional Circular';
    const message = req.body.message || req.body.body || '';
    const recipientRole = (req.body.recipientRole || 'ALL').toUpperCase();
    const [activeStudents, activeTeachers] = await Promise.all([
      Student.countDocuments({ status: 'ACTIVE' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
    ]);
    const doc = await Notification.create({
      title,
      message,
      type: req.body.type || 'NOTICE',
      recipientRole,
      createdBy: req.user._id,
    });
    const estimatedRecipients =
      recipientRole === 'TEACHER'
        ? activeTeachers
        : recipientRole === 'STUDENT' || recipientRole === 'PARENT'
          ? activeStudents
          : activeStudents + activeTeachers;

    return sendSuccess(
      res,
      {
        notification: doc,
        channel: req.body.channel || 'Portal Noticeboard',
        recipientCount: estimatedRecipients,
        status: 'PUBLISHED',
        timestamp: doc.createdAt,
      },
      'Broadcast notice published',
      201
    );
  })
);

router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id },
        { recipientRole: { $in: ['ALL', req.user.role] } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return sendSuccess(res, messages, 'Messages retrieved');
  })
);

module.exports = router;
