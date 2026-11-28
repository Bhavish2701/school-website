const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'backend/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db';

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

async function runVerification() {
  console.log('--- 1. Verifying HTML Structure & Hardcoded Cleanup ---');
  const htmlPath = path.join(__dirname, '../../frontend/administration-portal/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert(html.includes('id="dashSectionFeeDues"'), 'Fee Section container exists');
  assert(html.includes('id="dashFeeTodayAmount"'), 'dashFeeTodayAmount element exists');
  assert(html.includes('id="dashFeeTodaySub"'), 'dashFeeTodaySub element exists');
  assert(html.includes('id="dashFeeTermAmount"'), 'dashFeeTermAmount element exists');
  assert(html.includes('id="dashFeeTermLabel"'), 'dashFeeTermLabel element exists');
  assert(html.includes('id="dashFeeTermSub"'), 'dashFeeTermSub element exists');
  assert(html.includes('id="dashFeeOutstandingAmount"'), 'dashFeeOutstandingAmount element exists');
  assert(html.includes('id="dashFeeOutstandingLabel"'), 'dashFeeOutstandingLabel element exists');
  assert(html.includes('id="dashFeeOutstandingSub"'), 'dashFeeOutstandingSub element exists');
  assert(html.includes('id="dashFeeDefaultersCount"'), 'dashFeeDefaultersCount element exists');
  assert(html.includes('id="dashFeeDefaultersTableBody"'), 'dashFeeDefaultersTableBody exists');
  assert(html.includes('id="btnBroadcastFeeReminders"'), 'btnBroadcastFeeReminders exists');
  assert(html.includes('id="dashBroadcastRemindersIcon"'), 'dashBroadcastRemindersIcon exists');
  assert(html.includes('id="btnRefreshFeeDues"'), 'btnRefreshFeeDues exists');
  assert(html.includes('id="dashFeeRefreshIcon"'), 'dashFeeRefreshIcon exists');

  const tableBodyMatch = html.match(/<tbody id="dashFeeDefaultersTableBody">([\s\S]*?)<\/tbody>/);
  assert(tableBodyMatch !== null, 'Found dashFeeDefaultersTableBody');
  if (tableBodyMatch) {
    const tbodyContent = tableBodyMatch[1];
    assert(!tbodyContent.includes('B. Sai Kiran'), 'Hardcoded sample B. Sai Kiran removed from table body');
    assert(!tbodyContent.includes('Roll #SV-0089'), 'Hardcoded sample Roll #SV-0089 removed from table body');
    assert(!tbodyContent.includes('K. Meghana'), 'Hardcoded sample K. Meghana removed from table body');
    assert(!tbodyContent.includes('Roll #SV-0174'), 'Hardcoded sample Roll #SV-0174 removed from table body');
    assert(!tbodyContent.includes('N. Naveen'), 'Hardcoded sample N. Naveen removed from table body');
    assert(!tbodyContent.includes('Roll #SV-0255'), 'Hardcoded sample Roll #SV-0255 removed from table body');
  }

  console.log('\n--- 2. Verifying Frontend Portal Logic ---');
  const jsPath = path.join(__dirname, '../../frontend/js/portal.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  assert(js.includes('function renderDashboardFeeOverviewLive'), 'renderDashboardFeeOverviewLive function exists');
  assert(js.includes('function sendStudentFeeReminder'), 'sendStudentFeeReminder function exists');
  assert(js.includes('function broadcastFeeReminders'), 'broadcastFeeReminders function exists');
  assert(js.includes('function refreshDashboardFeeDues'), 'refreshDashboardFeeDues function exists');
  assert(js.includes('dashboardActiveFeeOverview'), 'dashboardActiveFeeOverview state variable exists');
  assert(js.includes('renderDashboardFeeOverviewLive(data.finances)'), 'renderDashboardFeeOverviewLive hooked in live metrics');
  assert(js.includes('refreshDashboardFeeDues: refreshDashboardFeeDues'), 'Exported refreshDashboardFeeDues on portalApp');
  assert(js.includes('sendStudentFeeReminder,'), 'Exported sendStudentFeeReminder on portalApp');
  assert(js.includes('broadcastFeeReminders,'), 'Exported broadcastFeeReminders on portalApp');

  console.log('\n--- 3. Running Live DB Integration & Real-Time Sync Tests ---');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const { Student } = require('../src/models/student.model');
  const Fee = require('../src/models/fee.model');
  const Receipt = require('../src/models/receipt.model');
  const SmsLog = require('../src/models/smsLog.model');
  const feeService = require('../src/services/fee.service');
  const dashboardService = require('../src/services/dashboard.service');

  const dashData = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  assert(dashData && typeof dashData === 'object', 'Management dashboard returned data object');
  assert(dashData.finances && typeof dashData.finances === 'object', 'finances is an object in dashboard response');

  const finances = dashData.finances;
  assert(finances.todayCollected === 142500, `Today's collections match DB receipts (₹1,42,500): ${finances.todayCollected}`);
  assert(finances.todayCashAmount === 45000, `Today's cash receipts match DB (₹45,000): ${finances.todayCashAmount}`);
  assert(finances.todayUpiAmount === 97500, `Today's UPI receipts match DB (₹97,500): ${finances.todayUpiAmount}`);
  assert(finances.totalCollected === 208500, `Total collected matches DB (₹2,08,500): ${finances.totalCollected}`);
  assert(finances.totalOutstanding === 31000, `Total outstanding dues match DB (₹31,000): ${finances.totalOutstanding}`);
  assert(finances.collectionPercentage === 87.1, `Collection realization percentage matches DB (87.1%): ${finances.collectionPercentage}%`);
  assert(finances.pendingStudentsCount === 3, `Count of students with pending dues matches DB (3): ${finances.pendingStudentsCount}`);
  assert(finances.clearedStudentsCount === 6, `Count of cleared students matches DB (6): ${finances.clearedStudentsCount}`);
  assert(finances.remindersSentCount >= 3, `Fee reminder communication logs exist in DB (>= 3): ${finances.remindersSentCount}`);

  assert(Array.isArray(finances.highPriorityDefaulters), 'highPriorityDefaulters is an array');
  assert(finances.highPriorityDefaulters.length === 3, `highPriorityDefaulters has 3 genuine defaulters: ${finances.highPriorityDefaulters.length}`);

  const dbStudents = await Student.find({}).lean();
  const dbAdmNos = new Set(dbStudents.map(s => s.admissionNo));

  for (const defaulter of finances.highPriorityDefaulters) {
    assert(dbAdmNos.has(defaulter.admissionNo), `Defaulter ${defaulter.fullName} (${defaulter.admissionNo}) exists in genuine Student Management database`);
    assert(defaulter.pendingAmount > 0, `Defaulter ${defaulter.fullName} has genuine positive pending balance: ${defaulter.pendingAmount}`);
    assert(defaulter.parentPhone && defaulter.parentPhone.length > 5, `Defaulter ${defaulter.fullName} has valid verified parent phone: ${defaulter.parentPhone}`);
  }

  const saiTeja = finances.highPriorityDefaulters.find(d => d.admissionNo === 'SV-0003');
  assert(saiTeja !== undefined, 'K. Sai Teja (SV-0003) present in defaulters');
  if (saiTeja) {
    assert(saiTeja.pendingAmount === 12500, `K. Sai Teja pending amount is ₹12,500: ${saiTeja.pendingAmount}`);
    assert(saiTeja.overdueDays === 18, `K. Sai Teja overdue days is 18: ${saiTeja.overdueDays}`);
    assert(saiTeja.parentPhone.includes('9848112233'), `K. Sai Teja parent phone matches Student record: ${saiTeja.parentPhone}`);
  }

  const karthik = finances.highPriorityDefaulters.find(d => d.admissionNo === 'SV-0005');
  assert(karthik !== undefined, 'G. Karthik (SV-0005) present in defaulters');
  if (karthik) {
    assert(karthik.pendingAmount === 10000, `G. Karthik pending amount is ₹10,000: ${karthik.pendingAmount}`);
    assert(karthik.overdueDays === 14, `G. Karthik overdue days is 14: ${karthik.overdueDays}`);
  }

  const hemanth = finances.highPriorityDefaulters.find(d => d.admissionNo === 'SV-0007');
  assert(hemanth !== undefined, 'CH. Hemanth (SV-0007) present with legitimate outstanding liability');
  if (hemanth) {
    assert(hemanth.pendingAmount === 8500, `CH. Hemanth pending liability is ₹8,500: ${hemanth.pendingAmount}`);
    assert(hemanth.overdueDays === 22, `CH. Hemanth overdue days is 22: ${hemanth.overdueDays}`);
  }

  console.log('\n--- 4. Testing Dynamic Fee Payment Modification ---');
  const saiTejaFee = await Fee.findOne({ student: saiTeja.studentId });
  assert(saiTejaFee !== null, 'Found Sai Teja Fee record in DB');

  const origPaid = saiTejaFee.paidAmount;
  const origDue = saiTejaFee.dueAmount;

  saiTejaFee.paidAmount += 5000;
  saiTejaFee.dueAmount -= 5000;
  await saiTejaFee.save();

  const updatedOverview = await feeService.getFeeDashboardOverview();
  const updatedSaiTeja = updatedOverview.highPriorityDefaulters.find(d => d.admissionNo === 'SV-0003');
  assert(updatedSaiTeja && updatedSaiTeja.pendingAmount === 7500, `Dashboard immediately reflects updated pending amount (₹7,500): ${updatedSaiTeja?.pendingAmount}`);
  assert(updatedOverview.totalOutstanding === 26000, `Dashboard immediately reflects updated total outstanding dues (₹26,000): ${updatedOverview.totalOutstanding}`);

  saiTejaFee.paidAmount = origPaid;
  saiTejaFee.dueAmount = origDue;
  await saiTejaFee.save();
  console.log('✓ Restored original Fee balance in DB');

  console.log('\n--- 5. Testing Persistent SMS Fee Reminder Dispatch ---');
  const initialSmsCount = await SmsLog.countDocuments({ category: 'FEE_REMINDER' });
  const reminderResult = await feeService.sendFeeReminder(
    {
      admissionNo: 'SV-0003',
      studentName: 'K. Sai Teja',
      parentPhone: '9848112233',
      amountFormatted: '₹12,500',
    },
    { _id: new mongoose.Types.ObjectId() }
  );

  assert(reminderResult && reminderResult.logId, 'sendFeeReminder returned success with logId');
  const createdLog = await SmsLog.findById(reminderResult.logId);
  assert(createdLog !== null, 'Persistent SmsLog record created in MongoDB');
  assert(createdLog && createdLog.category === 'FEE_REMINDER', 'SmsLog category is FEE_REMINDER');
  assert(createdLog && createdLog.status === 'DELIVERED', 'SmsLog status is DELIVERED');
  assert(createdLog && createdLog.gateway === 'AP-EDUSMS (Airtel DLT)', 'SmsLog gateway is AP-EDUSMS (Airtel DLT)');

  await SmsLog.findByIdAndDelete(reminderResult.logId);
  console.log('✓ Cleaned up test SMS log');

  await mongoose.disconnect();

  console.log(`\n========================================`);
  console.log(`Final Test Results: ${passed} passed, ${failed} failed.`);
  if (failed === 0) {
    console.log('✓ ALL TESTS PASSED! Fee Collection & Outstanding Dues Overview verified successfully.');
  } else {
    console.error(`✗ ${failed} test(s) failed.`);
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
