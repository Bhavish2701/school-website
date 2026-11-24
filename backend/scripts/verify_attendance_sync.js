const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

console.log('--- Sri Vidya Dashboard "Students Absent Today" Verification Suite ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Static HTML Checks
const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.includes('id="dashSectionAbsentees"'), 'dashSectionAbsentees container exists');
assert(html.includes('id="dashAbsenteesCount"'), 'dashAbsenteesCount dynamic count element exists');
assert(html.includes('id="dashFilterCountAll"'), 'dashFilterCountAll exists');
assert(html.includes('id="dashFilterCountUnexcused"'), 'dashFilterCountUnexcused exists');
assert(html.includes('id="dashFilterCountMedical"'), 'dashFilterCountMedical exists');
assert(html.includes('id="dashFilterCountExcused"'), 'dashFilterCountExcused exists');
assert(html.includes('id="dashAbsenteesTableBody"'), 'dashAbsenteesTableBody exists');
assert(html.includes('id="dashAbsenteesFooterCount"'), 'dashAbsenteesFooterCount exists');
assert(html.includes('portalApp.refreshDashboardAbsentees'), 'Manual refresh button exists');

// Verify hardcoded sample students removed from tbody
const tbodyMatch = html.match(/<tbody id="dashAbsenteesTableBody">([\s\S]*?)<\/tbody>/);
assert(tbodyMatch !== null, 'Found dashAbsenteesTableBody tbody');
const tbodyContent = tbodyMatch ? tbodyMatch[1] : '';
assert(!tbodyContent.includes('G. Sai Teja'), 'Hardcoded G. Sai Teja removed from table body');
assert(!tbodyContent.includes('K. Divya Sree'), 'Hardcoded K. Divya Sree removed from table body');
assert(!tbodyContent.includes('P. Hema Latha'), 'Hardcoded P. Hema Latha removed from table body');
assert(!tbodyContent.includes('M. Charan Teja'), 'Hardcoded M. Charan Teja removed from table body');
assert(!tbodyContent.includes('S. Rohit Varma'), 'Hardcoded S. Rohit Varma removed from table body');
assert(!tbodyContent.includes('+91 98480 23145'), 'Hardcoded fake phone numbers removed from table body');
assert(!tbodyContent.includes('Delivered 08:42 AM'), 'Hardcoded fake SMS timestamps removed from table body');

// 2. Static JS Checks
const jsPath = path.join(__dirname, '../../frontend/js/portal.js');
const js = fs.readFileSync(jsPath, 'utf8');

assert(js.includes('function renderDashboardAbsentees('), 'renderDashboardAbsentees function exists');
assert(js.includes('function filterAbsentees('), 'filterAbsentees function exists');
assert(js.includes('function refreshDashboardAbsentees('), 'refreshDashboardAbsentees function exists');
assert(js.includes('function sendAbsenteeSMS('), 'sendAbsenteeSMS function exists');
assert(js.includes('function callParent('), 'callParent function exists');
assert(js.includes('setInterval(refreshDashboardAbsentees, 60000);'), 'Periodic 60s background refresh registered');
assert(js.includes('/api/v1/attendance/management/absentees'), 'API route /api/v1/attendance/management/absentees referenced');

// 3. Backend Model & Service Checks
const dashboardService = require('../src/services/dashboard.service');
const attendanceService = require('../src/services/attendance.service');
const { Student } = require('../src/models/student.model');
const { AttendanceRecord, AttendanceRegister } = require('../src/models/attendance.model');
const SmsLog = require('../src/models/smsLog.model');

