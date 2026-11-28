const mongoose = require('mongoose');
const { Student } = require('../models/student.model');
const { User } = require('../models/user.model');
const QueryFeatures = require('../utils/queryFeatures');
const ApiError = require('../utils/apiError');

class StudentService {
  async getStudents(queryString = {}, currentUser = null) {
    const baseFilter = {};

    if (currentUser) {
      if (currentUser.role === 'STUDENT') {
        baseFilter.$or = [
          { user: currentUser._id },
          { admissionNo: currentUser.studentProfile?.admissionNo || '__NONE__' },
        ];
      } else if (currentUser.role === 'PARENT') {
        const childrenIds = currentUser.children || [];
        baseFilter.$or = [
          { parentUser: currentUser._id },
          { user: { $in: childrenIds } },
          { _id: { $in: childrenIds } },
        ];
      } else if (currentUser.role === 'TEACHER') {
        const assigned = currentUser.assignedClasses || [];
        if (assigned.length === 0) {
          baseFilter._id = null;
        } else {
          baseFilter.$or = assigned.map((a) => ({
            class: a.class,
            ...(a.section ? { section: a.section } : {}),
          }));
        }
      }
    }

    const mongooseQuery = Student.find(baseFilter).populate(
      'parentUser',
      'fullName phone email'
    );

    const queryFeatures = new QueryFeatures(mongooseQuery, queryString)
      .search(['fullName', 'admissionNo', 'rollNo', 'parentName', 'phone', 'address'])
      .filter()
      .sort('class:asc,rollNo:asc')
      .paginate(10, 2000);

    return await queryFeatures.execute();
  }

