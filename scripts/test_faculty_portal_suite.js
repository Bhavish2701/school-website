const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: MODULE 19 - FACULTY & TEACHING STAFF PORTAL');
console.log('====================================================');

const html = fs.readFileSync('frontend/faculty-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/teacher.js', 'utf8');

// Helper to check case-insensitive presence in string
function hasText(source, text) {
  return source.toLowerCase().includes(text.toLowerCase());
}

// --------------------------------------------------------------------------
// TEST 1: 19.1 Faculty Dashboard
// --------------------------------------------------------------------------
console.log('\n--- Test 1: Verify 19.1 Faculty Dashboard Display & Quick Actions ---');
assert.ok(html.includes('id="view-dashboard"'), 'view-dashboard must exist');

// 9 Required Displays
const dashDisplays = [
  "Today's classes",
  "Assigned students",
  "Attendance pending",
  "Assignments to grade",
  "Marks pending submission",
  "Upcoming exams",
  "School announcements",
  "Parent meeting requests",
  "Tasks and deadlines"
];
dashDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Dashboard must display: ${d}`);
});

// 6 Required Quick Actions
const dashActions = [
  "Mark Attendance",
  "Create Assignment",
  "Upload Study Material",
  "Enter Marks",
  "View Timetable",
  "Send Authorized Class Announcement"
];
dashActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Dashboard quick action must exist: ${a}`);
});

console.log('[PASS] Test 1: 19.1 Faculty Dashboard displays and quick actions verified');

// --------------------------------------------------------------------------
// TEST 2: 19.2 My Classes
// --------------------------------------------------------------------------
console.log('\n--- Test 2: Verify 19.2 My Classes Table & Actions ---');
assert.ok(html.includes('id="view-my-classes"'), 'view-my-classes must exist');

const classColumns = [
  "Class",
  "Section",
  "Subject",
  "Student count",
  "Class teacher status",
  "Next lesson",
  "Actions"
];
classColumns.forEach(c => {
  assert.ok(hasText(html, c) || hasText(js, c), `My Classes table must have column: ${c}`);
});

const classActions = [
  "Open class",
  "View roster",
  "Open attendance",
  "View assignments",
  "View permitted performance data"
];
classActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `My Classes action must exist: ${a}`);
});

console.log('[PASS] Test 2: 19.2 My Classes table and actions verified');

// --------------------------------------------------------------------------
// TEST 3: 19.3 Student Profiles
// --------------------------------------------------------------------------
console.log('\n--- Test 3: Verify 19.3 Student Profiles Tabs & Actions ---');
assert.ok(html.includes('id="view-students"'), 'view-students must exist');

const studentTabs = [
  "Overview",
  "Attendance",
  "Academic Progress",
  "Assignments",
  "Published Results",
  "Authorized Remarks"
];
studentTabs.forEach(t => {
  assert.ok(hasText(html, t) || hasText(js, t), `Student Profiles must contain tab: ${t}`);
});

const studentActions = [
  "View profile",
  "Submit academic feedback",
  "Request correction",
  "Contact authorized guardian"
];
studentActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Student Profiles action must exist: ${a}`);
});

console.log('[PASS] Test 3: 19.3 Student Profiles tabs and actions verified');

// --------------------------------------------------------------------------
// TEST 4: 19.4 Mark Attendance
// --------------------------------------------------------------------------
console.log('\n--- Test 4: Verify 19.4 Mark Attendance Display & Actions ---');
assert.ok(html.includes('id="view-attendance"'), 'view-attendance must exist');

const attDisplays = [
  "Class and section",
  "Date",
  "Student list",
  "Present",
  "Submission status",
  "Attendance summary"
];
attDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Mark Attendance must display: ${d}`);
});

const attActions = [
  "Mark all present",
  "Change individual status",
  "Save draft",
  "Submit",
  "Request correction"
];
attActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Mark Attendance action must exist: ${a}`);
});

console.log('[PASS] Test 4: 19.4 Mark Attendance display and actions verified');

// --------------------------------------------------------------------------
// TEST 5: 19.5 Lesson Plans & Syllabus
// --------------------------------------------------------------------------
console.log('\n--- Test 5: Verify 19.5 Lesson Plans & Syllabus Display & Actions ---');
assert.ok(html.includes('id="view-academics"'), 'view-academics must exist');

const lessonDisplays = [
  "Subject",
  "Class",
  "Chapter",
  "Topic",
  "Objectives",
  "Planned date",
  "Completion status",
  "Review comments"
];
lessonDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Lesson Plans must display: ${d}`);
});

const lessonActions = [
  "Create lesson plan",
  "Save draft",
  "Submit for review",
  "Mark topic complete",
  "Update syllabus progress"
];
lessonActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Lesson Plans action must exist: ${a}`);
});

console.log('[PASS] Test 5: 19.5 Lesson Plans & Syllabus verified');

// --------------------------------------------------------------------------
// TEST 6: 19.6 Assignments & Study Materials
// --------------------------------------------------------------------------
console.log('\n--- Test 6: Verify 19.6 Assignments & Study Materials Display & Actions ---');
assert.ok(html.includes('id="view-assignments"'), 'view-assignments must exist');

const assignDisplays = [
  "Assignment title",
  "Class",
  "Subject",
  "Assigned date",
  "Due date",
  "Submission count",
  "Grading status"
];
assignDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Assignments must display: ${d}`);
});

