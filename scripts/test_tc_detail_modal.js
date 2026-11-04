const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: TC DETAIL DOSSIER MODAL ALIGNMENT & LOGIC');
console.log('====================================================');

// Mock DOM environment
const elements = {};
function getMock(id, tag = 'div') {
  if (!elements[id]) {
    elements[id] = {
      id,
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        _classes: new Set(),
        add: function(c) { this._classes.add(c); },
        remove: function(c) { this._classes.delete(c); },
        contains: function(c) { return this._classes.has(c); },
        toString: function() { return Array.from(this._classes).join(' '); }
      },
      innerHTML: '',
      textContent: '',
      value: '',
      children: [],
      setAttribute: function(k, v) { this[k] = v; },
      getAttribute: function(k) { return this[k]; },
      addEventListener: () => {},
      removeEventListener: () => {},
      click: function() {}
    };
  }
  return elements[id];
}

global.window = {
  location: { reload: () => {} },
  localStorage: {
    _data: {},
    getItem: (k) => window.localStorage._data[k] || null,
    setItem: (k, v) => { window.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete window.localStorage._data[k]; }
  },
  addEventListener: () => {},
  dispatchEvent: () => {},
  print: () => {}
};

global.document = {
  getElementById: (id) => getMock(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getMock(sel.slice(1));
    return getMock('sel_' + Math.random());
  },
  querySelectorAll: (sel) => {
    if (sel === '.tc-detail-tab-btn') {
      return ['profile', 'clearance', 'preview', 'issuance'].map(tab => {
        const btn = getMock('tab_btn_' + tab, 'button');
        btn.setAttribute('data-tab', tab);
        return btn;
      });
    }
    if (sel === '.tc-detail-pane') {
      return ['profile', 'clearance', 'preview', 'issuance'].map(tab => {
        const pane = getMock(`tcPane-${tab}`, 'div');
        return pane;
      });
    }
    return [];
  },
  createElement: (tag) => getMock('el_' + Math.random(), tag),
  body: getMock('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Load student-roster.js and portal.js
eval(fs.readFileSync('frontend/js/student-roster.js', 'utf8'));
eval(fs.readFileSync('frontend/js/portal.js', 'utf8'));
const portal = global.portalApp || window.portalApp;

assert(portal, 'portalApp must be defined on window');
console.log('\n[PASS] Portal and Roster loaded successfully');

// Initialize transfers
portal.initTransfers();
const initialTransfers = portal.state.transfers;
assert(Array.isArray(initialTransfers) && initialTransfers.length > 0, 'state.transfers must be loaded');
console.log(`[PASS] Transfers state initialized with ${initialTransfers.length} records`);

// --- Test 1: Verify HTML Structure and ID mappings in index.html ---
console.log('\n--- Test 1: Verify HTML Structure & ID Mappings in index.html ---');
const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');

const expectedIds = [
  'tcDetailModal',
  'tcDetailModalTitle',
  'tcDetailStatusBadge',
  'tcDetailRequestIdPill',
  'tcDetailModalSubtitle',
  'tcPane-profile',
  'tcDossierName',
  'tcDossierAdmNo',
  'tcDossierStudentId',
  'tcDossierPenNo',
  'tcDossierAadhaar',
  'tcDossierClass',
  'tcDossierDob',
  'tcDossierFather',
  'tcDossierMother',
  'tcDossierRequester',
  'tcDossierRelation',
  'tcDossierPhone',
  'tcDossierReqDate',
  'tcDossierOrderRef',
  'tcDossierReason',
  'tcDossierDest',
  'tcDossierLastDate',
  'tcDossierAttendance',
  'tcPane-clearance',
  'tcDossierExam',
  'tcDossierConduct',
  'tcDossierPromotion',
  'tcDossierTeacherSign',
  'tcDossierLibBooks',
  'tcDossierLab',
  'tcDossierSports',
  'tcDossierLibrarianSign',
  'tcDossierDues',
  'tcDossierNdcRef',
  'tcDossierStatutoryStatus',
  'tcDossierBursarSign',
  'tcDossierPrincipalStatus',
  'tcDossierPrincipalDate',
  'tcPane-preview',
  'tcDossierDocContainer',
  'tcPane-issuance',
  'tcDossierFinalNo',
  'tcDossierFinalDate',
  'tcDossierSignatory',
  'tcDossierHash',
  'tcDossierPermId',
  'tcDetailFooterActionBtns'
];

expectedIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `HTML must contain element id="${id}"`);
});
console.log(`[PASS] All ${expectedIds.length} expected element IDs verified in index.html`);

