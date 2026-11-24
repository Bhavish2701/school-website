/**
 * Verification Suite: Today's Timetable & Upcoming Examinations
 * Verifies end-to-end synchronization between Timetable Management, Examination Management,
 * MongoDB collections, and Principal Dashboard UI.
 */
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

  assert(html.includes('id="dashSectionTimetableExams"'), 'Section 1 container exists');
  assert(html.includes('id="activePeriodPill"'), 'activePeriodPill element exists');
  assert(html.includes('id="btnRefreshTimetableExams"'), 'Manual refresh button exists');
  assert(html.includes('id="dashTimetableRefreshIcon"'), 'Refresh spin icon exists');
  assert(html.includes('id="dashPeriodsRail"'), 'dashPeriodsRail container exists');
  assert(html.includes('id="dashSubstAlert"'), 'dashSubstAlert container exists');
  assert(html.includes('id="dashSubstAlertContent"'), 'dashSubstAlertContent container exists');
  assert(html.includes('id="dashUpcomingExamsCount"'), 'dashUpcomingExamsCount element exists');
  assert(html.includes('id="dashUpcomingExamsTableBody"'), 'dashUpcomingExamsTableBody exists');

  // Verify that hardcoded past exam rows inside dashUpcomingExamsTableBody were removed
  const tableBodyMatch = html.match(/<tbody id="dashUpcomingExamsTableBody">([\s\S]*?)<\/tbody>/);
  assert(tableBodyMatch !== null, 'Found dashUpcomingExamsTableBody');
  if (tableBodyMatch) {
    const tbodyContent = tableBodyMatch[1];
    assert(!tbodyContent.includes('Quarterly Summative Assessment (SA-1)'), 'Hardcoded past SA-1 removed from table body');
    assert(!tbodyContent.includes('Sept 24 – Sept 30, 2026'), 'Hardcoded past SA-1 dates removed from table body');
    assert(!tbodyContent.includes('Science Olympiad &amp; National Talent Search'), 'Hardcoded past Science Olympiad removed from table body');
    assert(!tbodyContent.includes('Oct 15 – Oct 17, 2026'), 'Hardcoded past Olympiad dates removed from table body');
  }

  console.log('\n--- 2. Verifying Frontend Portal Logic ---');
  const jsPath = path.join(__dirname, '../../frontend/js/portal.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  assert(js.includes('function renderDashboardUpcomingExamsLive'), 'renderDashboardUpcomingExamsLive function exists');
  assert(js.includes('function renderDashboardSubstitutionsLive'), 'renderDashboardSubstitutionsLive function exists');
  assert(js.includes('function refreshDashboardTimetableAndExams'), 'refreshDashboardTimetableAndExams function exists');
  assert(js.includes('dashboardActiveTimetablePeriods'), 'dashboardActiveTimetablePeriods state variable exists');
  assert(js.includes('dashboardActiveSubstitution'), 'dashboardActiveSubstitution state variable exists');
  assert(js.includes('dashboardUpcomingExams'), 'dashboardUpcomingExams state variable exists');
  assert(js.includes('renderDashboardUpcomingExamsLive(dashboardUpcomingExams)'), 'Live upcoming exams hooked in live metrics');
  assert(js.includes('renderDashboardSubstitutionsLive(dashboardActiveSubstitution)'), 'Live substitutions hooked in live metrics');
  assert(js.includes('refreshDashboardTimetableAndExams: refreshDashboardTimetableAndExams'), 'Exported refreshDashboardTimetableAndExams on portalApp');

  console.log('\n--- 3. Running Live DB Integration & Real-Time Sync Tests ---');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const Timetable = require('../src/models/timetable.model');
  const Substitution = require('../src/models/substitution.model');
  const { Exam } = require('../src/models/exam.model');
  const dashboardService = require('../src/services/dashboard.service');

  // Test 3a: Get Management Dashboard
  const dashData = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  assert(dashData && typeof dashData === 'object', 'Management dashboard returned data object');
  assert(dashData.timetable && Array.isArray(dashData.timetable.periods), 'timetable.periods is an array');
  assert(dashData.timetable.totalPeriods >= 8, `timetable.totalPeriods is ${dashData.timetable.totalPeriods} (expected >= 8)`);
  assert(dashData.timetable.activeSubstitution !== undefined, 'timetable.activeSubstitution object exists');
  assert(Array.isArray(dashData.upcomingExams), 'upcomingExams is an array');

  // Test 3b: Verify past exams are strictly excluded
  const hasPastSA1 = dashData.upcomingExams.some(e => e.name.includes('SA-1') || e.name.includes('Quarterly'));
  assert(!hasPastSA1, 'Past SA-1 (completed in Sept) automatically excluded from upcoming examinations');

  const hasPastOlympiad = dashData.upcomingExams.some(e => e.name.includes('Olympiad'));
  assert(!hasPastOlympiad, 'Past Science Olympiad (completed in Oct) automatically excluded from upcoming examinations');

  // Test 3c: Verify upcoming exams presence
  const hasHalfYearly = dashData.upcomingExams.some(e => e.name.includes('Half-Yearly'));
  assert(hasHalfYearly, 'Upcoming Half-Yearly examination correctly included in dashboard');

  const hasPreFinal = dashData.upcomingExams.some(e => e.name.includes('Pre-Final Exam 1'));
  assert(hasPreFinal, 'Upcoming Class X Pre-Final Exam 1 correctly included in dashboard');

  // Test 3d: Verify chronological sorting
  let isSorted = true;
  for (let i = 0; i < dashData.upcomingExams.length - 1; i++) {
    if (new Date(dashData.upcomingExams[i].startDate) > new Date(dashData.upcomingExams[i + 1].startDate)) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, 'Upcoming examinations are chronologically sorted by scheduled date');

  // Test 4: Dynamic Timetable Modification Test
  console.log('\n--- 4. Testing Dynamic Timetable Period Modification ---');
  const period1 = await Timetable.findOne({ className: 'Class X-A', day: 'Monday', periodNumber: 1 });
  assert(period1 !== null, 'Found Monday Period 1 in DB');

  const originalTiming = period1.startTime;
  const originalEndTiming = period1.endTime;

  // Change period timing in DB (simulating Timetable Management change)
  period1.startTime = '08:45 AM';
  period1.endTime = '09:30 AM';
  period1.startMinutes = 525;
  period1.endMinutes = 570;
  await period1.save();

  // Query dashboard again
  const updatedDash1 = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const updatedPeriod1 = updatedDash1.timetable.periods.find(p => p.periodNumber === 1);
  assert(updatedPeriod1 && updatedPeriod1.startTime === '08:45 AM', `Dashboard immediately reflects updated period start timing: ${updatedPeriod1?.startTime}`);
  assert(updatedPeriod1 && updatedPeriod1.endTime === '09:30 AM', `Dashboard immediately reflects updated period end timing: ${updatedPeriod1?.endTime}`);

  // Revert period 1 timing
  period1.startTime = originalTiming;
  period1.endTime = originalEndTiming;
  period1.startMinutes = 540;
  period1.endMinutes = 585;
  await period1.save();
  console.log('✓ Restored original period timing in DB');

  // Test 5: Dynamic Examination Date Modification Test
  console.log('\n--- 5. Testing Dynamic Examination Date Modification ---');
  const halfYearlyExam = await Exam.findOne({ name: 'Half-Yearly Examinations & Practicals' });
  assert(halfYearlyExam !== null, 'Found Half-Yearly examination in DB');

  const originalStartDate = halfYearlyExam.startDate;

  // Reschedule to Nov 12
  halfYearlyExam.startDate = new Date('2026-11-12T00:00:00.000Z');
  await halfYearlyExam.save();

  // Query dashboard again
  const updatedDash2 = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const updatedHY = updatedDash2.upcomingExams.find(e => e.name === 'Half-Yearly Examinations & Practicals');
  assert(updatedHY && updatedHY.datesFormatted.includes('Nov 12'), `Dashboard immediately reflects updated examination date: ${updatedHY?.datesFormatted}`);

  // Revert exam date
  halfYearlyExam.startDate = originalStartDate;
  await halfYearlyExam.save();
  console.log('✓ Restored original examination date in DB');

  // Test 6: Verify Completed Exam Disappears
  console.log('\n--- 6. Testing Real-Time Completed Exam Exclusion ---');
  halfYearlyExam.status = 'COMPLETED';
  await halfYearlyExam.save();

  const updatedDash3 = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  const hyIncludedAfterComplete = updatedDash3.upcomingExams.some(e => e.name === 'Half-Yearly Examinations & Practicals');
  assert(!hyIncludedAfterComplete, 'Completed examination immediately excluded from dashboard upcoming list');

  // Revert status to UPCOMING
  halfYearlyExam.status = 'UPCOMING';
  await halfYearlyExam.save();
  console.log('✓ Restored examination status to UPCOMING');

  // Test 7: Verify Active Substitution Linking
  console.log('\n--- 7. Testing Active Teacher Substitution Linking ---');
  const activeSub = await Substitution.findOne({ substitutionId: 'SUB-2026-002' });
  assert(activeSub !== null, 'Found active substitution SUB-2026-002 in DB');
  assert(dashData.timetable.activeSubstitution !== null, 'Dashboard timetable includes active substitution data');
  assert(dashData.timetable.activeSubstitution.substituteTeacher === 'Smt. M. Lakshmi', `Substitute teacher matches DB: ${dashData.timetable.activeSubstitution.substituteTeacher}`);
  assert(dashData.timetable.activeSubstitution.absentTeacher === 'Sri K. Rajesh', `Absent teacher matches DB: ${dashData.timetable.activeSubstitution.absentTeacher}`);

  await mongoose.disconnect();

  console.log(`\n========================================`);
  console.log(`Final Test Results: ${passed} passed, ${failed} failed.`);
  if (failed === 0) {
    console.log('✓ ALL TESTS PASSED! Timetable & Upcoming Exams sync verified successfully.');
  } else {
    console.error(`✗ ${failed} test(s) failed.`);
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
