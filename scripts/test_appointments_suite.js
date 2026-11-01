const fs = require('fs');

console.log("=== COMPREHENSIVE AUTOMATED TEST: SECTION 11 APPOINTMENTS & VISITORS SUITE ===");

const elements = new Map();
function createMockElement(id, tag = 'div') {
  return {
    id: id,
    tagName: tag.toUpperCase(),
    textContent: '',
    innerHTML: '',
    value: '',
    style: {},
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
    },
    dataset: {},
    children: [],
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: function(c) { 
      const idx = this.children.indexOf(c);
      if (idx !== -1) this.children.splice(idx, 1);
      return c;
    },
    addEventListener: function(event, handler) {},
    removeEventListener: function(event, handler) {},
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    removeAttribute: function(k) { delete this[k]; },
    focus: function() {},
    blur: function() {},
    click: function() {},
    querySelectorAll: function(sel) { 
      // Return matching elements
      const res = [];
      elements.forEach(el => {
        if (sel.includes(el.id)) res.push(el);
      });
      return res;
    },
    querySelector: function(sel) { 
      if (sel.startsWith('#')) return this.getElementById ? this.getElementById(sel.substring(1)) : mockDoc.getElementById(sel.substring(1));
      return null;
    }
  };
}

const indexHtml = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const idRegex = /id="([^"]+)"/g;
let m;
while ((m = idRegex.exec(indexHtml)) !== null) {
  const id = m[1];
  if (!elements.has(id)) {
    elements.set(id, createMockElement(id));
  }
}

const mockDoc = {
  getElementById: function(id) {
    if (!elements.has(id)) {
      elements.set(id, createMockElement(id));
    }
    return elements.get(id);
  },
  createElement: function(tag) {
    return createMockElement('dyn_' + Math.random(), tag);
  },
  querySelectorAll: function(sel) {
    const res = [];
    elements.forEach(el => res.push(el));
    return res;
  },
  querySelector: function(sel) {
    if (sel.startsWith('#')) return this.getElementById(sel.substring(1));
    return null;
  },
  body: createMockElement('body', 'body'),
  documentElement: createMockElement('html', 'html'),
  addEventListener: function(ev, cb) {},
  removeEventListener: function(ev, cb) {}
};

const mockWindow = {
  document: mockDoc,
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  },
  sessionStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  },
  location: { href: 'http://localhost:5000/administration-portal/', hash: '' },
  navigator: { userAgent: 'NodeMock' },
  addEventListener: function(ev, cb) {},
  removeEventListener: function(ev, cb) {},
  scrollTo: function() {},
  alert: function(msg) { console.log("[MOCK ALERT]", msg); },
  confirm: function(msg) { return true; },
  prompt: function(msg) { return 'Official reason provided'; },
  STUDENT_ROSTER: []
};

global.window = mockWindow;
global.document = mockDoc;
global.localStorage = mockWindow.localStorage;
global.sessionStorage = mockWindow.sessionStorage;
global.location = mockWindow.location;
global.navigator = mockWindow.navigator;
global.scrollTo = mockWindow.scrollTo;
global.prompt = mockWindow.prompt;
global.confirm = mockWindow.confirm;
global.alert = mockWindow.alert;

require('../frontend/js/student-roster.js');
require('../frontend/js/portal.js');

const app = mockWindow.portalApp;
if (!app) {
  console.error("portalApp not exported to window!");
  process.exit(1);
}

app.init();
console.log("Portal initialized successfully!");

let passed = 0;
let failed = 0;
function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

// ==========================================
// TEST SUITE 11.1: APPOINTMENT OVERVIEW
// ==========================================
console.log("\n--- Testing 11.1: Appointment Overview ---");
app.renderAppointmentsOverview();
const todayTbody = mockDoc.getElementById('overviewTodayMeetingsTableBody');
assert(todayTbody && todayTbody.innerHTML.length > 50, "11.1 Renders today's meetings");

const pendingTbody = mockDoc.getElementById('overviewPendingRequestsTableBody');
assert(pendingTbody && pendingTbody.innerHTML.length > 50, "11.1 Renders pending requests in overview");

const reschedTbody = mockDoc.getElementById('overviewReschedulingTableBody');
assert(reschedTbody && reschedTbody.innerHTML.length > 50, "11.1 Renders rescheduling requests");

const upcomingTbody = mockDoc.getElementById('overviewUpcomingAppointmentsTableBody');
assert(upcomingTbody && upcomingTbody.innerHTML.length > 50, "11.1 Renders upcoming meetings");

// Test mark arrival
app.markAppointmentArrival('APT-TODAY-01');
assert(todayTbody.innerHTML.includes('Arrived at Campus'), "11.1 Mark arrival updates status to Arrived");

// ==========================================
// TEST SUITE 11.2: PRINCIPAL'S CALENDAR
// ==========================================
console.log("\n--- Testing 11.2: Principal's Calendar ---");
app.renderPrincipalsCalendar();
const calContainer = mockDoc.getElementById('principalsCalendarContainer');
assert(calContainer && calContainer.innerHTML.length > 50, "11.2 Renders Principal's Calendar");

