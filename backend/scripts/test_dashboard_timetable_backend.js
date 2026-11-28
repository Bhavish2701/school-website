const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db';

async function testBackend() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const dashboardService = require('../src/services/dashboard.service');
  const timetableService = require('../src/services/timetable.service');
  const examService = require('../src/services/exam.service');

  const dashData = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });

  console.log('Timetable Data:');
  console.log('  Date:', dashData.timetable?.date, 'Day:', dashData.timetable?.dayName);
  console.log('  Total Periods:', dashData.timetable?.totalPeriods);
  console.log('  Active Substitution:', dashData.timetable?.activeSubstitution?.substitutionId);
  console.log('  Sample Period:', dashData.timetable?.periods?.[0]);

  console.log('Upcoming Exams Data:');
  console.log('  Total Upcoming Exams:', dashData.upcomingExams?.length);
  dashData.upcomingExams?.forEach((ex, idx) => {
    console.log(`  [${idx + 1}] ${ex.name} - Classes: ${ex.classes} - Dates: ${ex.datesFormatted} - Status: ${ex.status} - Hall Tickets: ${ex.hallTicketStatus}`);
  });

  const hasPastSA1 = dashData.upcomingExams?.some(e => e.name.includes('SA-1') || e.name.includes('Quarterly'));
  console.log('  Past SA-1 excluded:', !hasPastSA1 ? 'PASS' : 'FAIL');

  const hasPastOlympiad = dashData.upcomingExams?.some(e => e.name.includes('Olympiad'));
  console.log('  Past Olympiad excluded:', !hasPastOlympiad ? 'PASS' : 'FAIL');

  let isSorted = true;
  for (let i = 0; i < dashData.upcomingExams.length - 1; i++) {
    if (new Date(dashData.upcomingExams[i].startDate) > new Date(dashData.upcomingExams[i + 1].startDate)) {
      isSorted = false;
      break;
    }
  }
  console.log('  Upcoming exams chronologically sorted:', isSorted ? 'PASS' : 'FAIL');

  await mongoose.disconnect();
}

testBackend().catch(err => {
  console.error(err);
  process.exit(1);
});
