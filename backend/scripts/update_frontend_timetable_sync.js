const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/js/portal.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldExportTarget = `    renderDashboardAbsentees,
    refreshDashboardAbsentees,`;

const newExportCode = `    renderDashboardAbsentees,
    refreshDashboardAbsentees,
    renderDashboardUpcomingExamsLive,
    renderDashboardSubstitutionsLive,
    refreshDashboardTimetableAndExams,`;

if (content.includes(oldExportTarget)) {
  content = content.replace(oldExportTarget, newExportCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully exported refreshDashboardTimetableAndExams on portalApp.');
} else {
  console.error('Target oldExportTarget not found in portal.js!');
  process.exit(1);
}
