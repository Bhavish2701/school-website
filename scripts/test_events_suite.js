const fs = require('fs');

console.log("=== COMPREHENSIVE AUTOMATED TEST: SECTION 13 EVENTS SUITE ===");

const elements = new Map();
function createMockElement(id, tag = 'div') {
  return {
    id: id,
    tagName: tag.toUpperCase(),
    textContent: '',
    innerHTML: '',
    value: '',
    checked: false,
    style: {},
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }
    },
    remove: function() {
      if (this.parentNode) this.parentNode.removeChild(this);
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
    reset: function() { this.value = ''; },
    querySelectorAll: function(sel) { return []; },
    querySelector: function(sel) { 
      if (sel.startsWith('#')) return mockDoc.getElementById(sel.substring(1));
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
  querySelectorAll: function(sel) { return []; },
  querySelector: function(sel) { 
    if (sel.startsWith('#')) return mockDoc.getElementById(sel.substring(1));
    return null;
  },
  createElement: function(tag) { return createMockElement('dynamic-' + Math.random(), tag); },
  addEventListener: function(ev, cb) {},
  documentElement: { setAttribute: function() {}, style: {} },
  body: createMockElement('body', 'body')
};

const mockWindow = {
  document: mockDoc,
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; }
  },
  sessionStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; }
  },
  innerWidth: 1200,
  addEventListener: function() {},
  removeEventListener: function() {},
  setInterval: function(fn) { return 1; },
  clearInterval: function() {},
  setTimeout: function(fn) { return 1; },
  clearTimeout: function() {},
  scrollTo: function() {},
  alert: function(msg) {},
  confirm: function(msg) { return true; },
  prompt: function(msg, def) { return def || 'Automated Test Response'; },
  location: { hash: '', reload: function() {} }
};

global.window = mockWindow;
global.document = mockDoc;
global.localStorage = mockWindow.localStorage;
global.sessionStorage = mockWindow.sessionStorage;
global.alert = mockWindow.alert;
global.confirm = mockWindow.confirm;
global.prompt = mockWindow.prompt;

const portalCode = fs.readFileSync('frontend/js/portal.js', 'utf8');
eval(portalCode);
mockWindow.portalApp.init();

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failCount++;
  }
}

console.log("\n--- Testing 13.1 Annual Calendar ---");
mockWindow.portalApp.renderAnnualCalendar();
const calTbody = mockDoc.getElementById('annualCalendarTableBody');
assert(calTbody.innerHTML.includes('School Reopening'), '13.1 renders initial annual calendar events');
assert(calTbody.innerHTML.includes('Published'), '13.1 shows published status');

// Test Create Annual Event
mockDoc.getElementById('calEventDate').value = '10 Jan 2027';
mockDoc.getElementById('calEventTitle').value = 'National Youth Day Seminar';
mockDoc.getElementById('calEventCategory').value = 'Academic';
mockDoc.getElementById('calEventClasses').value = 'Classes VIII - X';
mockDoc.getElementById('calEventLocation').value = 'Main Auditorium';
mockDoc.getElementById('calEventStatus').value = 'Draft';

mockWindow.portalApp.handleCalendarEventSubmit({ preventDefault: () => {} });
assert(calTbody.innerHTML.includes('National Youth Day Seminar'), '13.1 creates new calendar event');

// Test Approve & Publish & Notify & Cancel
mockWindow.portalApp.approveCalendarEvent('AC-01');
mockWindow.portalApp.publishCalendarEvent('AC-09');
mockWindow.portalApp.notifyCalendarAffectedUsers('AC-01');
mockWindow.portalApp.cancelCalendarEvent('AC-11');
assert(calTbody.innerHTML.includes('Cancelled'), '13.1 cancels calendar event with reason');

