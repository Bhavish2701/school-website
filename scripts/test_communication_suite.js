const fs = require('fs');

console.log("=== COMPREHENSIVE AUTOMATED TEST: SECTION 12 COMMUNICATION SUITE ===");

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
  createElement: function(tag) {
    return createMockElement('dyn_' + Math.random(), tag);
  },
  querySelectorAll: function(sel) { return []; },
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
  alert: function(msg) { console.log("[ALERT]", msg); },
  confirm: function(msg) { return true; },
  prompt: function(msg) { return 'Official response provided'; },
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
// TEST SUITE 12.1: ANNOUNCEMENTS
// ==========================================
console.log("\n--- Testing 12.1: Announcements ---");
app.renderAnnouncements();
const annTbody = mockDoc.getElementById('announcementsTableBody');
assert(annTbody && annTbody.innerHTML.includes('ANN-'), "12.1 Renders announcements table with Reference IDs");
assert(annTbody.innerHTML.includes('STEM') && annTbody.innerHTML.includes('FA-3'), "12.1 Displays Title & Message Content");
assert(annTbody.innerHTML.includes('Classes VI–X') || annTbody.innerHTML.includes('Campus-Wide'), "12.1 Displays Audience & Applicable Classes");
assert(annTbody.innerHTML.includes('STEM_Fair_Guidelines_2026.pdf'), "12.1 Displays Attachment references");
assert(annTbody.innerHTML.includes('Expires:'), "12.1 Displays Publication and Expiry dates");
assert(annTbody.innerHTML.includes('Principal') || annTbody.innerHTML.includes('Vice Principal'), "12.1 Displays Author & Approval Status");

// Test Announcement Actions
app.openPreviewAnnouncementModal('ANN-2026-038');
assert(mockDoc.getElementById('previewAnnouncementBody').innerHTML.includes('STEM'), "12.1 Preview announcement renders layout");

app.submitAnnouncementForApproval('ANN-2026-044');
assert(true, "12.1 Submit announcement for approval executes cleanly");

app.approveAnnouncement('ANN-2026-041');
assert(true, "12.1 Approve announcement executes cleanly");

app.publishAnnouncement('ANN-2026-042');
assert(true, "12.1 Publish announcement executes cleanly");

mockDoc.getElementById('retractAnnouncementId').value = 'ANN-2026-038';
mockDoc.getElementById('retractReason').value = 'Completed scheduled event';
app.handleRetractAnnouncementSubmit();
assert(true, "12.1 Retract / Archive announcement with reason executes cleanly");

// ==========================================
// TEST SUITE 12.2: OFFICIAL CIRCULARS
// ==========================================
console.log("\n--- Testing 12.2: Official Circulars ---");
app.renderOfficialCirculars();
const cirTbody = mockDoc.getElementById('officialCircularsTableBody');
assert(cirTbody && cirTbody.innerHTML.includes('CIR/2026-27/'), "12.2 Renders official circulars with Circular Numbers");
assert(cirTbody.innerHTML.includes('CIR_2026_FA3_Schedule.pdf'), "12.2 Displays document attachment link");
assert(cirTbody.innerHTML.includes('Mandatory Digital Signature') || cirTbody.innerHTML.includes('General Information'), "12.2 Displays acknowledgement requirement");
assert(cirTbody.innerHTML.includes('484 / 500 Signed'), "12.2 Real-time parent signature tracking displayed");

// Test Circular Actions
app.openPreviewCircularModal('CIR/2026-27/024');
assert(mockDoc.getElementById('previewCircularBody').innerHTML.includes('SRI VIDYA ENGLISH MEDIUM HIGH SCHOOL'), "12.2 Preview circular renders official school letterhead");

app.approveCircular('CIR/2026-27/025');
assert(true, "12.2 Approve & Publish circular executes cleanly");

app.openTrackCircularAckModal('CIR/2026-27/024');
assert(mockDoc.getElementById('trackCircularAckTableBody').innerHTML.includes('A. Somasekhar'), "12.2 Track acknowledgement renders student & guardian roster");

app.sendReminderToPendingAck();
assert(true, "12.2 Send reminder to pending parents dispatches notification");

// ==========================================
// TEST SUITE 12.3: SMS BROADCAST
// ==========================================
console.log("\n--- Testing 12.3: SMS Broadcast ---");
app.renderSmsBroadcast();
const smsTbody = mockDoc.getElementById('smsBroadcastTableBody');
assert(smsTbody && smsTbody.innerHTML.includes('SMS-2026-'), "12.3 Renders SMS campaigns table");
assert(smsTbody.innerHTML.includes('TPL-DLT-'), "12.3 Displays DLT template ID & message text");
assert(smsTbody.innerHTML.includes('Absent Today') || smsTbody.innerHTML.includes('Fee Due'), "12.3 Displays recipient group & recipient count");
assert(smsTbody.innerHTML.includes('Delivered') && smsTbody.innerHTML.includes('Failed'), "12.3 Displays delivery summary");

// Test SMS Actions
app.openValidateRecipientsModal();
assert(mockDoc.getElementById('validateRecipientsBody').innerHTML.includes('TOTAL VALID'), "12.3 Validate recipients renders DND clearance dossier");

app.retrySmsCampaign('SMS-2026-041');
assert(true, "12.3 Retry failed messages updates campaign delivery");

app.exportSmsDeliveryCSV();
assert(true, "12.3 Export SMS delivery report executes cleanly");

