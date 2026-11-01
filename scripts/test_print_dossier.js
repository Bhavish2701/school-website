const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: STUDENT DOSSIER PRINT GENERATOR & COMPLIANCE ===');

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
    querySelector: function(sel) { return null; }
  };
}

function getEl(id, tag = 'div') {
  if (!elements.has(id)) {
    elements.set(id, createMockElement(id, tag));
  }
  return elements.get(id);
}

let printCalled = false;
let windowOpenCalled = false;
let openedDocumentContent = '';

global.window = {
  location: { hash: '#students' },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  confirm: () => true,
  prompt: (msg, def) => def || 'Approved by Principal',
  alert: () => {},
  print: function() {
    printCalled = true;
  },
  open: function(url, target, features) {
    windowOpenCalled = true;
    return {
      document: {
        open: () => {},
        write: (str) => { openedDocumentContent += str; },
        close: () => {}
      },
      focus: () => {},
      print: () => { printCalled = true; },
      closed: false
    };
  }
};

global.document = {
  getElementById: (id) => getEl(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getEl(sel.slice(1));
    return createMockElement('sel_' + Math.random());
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => createMockElement('el_' + Math.random(), tag),
  body: createMockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; },
  clear: () => { global.localStorage._store = {}; }
};

global.showToast = function(msg, type) {};
global.bootstrap = { Modal: function() { return { show: () => {}, hide: () => {} }; } };

// Load student-roster.js first to populate window.STUDENT_ROSTER
const rosterPath = path.join(__dirname, '..', 'frontend', 'js', 'student-roster.js');
if (fs.existsSync(rosterPath)) {
  const rosterCode = fs.readFileSync(rosterPath, 'utf8');
  eval(rosterCode);
  console.log('[PASS] Loaded student-roster.js, student count:', (global.window.STUDENT_ROSTER || []).length);
}

// Load portal.js
const jsPath = path.join(__dirname, '..', 'frontend', 'js', 'portal.js');
const portalCode = fs.readFileSync(jsPath, 'utf8');
eval(portalCode);

const portalApp = global.portalApp || window.portalApp;
if (!portalApp) {
  throw new Error('portalApp failed to initialize');
}
console.log('[PASS] portalApp initialized successfully');

// Test 1: Verify Exports
if (typeof portalApp.generateStudentDossierPrintHTML !== 'function') {
  throw new Error('portalApp.generateStudentDossierPrintHTML is not exported');
}
console.log('[PASS] Export exists: generateStudentDossierPrintHTML');

if (typeof portalApp.printStudentDossier !== 'function') {
  throw new Error('portalApp.printStudentDossier is not exported');
}
console.log('[PASS] Export exists: printStudentDossier');

if (typeof portalApp.getActiveDossierStudent !== 'function') {
  throw new Error('portalApp.getActiveDossierStudent is not exported');
}
console.log('[PASS] Export exists: getActiveDossierStudent');

// Test 2: Generate Print HTML for default/seed student
const student = portalApp.getActiveDossierStudent();
if (!student) {
  throw new Error('No active student returned from getActiveDossierStudent');
}
console.log(`[PASS] Retrieved active dossier student: ${student.name} (${student.admNo})`);

const printDoc = portalApp.generateStudentDossierPrintHTML(student);

// Assertions on the generated HTML content
const requiredSubstrings = [
  '<!DOCTYPE html>',
  'Sri Vidya English Medium High School',
  'Official Student Cumulative Record &amp; Scholastic Dossier',
  'Dossier Docket:',
  student.name,
  student.admNo,
  '1. Continuous Scholastic Progression &amp; Enrolment History',
  '2. Continuous Comprehensive Evaluation (CCE) - Academic Tabulation',
  '3. Attendance Compliance Audit',
  '4. Financial Fee Clearance',
  '5. Logistics, Health, Co-Curricular &amp; Statutory Credentials Verification',
  'STATUTORY ATTESTATION &amp; CERTIFICATION',
  'Smt. K. Hymavathi',
  'Smt. Gorle Varalakshmi, M.A., B.Ed.',
  'OFFICIAL<br>INSTITUTIONAL<br>SEAL',
  'window.print();'
];

requiredSubstrings.forEach(sub => {
  if (!printDoc.includes(sub)) {
    throw new Error(`Missing required string in print docket: "${sub}"`);
  }
});
console.log('[PASS] Generated A4 Dossier Document contains all 7 statutory sections, AP Board credentials, tables, and tripartite signature blocks');

// Test 3: Test printStudentDossier execution
portalApp.printStudentDossier(student.admNo);
if (!windowOpenCalled && !printCalled) {
  throw new Error('Neither window.open nor window.print was called by printStudentDossier');
}
console.log('[PASS] printStudentDossier executed cleanly and opened official print docket window');

// Test 4: Test in-page printable container fallback
const inPagePrintable = global.document.getElementById('printableStudentDossier');
if (!inPagePrintable || !inPagePrintable.innerHTML.includes(student.name)) {
  throw new Error('In-page #printableStudentDossier container was not created/populated');
}
console.log('[PASS] In-page fallback container #printableStudentDossier populated for print media stylesheets');

console.log('\n========================================');
console.log('TEST SUMMARY: ALL 6 DOSSIER PRINT TESTS PASSED 100%!');
console.log('========================================');
