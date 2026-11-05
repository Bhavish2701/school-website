/**
 * Sri Vidya Educational Trust - Module 10: Subscriptions & Plans Acceptance Test Suite
 * Validates:
 * 1. 10.1 Commercial Plans Directory (Listing, Create, Update, Publish, Archive)
 * 2. 10.2 Institution Subscriptions (Listing, Assign, Renew, Change Plan, Adjustments, Suspend/Cancel)
 * 3. 10.3 Usage, Quotas & Entitlements (Active users, Storage, Enabled modules, Warnings)
 * 4. Section 10.3 Statutory Record Protection & Non-Disruption Invariant Guarantee
 * 5. UI & Template Integrity in platform-admin index.html & platform-admin.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('SRI VIDYA TRUST: MODULE 10 SUBSCRIPTIONS & PLANS ACCEPTANCE SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  [PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${name}`);
      console.error(`         ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${name}`);
      console.error(`         ${err.message}`);
    }
  }

  // 1. Summary KPI
  await asyncTest('GET /api/v1/platform/subscriptions/summary returns aggregate metrics', async () => {
    const res = await request('GET', '/api/v1/platform/subscriptions/summary');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const d = res.body.data;
    assert(typeof d.totalSubscriptions === 'number', 'totalSubscriptions must be number');
    assert(typeof d.activePublishedPlans === 'number', 'activePublishedPlans must be number');
    assert(typeof d.totalActiveStudentsEnrolled === 'number', 'totalActiveStudentsEnrolled must be number');
    assert(typeof d.totalCloudStorageGB === 'number', 'totalCloudStorageGB must be number');
    assert.strictEqual(d.statutoryGuarantee, 'AP_EDU_CODE_ACTIVE_NON_DISRUPTION');
  });

  // 2. 10.1 Commercial Plans Directory Listing
  await asyncTest('GET /api/v1/platform/plans returns populated commercial tiers', async () => {
    const res = await request('GET', '/api/v1/platform/plans');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data), 'Plans must be an array');
    assert(res.body.data.length >= 3, 'Must have at least 3 default plans');

    const core = res.body.data.find(p => p.code === 'SVT-CORE');
    assert(core, 'Must find SVT-CORE plan');
    assert.strictEqual(core.name, 'Trust Foundation License');
    assert(Array.isArray(core.includedFeatures), 'Must have includedFeatures array');
    assert(core.limits?.maxStudents, 'Must specify student limits');
  });

  // 3. 10.1 Create, Update, Archive, Publish Plan
  await asyncTest('POST /api/v1/platform/plans creates a new commercial plan', async () => {
    const res = await request('POST', '/api/v1/platform/plans', {
      planId: 'PLAN-TEST-AI',
      name: 'AI-Enhanced Campus Pilot',
      code: 'SVT-AI',
      description: 'Pilot license for adaptive learning analytics and automated attendance',
      price: 60000,
      billingInterval: 'Termly',
      status: 'Draft',
      limits: { maxStudents: 2000, maxStaff: 200, storageGB: 300, apiRequestsPerDay: 100000 },
      includedFeatures: ['SIS Core', 'Facial Recognition Telemetry', 'Automated Grading Co-Pilot']
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.code, 'SVT-AI');
  });

  await asyncTest('PUT /api/v1/platform/plans/:planId updates plan limits and price', async () => {
    const res = await request('PUT', '/api/v1/platform/plans/PLAN-TEST-AI', {
      price: 65000,
      limits: { maxStudents: 2500 }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.price, 65000);
    assert.strictEqual(res.body.data.limits.maxStudents, 2500);
  });

  await asyncTest('POST /api/v1/platform/plans/:planId/publish updates status to Published', async () => {
    const res = await request('POST', '/api/v1/platform/plans/PLAN-TEST-AI/publish');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Published');
  });

  await asyncTest('POST /api/v1/platform/plans/:planId/archive updates status to Archived', async () => {
    const res = await request('POST', '/api/v1/platform/plans/PLAN-TEST-AI/archive');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Archived');
  });

  // 4. 10.2 Institution Subscriptions Listing
  await asyncTest('GET /api/v1/platform/subscriptions returns all institution contracts', async () => {
    const res = await request('GET', '/api/v1/platform/subscriptions');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data), 'Subscriptions must be an array');
    assert(res.body.data.length >= 3, 'Must have at least 3 institution subscriptions');

    const mainCampus = res.body.data.find(s => s.institutionId === 'INST-001');
    assert(mainCampus, 'Must find Main Campus (INST-001) subscription');
    assert(['SVT-PRO', 'SVT-ENTERPRISE'].includes(mainCampus.planCode), 'Must have valid plan code');
    assert(['Active', 'Renewed'].includes(mainCampus.subscriptionStatus), 'Must have valid subscription status');
    assert(mainCampus.usage?.activeStudents > 0, 'Must record active students usage');
  });

  // 5. 10.2 Renew Subscription
  await asyncTest('POST /api/v1/platform/subscriptions/:id/renew extends contract renewal date', async () => {
    const res = await request('POST', '/api/v1/platform/subscriptions/SUB-2026-001/renew', {
      renewalDate: '2028-03-31T23:59:59Z',
      paymentStatus: 'Paid'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.subscriptionStatus, 'Renewed');
    assert(new Date(res.body.data.renewalDate).getFullYear() >= 2028, 'Renewal year must be >= 2028');
  });

  // 6. 10.2 Change / Migrate Plan
  await asyncTest('POST /api/v1/platform/subscriptions/:id/change-plan migrates institution to Enterprise tier', async () => {
    const res = await request('POST', '/api/v1/platform/subscriptions/SUB-2026-001/change-plan', {
      planId: 'PLAN-SVT-ENT'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.planCode, 'SVT-ENTERPRISE');
    assert.strictEqual(res.body.data.planName, 'Multi-Academy Network Enterprise');
  });

  // 7. 10.2 Record Billing Adjustment
  await asyncTest('POST /api/v1/platform/subscriptions/:id/adjustments records concession with trustee authorization', async () => {
    const res = await request('POST', '/api/v1/platform/subscriptions/SUB-2026-001/adjustments', {
      amount: 10000,
      type: 'CONCESSION',
      reason: 'Special Trust Centenary Concession authorized by Board',
      operator: 'Trustee Sri P. Venkatasubba Rao'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.adjustment.type, 'CONCESSION');
    assert.strictEqual(res.body.adjustment.amount, 10000);
  });

  // 8. 10.2 Suspend with Non-Disruption Guarantee
  await asyncTest('POST /api/v1/platform/subscriptions/:id/status suspends subscription but preserves record access', async () => {
    const res = await request('POST', '/api/v1/platform/subscriptions/SUB-2026-002/status', {
      action: 'Suspend',
      reason: 'Routine contract review milestone pending verification'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.subscriptionStatus, 'Suspended');
    assert(res.body.data.contractualNotes.includes('AP Statutory Invariant'), 'Must explicitly record non-disruption guarantee in contractual notes');
  });

  // 9. 10.3 Usage & Entitlements
  await asyncTest('GET /api/v1/platform/subscriptions/usage/INST-001 returns active quotas and warnings', async () => {
    const res = await request('GET', '/api/v1/platform/subscriptions/usage/INST-001');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.institutionId, 'INST-001');

    const u = res.body.usage;
    assert(u.activeStudents?.used !== undefined, 'Must report activeStudents.used');
    assert(u.storageGB?.used !== undefined, 'Must report storageGB.used');
    assert(Array.isArray(res.body.enabledModules), 'Must report enabledModules list');
    assert(res.body.statutoryNonDisruptionGuarantee?.isProtected === true, 'Statutory non-disruption guarantee must be true');
  });

  // 10. UI & Template Integrity in index.html
  test('frontend/platform-admin/index.html includes 10.1 plans, 10.2 subscriptions, 10.3 usage, and 5 modals', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html'), 'utf8');

    // Section view root
    assert(html.includes('id="view-subscription"'), 'Must have #view-subscription');

    // Sub tabs
    assert(html.includes('id="btnSubTabPlans"'), 'Must have #btnSubTabPlans');
    assert(html.includes('id="btnSubTabSubscriptions"'), 'Must have #btnSubTabSubscriptions');
    assert(html.includes('id="btnSubTabUsage"'), 'Must have #btnSubTabUsage');

    // 10.1 Plans Directory
    assert(html.includes('id="planGridContainer"'), 'Must have #planGridContainer');
    assert(html.includes('id="txtPlanFilterSearch"'), 'Must have #txtPlanFilterSearch');

    // 10.2 Subscriptions Table
    assert(html.includes('id="tblSubscriptionsBody"'), 'Must have #tblSubscriptionsBody');
    assert(html.includes('id="txtSubFilterSearch"'), 'Must have #txtSubFilterSearch');

    // 10.3 Usage & Entitlements
    assert(html.includes('id="selUsageInstitution"'), 'Must have #selUsageInstitution');
    assert(html.includes('id="usageStudentValue"'), 'Must have #usageStudentValue');
    assert(html.includes('id="usageStorageValue"'), 'Must have #usageStorageValue');
    assert(html.includes('id="usageStaffValue"'), 'Must have #usageStaffValue');
    assert(html.includes('id="usageApiValue"'), 'Must have #usageApiValue');
    assert(html.includes('Section 10.3 Statutory Record Protection &amp; Non-Disruption Guarantee'), 'Must display non-disruption guarantee');

    // 5 Modals
    assert(html.includes('id="modalCreateEditPlan"'), 'Must have #modalCreateEditPlan');
    assert(html.includes('id="modalAssignChangePlan"'), 'Must have #modalAssignChangePlan');
    assert(html.includes('id="modalRenewSubscription"'), 'Must have #modalRenewSubscription');
    assert(html.includes('id="modalBillingAdjustment"'), 'Must have #modalBillingAdjustment');
    assert(html.includes('id="modalSuspendCancelSubscription"'), 'Must have #modalSuspendCancelSubscription');
  });

  // 11. Controller exports integrity in platform-admin.js
  test('frontend/js/platform-admin.js exports all Module 10 controller functions', () => {
    const js = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js'), 'utf8');

    const expectedMethods = [
      'loadSubscriptionsData',
      'switchSubscriptionSubTab',
      'filterPlansDirectory',
      'openCreatePlanModal',
      'openEditPlanModal',
      'submitPlanForm',
      'publishPlan',
      'archivePlan',
      'filterSubscriptionsTable',
      'resetSubscriptionFilters',
      'openAssignPlanModal',
      'submitAssignPlan',
      'openChangePlanModal',
      'openRenewModal',
      'submitRenewSubscription',
      'openBillingAdjustmentModal',
      'submitBillingAdjustment',
      'openSuspendCancelModal',
      'submitSuspendCancelSubscription',
      'renderUsageAndEntitlements',
      'exportSubscriptionsCSV'
    ];

    expectedMethods.forEach(method => {
      const regex = new RegExp(`\\b${method}\\b`);
      assert(regex.test(js), `platform-admin.js must export or define ${method}`);
    });
  });

  console.log('\n------------------------------------------------------------------------');
  console.log(`MODULE 10 TEST SUMMARY: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