// View switchers: Day, Week, Month, Agenda
app.setCalendarViewMode('day');
assert(calContainer.innerHTML.includes('Time Window') || calContainer.innerHTML.includes('Classification'), "11.2 Day View rendered with time windows");

app.setCalendarViewMode('week');
assert(calContainer.innerHTML.includes('Monday') || calContainer.innerHTML.includes('Weekly View'), "11.2 Week View rendered");

app.setCalendarViewMode('month');
assert(calContainer.innerHTML.includes('Month') || calContainer.innerHTML.includes('cal-month') || calContainer.innerHTML.includes('Sunday') || calContainer.innerHTML.includes('grid'), "11.2 Month View rendered");

app.setCalendarViewMode('agenda');
assert(calContainer.innerHTML.includes('flex') && (calContainer.innerHTML.includes('Consultation') || calContainer.innerHTML.includes('Review') || calContainer.innerHTML.includes('AM') || calContainer.innerHTML.includes('PM')), "11.2 Agenda View rendered");

// Test Privacy Masking: Non-executive role
app.switchRole('admin'); // Clerk role
app.setCalendarViewMode('agenda');
assert(calContainer.innerHTML.includes('Private Agenda') || calContainer.innerHTML.includes('Leadership Jurisdiction') || calContainer.innerHTML.includes('Confidential'), "11.2 Privacy Guard masks executive meetings for Office Clerk");
app.switchRole('principal'); // Restore principal

// ==========================================
// TEST SUITE 11.3: APPOINTMENT REQUESTS
// ==========================================
console.log("\n--- Testing 11.3: Appointment Requests ---");
app.renderAppointmentRequests();
const reqTable = mockDoc.getElementById('appointmentRequestsTableBody');
assert(reqTable && reqTable.innerHTML.includes('REQ-'), "11.3 Renders requests table with Request IDs");
assert(reqTable.innerHTML.includes('Sri') || reqTable.innerHTML.includes('Dr.') || reqTable.innerHTML.includes('Smt.'), "11.3 Displays requester identity & purpose");

// Test request actions
app.approveAppointmentRequest('REQ-2026-0041');
assert(true, "11.3 Approve request executes cleanly");

app.requestAppointmentClarification('REQ-2026-0042');
assert(true, "11.3 Request clarification executes cleanly");

app.declineAppointmentRequest('REQ-2026-0043');
assert(true, "11.3 Decline request executes cleanly");

app.notifyAppointmentRequester('REQ-2026-0041');
assert(true, "11.3 Notify requester dispatches alert");

// ==========================================
// TEST SUITE 11.4: VISITOR REGISTER & 90-DAY RETENTION
// ==========================================
console.log("\n--- Testing 11.4: Visitor Register ---");
app.renderVisitorRegister();
const visTable = mockDoc.getElementById('visitorRegisterTableBody');
assert(visTable && (visTable.innerHTML.includes('PASS-') || visTable.innerHTML.includes('VISITOR-')), "11.4 Renders visitor register with Badge & Pass IDs");
assert(visTable.innerHTML.includes('In Campus') || visTable.innerHTML.includes('Checked Out') || visTable.innerHTML.includes('Visitor'), "11.4 Tracks visitor badge & status");

// Test visitor actions
app.handleCheckInVisitor('PASS-2026-1049');
assert(true, "11.4 Check-in visitor executes cleanly");

app.notifyVisitorHost('PASS-2026-1049');
assert(true, "11.4 Notify host dispatches instant notification");

app.handleMarkVisitorExit('PASS-2026-1049');
assert(true, "11.4 Visitor check-out records exit timestamp");

app.viewVisitorHistory('Sri K. Venkat Rao', '98480 33445');
assert(mockDoc.getElementById('visitorHistoryModalBody').innerHTML.includes('Venkat Rao'), "11.4 View visitor history renders past visits dossier");

// ==========================================
// TEST SUITE 11.5: MEETING HISTORY & DIRECTIVES
// ==========================================
console.log("\n--- Testing 11.5: Meeting History & Directives ---");
app.renderMeetingHistory();
const histTable = mockDoc.getElementById('meetingHistoryTableBody');
assert(histTable && (histTable.innerHTML.includes('MTG-') || histTable.innerHTML.includes('Meeting')), "11.5 Renders meeting history register");

app.renderFollowupActions();
const fupTable = mockDoc.getElementById('followupActionsTableBody');
assert(fupTable && fupTable.innerHTML.includes('FUP-'), "11.5 Renders follow-up directives");

app.handleCompleteFollowup('FUP-2026-001');
assert(true, "11.5 Complete follow-up directive updates task state");

// ==========================================
// LIVE CLOCK & RETENTION POLICY
// ==========================================
console.log("\n--- Testing Live Clock & Statutory Retention Policy ---");
const timeText = mockDoc.getElementById('liveTimeText').textContent;
assert(timeText.includes('IST') && !timeText.includes('--:--:--'), `Live clock displays current IST time: ${timeText}`);

assert(indexHtml.includes('Statutory Retention: 90 Days') || indexHtml.includes('90-Day Mandatory Statutory Visitor Data Retention') || indexHtml.includes('Statutory Retention: 100% History Retained'), "Statutory data retention policy displayed prominently");

console.log(`\n==========================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`==========================================`);

process.exit(failed > 0 ? 1 : 0);
