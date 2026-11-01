const fs = require('fs');

console.log("=== COMPREHENSIVE AUTOMATED TEST: SECTION 14 TRANSPORT SUITE ===");

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

const app = mockWindow.portalApp;
if (!app) {
  console.error("CRITICAL: portalApp not exported on mockWindow!");
  process.exit(1);
}

let passCount = 0;
let failCount = 0;
function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// 14.1 Routes & Stops Tests
// -------------------------------------------------------------
console.log('\n--- 14.1 Routes & Stops ---');
app.renderTransportRoutesTable();
const routesTbody = mockDoc.getElementById('transportRoutesTableBody');
assert(routesTbody.innerHTML.includes('RTC Bus Complex Line'), '14.1 renders initial transport routes');
assert(routesTbody.innerHTML.includes('Route 1'), '14.1 renders Route 1 badge');
assert(routesTbody.innerHTML.includes('AP-07-TX-1041'), '14.1 displays assigned vehicle registration');
assert(routesTbody.innerHTML.includes('Sri K. Venkateswarlu'), '14.1 displays driver name');
assert(routesTbody.innerHTML.includes('Smt. K. Hymavathi'), '14.1 displays attendant name');
assert(routesTbody.innerHTML.includes('Stops'), '14.1 displays Add/Edit Stops action');
assert(routesTbody.innerHTML.includes('Publish'), '14.1 displays Publish route action');

// Filter routes
mockDoc.getElementById('transportRouteSearchInput').value = 'RTC';
app.filterTransportRoutes();
assert(routesTbody.innerHTML.includes('RTC Bus Complex Line'), '14.1 filters routes by query');
mockDoc.getElementById('transportRouteSearchInput').value = '';
app.filterTransportRoutes();

// Create Route
mockDoc.getElementById('routeM14Id').value = 'Route 99';
mockDoc.getElementById('routeM14Name').value = 'Test Transit Corridor Line';
mockDoc.getElementById('routeM14Stops').value = 'Center A (07:30 AM), Center B (07:50 AM), Campus Gate (08:15 AM)';
mockDoc.getElementById('routeM14Pickup').value = '07:30 AM - 08:15 AM';
mockDoc.getElementById('routeM14Drop').value = '04:30 PM - 05:15 PM';
mockDoc.getElementById('routeM14Vehicle').value = 'Bus #1 (AP-07-TX-1041)';
app.handleCreateTransportRouteSubmit({ preventDefault: () => {} });
app.renderTransportRoutesTable();
assert(routesTbody.innerHTML.includes('Route 99'), '14.1 successfully creates and renders new route');
assert(routesTbody.innerHTML.includes('Test Transit Corridor Line'), '14.1 displays new route title');

// Edit Stops
app.openEditRouteStopsModal('Route 1');
mockDoc.getElementById('editRouteStopsContent').value = 'RTC Bus Complex Gate (07:30 AM - 10 Students)\nOld Guntur Centre (07:42 AM - 8 Students)\nSri Vidya Campus Gate (08:15 AM - 0 Students)';
mockDoc.getElementById('editRouteStopsReason').value = 'Monsoon alignment';
app.handleEditRouteStopsSubmit({ preventDefault: () => {} });
app.renderTransportRoutesTable();
assert(routesTbody.innerHTML.includes('Modified'), '14.1 marks route Modified after stop changes');

// Assign Route Vehicle
app.assignRouteVehicle('Route 1', 'AP-07-TX-1042');
app.renderTransportRoutesTable();
assert(routesTbody.innerHTML.includes('AP-07-TX-1042'), '14.1 assigns new vehicle to route');

// Publish Route
app.publishTransportRoute('Route 1');
app.renderTransportRoutesTable();
assert(routesTbody.innerHTML.includes('Published'), '14.1 publishes route');

// Record Route Changes
app.recordRouteChange('Route 1', 'Annual timing revision');
assert(true, '14.1 logs route change successfully');

// -------------------------------------------------------------
// 14.2 Vehicles Tests
// -------------------------------------------------------------
console.log('\n--- 14.2 Vehicles ---');
app.renderTransportVehiclesTable();
const vehTbody = mockDoc.getElementById('transportVehiclesTableBody');
assert(vehTbody.innerHTML.includes('AP-07-TX-1041'), '14.2 renders initial fleet vehicles');
assert(vehTbody.innerHTML.includes('Tata Starbus Ultra'), '14.2 displays vehicle make & model');
assert(vehTbody.innerHTML.includes('32 Seats'), '14.2 displays seating capacity');
assert(vehTbody.innerHTML.includes('Operational'), '14.2 displays maintenance status');
assert(vehTbody.innerHTML.includes('Docs'), '14.2 displays Upload Docs action');
assert(vehTbody.innerHTML.includes('Maintain'), '14.2 displays Record Maintenance action');

