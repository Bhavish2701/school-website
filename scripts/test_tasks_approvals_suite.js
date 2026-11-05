const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('TEST SUITE: MODULE 17 - TASKS & APPROVALS SPECIFICATION');
console.log('====================================================\n');

const html = fs.readFileSync('frontend/administration-portal/index.html', 'utf8');
const js = fs.readFileSync('frontend/js/portal.js', 'utf8');

// --------------------------------------------------------------------------
// TEST 1: Subview 17.1 Pending Approvals (Table Headers & All 8 Categories)
// --------------------------------------------------------------------------
console.log('--- Test 1: Verify 17.1 Pending Approvals Table & 8 Request Categories ---');
assert.ok(html.includes('id="tablePendingApprovals"'), 'tablePendingApprovals must exist');

// Table Headers
const pendingTableStart = html.indexOf('id="tablePendingApprovals"');
const pendingTableEnd = html.indexOf('</table>', pendingTableStart);
const pendingTableSnippet = html.substring(pendingTableStart, pendingTableEnd);

assert.ok(pendingTableSnippet.includes('Request ID'), 'Header must contain "Request ID"');
assert.ok(pendingTableSnippet.includes('Module'), 'Header must contain "Module"');
assert.ok(pendingTableSnippet.includes('Requester'), 'Header must contain "Requester"');
assert.ok(pendingTableSnippet.includes('Request Date') || pendingTableSnippet.includes('Request date'), 'Header must contain "Request Date"');
assert.ok(pendingTableSnippet.includes('Priority'), 'Header must contain "Priority"');
assert.ok(pendingTableSnippet.includes('Current Approval Stage') || pendingTableSnippet.includes('Current approval stage'), 'Header must contain "Current Approval Stage"');
assert.ok(pendingTableSnippet.includes('Due Date') || pendingTableSnippet.includes('Due date'), 'Header must contain "Due Date"');
assert.ok(pendingTableSnippet.includes('Actions'), 'Header must contain "Actions"');

// Verify All 8 Categories present in JS data
assert.ok(js.includes('Admission'), 'Must include Admission approvals in tasks pending data');
assert.ok(js.includes('Staff Leave') || js.includes('Leave Request'), 'Must include Leave requests');
assert.ok(js.includes('Marks') || js.includes('Results'), 'Must include Marks or results approvals');
assert.ok(js.includes('Fee Concession') || js.includes('Fee concession'), 'Must include Fee concessions');
assert.ok(js.includes('Refund'), 'Must include Refunds');
assert.ok(js.includes('Purchase'), 'Must include Purchase requests');
assert.ok(js.includes('Student Record Correction') || js.includes('record correction'), 'Must include Student record corrections');
assert.ok(js.includes('Communication') || js.includes('Published communication'), 'Must include Published communication approvals');

console.log('[PASS] Test 1: 17.1 Pending Approvals structure & categories verified');

// --------------------------------------------------------------------------
// TEST 2: Subview 17.2 My Assigned Tasks (Table Headers & Actions)
// --------------------------------------------------------------------------
console.log('\n--- Test 2: Verify 17.2 My Assigned Tasks Table Columns & Action Handlers ---');
assert.ok(html.includes('id="tableAssignedTasks"'), 'tableAssignedTasks must exist');

const assignedTableStart = html.indexOf('id="tableAssignedTasks"');
const assignedTableEnd = html.indexOf('</table>', assignedTableStart);
const assignedTableSnippet = html.substring(assignedTableStart, assignedTableEnd);

assert.ok(assignedTableSnippet.includes('Task'), 'Header must contain "Task"');
assert.ok(assignedTableSnippet.includes('Assigned By') || assignedTableSnippet.includes('Assigned by'), 'Header must contain "Assigned by"');
assert.ok(assignedTableSnippet.includes('Assigned To') || assignedTableSnippet.includes('Assigned to'), 'Header must contain "Assigned to"');
assert.ok(assignedTableSnippet.includes('Due Date') || assignedTableSnippet.includes('Due date'), 'Header must contain "Due date"');
assert.ok(assignedTableSnippet.includes('Priority'), 'Header must contain "Priority"');
assert.ok(assignedTableSnippet.includes('Status'), 'Header must contain "Status"');
assert.ok(assignedTableSnippet.includes('Related Record') || assignedTableSnippet.includes('Related record'), 'Header must contain "Related record"');
assert.ok(assignedTableSnippet.includes('Actions'), 'Header must contain "Actions"');

console.log('[PASS] Test 2: 17.2 My Assigned Tasks table columns verified');

// --------------------------------------------------------------------------
// TEST 3: Subview 17.3 Approval History (Table Columns & Traceability)
// --------------------------------------------------------------------------
console.log('\n--- Test 3: Verify 17.3 Approval History Columns & Traceability Statement ---');
assert.ok(html.includes('id="tableApprovalHistory"'), 'tableApprovalHistory must exist');

