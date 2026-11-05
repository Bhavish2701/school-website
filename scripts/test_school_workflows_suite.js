const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('--- RUNNING STATUTORY SCHOOL WORKFLOWS (WORKFLOWS A THROUGH J) TEST SUITE ---');

// 1. Verify Backend Workflows Module
const routesPath = path.resolve(__dirname, '../backend/src/modules/workflows/routes.js');
assert.ok(fs.existsSync(routesPath), 'backend/src/modules/workflows/routes.js must exist');
const { INSTITUTIONAL_WORKFLOWS_REGISTRY } = require(routesPath);

assert.ok(Array.isArray(INSTITUTIONAL_WORKFLOWS_REGISTRY), 'Workflows registry must be an array');
assert.strictEqual(INSTITUTIONAL_WORKFLOWS_REGISTRY.length, 10, 'Must have exactly 10 workflows (A through J)');

const expectedWorkflows = [
  { id: 'WF-A', title: 'New student admission' },
  { id: 'WF-B', title: 'Student attendance' },
  { id: 'WF-C', title: 'Examinations and results' },
  { id: 'WF-D', title: 'Fees' },
  { id: 'WF-E', title: 'Teacher onboarding' },
  { id: 'WF-F', title: 'Staff leave' },
  { id: 'WF-G', title: 'Principal appointment' },
  { id: 'WF-H', title: 'Student transfer' },
  { id: 'WF-I', title: 'Purchase request' },
  { id: 'WF-J', title: 'School announcement' }
];

let totalStepsCount = 0;
expectedWorkflows.forEach(expected => {
  const wf = INSTITUTIONAL_WORKFLOWS_REGISTRY.find(w => w.id === expected.id);
  assert.ok(wf, `Workflow ${expected.id} must exist in registry`);
  assert.ok(wf.steps.length >= 7, `${expected.id} must have at least 7 steps`);
  totalStepsCount += wf.steps.length;

  // Verify mandatory step fields: responsible user, status, timestamps and required next action
  wf.steps.forEach(step => {
    assert.ok(step.stepNo > 0, `Step must have positive stepNo in ${wf.id}`);
    assert.ok(step.name, `Step must have name in ${wf.id}`);
    assert.ok(step.responsibleUser, `Step must have responsibleUser in ${wf.id}`);
    assert.ok(step.responsibleRole, `Step must have responsibleRole in ${wf.id}`);
    assert.ok(step.status, `Step must have status in ${wf.id}`);
    assert.ok(step.timestamp !== undefined, `Step must have timestamp in ${wf.id}`);
    assert.ok(step.nextAction, `Step must have nextAction in ${wf.id}`);
  });
});

console.log(`✓ Backend registry verified: 10 workflows with all ${totalStepsCount} statutory audit steps!`);

// 2. Verify Module Mounting in backend/src/modules/index.js
const moduleIndexPath = path.resolve(__dirname, '../backend/src/modules/index.js');
const moduleIndexContent = fs.readFileSync(moduleIndexPath, 'utf8');
assert.ok(moduleIndexContent.includes('/workflows'), 'backend/src/modules/index.js must mount /workflows route');
console.log('✓ Backend API route mount verified: /api/v1/modules/workflows');

// 3. Verify Frontend UI in frontend/administration-portal/index.html
const htmlPath = path.resolve(__dirname, '../frontend/administration-portal/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
assert.ok(html.includes('subview-tasks-workflows'), 'index.html must have subview-tasks-workflows');
assert.ok(html.includes('institutionalWorkflowModal'), 'index.html must have institutionalWorkflowModal');
assert.ok(html.includes('Core Workflows (A–J)'), 'index.html must have sidebar menu item for Core Workflows');
assert.ok(html.includes('Core Workflows (10 Pipelines)'), 'index.html must have subtab button');
console.log('✓ Frontend subview, modal stepper, and navigation buttons verified in index.html');

// 4. Verify Frontend Controller in frontend/js/portal.js
const jsPath = path.resolve(__dirname, '../frontend/js/portal.js');
const js = fs.readFileSync(jsPath, 'utf8');
assert.ok(js.includes('INSTITUTIONAL_WORKFLOWS_DATA'), 'portal.js must define INSTITUTIONAL_WORKFLOWS_DATA');
assert.ok(js.includes('function renderWorkflowSettingsTable'), 'portal.js must have renderWorkflowSettingsTable');
assert.ok(js.includes('function openWorkflowPipelineModal'), 'portal.js must have openWorkflowPipelineModal');
assert.ok(js.includes('function advanceWorkflowStep'), 'portal.js must have advanceWorkflowStep');
assert.ok(js.includes('renderWorkflowSettingsTable,'), 'portalApp must export renderWorkflowSettingsTable');
assert.ok(js.includes('openWorkflowPipelineModal,'), 'portalApp must export openWorkflowPipelineModal');
assert.ok(js.includes('advanceWorkflowStep,'), 'portalApp must export advanceWorkflowStep');
console.log('✓ Frontend controller functions and portalApp exports verified in portal.js');

// 5. Verify CSS in frontend/css/portal.css
const cssPath = path.resolve(__dirname, '../frontend/css/portal.css');
const css = fs.readFileSync(cssPath, 'utf8');
assert.ok(css.includes('.workflow-step-chain'), 'portal.css must have .workflow-step-chain');
assert.ok(css.includes('.wf-step-node'), 'portal.css must have .wf-step-node');
assert.ok(css.includes('.school-gov-modal'), 'portal.css must have .school-gov-modal');
assert.ok(css.includes('.school-applicant-dossier'), 'portal.css must have .school-applicant-dossier');
console.log('✓ Stepper and institutional modal styles verified in portal.css');

console.log('--- ALL STATUTORY SCHOOL WORKFLOW CHECKS PASSED (100%) ---');