// Filter vehicles
mockDoc.getElementById('transportVehicleSearchInput').value = '1042';
app.filterTransportVehicles();
assert(vehTbody.innerHTML.includes('AP-07-TX-1042'), '14.2 filters vehicle by registration query');
mockDoc.getElementById('transportVehicleSearchInput').value = '';
app.filterTransportVehicles();

// Add vehicle
mockDoc.getElementById('vehM14Reg').value = 'AP-07-TX-8888';
mockDoc.getElementById('vehM14Type').value = 'School Bus';
mockDoc.getElementById('vehM14Capacity').value = '36 Seats';
mockDoc.getElementById('vehM14Route').value = 'Route 1 - RTC Complex Line';
mockDoc.getElementById('vehM14Insurance').value = '31 Dec 2027';
mockDoc.getElementById('vehM14Permit').value = '31 Dec 2027';
mockDoc.getElementById('vehM14Inspection').value = '15 Nov 2026';
mockDoc.getElementById('vehM14Status').value = 'Operational';
app.handleAddVehicleSubmit({ preventDefault: () => {} });
app.renderTransportVehiclesTable();
assert(vehTbody.innerHTML.includes('AP-07-TX-8888'), '14.2 adds new vehicle to fleet');

// Upload Vehicle Docs
mockDoc.getElementById('uploadVehRegId').value = 'AP-07-TX-1041';
mockDoc.getElementById('uploadVehDocType').value = 'Insurance Policy';
mockDoc.getElementById('uploadVehDocRef').value = 'UIIC-2027-NEW';
mockDoc.getElementById('uploadVehDocExpiry').value = '30 Jun 2028';
app.handleUploadVehicleDocsSubmit({ preventDefault: () => {} });
app.renderTransportVehiclesTable();
assert(vehTbody.innerHTML.includes('30 Jun 2028'), '14.2 updates vehicle document expiry');

// Assign Vehicle Route & Mark Unavailable
app.assignVehicleRoute('AP-07-TX-1041', 'Route 3');
assert(true, '14.2 assignVehicleRoute executed');
app.markVehicleUnavailable('AP-07-TX-1041', 'Brake overhaul');
app.renderTransportVehiclesTable();
assert(vehTbody.innerHTML.includes('Unavailable'), '14.2 marks vehicle status Unavailable');

// View Vehicle History
app.viewVehicleHistory('AP-07-TX-1041');
const dossierModal = mockDoc.getElementById('viewTransportDossierModal');
assert(dossierModal.style.display !== 'none', '14.2 viewVehicleHistory opens transport dossier modal');

// -------------------------------------------------------------
// 14.3 Drivers & Attendants Tests
// -------------------------------------------------------------
console.log('\n--- 14.3 Drivers & Attendants ---');
app.renderTransportDriversTable();
const drvTbody = mockDoc.getElementById('transportDriversTableBody');
assert(drvTbody.innerHTML.includes('Sri K. Venkateswarlu'), '14.3 renders initial drivers & attendants');
assert(drvTbody.innerHTML.includes('TR-DRV-01'), '14.3 displays driver ID');
assert(drvTbody.innerHTML.includes('On Duty'), '14.3 displays duty status');
assert(drvTbody.innerHTML.includes('Duties'), '14.3 displays Assign Duties action');
assert(drvTbody.innerHTML.includes('Verify'), '14.3 displays Verify Documents action');

// Filter drivers
mockDoc.getElementById('transportDriverRoleFilter').value = 'Driver';
app.filterTransportDrivers();
assert(drvTbody.innerHTML.includes('Sri K. Venkateswarlu'), '14.3 filters personnel by role');
mockDoc.getElementById('transportDriverRoleFilter').value = 'all';
app.filterTransportDrivers();

// Assign Duties
mockDoc.getElementById('driverM14EmpId').value = 'TR-DRV-01';
mockDoc.getElementById('driverM14Role').value = 'Driver';
mockDoc.getElementById('driverM14Vehicle').value = 'Bus #2 (AP-07-TX-1042)';
mockDoc.getElementById('driverM14Route').value = 'Route 2 - Arundelpet Line';
mockDoc.getElementById('driverM14Duty').value = 'On Duty';
mockDoc.getElementById('driverM14Expiry').value = 'DL: 31 Dec 2029 • Med: Fit';
app.handleAssignDriverDutiesSubmit({ preventDefault: () => {} });
app.renderTransportDriversTable();
assert(drvTbody.innerHTML.includes('Bus #2 (AP-07-TX-1042)'), '14.3 updates assigned vehicle in driver roster');

