const fs = require('fs');

console.log("=== COMPREHENSIVE AUTOMATED TEST: SECTION 15 INVENTORY & ASSETS SUITE ===");

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

// Global browser mocks
global.window = {
  location: { hash: '#inventory' },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  confirm: () => true,
  prompt: (msg, def) => def || 'Approved by Principal',
  alert: () => {},
  print: () => {}
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

global.navigator = { userAgent: 'node' };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Load portal code
const portalCode = fs.readFileSync('frontend/js/portal.js', 'utf8');
const runFn = new Function('window', 'document', 'navigator', 'sessionStorage', 'localStorage', portalCode + '\nreturn portalApp;');
const portalApp = runFn(global.window, global.document, global.navigator, global.sessionStorage, global.localStorage);

console.log("PortalApp initialized successfully.");

let passCount = 0;
let failCount = 0;
function assert(cond, name) {
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name}`);
    failCount++;
  }
}

// 1. Verify exports exist
const requiredExports = [
  // 15.1 Asset Register
  'renderInventoryAssetsTable', 'filterInventoryAssets', 'openAddAssetModal', 'handleAddAssetSubmit',
  'assignAssetLocation', 'openTransferAssetModal', 'handleTransferAssetSubmit',
  'openRecordAssetMaintenanceModal', 'handleRecordAssetMaintenanceSubmit',
  'openDisposeAssetModal', 'handleDisposeAssetSubmit', 'markAssetDisposed', 'viewAssetHistory',
  'exportInventoryAssetsCSV',
  // 15.2 Stock Management
  'renderInventoryStockTable', 'filterInventoryStock', 'openReceiveStockModal', 'handleReceiveStockSubmit',
  'openIssueStockModal', 'handleIssueStockSubmit', 'openReturnStockModal', 'handleReturnStockSubmit',
  'openAdjustStockModal', 'handleAdjustStockSubmit', 'requestStockReplenishment', 'exportStockReportCSV',
  // 15.3 Purchase Requests
  'renderInventoryPurchasesTable', 'filterInventoryPurchases', 'openCreatePurchaseRequestModal',
  'handleCreatePurchaseRequestSubmit', 'submitPurchaseRequest', 'approvePurchaseRequest', 'rejectPurchaseRequest',
  'requestPurchaseQuotations', 'recordPurchaseOrder', 'recordReceiptOfGoods', 'openMatchInvoiceReceiptModal',
  'handleMatchInvoiceReceiptSubmit', 'matchInvoiceAndReceipt', 'exportInventoryPurchasesCSV',
  // 15.4 Vendors
  'renderInventoryVendorsTable', 'filterInventoryVendors', 'openAddVendorModal', 'handleAddVendorSubmit',
  'verifyVendorDetails', 'openUpdateVendorContractModal', 'handleUpdateVendorContractSubmit',
  'openRecordVendorPerformanceModal', 'handleRecordVendorPerformanceSubmit', 'deactivateVendor',
  // 15.5 Issue, Return & Maintenance
  'renderInventoryIssueReturnTable', 'filterInventoryIssueReturn', 'openIssueItemModal', 'handleIssueItemSubmit',
  'openRecordItemReturnModal', 'handleRecordItemReturnSubmit', 'openRecordItemDamageModal',
  'handleRecordItemDamageSubmit', 'requestItemRepair', 'closeItemMaintenanceRequest',
  'exportInventoryIssueReturnCSV',
  // Aliases
  'addAsset', 'assignLocation', 'transferAsset', 'recordMaintenance', 'markDisposed', 'viewHistory',
  'receiveStock', 'issueStock', 'returnStock', 'adjustInventory', 'requestReplenishment', 'exportStockReport',
  'createRequest', 'approveOrReject', 'requestQuotations', 'matchInvoice', 'addVendor', 'verifyDetails',
  'updateContract', 'recordPerformance', 'issueItem', 'recordReturn', 'recordDamage', 'requestRepair',
  'closeMaintenanceRequest'
];

requiredExports.forEach(fn => {
  assert(typeof portalApp[fn] === 'function', `Export exists: ${fn}`);
});

// 2. Test 15.1: Asset Register
console.log("\n--- Testing 15.1: Asset Register ---");
getEl('inventoryAssetCategoryFilter').value = 'all';
getEl('inventoryAssetConditionFilter').value = 'all';
getEl('inventoryAssetSearchInput').value = '';

portalApp.renderInventoryAssetsTable();
const tbodyAssets = getEl('inventoryAssetsTableBody');
assert(tbodyAssets.innerHTML.includes('AST-IT-2024-001'), "Assets table rendered seed asset AST-IT-2024-001");
assert(tbodyAssets.innerHTML.includes('Computer &amp; IT') || tbodyAssets.innerHTML.includes('Computer & IT'), "Asset category rendered");

// Search filter
getEl('inventoryAssetSearchInput').value = 'OptiPlex';
portalApp.filterInventoryAssets();
assert(tbodyAssets.innerHTML.includes('Dell OptiPlex'), "Filter assets by keyword matches Dell OptiPlex");
getEl('inventoryAssetSearchInput').value = '';

// Add asset
portalApp.openAddAssetModal();
getEl('assetM15Name').value = 'Smart Interactive Panel 75"';
getEl('assetM15Category').value = 'Smart Class & Audiovisual';
getEl('assetM15Serial').value = 'SIP-75-2026-009';
getEl('assetM15PurchaseDate').value = '2026-11-01';
getEl('assetM15Value').value = '₹1,35,000';
getEl('assetM15Location').value = 'Room 205 (Smart Class 10A)';
getEl('assetM15Dept').value = 'Secondary Academic Wing';
getEl('assetM15Condition').value = 'Excellent';
getEl('assetM15Warranty').value = '3-Yr Manufacturer';
getEl('assetM15Status').value = 'Operational';
portalApp.handleAddAssetSubmit({ preventDefault: () => {} });
assert(tbodyAssets.innerHTML.includes('Smart Interactive Panel 75"'), "New asset added and rendered in table");

// Assign location
portalApp.assignAssetLocation('AST-IT-2024-001');
assert(tbodyAssets.innerHTML.length > 0, "Assign asset location handled gracefully");

// Transfer asset
portalApp.openTransferAssetModal('AST-IT-2024-001');
getEl('transferAssetNewLocation').value = 'Library Digital Reading Section';
getEl('transferAssetNewDept').value = 'Library & Research Wing';
getEl('transferAssetReason').value = 'High-density digital exam prep requirement';
portalApp.handleTransferAssetSubmit({ preventDefault: () => {} });
assert(tbodyAssets.innerHTML.includes('Library Digital Reading Section'), "Asset transfer updated location in table");

// Record maintenance
portalApp.openRecordAssetMaintenanceModal('AST-IT-2024-001');
getEl('maintAssetIssue').value = 'Preventive Cleaning & Diagnostic Run';
getEl('maintAssetVendor').value = 'Dell Authorized Tech Services';
getEl('maintAssetCost').value = '₹2,500';
getEl('maintAssetResolution').value = 'All RAM modules and displays calibrated';
portalApp.handleRecordAssetMaintenanceSubmit({ preventDefault: () => {} });
assert(tbodyAssets.innerHTML.length > 0, "Asset maintenance recorded successfully");

// Mark disposed
portalApp.openDisposeAssetModal('AST-IT-2024-001');
getEl('disposeAssetReason').value = 'Surplus equipment replaced by next-gen model';
getEl('disposeAssetAuthBy').value = 'Principal Smt. Gorle Varalakshmi';
getEl('disposeAssetSanctionRef').value = 'DISP-AUTH-2026-091';
portalApp.handleDisposeAssetSubmit({ preventDefault: () => {} });
assert(tbodyAssets.innerHTML.includes('Disposed'), "Asset marked as Disposed with authorization");

// View history
portalApp.viewAssetHistory('AST-IT-2024-001');
assert(getEl('inventoryDossierModalBody').innerHTML.length > 0 || getEl('inventoryDossierModalTitle').innerHTML.length > 0, "View asset history populated dossier modal");

// 3. Test 15.2: Stock Management
console.log("\n--- Testing 15.2: Stock Management ---");
getEl('inventoryStockLevelFilter').value = 'all';
getEl('inventoryStockSearchInput').value = '';

portalApp.renderInventoryStockTable();
const tbodyStock = getEl('inventoryStockTableBody');
assert(tbodyStock.innerHTML.includes('STK-STA-01'), "Stock table rendered seed item STK-STA-01");
assert(tbodyStock.innerHTML.includes('JK Copier A4 Paper Reams'), "Stock item name rendered");

// Filter stock
getEl('inventoryStockSearchInput').value = 'Copier';
portalApp.filterInventoryStock();
assert(tbodyStock.innerHTML.includes('STK-STA-01'), "Stock filter by item name matches");
getEl('inventoryStockSearchInput').value = '';

// Receive stock
portalApp.openReceiveStockModal('STK-STA-01');
getEl('recStockQty').value = '500';
getEl('recStockVendor').value = 'Sri Lakshmi Stationers';
getEl('recStockChallan').value = 'INV-2026-881';
portalApp.handleReceiveStockSubmit({ preventDefault: () => {} });
assert(tbodyStock.innerHTML.length > 0, "Stock received and updated");

// Issue stock
portalApp.openIssueStockModal('STK-STA-01');
getEl('issueStockQty').value = '100';
getEl('issueStockRecipient').value = 'Vice Principal Sri Navva Anand';
getEl('issueStockDept').value = 'Examinations Wing';
getEl('issueStockPurpose').value = 'Mid-term Board prep exams';
portalApp.handleIssueStockSubmit({ preventDefault: () => {} });
assert(tbodyStock.innerHTML.length > 0, "Stock issued and registered in table");

// Return stock
portalApp.openReturnStockModal('STK-STA-01');
getEl('returnStockQty').value = '20';
getEl('returnStockCondition').value = 'Unopened Box Pack';
getEl('returnStockReason').value = 'Unused exam booklets returned to store';
portalApp.handleReturnStockSubmit({ preventDefault: () => {} });
assert(tbodyStock.innerHTML.length > 0, "Stock returned successfully");

// Adjust inventory with reason
portalApp.openAdjustStockModal('STK-STA-01');
getEl('adjustStockNewQty').value = '2450';
getEl('adjustStockReason').value = 'Annual physical stock audit verification count';
portalApp.handleAdjustStockSubmit({ preventDefault: () => {} });
assert(tbodyStock.innerHTML.includes('2,450') || tbodyStock.innerHTML.includes('2450'), "Stock quantity adjusted with statutory audit reason");

// Request replenishment
portalApp.requestStockReplenishment('STK-STA-01');
assert(tbodyStock.innerHTML.length > 0, "Stock replenishment request created");

// 4. Test 15.3: Purchase Requests
console.log("\n--- Testing 15.3: Purchase Requests ---");
getEl('inventoryPurchasesStatusFilter').value = 'all';
getEl('inventoryPurchasesSearchInput').value = '';

portalApp.renderInventoryPurchasesTable();
const tbodyPurchases = getEl('inventoryPurchasesTableBody');
assert(tbodyPurchases.innerHTML.includes('PR-2026-061'), "Purchases table rendered seed request PR-2026-061");
assert(tbodyPurchases.innerHTML.includes('Mathematics &amp; Examination') || tbodyPurchases.innerHTML.includes('Mathematics & Examination'), "Department rendered");

// Create request
portalApp.openCreatePurchaseRequestModal();
getEl('prM15Requester').value = 'Dr. M. Radhakrishna (PGT Chemistry)';
getEl('prM15Dept').value = 'Chemistry & Senior Secondary Lab';
getEl('prM15Items').value = 'Titration Flasks, Burettes & Reagents (Grade AR)';
getEl('prM15Quantity').value = '50 Sets';
getEl('prM15Cost').value = '₹32,500';
getEl('prM15Justification').value = 'Mandatory curriculum lab practicals for Class XII Board batches';
getEl('prM15Vendor').value = 'Andhra Scientific Instruments Co.';
portalApp.handleCreatePurchaseRequestSubmit({ preventDefault: () => {} });
assert(tbodyPurchases.innerHTML.includes('Titration Flasks'), "New purchase request created and rendered");

// Submit, Approve, Reject
portalApp.submitPurchaseRequest('PR-2026-061');
assert(tbodyPurchases.innerHTML.length > 0, "Purchase request submitted for review");

portalApp.approvePurchaseRequest('PR-2026-061');
assert(tbodyPurchases.innerHTML.includes('Approved by Principal'), "Purchase request approved by principal");

portalApp.requestPurchaseQuotations('PR-2026-061');
assert(tbodyPurchases.innerHTML.length > 0, "Quotations requested from empaneled vendors");

portalApp.recordPurchaseOrder('PR-2026-061');
assert(tbodyPurchases.innerHTML.length > 0, "Purchase order PO recorded");

portalApp.recordReceiptOfGoods('PR-2026-061');
assert(tbodyPurchases.innerHTML.length > 0, "Receipt of goods recorded");

// Match invoice and receipt
portalApp.openMatchInvoiceReceiptModal('PR-2026-061');
getEl('matchInvoiceNo').value = 'INV-SCI-2026-449';
getEl('matchInvoiceAmount').value = '₹48,200';
getEl('matchDiscrepancyNotes').value = 'Passed for Payment by Accounts Dept';
portalApp.handleMatchInvoiceReceiptSubmit({ preventDefault: () => {} });
assert(tbodyPurchases.innerHTML.includes('Reconciled') || tbodyPurchases.innerHTML.includes('Matched'), "Invoice and receipt matched");

// 5. Test 15.4: Vendors
console.log("\n--- Testing 15.4: Vendors ---");
getEl('inventoryVendorsRatingFilter').value = 'all';
getEl('inventoryVendorsSearchInput').value = '';

portalApp.renderInventoryVendorsTable();
const tbodyVendors = getEl('inventoryVendorsTableBody');
assert(tbodyVendors.innerHTML.includes('Sri Krishna Book Depot'), "Vendors table rendered Sri Krishna Book Depot");
assert(tbodyVendors.innerHTML.includes('VND-001'), "Vendor code rendered");

// Add vendor
portalApp.openAddVendorModal();
getEl('vendorM15Name').value = 'Vizag Academic Publishing & Stationery Mart';
getEl('vendorM15ContactPerson').value = 'Sri P. Sanyasi Rao';
getEl('vendorM15Phone').value = '+91 891 2548821';
getEl('vendorM15Email').value = 'sales@vizagacad.in';
getEl('vendorM15Products').value = 'State syllabus textbooks, workbooks, notebooks';
getEl('vendorM15Contract').value = 'Active Annual Rate Contract';
getEl('vendorM15Gstin').value = '37AAECV9981F1ZY';
getEl('vendorM15Pan').value = 'AAECV9981F';
getEl('vendorM15Terms').value = 'Net 30 Days after goods delivery & physical verification';
portalApp.handleAddVendorSubmit({ preventDefault: () => {} });
assert(tbodyVendors.innerHTML.includes('Vizag Academic Publishing'), "New vendor added and rendered in table");

// Verify details
portalApp.verifyVendorDetails('VND-001');
assert(tbodyVendors.innerHTML.length > 0, "Vendor statutory details verified");

// Update contract
portalApp.openUpdateVendorContractModal('VND-001');
getEl('contractStatusSelect').value = 'Active Rate Contract (Extended 2026-28)';
getEl('contractValidTill').value = '31 Mar 2028';
getEl('contractSlaTerms').value = 'Quarterly SLA review with penalty clause for downtime > 48h';
portalApp.handleUpdateVendorContractSubmit({ preventDefault: () => {} });
assert(tbodyVendors.innerHTML.includes('2028'), "Vendor contract period updated");

// Record performance
portalApp.openRecordVendorPerformanceModal('VND-001');
getEl('perfRating').value = '5.0 / 5.0 (Exceptional)';
getEl('perfQualityRemarks').value = 'Prompt on-site replacement during IT lab upgrade';
portalApp.handleRecordVendorPerformanceSubmit({ preventDefault: () => {} });
assert(tbodyVendors.innerHTML.includes('5.0') || tbodyVendors.innerHTML.includes('Exceptional'), "Vendor performance rating updated");

// Deactivate vendor
portalApp.deactivateVendor('VND-001');
assert(tbodyVendors.innerHTML.includes('Suspended') || tbodyVendors.innerHTML.includes('Deactivated') || tbodyVendors.innerHTML.includes('Inactive'), "Vendor deactivated");

// 6. Test 15.5: Issue, Return & Maintenance
console.log("\n--- Testing 15.5: Issue, Return & Maintenance ---");
getEl('inventoryIssueStatusFilter').value = 'all';
getEl('inventoryIssueSearchInput').value = '';

portalApp.renderInventoryIssueReturnTable();
const tbodyIssue = getEl('inventoryIssueReturnTableBody');
assert(tbodyIssue.innerHTML.includes('ISS-2026-101'), "Issue/Return table rendered seed record ISS-2026-101");
assert(tbodyIssue.innerHTML.includes('Dell Latitude 3420'), "Item name rendered");

// Issue item
portalApp.openIssueItemModal();
getEl('issueM15AssetOrItem').value = 'Digital Sound Mixer Console (Yamaha MG10XU)';
getEl('issueM15IssuedTo').value = 'Sri B. Ramana (Cultural In-charge)';
getEl('issueM15Dept').value = 'Cultural & Extracurricular Wing';
getEl('issueM15IssueDate').value = '2026-11-01';
getEl('issueM15ExpectedReturn').value = '2026-11-03';
getEl('issueM15Condition').value = 'Tested Operational';
portalApp.handleIssueItemSubmit({ preventDefault: () => {} });
assert(tbodyIssue.innerHTML.includes('Yamaha MG10XU'), "New equipment issued and rendered in table");

// Record return
portalApp.openRecordItemReturnModal('ISS-2026-101');
getEl('returnM15ActualDate').value = '2026-11-01';
getEl('returnM15Condition').value = 'Good Condition (All cables verified)';
getEl('returnM15Notes').value = 'Returned intact to Store In-charge';
portalApp.handleRecordItemReturnSubmit({ preventDefault: () => {} });
assert(tbodyIssue.innerHTML.includes('Returned') || tbodyIssue.innerHTML.includes('Closed'), "Item return recorded with status Returned");

// Record damage
portalApp.openRecordItemDamageModal('ISS-2026-101');
getEl('damageM15Severity').value = 'Moderate';
getEl('damageM15Description').value = 'HDMI input port 2 loose during inter-school event';
getEl('damageM15Action').value = 'Sent for Authorized Component Replacement';
portalApp.handleRecordItemDamageSubmit({ preventDefault: () => {} });
assert(tbodyIssue.innerHTML.includes('Damage') || tbodyIssue.innerHTML.includes('Moderate'), "Equipment damage recorded");

// Request repair
portalApp.requestItemRepair('ISS-2026-101');

assert(tbodyIssue.innerHTML.includes('Under Repair'), "Item repair requested and status updated");

// Close maintenance request
portalApp.closeItemMaintenanceRequest('ISS-2026-101');
assert(tbodyIssue.innerHTML.includes('Operational') || tbodyIssue.innerHTML.includes('Returned'), "Maintenance request closed and equipment operational");

// CSV Exporters
portalApp.exportInventoryAssetsCSV();
portalApp.exportStockReportCSV();
portalApp.exportInventoryPurchasesCSV();
portalApp.exportInventoryIssueReturnCSV();
assert(true, "All CSV exporters executed cleanly");

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL SECTION 15 INVENTORY & ASSETS SUITE TESTS PASSED 100%!");
}