  async getStudentById(id, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid student ID format: '${id}'`);
    }

    const student = await Student.findById(id)
      .populate('parentUser', 'fullName phone email role')
      .populate('user', 'username email isActive lastLogin');

    if (!student) {
      throw ApiError.notFound(`Student with ID '${id}' not found`);
    }

    if (currentUser) {
      const userRole = currentUser.role;
      const userId = currentUser._id.toString();

      if (userRole === 'STUDENT') {
        const isOwn =
          (student.user && student.user._id.toString() === userId) ||
          student.admissionNo === currentUser.studentProfile?.admissionNo;
        if (!isOwn) {
          throw ApiError.forbidden('Object-level authorization failed: Students can view only their own profile.');
        }
      } else if (userRole === 'PARENT') {
        const parentChildren = (currentUser.children || []).map((c) => c.toString());
        const isChild =
          (student.parentUser && student.parentUser._id.toString() === userId) ||
          parentChildren.includes(student._id.toString()) ||
          (student.user && parentChildren.includes(student.user._id.toString()));
        if (!isChild) {
          throw ApiError.forbidden("Object-level authorization failed: Parents can view only their children's profiles.");
        }
      } else if (userRole === 'TEACHER') {
        const assigned = currentUser.assignedClasses || [];
        const isAssigned = assigned.some(
          (a) => a.class === student.class && (!a.section || a.section === student.section)
        );
        if (!isAssigned) {
          throw ApiError.forbidden(
            `Object-level authorization failed: Teachers can access only students in assigned classes (Class ${student.class}-${student.section} is not assigned).`
          );
        }
      }
    }

    return student;
  }

  async createStudent(studentData, currentUser = null) {
    const admissionNo = (studentData.admissionNo || '').trim().toUpperCase();

    const existing = await Student.findOne({ admissionNo });
    if (existing) {
      throw ApiError.conflict(`Student with admission number '${admissionNo}' already exists`, 'DUPLICATE_ADMISSION_NO', {
        admissionNo: 'Admission number already registered',
      });
    }

    if (!studentData.parentUser && studentData.parentPhone) {
      const parentUser = await User.findOne({
        role: 'PARENT',
        phone: studentData.parentPhone.trim(),
      });
      if (parentUser) {
        studentData.parentUser = parentUser._id;
      }
    }

    const newStudent = await Student.create({
      ...studentData,
      admissionNo,
    });

    if (newStudent.parentUser) {
      await User.findByIdAndUpdate(newStudent.parentUser, {
        $addToSet: { children: newStudent._id },
      });
    }

    return newStudent;
  }

  async updateStudent(id, updateData, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid student ID format: '${id}'`);
    }

    const student = await Student.findById(id);
    if (!student) {
      throw ApiError.notFound(`Student with ID '${id}' not found`);
    }

    if (currentUser && currentUser.role === 'TEACHER') {
      const assigned = currentUser.assignedClasses || [];
      const isAssigned = assigned.some(
        (a) => a.class === student.class && (!a.section || a.section === student.section)
      );
      if (!isAssigned) {
        throw ApiError.forbidden('Teachers can only update records of students in their assigned classes');
      }

      const allowedFields = ['attendancePercentage', 'gpa', 'emergencyContact'];
      Object.keys(updateData).forEach((key) => {
        if (!allowedFields.includes(key)) {
          delete updateData[key];
        }
      });
    }

    if (updateData.admissionNo) {
      const normalizedAdm = updateData.admissionNo.trim().toUpperCase();
      if (normalizedAdm !== student.admissionNo) {
        const duplicate = await Student.findOne({ admissionNo: normalizedAdm });
        if (duplicate) {
          throw ApiError.conflict(`Admission number '${normalizedAdm}' is already taken`, 'DUPLICATE_ADMISSION_NO');
        }
        updateData.admissionNo = normalizedAdm;
      }
    }

    Object.assign(student, updateData);
    await student.save();

    return student;
  }

  async deleteStudent(id, currentUser = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid student ID format: '${id}'`);
    }

    const student = await Student.findById(id);
    if (!student) {
      throw ApiError.notFound(`Student with ID '${id}' not found`);
    }

    await Student.findByIdAndDelete(id);

    if (student.parentUser) {
      await User.findByIdAndUpdate(student.parentUser, {
        $pull: { children: student._id },
      });
    }

    return {
      id: student._id,
      admissionNo: student.admissionNo,
      fullName: student.fullName,
      deleted: true,
    };
  }

  async getStudentDashboardStats(currentUser = null) {
    const activeFilter = { status: 'ACTIVE' };
    const totalStudents = await Student.countDocuments({ status: { $ne: 'DELETED' } });
    const activeStudents = await Student.countDocuments(activeFilter);
    const inactiveStudents = await Student.countDocuments({ status: { $in: ['INACTIVE', 'SUSPENDED', 'TRANSFERRED', 'WITHDRAWN', 'ARCHIVED'] } });

    const maleCount = await Student.countDocuments({ ...activeFilter, gender: 'male' });
    const femaleCount = await Student.countDocuments({ ...activeFilter, gender: 'female' });

    const paidCount = await Student.countDocuments({ ...activeFilter, feeStatus: 'Paid' });
    const partialCount = await Student.countDocuments({ ...activeFilter, feeStatus: 'Partial' });
    const pendingCount = await Student.countDocuments({ ...activeFilter, feeStatus: 'Pending' });

    const { AttendanceRecord } = require('../models/attendance.model');
    const activeStudentIds = await Student.find(activeFilter).distinct('_id');
    const [totalAttRecords, presentAttRecords] = activeStudentIds.length > 0
      ? await Promise.all([
          AttendanceRecord.countDocuments({ student: { $in: activeStudentIds } }),
          AttendanceRecord.countDocuments({ student: { $in: activeStudentIds }, status: { $in: ['PRESENT', 'LATE', 'EXCUSED'] } }),
        ])
      : [0, 0];
    const attendanceAverage = totalAttRecords > 0
      ? Math.round((presentAttRecords / totalAttRecords) * 1000) / 10
      : null;

    const classAggregation = await Student.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const classDistribution = classAggregation.map((c) => ({
      class: c._id,
      count: c.count,
    }));

    const recentAdmissions = await Student.find(activeFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('admissionNo fullName class section status createdAt feeStatus');

    return {
      summary: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        attendanceAverage,
      },
      genderStats: {
        male: maleCount,
        female: femaleCount,
      },
      feeDistribution: {
        paid: paidCount,
        partial: partialCount,
        pending: pendingCount,
      },
      classDistribution,
      recentAdmissions,
    };
  }
}

module.exports = new StudentService();