const historyTableStart = html.indexOf('id="tableApprovalHistory"');
const historyTableEnd = html.indexOf('</table>', historyTableStart);
const historyTableSnippet = html.substring(historyTableStart, historyTableEnd);

assert.ok(historyTableSnippet.includes('Request'), 'Header must contain "Request"');
assert.ok(historyTableSnippet.includes('Decision'), 'Header must contain "Decision"');
assert.ok(historyTableSnippet.includes('Decision Maker') || historyTableSnippet.includes('Decision maker'), 'Header must contain "Decision maker"');
assert.ok(historyTableSnippet.includes('Timestamp'), 'Header must contain "Timestamp"');
assert.ok(historyTableSnippet.includes('Reason'), 'Header must contain "Reason"');
assert.ok(historyTableSnippet.includes('Previous Stage') || historyTableSnippet.includes('Previous stage'), 'Header must contain "Previous stage"');
assert.ok(historyTableSnippet.includes('Next Stage') || historyTableSnippet.includes('Next stage'), 'Header must contain "Next stage"');

// Traceability statement in index.html
assert.ok(
  html.includes('traceable') || html.includes('disputes'),
  'Approval history section must explicitly document traceability and dispute reduction'
);

console.log('[PASS] Test 3: 17.3 Approval History columns and traceability verified');

// --------------------------------------------------------------------------
// TEST 4: Subview 17.4 Escalations (Table Columns & Policy Compliance)
// --------------------------------------------------------------------------
console.log('\n--- Test 4: Verify 17.4 Escalations Columns & Policy Notice ---');
assert.ok(html.includes('id="tableEscalations"'), 'tableEscalations must exist');

const escTableStart = html.indexOf('id="tableEscalations"');
const escTableEnd = html.indexOf('</table>', escTableStart);
const escTableSnippet = html.substring(escTableStart, escTableEnd);

assert.ok(escTableSnippet.includes('Overdue Request') || escTableSnippet.includes('Overdue request'), 'Header must contain "Overdue request"');
assert.ok(escTableSnippet.includes('Responsible Person') || escTableSnippet.includes('Responsible person'), 'Header must contain "Responsible person"');
assert.ok(escTableSnippet.includes('Time Overdue') || escTableSnippet.includes('Time overdue'), 'Header must contain "Time overdue"');
assert.ok(escTableSnippet.includes('Priority'), 'Header must contain "Priority"');
assert.ok(escTableSnippet.includes('Escalation Level') || escTableSnippet.includes('Escalation level'), 'Header must contain "Escalation level"');
assert.ok(escTableSnippet.includes('Next Action') || escTableSnippet.includes('Next action'), 'Header must contain "Next action"');

// Policy notice statement in index.html
assert.ok(
  html.includes('bypass') || html.includes('defined school policies') || html.includes('policies'),
  'Escalations section must explicitly state school policy adherence without bypassing approval requirements'
);

console.log('[PASS] Test 4: 17.4 Escalations columns and policy adherence verified');

// --------------------------------------------------------------------------
// TEST 5: Action Modals & Controller Handlers in portal.js
// --------------------------------------------------------------------------
console.log('\n--- Test 5: Verify Required Action Functions & Modals in portal.js ---');
// 17.1 Actions
assert.ok(js.includes('function openApprovalDecisionModal('), 'openApprovalDecisionModal must exist');
assert.ok(js.includes('function executeQuickDecision('), 'executeQuickDecision must exist');
assert.ok(js.includes('function openRejectRequestModal(') || js.includes('rejectRequest'), 'Rejection action must exist');
assert.ok(js.includes('function openReturnRequestModal(') || js.includes('returnRequest'), 'Return for correction action must exist');
assert.ok(js.includes('function openReassignRequestModal(') || js.includes('reassignRequest'), 'Reassign action must exist');
assert.ok(js.includes('function openRequestHistoryModal(') || js.includes('viewHistory'), 'View history action must exist');

// 17.2 Actions
assert.ok(js.includes('function startAssignedTask(') || js.includes('startTask'), 'Start task action must exist');
assert.ok(js.includes('function openUpdateTaskProgressModal(') || js.includes('updateProgress'), 'Update progress action must exist');
assert.ok(js.includes('function openAddTaskCommentModal(') || js.includes('addComment'), 'Add comment action must exist');
assert.ok(js.includes('function openAttachTaskEvidenceModal(') || js.includes('attachEvidence'), 'Attach evidence action must exist');
assert.ok(js.includes('function markTaskComplete(') || js.includes('completeTask'), 'Mark complete action must exist');
assert.ok(js.includes('function openRequestTaskExtensionModal(') || js.includes('requestExtension'), 'Request extension action must exist');

console.log('[PASS] Test 5: Action functions and controller handlers verified');

console.log('\n====================================================');
console.log('ALL MODULE 17 TASKS & APPROVALS TESTS PASSED (100%)');
console.log('====================================================\n');
