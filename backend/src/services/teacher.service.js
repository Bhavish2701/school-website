const mongoose = require('mongoose');
const { Teacher } = require('../models/teacher.model');
const { Student } = require('../models/student.model');
const { Leave } = require('../models/leave.model');
const { Notification } = require('../models/notification.model');
const QueryFeatures = require('../utils/queryFeatures');
const ApiError = require('../utils/apiError');

class TeacherService {
  async getTeacherDocByUser(userId) {
    return await Teacher.findOne({ user: userId });
  }

  async getTeachers(queryString = {}, currentUser = null) {
    const baseFilter = {};

    if (currentUser && currentUser.role === 'TEACHER') {
      baseFilter.status = 'ACTIVE';
    }

    const mongooseQuery = Teacher.find(baseFilter).select(
      'employeeId fullName gender qualification specialization email phone status assignedClasses joiningDate'
    );

    const queryFeatures = new QueryFeatures(mongooseQuery, queryString)
      .search(['fullName', 'employeeId', 'specialization', 'qualification', 'email', 'phone'])
      .filter()
      .sort('fullName:asc')
      .paginate(10, 50);

    return await queryFeatures.execute();
  }

  async getTeacherById(id, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid teacher ID format: '${id}'`);
    }

    const teacher = await Teacher.findById(id).populate('user', 'username email isActive lastLogin');
    if (!teacher) {
      throw ApiError.notFound(`Teacher with ID '${id}' not found`);
    }

    return teacher;
  }

  async getMyProfile(currentUser) {
    let teacher = await this.getTeacherDocByUser(currentUser._id);
    if (!teacher) {
      teacher = await Teacher.findOne({ email: currentUser.email });
    }
    if (!teacher) {
      throw ApiError.notFound('Teacher profile not found for the authenticated user');
    }
    return teacher;
  }

  async createTeacher(teacherData, currentUser = null) {
    const employeeId = (teacherData.employeeId || '').trim().toUpperCase();

    const existingEmp = await Teacher.findOne({ employeeId });
    if (existingEmp) {
      throw ApiError.conflict(`Teacher with employee ID '${employeeId}' already exists`, 'DUPLICATE_EMPLOYEE_ID');
    }

    const existingEmail = await Teacher.findOne({ email: teacherData.email.trim().toLowerCase() });
    if (existingEmail) {
      throw ApiError.conflict(`Teacher with email '${teacherData.email}' already exists`, 'DUPLICATE_EMAIL');
    }

    const newTeacher = await Teacher.create({
      ...teacherData,
      employeeId,
      email: teacherData.email.trim().toLowerCase(),
    });

    return newTeacher;
  }

  async updateTeacher(id, updateData, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid teacher ID format: '${id}'`);
    }

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound(`Teacher with ID '${id}' not found`);
    }

    if (currentUser && currentUser.role === 'TEACHER') {
      const isOwnProfile =
        teacher.user && teacher.user.toString() === currentUser._id.toString();
      if (!isOwnProfile && teacher.email !== currentUser.email) {
        throw ApiError.forbidden('Teachers are authorized to edit only their own profile');
      }

      const allowedSelfUpdates = ['phone', 'address', 'bloodGroup'];
      Object.keys(updateData).forEach((key) => {
        if (!allowedSelfUpdates.includes(key)) {
          delete updateData[key];
        }
      });
    }

    if (updateData.employeeId) {
      const normalizedEmp = updateData.employeeId.trim().toUpperCase();
      if (normalizedEmp !== teacher.employeeId) {
        const dup = await Teacher.findOne({ employeeId: normalizedEmp });
        if (dup) {
          throw ApiError.conflict(`Employee ID '${normalizedEmp}' is already registered`, 'DUPLICATE_EMPLOYEE_ID');
        }
        updateData.employeeId = normalizedEmp;
      }
    }

    Object.assign(teacher, updateData);
    await teacher.save();

    return teacher;
  }

  async deleteTeacher(id, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid teacher ID format: '${id}'`);
    }

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw ApiError.notFound(`Teacher with ID '${id}' not found`);
    }

    await Teacher.findByIdAndDelete(id);

    return {
      id: teacher._id,
      employeeId: teacher.employeeId,
      fullName: teacher.fullName,
      deleted: true,
    };
  }

  async getTimetable(teacherId, currentUser = null) {
    let teacher;
    if (teacherId === 'me' || !teacherId) {
      teacher = await this.getMyProfile(currentUser);
    } else {
      teacher = await this.getTeacherById(teacherId, currentUser);
    }

    return {
      teacherId: teacher._id,
      employeeId: teacher.employeeId,
      fullName: teacher.fullName,
      timetable: teacher.timetable || [],
    };
  }

  async updateTimetable(teacherId, timetableData, currentUser = null) {
    const teacher = await this.getTeacherById(teacherId, currentUser);
    teacher.timetable = timetableData;
    await teacher.save();

    return {
      teacherId: teacher._id,
      employeeId: teacher.employeeId,
      timetable: teacher.timetable,
    };
  }

  async getTeacherDashboard(currentUser) {
    let teacher = await this.getTeacherDocByUser(currentUser._id);
    if (!teacher) {
      teacher = await Teacher.findOne({ email: currentUser.email });
    }

    if (!teacher) {
      teacher = await Teacher.findOne({ status: 'ACTIVE' });
    }

    if (!teacher) {
      return {
        assignedClassesCount: 0,
        totalStudentsCount: 0,
        todayPeriodsCount: 0,
        pendingLeavesCount: 0,
        unreadNotificationsCount: 0,
        leaveBalance: { casual: 12, sick: 10, earned: 15 },
      };
    }

    const assigned = teacher.assignedClasses || [];
    const assignedClassesCount = assigned.length;

    let totalStudentsCount = 0;
    if (assigned.length > 0) {
      const classFilters = assigned.map((a) => ({
        class: a.class,
        ...(a.section ? { section: a.section } : {}),
      }));
      totalStudentsCount = await Student.countDocuments({
        status: 'ACTIVE',
        $or: classFilters,
      });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todaySchedule = (teacher.timetable || []).find((s) => s.day === todayName);
    const todayPeriods = todaySchedule ? todaySchedule.periods : [];

    const pendingLeavesCount = await Leave.countDocuments({
      teacher: teacher._id,
      status: 'PENDING',
    });

    const unreadNotificationsCount = await Notification.countDocuments({
      $or: [
        { recipientUser: currentUser._id, isRead: false },
        { recipientRole: 'TEACHER', isRead: false },
      ],
    });

    return {
      teacher: {
        id: teacher._id,
        employeeId: teacher.employeeId,
        fullName: teacher.fullName,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
      },
      metrics: {
        assignedClassesCount,
        totalStudentsCount,
        todayPeriodsCount: todayPeriods.length,
        pendingLeavesCount,
        unreadNotificationsCount,
      },
      assignedClasses: assigned,
      todaySchedule: {
        day: todayName,
        periods: todayPeriods,
      },
      leaveBalance: teacher.leaveBalance,
    };
  }

  async applyLeave(currentUser, leaveData) {
    const teacher = await this.getMyProfile(currentUser);

    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);

    if (end < start) {
      throw ApiError.badRequest('End date cannot precede start date');
    }

    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      teacher: teacher._id,
      user: currentUser._id,
      leaveType: leaveData.leaveType || 'CASUAL',
      startDate: start,
      endDate: end,
      daysCount,
      reason: leaveData.reason,
      status: 'PENDING',
    });

    await Notification.create({
      title: `New Leave Application - ${teacher.fullName}`,
      message: `${teacher.fullName} (${teacher.employeeId}) has requested ${daysCount} day(s) ${leave.leaveType} leave from ${start.toDateString()} to ${end.toDateString()}.`,
      type: 'LEAVE_STATUS',
      recipientRole: 'PRINCIPAL',
      senderUser: currentUser._id,
    });

    return leave;
  }

  async getLeaves(currentUser, queryString = {}) {
    const filter = {};

    if (currentUser && currentUser.role === 'TEACHER') {
      const teacher = await this.getTeacherDocByUser(currentUser._id);
      if (teacher) {
        filter.teacher = teacher._id;
      } else {
        filter.user = currentUser._id;
      }
    }

    if (queryString.status) {
      filter.status = queryString.status.toUpperCase();
    }

    const leaves = await Leave.find(filter)
      .populate('teacher', 'fullName employeeId specialization department status phone')
      .populate('reviewedBy', 'fullName role')
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return leaves;
  }

  async reviewLeave(leaveId, currentUser, { status, reviewRemarks = '' }) {
    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      throw ApiError.badRequest(`Invalid leave ID: '${leaveId}'`);
    }

    const leave = await Leave.findById(leaveId).populate('teacher');
    if (!leave) {
      throw ApiError.notFound(`Leave request '${leaveId}' not found`);
    }

    const { User } = require('../models/user.model');
    const reviewer = currentUser || (await User.findOne({ role: 'PRINCIPAL' })) || { _id: null, fullName: 'Principal Smt. Gorle Varalakshmi' };

    leave.status = status;
    leave.reviewedBy = reviewer._id;
    leave.reviewRemarks = reviewRemarks;
    await leave.save();

    if (leave.teacher) {
      const teacher = await Teacher.findById(leave.teacher._id);
      if (teacher) {
        if (status === 'APPROVED') {
          teacher.status = 'ON_LEAVE';
          if (teacher.leaveBalance) {
            const typeKey = leave.leaveType.toLowerCase();
            if (teacher.leaveBalance[typeKey] !== undefined) {
              teacher.leaveBalance[typeKey] = Math.max(0, teacher.leaveBalance[typeKey] - leave.daysCount);
            }
          }
        } else if (status === 'REJECTED') {
          const otherActiveLeaves = await Leave.countDocuments({
            _id: { $ne: leave._id },
            teacher: teacher._id,
            status: 'APPROVED',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
          });
          if (otherActiveLeaves === 0) {
            teacher.status = 'ACTIVE';
          }
        }
        await teacher.save();
      }
    }

    if (leave.user) {
      await Notification.create({
        title: `Leave Application ${status}`,
        message: `Your leave request for ${leave.daysCount} day(s) has been ${status.toLowerCase()} by ${reviewer.fullName || 'Principal Smt. Gorle Varalakshmi'}. Remarks: ${reviewRemarks || 'None'}`,
        type: 'LEAVE_STATUS',
        recipientUser: leave.user,
        recipientRole: 'TEACHER',
        senderUser: reviewer._id || leave.user,
      });
    }

    return leave;
  }

  async getNotifications(currentUser) {
    const notifications = await Notification.find({
      $or: [
        { recipientUser: currentUser._id },
        { recipientRole: currentUser.role },
        { recipientRole: 'ALL' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      notifications,
      unreadCount,
    };
  }

  async markNotificationRead(notificationId, currentUser) {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw ApiError.badRequest(`Invalid notification ID: '${notificationId}'`);
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    return notification;
  }

  async createNotification(currentUser, notificationData) {
    const notification = await Notification.create({
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'ANNOUNCEMENT',
      recipientRole: notificationData.recipientRole || 'TEACHER',
      recipientUser: notificationData.recipientUser || null,
      senderUser: currentUser._id,
    });

    return notification;
  }
}

module.exports = new TeacherService();
