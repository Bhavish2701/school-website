const path = require('path');
process.env.NODE_PATH = path.join(__dirname, '../backend/node_modules');
require('module').Module._initPaths();

const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db');
  console.log('MongoDB connected');
  const dashboardService = require('../backend/src/services/dashboard.service');
  const mgmt = await dashboardService.getManagementDashboard(null);
  console.log('--- MANAGEMENT DASHBOARD ---');
  console.log('studentCount:', mgmt.studentCount);
  console.log('teacherCount:', mgmt.teacherCount);
  console.log('attendance:', {
    isMarkedToday: mgmt.attendance?.isMarkedToday,
    schoolAttendancePercentage: mgmt.attendance?.schoolAttendancePercentage,
    todayPresent: mgmt.attendance?.todayPresent,
    todayAbsent: mgmt.attendance?.todayAbsent,
    expectedStudents: mgmt.attendance?.expectedStudents
  });
  console.log('admissions:', mgmt.admissions);
  console.log('approvals:', mgmt.approvals);
  console.log('finances:', mgmt.finances);
  console.log('upcomingExams count:', mgmt.upcomingExams?.length);

  console.log('--- TEACHER DASHBOARD (Teacher 1) ---');
  const Teacher = require('../backend/src/models/teacher.model').Teacher;
  const t = await Teacher.findOne();
  if (t) {
    const teacherDash = await dashboardService.getTeacherDashboard(null, t._id);
    console.log('Teacher name:', t.firstName, t.lastName);
    console.log('assignedClasses count:', teacherDash.assignedClasses?.length);
    console.log('todaySchedule count:', teacherDash.todaySchedule?.length);
    console.log('stats:', teacherDash.stats);
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