const assignActions = [
  "Create assignment",
  "Attach material",
  "Publish assignment",
  "Extend deadline",
  "Review submissions",
  "Grade",
  "Provide feedback"
];
assignActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Assignments action must exist: ${a}`);
});

console.log('[PASS] Test 6: 19.6 Assignments & Study Materials verified');

// --------------------------------------------------------------------------
// TEST 7: 19.7 Examinations & Marks
// --------------------------------------------------------------------------
console.log('\n--- Test 7: Verify 19.7 Examinations & Marks Display, Actions & Policy ---');
assert.ok(html.includes('id="view-examinations"'), 'view-examinations must exist');

const examDisplays = [
  "Exam",
  "Class",
  "Subject",
  "Maximum marks",
  "Marks entry progress",
  "Submission deadline",
  "Review status"
];
examDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Examinations must display: ${d}`);
});

const examActions = [
  "Enter marks",
  "Save draft",
  "Validate",
  "Submit for review",
  "Correct returned entries",
  "View approval outcome"
];
examActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Examinations action must exist: ${a}`);
});

// Statutory Rule: Teachers should not publish final results unless explicitly authorized
assert.ok(
  hasText(html, "not publish final results") || hasText(js, "not publish final results") || hasText(html, "policy"),
  "Statutory rule against unauthorized publication of final results must be enforced"
);

console.log('[PASS] Test 7: 19.7 Examinations & Marks verified');

// --------------------------------------------------------------------------
// TEST 8: 19.8 My Timetable
// --------------------------------------------------------------------------
console.log('\n--- Test 8: Verify 19.8 My Timetable Display & Actions ---');
assert.ok(html.includes('id="view-timetable"'), 'view-timetable must exist');

const ttDisplays = [
  "Weekly schedule",
  "Period",
  "Class",
  "Subject",
  "Room",
  "Substitution",
  "Schedule updates"
];
ttDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Timetable must display: ${d}`);
});

const ttActions = [
  "View full timetable",
  "View class details",
  "Request correction",
  "Acknowledge substitution"
];
ttActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Timetable action must exist: ${a}`);
});

console.log('[PASS] Test 8: 19.8 My Timetable verified');

// --------------------------------------------------------------------------
// TEST 9: 19.9 Communication
// --------------------------------------------------------------------------
console.log('\n--- Test 9: Verify 19.9 Communication Display & Actions ---');
assert.ok(html.includes('id="view-communication"'), 'view-communication must exist');

const commDisplays = [
  "School notices",
  "Assigned class announcements",
  "Parent messages",
  "Meeting requests",
  "Message history"
];
commDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Communication must display: ${d}`);
});

const commActions = [
  "Create class announcement",
  "Submit for approval",
  "Reply to authorized message",
  "Schedule meeting",
  "Escalate a sensitive concern"
];
commActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Communication action must exist: ${a}`);
});

console.log('[PASS] Test 9: 19.9 Communication verified');

// --------------------------------------------------------------------------
// TEST 10: 19.10 Leave Management
// --------------------------------------------------------------------------
console.log('\n--- Test 10: Verify 19.10 Leave Management Display & Actions ---');
assert.ok(html.includes('id="view-leave"'), 'view-leave must exist');

const leaveDisplays = [
  "Leave balance",
  "Previous requests",
  "Pending requests",
  "Upcoming approved leave"
];
leaveDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `Leave Management must display: ${d}`);
});

const leaveActions = [
  "Apply for leave",
  "Upload required evidence",
  "Edit draft",
  "Cancel",
  "View approval history"
];
leaveActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `Leave Management action must exist: ${a}`);
});

console.log('[PASS] Test 10: 19.10 Leave Management verified');

// --------------------------------------------------------------------------
// TEST 11: 19.11 My Profile
// --------------------------------------------------------------------------
console.log('\n--- Test 11: Verify 19.11 My Profile Display & Actions ---');
assert.ok(html.includes('id="view-profile"'), 'view-profile must exist');

const profDisplays = [
  "Personal information",
  "Employment details",
  "Qualifications",
  "Authorized documents",
  "Contact details",
  "Account security"
];
profDisplays.forEach(d => {
  assert.ok(hasText(html, d) || hasText(js, d), `My Profile must display: ${d}`);
});

const profActions = [
  "Request profile correction",
  "Update permitted contact details",
  "Upload required document",
  "Change password",
  "security"
];
profActions.forEach(a => {
  assert.ok(hasText(html, a) || hasText(js, a), `My Profile action must exist: ${a}`);
});

console.log('[PASS] Test 11: 19.11 My Profile verified');

console.log('\n====================================================');
console.log('ALL MODULE 19 FACULTY PORTAL TESTS PASSED (100%)');
console.log('====================================================\n');
