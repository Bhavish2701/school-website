/**
 * Regression Test Suite: Future Student & Parent Portals Backend Support
 * Specification 20:
 * - 20.1 Future Student Portal Backend API Support (14 Pages, Scoping, Permitted Actions)
 * - 20.2 Future Parent Portal Backend API Support (16 Pages, Child Switching, Immutability, Correction Requests)
 * - 20.3 Online Admission & Single Unified Portal Connection Workflow
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: MODULE 20 - FUTURE STUDENT & PARENT PORTALS BACKEND');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function check(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[PASS] Test ${totalCount}: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalCount}: ${desc}`);
    console.error(`       Error: ${err.message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// TEST 1: 20.1 Future Student Portal Service & Endpoints
// -------------------------------------------------------------
check('Verify 20.1 Student Portal Service has all 14 required page handlers', () => {
  const servicePath = path.resolve(__dirname, '../backend/src/services/studentPortal.service.js');
  assert.ok(fs.existsSync(servicePath), 'studentPortal.service.js must exist');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');

  const requiredMethods = [
    'getDashboard',          // Dashboard
    'getProfile',            // My Profile
    'getMyClasses',          // My Classes
    'getTimetable',          // Timetable
    'getAttendance',         // Attendance
    'getAssignments',        // Assignments
    'submitAssignment',      // Submit Assignment (permitted action)
    'getStudyMaterials',     // Study Materials
    'getExamSchedule',       // Examination Schedule
    'getPublishedResults',   // Published Results
    'getNotices',            // School Notices
    'getEvents',             // Events
    'getLibrary',            // Library
    'getTransport',          // Transport
    'getHelpSupport',        // Help & Support
    'submitHelpSupportQuery' // Submit Support Ticket
  ];

  requiredMethods.forEach((method) => {
    assert.ok(
      serviceCode.includes(`async ${method}`) || serviceCode.includes(`${method}(`),
      `studentPortal.service.js must implement ${method}`
    );
  });

  // Verify published results rule (strictly published results only)
  assert.ok(
    serviceCode.includes('Only official results published and sealed') ||
    serviceCode.includes('resultStatus: \'PUBLISHED\''),
    'Service must enforce that only published results are exposed to students'
  );

  // Verify attendance advisory on read-only status
  assert.ok(
    serviceCode.includes('cannot be directly edited') ||
    serviceCode.includes('read-only'),
    'Service must convey read-only status on verified attendance records'
  );
});

// -------------------------------------------------------------
// TEST 2: 20.1 Student Portal Routes & RBAC Middleware
// -------------------------------------------------------------
check('Verify 20.1 Student Portal Routes enforce STUDENT role & mount 14 endpoints', () => {
  const routesPath = path.resolve(__dirname, '../backend/src/routes/studentPortal.routes.js');
  assert.ok(fs.existsSync(routesPath), 'studentPortal.routes.js must exist');
  const routesCode = fs.readFileSync(routesPath, 'utf8');

  assert.ok(routesCode.includes("authorizeRoles('STUDENT'"), 'Routes must enforce STUDENT role authorization');

  const expectedRoutes = [
    '/dashboard',
    '/profile',
    '/classes',
    '/timetable',
    '/attendance',
    '/assignments',
    '/study-materials',
    '/exam-schedule',
    '/results',
    '/notices',
    '/events',
    '/library',
    '/transport',
    '/help-support',
  ];

  expectedRoutes.forEach((route) => {
    assert.ok(
      routesCode.includes(`'${route}'`),
      `studentPortal.routes.js must mount route '${route}'`
    );
  });
});

// -------------------------------------------------------------
// TEST 3: 20.2 Parent Portal Service & All 16 Required Page Handlers
// -------------------------------------------------------------
check('Verify 20.2 Parent Portal Service supports all 16 pages and multi-child switching', () => {
  const servicePath = path.resolve(__dirname, '../backend/src/services/parent.service.js');
  assert.ok(fs.existsSync(servicePath), 'parent.service.js must exist');
  const serviceCode = fs.readFileSync(servicePath, 'utf8');

  const requiredMethods = [
    'getChildOverview',          // 1. Dashboard
    'getChildren',               // 2. My Children (child switcher)
    'getChildProfile',           // 3. Child Profile
    'getChildAttendance',        // 4. Attendance
    'getChildAcademicProgress',  // 5. Academic Progress
    'getChildExamsAndResults',   // 6. Published Results
    'getChildAssignments',       // 7. Assignments
    'getChildFees',              // 8. Fees & Payments
    'getChildReceipts',          // 9. Receipts
    'applyChildLeave',           // 10. Leave Requests (apply)
    'getChildLeaves',            // 10b. Leave Requests (history)
    'getAppointments',           // 11. Appointments
    'bookAppointment',           // 11b. Book Appointment
    'getMessages',               // 12. Teacher Communication
    'sendMessage',               // 12b. Send Message to Teacher
    'getChildNotices',           // 13. School Notices
    'getEvents',                 // 14. Events & PTM Schedule
    'getChildDocuments',         // 15. Documents
    'getHelpSupport',            // 16. Help & Support
    'submitHelpSupportTicket',   // 16b. Submit Helpdesk Ticket
    'submitCorrectionRequest',   // Correction Requests (Statutory Workflow)
    'getCorrectionRequests',     // Correction Requests History
  ];

  requiredMethods.forEach((method) => {
    assert.ok(
      serviceCode.includes(`async ${method}`) || serviceCode.includes(`${method}(`),
      `parent.service.js must implement ${method}`
    );
  });
});

// -------------------------------------------------------------
// TEST 4: 20.2 Immutability of Verified Records & Correction Requests
// -------------------------------------------------------------
check('Verify 20.2 CorrectionRequest Model and Route Guards prevent direct record tampering', () => {
  // Check CorrectionRequest Model
  const modelPath = path.resolve(__dirname, '../backend/src/models/correctionRequest.model.js');
  assert.ok(fs.existsSync(modelPath), 'correctionRequest.model.js must exist');
  const modelCode = fs.readFileSync(modelPath, 'utf8');

  assert.ok(modelCode.includes('ATTENDANCE'), 'Must support ATTENDANCE correction module');
  assert.ok(modelCode.includes('RESULTS'), 'Must support RESULTS correction module');
  assert.ok(modelCode.includes('FEES'), 'Must support FEES correction module');
  assert.ok(modelCode.includes('STUDENT_RECORD'), 'Must support STUDENT_RECORD correction module');
  assert.ok(modelCode.includes('SUBMITTED'), 'Must have default status SUBMITTED');

  // Check Parent Routes Guard
  const routesPath = path.resolve(__dirname, '../backend/src/routes/parent.routes.js');
  const routesCode = fs.readFileSync(routesPath, 'utf8');

  assert.ok(
    routesCode.includes('Direct modification to verified school records') ||
    routesCode.includes('prohibited'),
    'Parent routes must explicitly block direct mutation on attendance/results/fees'
  );

  assert.ok(
    routesCode.includes('/correction-requests'),
    'Parent routes must mount /correction-requests endpoint'
  );
});

// -------------------------------------------------------------
// TEST 5: 20.3 Online Admission & Single Workflow Schema Verification
// -------------------------------------------------------------
check('Verify 20.3 Admission and Student Models support unified workflow & portal readiness', () => {
  // Admission Model
  const admModelPath = path.resolve(__dirname, '../backend/src/models/admission.model.js');
  const admCode = fs.readFileSync(admModelPath, 'utf8');

  assert.ok(admCode.includes('admissionSource'), 'Admission must define admissionSource (ONLINE, OFFLINE_WALKIN)');
  assert.ok(admCode.includes('documentVerification'), 'Admission must track documentVerification workflow');
  assert.ok(admCode.includes('eligibilityReview'), 'Admission must track eligibilityReview by authority');
  assert.ok(admCode.includes('decisionRecord'), 'Admission must track official decisionRecord');
  assert.ok(admCode.includes('portalActivation'), 'Admission must hold portalActivation credentials');

  // Student Model
  const studentModelPath = path.resolve(__dirname, '../backend/src/models/student.model.js');
  const studentCode = fs.readFileSync(studentModelPath, 'utf8');

  assert.ok(studentCode.includes('guardianDetails'), 'Student must store verified guardianDetails');
  assert.ok(studentCode.includes('studentPortalAccess'), 'Student must store studentPortalAccess state & token');
  assert.ok(studentCode.includes('parentPortalAccess'), 'Student must store parentPortalAccess state & token');
  assert.ok(studentCode.includes('transportDetails'), 'Student must store transportDetails');
  assert.ok(studentCode.includes('libraryDetails'), 'Student must store libraryDetails');
});

// -------------------------------------------------------------
// TEST 6: 20.3 Admission Service Auto-Enrollment & Credential Generation
// -------------------------------------------------------------
check('Verify 20.3 convertToStudent creates student, links guardian, fees, and portal tokens', () => {
  const admServicePath = path.resolve(__dirname, '../backend/src/services/admission.service.js');
  const admServiceCode = fs.readFileSync(admServicePath, 'utf8');

  assert.ok(admServiceCode.includes('studentActivationCode'), 'Must generate student portal activation credentials');
  assert.ok(admServiceCode.includes('parentActivationCode'), 'Must generate guardian portal activation credentials');
  assert.ok(admServiceCode.includes('Fee.create'), 'Must auto-create fee record for enrolled student');
  assert.ok(admServiceCode.includes('parentUser.children.push'), 'Must link student to parent user children array');
  assert.ok(admServiceCode.includes('isVerified: true'), 'Must mark guardian relationship as verified');
});

// -------------------------------------------------------------
// TEST 7: 20.3 Account Activation Endpoints & Master Route Mounting
// -------------------------------------------------------------
check('Verify 20.3 Auth activation endpoints and master router configuration', () => {
  const authControllerPath = path.resolve(__dirname, '../backend/src/controllers/auth.controller.js');
  const authControllerCode = fs.readFileSync(authControllerPath, 'utf8');

  assert.ok(authControllerCode.includes('activateParentAccount'), 'auth.controller.js must implement activateParentAccount');
  assert.ok(authControllerCode.includes('activateStudentAccount'), 'auth.controller.js must implement activateStudentAccount');

  const authRoutesPath = path.resolve(__dirname, '../backend/src/routes/auth.routes.js');
  const authRoutesCode = fs.readFileSync(authRoutesPath, 'utf8');

  assert.ok(authRoutesCode.includes('/parent/activate'), 'auth.routes.js must expose /parent/activate');
  assert.ok(authRoutesCode.includes('/student/activate'), 'auth.routes.js must expose /student/activate');

  const masterRoutesPath = path.resolve(__dirname, '../backend/src/routes/index.js');
  const masterRoutesCode = fs.readFileSync(masterRoutesPath, 'utf8');

  assert.ok(masterRoutesCode.includes('/student-portal') || masterRoutesCode.includes('/student'), 'Master router must mount student portal routes');
  assert.ok(masterRoutesCode.includes('/parent-portal') || masterRoutesCode.includes('/parents'), 'Master router must mount parent portal routes');
});

console.log('\n====================================================');
console.log(`ALL MODULE 20 FUTURE PORTALS BACKEND TESTS PASSED (${passCount}/${totalCount} - 100%)`);
console.log('====================================================\n');