// --- Test 2: Verify CSS Rules in portal.css ---
console.log('\n--- Test 2: Verify CSS Rules in portal.css ---');
const css = fs.readFileSync('frontend/css/portal.css', 'utf8');

assert(css.includes('.tc-profile-grid'), 'CSS must define .tc-profile-grid');
assert(css.includes('.tc-dossier-card'), 'CSS must define .tc-dossier-card');
assert(css.includes('.tc-kv-row'), 'CSS must define .tc-kv-row');
assert(css.includes('.tc-kv-label'), 'CSS must define .tc-kv-label');
assert(css.includes('.tc-kv-val'), 'CSS must define .tc-kv-val');
assert(css.includes('.tc-metrics-grid'), 'CSS must define .tc-metrics-grid');
assert(css.includes('.tc-metric-tile'), 'CSS must define .tc-metric-tile');
console.log('[PASS] All TC Dossier layout classes verified in portal.css');

// --- Test 3: Open TC Detail Modal & Populate Data ---
console.log('\n--- Test 3: Open TC Detail Modal & Verify Field Population ---');
portal.openTcDetailModal('TC-REQ-2026-0041');

const modal = getMock('tcDetailModal');
assert(modal.style.display === 'flex' || modal.classList.contains('active'), 'tcDetailModal must be displayed');

assert.strictEqual(getMock('tcDetailModalTitle').textContent, 'P. Kiran Kumar', 'Student name must match P. Kiran Kumar');
assert.strictEqual(getMock('tcDetailRequestIdPill').textContent, 'TC-REQ-2026-0041', 'Request ID pill must match TC-REQ-2026-0041');
assert.strictEqual(getMock('tcDossierAdmNo').textContent, 'SV-0082', 'Admission number must match SV-0082');
assert(getMock('tcDossierReason').textContent.includes('Hyderabad') || getMock('tcDossierReason').textContent.length > 0, 'Reason must be populated');
assert(getMock('tcDossierAttendance').textContent.includes('204') || getMock('tcDossierAttendance').textContent.length > 0, 'Attendance must be populated');
assert(getMock('tcDossierRequester').textContent.length > 0, 'Requester name must be populated');

console.log('[PASS] Test 3: openTcDetailModal successfully populates header, profile, requester, and metrics');

// --- Test 4: Tab Switching Navigation ---
console.log('\n--- Test 4: Tab Switching Navigation ---');
portal.switchTcDetailTab('clearance');
portal.switchTcDetailTab('preview');
portal.switchTcDetailTab('issuance');
portal.switchTcDetailTab('profile');
console.log('[PASS] Test 4: Tab switching executed cleanly across all 4 panes');

// --- Test 5: Footer Actions Rendering ---
console.log('\n--- Test 5: Footer Actions Rendering across Lifecycle Stages ---');
const issuedRec = portal.state.transfers.find(t => t.approvalStatus === 'Issued') || portal.state.transfers[0];
portal.renderTcDetailActions(issuedRec);
const footerHtml = getMock('tcDetailFooterActionBtns').innerHTML;
assert(footerHtml.includes('Print Official TC'), 'Issued record must have Print Official TC button');
assert(footerHtml.includes('Close'), 'Footer must have Close button');

console.log('[PASS] Test 5: Footer actions rendered accurately');

console.log('\n====================================================');
console.log('ALL TC DETAIL MODAL ALIGNMENT & LOGIC TESTS PASSED (100%)');
console.log('====================================================\n');