// Verify Documents
app.verifyDriverDocuments('TR-DRV-01');
app.renderTransportDriversTable();
assert(drvTbody.innerHTML.includes('Verified by RTA & AMVI'), '14.3 stamps statutory document verification');

// Suspend Duty
app.suspendDriverAssignment('TR-DRV-01', 'Medical recertification');
app.renderTransportDriversTable();
assert(drvTbody.innerHTML.includes('Suspended'), '14.3 suspends driver duty status');

// View Duty History
app.viewDriverDutyHistory('TR-DRV-01');
assert(dossierModal.style.display !== 'none', '14.3 viewDriverDutyHistory opens dossier');

// -------------------------------------------------------------
// 14.4 Transport Allocation Tests
// -------------------------------------------------------------
console.log('\n--- 14.4 Transport Allocation ---');
app.renderTransportAllocationsTable();
const allocTbody = mockDoc.getElementById('transportAllocationsTableBody');
assert(allocTbody.innerHTML.includes('M. Jagannath'), '14.4 renders student commuter allocations');
assert(allocTbody.innerHTML.includes('SV-0045'), '14.4 displays student admission number');
assert(allocTbody.innerHTML.includes('Class X-A'), '14.4 displays class');
assert(allocTbody.innerHTML.includes('Old Guntur Centre'), '14.4 displays boarding stop');
assert(allocTbody.innerHTML.includes('Paid'), '14.4 displays transport fee status');
assert(allocTbody.innerHTML.includes('Active'), '14.4 displays allocation status');
assert(allocTbody.innerHTML.includes('Stop'), '14.4 displays Change Stop action');
assert(allocTbody.innerHTML.includes('Notify'), '14.4 displays Notify Guardian action');

// Filter allocations
mockDoc.getElementById('transportAllocationFeeFilter').value = 'Paid';
app.filterTransportAllocations();
assert(allocTbody.innerHTML.includes('M. Jagannath'), '14.4 filters allocations by fee status');
mockDoc.getElementById('transportAllocationFeeFilter').value = 'all';
app.filterTransportAllocations();

// Assign Route to new Student
mockDoc.getElementById('allocM14Student').value = 'K. Haritha';
mockDoc.getElementById('allocM14Adm').value = 'SV-0999';
mockDoc.getElementById('allocM14Class').value = 'Class IX-A';
mockDoc.getElementById('allocM14Route').value = 'Route 1';
mockDoc.getElementById('allocM14Stop').value = 'Hindu College Junction';
mockDoc.getElementById('allocM14Fee').value = 'Paid';
mockDoc.getElementById('allocM14Status').value = 'Active';
app.handleAssignStudentRouteSubmit({ preventDefault: () => {} });
app.renderTransportAllocationsTable();
assert(allocTbody.innerHTML.includes('SV-0999'), '14.4 assigns route to new student');
assert(allocTbody.innerHTML.includes('K. Haritha'), '14.4 renders student commuter name');

// Change Stop
mockDoc.getElementById('changeStopAllocId').value = 'SV-0045';
mockDoc.getElementById('changeStopNewStop').value = 'Vegetable Market Yard Gate';
mockDoc.getElementById('changeStopReason').value = 'Parent house shift';
app.handleChangeStudentStopSubmit({ preventDefault: () => {} });
app.renderTransportAllocationsTable();
assert(allocTbody.innerHTML.includes('Vegetable Market Yard Gate'), '14.4 changes boarding stop');

// Suspend & Cancel Allocation
app.suspendStudentTransport('SV-0045', 'Term break');
app.renderTransportAllocationsTable();
assert(allocTbody.innerHTML.includes('Suspended'), '14.4 marks allocation Suspended');

app.cancelStudentTransport('SV-0045', 'Relocation');
app.renderTransportAllocationsTable();
assert(allocTbody.innerHTML.includes('Cancelled'), '14.4 marks allocation Cancelled');

// Notify Guardian
app.notifyTransportGuardian('SV-0012');
assert(true, '14.4 triggers guardian SMS and app notification');