console.log("\n--- Testing 13.2 School Events (10 Fields) ---");
mockWindow.portalApp.renderSchoolEventsTable();
const schoolTbody = mockDoc.getElementById('schoolEventsTableBody');
assert(schoolTbody.innerHTML.includes('Annual Science & STEM Robotics Expo 2026'), '13.2 renders school events with description');
assert(schoolTbody.innerHTML.includes('₹65,000'), '13.2 displays event budget field');
assert(schoolTbody.innerHTML.includes('Police Traffic Bandobast'), '13.2 displays required permissions field');
assert(schoolTbody.innerHTML.includes('Trained First-Aid Attendant'), '13.2 displays safety arrangements field');

// Test Create School Event (10 fields)
mockDoc.getElementById('eventM13Name').value = 'Inter-School Folk Music Carnival';
mockDoc.getElementById('eventM13Desc').value = 'Celebrating traditional Andhra folklore songs and instruments.';
mockDoc.getElementById('eventM13Organizer').value = 'Music Department';
mockDoc.getElementById('eventM13Coordinator').value = 'Smt. K. Sarada';
mockDoc.getElementById('eventM13DateTime').value = '15 Feb 2027, 10:00 AM - 04:00 PM';
mockDoc.getElementById('eventM13Venue').value = 'School Amphitheatre';
mockDoc.getElementById('eventM13Participants').value = '350 Students';
mockDoc.getElementById('eventM13Budget').value = '₹40,000';
mockDoc.getElementById('eventM13Permissions').value = 'Parent Consent & Sound Permissions';
mockDoc.getElementById('eventM13Safety').value = 'First aid kit, shaded canopy, cold water coolers';
mockDoc.getElementById('eventM13Status').value = 'Draft';

mockWindow.portalApp.handleSchoolEventSubmit({ preventDefault: () => {} });
assert(schoolTbody.innerHTML.includes('Inter-School Folk Music Carnival'), '13.2 creates school event with all 10 fields');

// Test School Event Actions
mockWindow.portalApp.assignEventCoordinator('SE-01');
mockWindow.portalApp.requestEventApproval('SE-05');
mockWindow.portalApp.reserveEventVenue('SE-01');
mockWindow.portalApp.publishSchoolEvent('SE-01');

// Test Attendance & Event Report
mockDoc.getElementById('eventAttId').value = 'SE-01';
mockDoc.getElementById('eventAttActual').value = '438';
mockDoc.getElementById('eventAttSupervisors').value = 'Sri Navva Anand & Smt. K. Sarada';
mockWindow.portalApp.handleRecordEventAttendanceSubmit({ preventDefault: () => {} });

mockDoc.getElementById('eventReportId').value = 'SE-01';
mockDoc.getElementById('eventReportActualBudget').value = '₹59,200';
mockDoc.getElementById('eventReportOutcome').value = 'Exemplary';
mockWindow.portalApp.handleCompleteEventReportSubmit({ preventDefault: () => {} });
assert(schoolTbody.innerHTML.includes('Completed'), '13.2 completes event report and transitions to Completed');

console.log("\n--- Testing 13.3 Competitions ---");
mockWindow.portalApp.renderCompetitionsTable();
const compTbody = mockDoc.getElementById('competitionsTableBody');
assert(compTbody.innerHTML.includes('AP State Children\'s Science Congress'), '13.3 renders competitions list');
assert(compTbody.innerHTML.includes('15 Nov 2026'), '13.3 shows registration deadline');
assert(compTbody.innerHTML.includes('Master K. Sai Tharun'), '13.3 shows competition results');

// Test Create Competition
mockDoc.getElementById('compM13Name').value = 'State Cyber Security Hackathon';
mockDoc.getElementById('compM13Classes').value = 'Classes VIII - X';
mockDoc.getElementById('compM13Deadline').value = '25 Jan 2027';
mockDoc.getElementById('compM13Coordinator').value = 'Sri Navva Anand';
mockWindow.portalApp.handleCompetitionSubmit({ preventDefault: () => {} });
assert(compTbody.innerHTML.includes('State Cyber Security Hackathon'), '13.3 creates competition');

// Test Register Participant
mockDoc.getElementById('compRegId').value = 'CMP-01';
mockDoc.getElementById('compRegStudent').value = 'Kumari K. Deepthi';
mockWindow.portalApp.handleRegisterCompParticipantsSubmit({ preventDefault: () => {} });