async function runLiveDbTests() {
  console.log('\n--- Running Live DB Integration & Attendance Flow Tests ---');
  await mongoose.connect('mongodb://localhost:27017/srividya_school_db');
  console.log('Connected to MongoDB');

  // Test 1: Query management dashboard with current DB state
  const dashData = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  assert(dashData && dashData.attendance, 'Management dashboard returns attendance object');
  assert(Array.isArray(dashData.attendance.todayAbsentees), 'todayAbsentees is an array');
  assert(dashData.attendance.absenteeBreakdown !== undefined, 'absenteeBreakdown object exists');
  console.log(`Current Absentees Today: ${dashData.attendance.todayAbsentees.length}`);

  // Test 2: Mark attendance for testing: 1 student ABSENT (Medical) and 1 EXCUSED (On-Duty)
  const testStudent1 = await Student.findOne({ admissionNo: 'SV-0003' }); // K. Sai Teja
  const testStudent2 = await Student.findOne({ admissionNo: 'SV-0004' }); // M. Divya Bharathi
  assert(testStudent1 !== null, 'Found student SV-0003 (K. Sai Teja) in DB');
  assert(testStudent2 !== null, 'Found student SV-0004 (M. Divya Bharathi) in DB');

  const today = new Date();
  const testDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));

  // Upsert test attendance records
  await AttendanceRecord.findOneAndUpdate(
    { student: testStudent1._id, date: testDate, session: 'FULL_DAY' },
    {
      student: testStudent1._id,
      class: testStudent1.class,
      section: testStudent1.section,
      academicYear: '2025-2026',
      date: testDate,
      status: 'ABSENT',
      remarks: 'High viral fever and doctor consultation',
      session: 'FULL_DAY',
      markedBy: new mongoose.Types.ObjectId(),
    },
    { upsert: true, new: true }
  );

  await AttendanceRecord.findOneAndUpdate(
    { student: testStudent2._id, date: testDate, session: 'FULL_DAY' },
    {
      student: testStudent2._id,
      class: testStudent2.class,
      section: testStudent2.section,
      academicYear: '2025-2026',
      date: testDate,
      status: 'EXCUSED',
      remarks: 'District Athletics Tournament On-Duty',
      isPermitted: true,
      session: 'FULL_DAY',
      markedBy: new mongoose.Types.ObjectId(),
    },
    { upsert: true, new: true }
  );

  // Test 3: Verify dashboard immediately catches the marked absentees
  const updatedDash = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const absList = updatedDash.attendance.todayAbsentees;
  assert(absList.length >= 2, `todayAbsentees length is ${absList.length} (expected >= 2)`);

  const saiTeja = absList.find(a => a.admissionNo === 'SV-0003');
  assert(saiTeja !== undefined, 'K. Sai Teja found in todayAbsentees');
  if (saiTeja) {
    assert(saiTeja.category === 'medical', 'K. Sai Teja classified as medical');
    assert(saiTeja.reportedReason.includes('fever'), 'Reason accurately reflects fever remark');
    assert(saiTeja.parentPhone === testStudent1.parentPhone, 'Parent phone matches student DB record');
    assert(saiTeja.smsStatus.delivered === false, 'SMS status initially Not Dispatched (no fake delivery)');
  }

  const divya = absList.find(a => a.admissionNo === 'SV-0004');
  assert(divya !== undefined, 'M. Divya Bharathi found in todayAbsentees');
  if (divya) {
    assert(divya.category === 'excused', 'M. Divya Bharathi classified as excused / on-duty');
    assert(divya.reportedReason.includes('On-Duty') || divya.reportedReason.includes('Tournament'), 'Reason reflects on-duty');
  }

  // Test 4: Dispatch real SMS log for SV-0003
  await SmsLog.create({
    student: testStudent1._id,
    admissionNo: testStudent1.admissionNo,
    studentName: testStudent1.fullName,
    recipientName: testStudent1.parentName,
    recipientPhone: testStudent1.parentPhone,
    message: 'Official Absence Alert',
    category: 'ABSENTEE_ALERT',
    gateway: 'AP-EDUSMS (Airtel DLT)',
    status: 'DELIVERED',
    deliveredAt: new Date(),
  });

  // Test 5: Re-query and verify SMS delivery status reflects actual gateway log
  const afterSmsDash = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const saiTejaAfterSms = afterSmsDash.attendance.todayAbsentees.find(a => a.admissionNo === 'SV-0003');
  assert(saiTejaAfterSms && saiTejaAfterSms.smsStatus.delivered === true, 'SMS delivery status is true after real gateway dispatch');
  assert(saiTejaAfterSms && saiTejaAfterSms.smsStatus.statusText.includes('Delivered'), 'SMS status text includes Delivered');

  // Test 6: Attendance Correction: Change SV-0003 from ABSENT to PRESENT
  await AttendanceRecord.findOneAndUpdate(
    { student: testStudent1._id, date: testDate, session: 'FULL_DAY' },
    {
      status: 'PRESENT',
      remarks: 'Late arrival permitted by Principal',
    }
  );

  const afterCorrectionDash = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const saiTejaAfterCorrection = afterCorrectionDash.attendance.todayAbsentees.find(a => a.admissionNo === 'SV-0003');
  assert(saiTejaAfterCorrection === undefined, 'Corrected student (now PRESENT) immediately removed from absentees list');

  // Clean up test records
  await AttendanceRecord.deleteMany({ student: { $in: [testStudent1._id, testStudent2._id] }, date: testDate });
  await SmsLog.deleteMany({ admissionNo: testStudent1.admissionNo });

  console.log('✓ Cleaned up test attendance records and test SMS logs');
  await mongoose.disconnect();

  console.log(`\nFinal Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✓ ALL TESTS PASSED! Real-time attendance synchronization verified successfully.');
  }
}

runLiveDbTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