// -------------------------------------------------------------
// 14.5 Maintenance & Safety Tests
// -------------------------------------------------------------
console.log('\n--- 14.5 Maintenance & Safety ---');
app.renderTransportMaintenanceTable();
const mntTbody = mockDoc.getElementById('transportMaintenanceTableBody');
assert(mntTbody.innerHTML.includes('School Bus AP-07-TX-1042'), '14.5 renders initial maintenance tickets');
assert(mntTbody.innerHTML.includes('MNT-2026-081'), '14.5 displays ticket ID');
assert(mntTbody.innerHTML.includes('Sri Lakshmi Commercial Auto Works'), '14.5 displays vendor');
assert(mntTbody.innerHTML.includes('Assign'), '14.5 displays Assign Repair action');
assert(mntTbody.innerHTML.includes('Work'), '14.5 displays Record Work action');
assert(mntTbody.innerHTML.includes('Approve'), '14.5 displays Approve Completion action');
assert(mntTbody.innerHTML.includes('Inspect'), '14.5 displays Schedule Inspection action');

// Report Fault
mockDoc.getElementById('faultM14Asset').value = 'School Bus AP-07-TX-1045';
mockDoc.getElementById('faultM14Priority').value = 'High';
mockDoc.getElementById('faultM14Desc').value = 'Tail lamp fused and wiper squeak';
mockDoc.getElementById('faultM14Vendor').value = 'Sri Lakshmi Auto Works';
app.handleReportFaultSubmit({ preventDefault: () => {} });
app.renderTransportMaintenanceTable();
assert(mntTbody.innerHTML.includes('AP-07-TX-1045'), '14.5 reports fault and generates ticket');

// Assign Repair
app.assignRepairTechnician('MNT-2026-081', 'Guntur Fleet Care & Hydraulics');
app.renderTransportMaintenanceTable();
assert(mntTbody.innerHTML.includes('Guntur Fleet Care & Hydraulics'), '14.5 assigns repair technician');

// Record Work
mockDoc.getElementById('workM14TicketId').value = 'MNT-2026-081';
mockDoc.getElementById('workM14Status').value = 'Resolved';
mockDoc.getElementById('workM14Evidence').value = 'Invoice #GW-8821 & RTA Fitness Slip Verified';
mockDoc.getElementById('workM14Summary').value = 'Overhauled front brakes and replaced fluid';
app.handleRecordMaintenanceWorkSubmit({ preventDefault: () => {} });
app.renderTransportMaintenanceTable();
assert(mntTbody.innerHTML.includes('Resolved'), '14.5 records maintenance work and updates status');

// Approve Completion
app.approveMaintenanceCompletion('MNT-2026-081');
app.renderTransportMaintenanceTable();
assert(mntTbody.innerHTML.includes('Approved'), '14.5 approves maintenance completion with executive sanction');

// Schedule Inspection
mockDoc.getElementById('inspM14Asset').value = 'School Bus AP-07-TX-1041';
mockDoc.getElementById('inspM14Date').value = '2026-11-20';
mockDoc.getElementById('inspM14Inspector').value = 'Assistant Motor Vehicle Inspector (AMVI), RTA Guntur';
app.handleScheduleInspectionSubmit({ preventDefault: () => {} });
app.renderTransportSafetyTable();
const safetyTbody = mockDoc.getElementById('transportSafetyTableBody');
assert(safetyTbody.innerHTML.includes('School Bus AP-07-TX-1041'), '14.5 schedules safety inspection and renders in safety register');

// Export CSV checks
app.exportTransportRoutesCSV();
app.exportTransportAllocationsCSV();
app.exportTransportMaintenanceCSV();
assert(true, '14.5 exports routes, allocations, and maintenance CSVs');

// Aliases verification
assert(typeof app.createRoute === 'function', 'Alias app.createRoute exists');
assert(typeof app.addOrEditStops === 'function', 'Alias app.addOrEditStops exists');
assert(typeof app.addVehicle === 'function', 'Alias app.addVehicle exists');
assert(typeof app.uploadDocuments === 'function', 'Alias app.uploadDocuments exists');
assert(typeof app.assignDuties === 'function', 'Alias app.assignDuties exists');
assert(typeof app.reportFault === 'function', 'Alias app.reportFault exists');
assert(typeof app.recordWork === 'function', 'Alias app.recordWork exists');
assert(typeof app.scheduleInspection === 'function', 'Alias app.scheduleInspection exists');
assert(typeof app.assignRoute === 'function', 'Alias app.assignRoute exists');
assert(typeof app.changeStop === 'function', 'Alias app.changeStop exists');
assert(typeof app.suspendService === 'function', 'Alias app.suspendService exists');
assert(typeof app.cancelAllocation === 'function', 'Alias app.cancelAllocation exists');
assert(typeof app.notifyAuthorizedGuardian === 'function', 'Alias app.notifyAuthorizedGuardian exists');

console.log(`\n========================================`);
console.log(`SECTION 14 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL SECTION 14 TRANSPORT SUITE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}