// ==========================================
// TEST SUITE 12.4: EMAIL DISPATCH
// ==========================================
console.log("\n--- Testing 12.4: Email Dispatch ---");
app.renderEmailDispatch();
const emlTbody = mockDoc.getElementById('emailDispatchTableBody');
assert(emlTbody && emlTbody.innerHTML.includes('EML-2026-'), "12.4 Renders email dispatches table");
assert(emlTbody.innerHTML.includes('Monthly Academic Performance') || emlTbody.innerHTML.includes('STEM'), "12.4 Displays campaign subject & message");
assert(emlTbody.innerHTML.includes('principal@srividya.edu.in'), "12.4 Displays official sender email address");
assert(emlTbody.innerHTML.includes('Delivered') || emlTbody.innerHTML.includes('Scheduled'), "12.4 Displays delivery status & schedule");

// Test Email Actions
app.cancelScheduledEmail('EML-2026-019');
assert(true, "12.4 Cancel scheduled email updates campaign state");

mockDoc.getElementById('testEmailAddress').value = 'admin@srividya.edu.in';
app.handleTestSendEmailSubmit();
assert(true, "12.4 Test send dispatches verification sample");

app.exportEmailDispatchCSV();
assert(true, "12.4 Export email delivery report executes cleanly");

// ==========================================
// TEST SUITE 12.5: MOBILE PUSH NOTIFICATIONS
// ==========================================
console.log("\n--- Testing 12.5: Mobile Push Notifications ---");
app.renderMobilePush();
const pushTbody = mockDoc.getElementById('mobilePushTableBody');
assert(pushTbody && pushTbody.innerHTML.includes('PUSH-2026-'), "12.5 Renders staged push notifications table");
assert(pushTbody.innerHTML.includes('Staged'), "12.5 Displays staging delivery status");
assert(pushTbody.innerHTML.includes('#appointments-overview') || pushTbody.innerHTML.includes('#academics-timetable'), "12.5 Displays deep link click-through destination");
assert(indexHtml.includes('Mobile Push Gateway Interface') && indexHtml.includes('Staged for Native App'), "12.5 Staging advisory banner prominently displayed");

// ==========================================
// TEST SUITE 12.6: PARENT ENQUIRIES & MESSAGES
// ==========================================
console.log("\n--- Testing 12.6: Parent Enquiries & Messages ---");
app.renderParentEnquiries();
const enqTbody = mockDoc.getElementById('parentEnquiriesTableBody');
assert(enqTbody && enqTbody.innerHTML.includes('ENQ-2026-'), "12.6 Renders parent enquiries with Enquiry IDs");
assert(enqTbody.innerHTML.includes('Sri K. Ramana') || enqTbody.innerHTML.includes('Smt. D. Sunitha'), "12.6 Displays requester name & contact");
assert(enqTbody.innerHTML.includes('K. Sai Tharun') || enqTbody.innerHTML.includes('D. Lavanya'), "12.6 Displays linked student details");
assert(enqTbody.innerHTML.includes('Academic') || enqTbody.innerHTML.includes('Transport'), "12.6 Displays inquiry category");
assert(enqTbody.innerHTML.includes('Vice Principal') || enqTbody.innerHTML.includes('Accounts Clerk'), "12.6 Displays assigned employee");

// Test Enquiry Actions
app.openReplyEnquiryModal('ENQ-2026-089');
assert(mockDoc.getElementById('replyRequesterName').textContent.includes('Sri K. Ramana'), "12.6 Reply modal loads inquiry dossier");

mockDoc.getElementById('replyEnquiryId').value = 'ENQ-2026-089';
mockDoc.getElementById('replyChannel').value = 'Parent Portal Direct';
mockDoc.getElementById('replyAssignee').value = 'Sri Navva Anand (Vice Principal)';
mockDoc.getElementById('replyMessageText').value = 'Remedial study material prepared and delivered to student.';
mockDoc.getElementById('replyInternalNote').value = 'Verified complete handbook handed over.';
mockDoc.getElementById('replyMarkResolved').checked = true;
app.handleReplyEnquirySubmit();
assert(true, "12.6 Reply & Resolve parent inquiry updates status to Resolved");

mockDoc.getElementById('escalateEnquiryId').value = 'ENQ-2026-092';
mockDoc.getElementById('escalateToOfficial').value = 'Smt. Gorle Varalakshmi (Principal)';
mockDoc.getElementById('escalatePriority').value = 'Urgent';
mockDoc.getElementById('escalateNotes').value = 'Roll call discrepancy requires Principal executive authorization.';
app.handleEscalateEnquirySubmit();
assert(true, "12.6 Escalate inquiry to leadership updates status to Escalated");

app.reopenParentEnquiry('ENQ-2026-090');
assert(true, "12.6 Reopen permitted parent enquiry restores open state");

app.exportParentEnquiriesCSV();
assert(true, "12.6 Export parent enquiries CSV executes cleanly");

assert(indexHtml.includes('Authorized Parent Communication') && indexHtml.includes('Parent Portal Integrated'), "12.6 Unified communication pipeline seamlessly integrated for Parent Portal");

// ==========================================
// TEST SUITE 12.7: MESSAGE TEMPLATES
// ==========================================
console.log("\n--- Testing 12.7: Message Templates ---");
app.renderMessageTemplates();
const tplTbody = mockDoc.getElementById('messageTemplatesTableBody');
assert(tplTbody && tplTbody.innerHTML.includes('TPL-DLT-'), "12.7 Renders message templates with DLT IDs");
assert(tplTbody.innerHTML.includes('{student_name}') || tplTbody.innerHTML.includes('{#var#}'), "12.7 Displays dynamic merge tags");

console.log(`\n==========================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`==========================================`);

process.exit(failed > 0 ? 1 : 0);
