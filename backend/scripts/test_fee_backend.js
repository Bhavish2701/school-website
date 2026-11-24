const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srividya_school_db';

async function testFeeBackend() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const feeService = require('../src/services/fee.service');
  const dashboardService = require('../src/services/dashboard.service');

  console.log('\n--- Testing feeService.getFeeDashboardOverview() ---');
  const overview = await feeService.getFeeDashboardOverview();
  console.log('Today Collected:', overview.todayCollected);
  console.log('Today Receipts Count:', overview.todayReceiptsCount);
  console.log('Today Cash:', overview.todayCashAmount, 'UPI:', overview.todayUpiAmount);
  console.log('Term Target:', overview.termTarget);
  console.log('Total Collected:', overview.totalCollected);
  console.log('Collection Percentage:', overview.collectionPercentage);
  console.log('Total Outstanding:', overview.totalOutstanding);
  console.log('Pending Students Count:', overview.pendingStudentsCount);
  console.log('Overdue 15 Days Count:', overview.overdue15DaysCount);
  console.log('Cleared Students Count:', overview.clearedStudentsCount);
  console.log('Reminders Sent Count:', overview.remindersSentCount);
  console.log('\nHigh Priority Defaulters:');
  overview.highPriorityDefaulters.forEach(d => {
    console.log(`- ${d.fullName} (${d.admissionNo}) | Class: ${d.className} | Parent: ${d.parentName} (${d.parentPhone}) | Due: ${d.pendingAmountFormatted} | Overdue: ${d.overdueDaysLabel} | Prev: ${d.previousReminder}`);
  });

  console.log('\n--- Testing dashboardService.getManagementDashboard() ---');
  const dash = await dashboardService.getManagementDashboard({ role: 'PRINCIPAL' });
  console.log('Dashboard finances object exists:', !!dash.finances);
  console.log('Dashboard finances todayCollected:', dash.finances.todayCollected);
  console.log('Dashboard defaulters count:', dash.finances.highPriorityDefaulters.length);

  await mongoose.disconnect();
}

testFeeBackend().catch(err => {
  console.error(err);
  process.exit(1);
});