// Test Record Results & Standings
mockDoc.getElementById('compResultsId').value = 'CMP-04';
mockDoc.getElementById('compWinner1').value = 'Master K. Sai Tharun (Class X-A)';
mockDoc.getElementById('compWinner2').value = 'Master Ch. Karthik (Class VIII-B)';
mockWindow.portalApp.handleRecordCompResultsSubmit({ preventDefault: () => {} });
assert(compTbody.innerHTML.includes('1st: Master K. Sai Tharun'), '13.3 records competition standings');

// Test Generate Certificates
mockWindow.portalApp.generateCompetitionCertificates('CMP-01');
assert(mockDoc.getElementById('certCompTitle').textContent.includes('Science Congress'), '13.3 generates official merit certificate');

console.log("\n--- Testing 13.4 Clubs & Sports ---");
mockWindow.portalApp.renderClubsSportsTable();
const clubsTbody = mockDoc.getElementById('clubsSportsTableBody');
assert(clubsTbody.innerHTML.includes('Sri Vidya Cricket Academy'), '13.4 renders clubs & sports squads');
assert(clubsTbody.innerHTML.includes('Sri D. Prasad'), '13.4 shows assigned coordinator / coach');
assert(clubsTbody.innerHTML.includes('95.4%'), '13.4 shows attendance percentage');
assert(clubsTbody.innerHTML.includes('Batting cage nets'), '13.4 shows activities and curriculum');
assert(clubsTbody.innerHTML.includes('Rolling Trophy'), '13.4 shows achievements');

// Test Create Club
mockDoc.getElementById('clubM13Name').value = 'Junior Space & Astronomy Guild';
mockDoc.getElementById('clubM13Coordinator').value = 'Sri Navva Anand';
mockDoc.getElementById('clubM13Schedule').value = 'Friday (04:00 PM - 05:15 PM)';
mockDoc.getElementById('clubM13Venue').value = 'Campus Rooftop Observatory';
mockDoc.getElementById('clubM13Activities').value = 'Telescope stargazing, lunar phase tracking, constellation mapping';
mockDoc.getElementById('clubM13Achievements').value = 'Constructed school solar clock';
mockWindow.portalApp.handleClubSubmit({ preventDefault: () => {} });
assert(clubsTbody.innerHTML.includes('Junior Space & Astronomy Guild'), '13.4 creates club / sports team');

// Test Enrol Students
mockDoc.getElementById('clubEnrolId').value = 'CS-01';
mockDoc.getElementById('clubEnrolStudent').value = 'Master S. Charan';
mockDoc.getElementById('clubEnrolRole').value = 'Fast Bowler / Squad Member';
mockWindow.portalApp.handleEnrolClubStudentsSubmit({ preventDefault: () => {} });

// Test Record Participation
mockDoc.getElementById('clubPartId').value = 'CS-01';
mockDoc.getElementById('clubPartAtt').value = '37 of 39 (94.9%)';
mockDoc.getElementById('clubPartDrills').value = 'Boundary fielding agility and catching under high sky balls.';
mockWindow.portalApp.handleRecordClubParticipationSubmit({ preventDefault: () => {} });
assert(clubsTbody.innerHTML.includes('94.9%'), '13.4 records club attendance and drills');

// Test Publish Achievement
mockDoc.getElementById('clubAchId').value = 'CS-01';
mockDoc.getElementById('clubAchTitle').value = 'State Under-14 Cricket Silver Medal';
mockDoc.getElementById('clubAchCategory').value = 'State Runners-Up';
mockWindow.portalApp.handlePublishClubAchievementSubmit({ preventDefault: () => {} });
assert(clubsTbody.innerHTML.includes('State Runners-Up: State Under-14 Cricket Silver Medal'), '13.4 publishes club achievement');

console.log("\n==========================================");
console.log(`TOTAL PASSED: ${passCount}`);
console.log(`TOTAL FAILED: ${failCount}`);
console.log("==========================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
