/**
 * test_platform_policies_suite.js
 * Acceptance test suite for Module 17: Platform Policies & Data Retention
 * Sri Vidya Educational Trust Platform Administration
 *
 * Verifies:
 * 17.1 Policy Register (8 Categories, lifecycle, audit logging)
 * 17.2 Data Retention Configuration (Statutory Granular Invariant, Permanent Records, Versions, Review Lifecycle)
 * 17.3 Data Requests & Governance Safeguards (5 Request Types, Controlled Deletion Dual Signoff Invariant)
 * HTML structure, CSS rules, and JavaScript public interfaces
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: null, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('  MODULE 17: PLATFORM POLICIES & DATA RETENTION SUITE');
  console.log('=============================================================\n');

  try {
    // -------------------------------------------------------------
    // Test Group 1: 17.1 Policy Register
    // -------------------------------------------------------------
    console.log('--- Test Group 1: 17.1 Policy Register ---');
    const resPolList = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies',
      method: 'GET'
    });

    assert(resPolList.status === 200, 'GET /api/v1/platform/policies returns 200 OK');
    assert(resPolList.data.success === true, 'Response indicates success = true');
    const policies = resPolList.data.data;
    assert(Array.isArray(policies) && policies.length >= 8, `Policy register has ${policies.length} items (expected at least 8)`);

    // Verify all 8 categories are represented
    const categoriesFound = new Set(policies.map(p => p.category));
    const expectedCategories = [
      'ACCOUNT_SECURITY',
      'DATA_ACCESS',
      'DATA_RETENTION',
      'DOCUMENT_STORAGE',
      'BACKUP_RETENTION',
      'AUDIT_LOGGING',
      'DATA_EXPORTS',
      'INCIDENT_RESPONSE'
    ];

    expectedCategories.forEach(cat => {
      assert(categoriesFound.has(cat), `Policy register contains category '${cat}'`);
    });

    // Check specific policy attributes
    const secPolicy = policies.find(p => p.category === 'ACCOUNT_SECURITY');
    assert(!!secPolicy.policyId, 'Policy has unique policyId');
    assert(!!secPolicy.name, 'Policy has name');
    assert(!!secPolicy.version, 'Policy has version identifier');
    assert(!!secPolicy.effectiveDate, 'Policy has effective date');
    assert(!!secPolicy.owner, 'Policy has owner specification');
    assert(!!secPolicy.approvalStatus, 'Policy has approval status');
    assert(!!secPolicy.reviewDate, 'Policy has review date');

    // Test Create Policy
    const testPolId = `POL-TEST-${Date.now().toString().slice(-4)}`;
    const resCreatePol = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/register',
      method: 'POST'
    }, {
      policyId: testPolId,
      name: 'Test Mobile Device Management Governance Policy',
      category: 'ACCOUNT_SECURITY',
      version: 'v1.0',
      owner: 'IT Governance Council',
      approvalStatus: 'DRAFT',
      scopeDescription: 'All handheld devices utilized by school bus coordinators and biometric desks.',
      contentSummary: 'Enforces full remote wipe capability and Knox device security.'
    });

    assert(resCreatePol.status === 201, 'POST /api/v1/platform/policies/register returns 201 Created');
    assert(resCreatePol.data.success === true, 'Policy creation succeeds');

    // Test Get Policy by ID
    const resGetPol = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/register/${testPolId}`,
      method: 'GET'
    });
    assert(resGetPol.status === 200, `GET /api/v1/platform/policies/register/${testPolId} returns 200 OK`);
    assert(resGetPol.data.data.name === 'Test Mobile Device Management Governance Policy', 'Retrieved policy matches creation');

    // Test Update Policy
    const resUpdatePol = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/register/${testPolId}`,
      method: 'PUT'
    }, {
      approvalStatus: 'APPROVED'
    });
    assert(resUpdatePol.status === 200, 'PUT /api/v1/platform/policies/register/:id updates policy');
    assert(resUpdatePol.data.data.approvalStatus === 'APPROVED', 'Policy status updated to APPROVED');

    // -------------------------------------------------------------
    // Test Group 2: 17.2 Data Retention Configuration & Non-Universal Invariant
    // -------------------------------------------------------------
    console.log('\n--- Test Group 2: 17.2 Data Retention Configuration & Statutory Invariant ---');
    const resRetList = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/retention',
      method: 'GET'
    });

    assert(resRetList.status === 200, 'GET /api/v1/platform/policies/retention returns 200 OK');
    assert(resRetList.data.success === true, 'Response indicates success = true');
    const retentionRules = resRetList.data.data;
    assert(Array.isArray(retentionRules) && retentionRules.length >= 7, `Retention rules count is ${retentionRules.length} (expected at least 7)`);

    // Verify statutory permanent preservation for Admission General Register (Rule 88)
    const admRule = retentionRules.find(r => r.recordCategory.includes('Admission General Register'));
    assert(!!admRule, 'Statutory Student Admission General Register exists');
    assert(admRule.retentionYears === -1, 'Admission General Register retention is Permanent (-1 years)');
    assert(admRule.isStatutoryPermanent === true, 'Admission General Register is flagged isStatutoryPermanent = true');
    assert(admRule.legalBasis.includes('Rule 88') || admRule.legalBasis.includes('Education Act'), 'Governing legal basis cites AP Education Code');

    // Verify statutory permanent preservation for TC Counterfoils (Rule 99)
    const tcRule = retentionRules.find(r => r.recordCategory.includes('Transfer Certificate'));
    assert(!!tcRule, 'Transfer Certificate Appendix 16 Docket exists');
    assert(tcRule.retentionYears === -1, 'TC Appendix 16 Docket retention is Permanent (-1 years)');
    assert(tcRule.isStatutoryPermanent === true, 'TC Docket is flagged isStatutoryPermanent = true');

    // Verify 7-year fiscal audit retention
    const finRule = retentionRules.find(r => r.recordCategory.includes('Fee Day Books'));
    assert(!!finRule, 'Fee Day Books & Audit Vouchers retention rule exists');
    assert(finRule.retentionYears === 7, 'Financial vouchers retention is 7 years under Companies / Income Tax Act');

    // Verify 3-year rolling attendance retention
    const attRule = retentionRules.find(r => r.recordCategory.includes('Attendance'));
    assert(!!attRule, 'Biometric attendance retention rule exists');
    assert(attRule.retentionYears === 3, 'Biometric attendance retention is 3 rolling academic years');

    // Verify Section 17.2 Invariant: Universal deletion period is strictly blocked
    console.log('Testing Section 17.2 Invariant: Universal deletion attempts must be blocked...');
    const resUniversalAttempt = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/retention/draft',
      method: 'POST'
    }, {
      recordCategory: 'UNIVERSAL',
      retentionYears: 3,
      retentionRule: 'Universal 3-Year Purge for All Platform Records',
      legalBasis: 'Attempted Universal Overwrite',
      isUniversalAttempt: true
    });

    assert(resUniversalAttempt.status === 422 || resUniversalAttempt.status === 400, 'Universal retention attempt rejected with error status');
    assert(resUniversalAttempt.data.statutoryInvariantBlocked === true, 'Response flags statutoryInvariantBlocked = true');
    assert(resUniversalAttempt.data.message.includes('Universal deletion periods are strictly forbidden'), 'Error message cites statutory invariant against universal deletion');

    // Verify Section 17.2 Invariant: Cannot assign temporary retention to Statutory Permanent record
    console.log('Testing Statutory Permanent record protection...');
    const resPermanentTamper = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/retention/draft',
      method: 'POST'
    }, {
      recordCategory: 'Student Master Admission General Register',
      retentionYears: 5,
      retentionRule: 'Temporary 5-Year Deletion for Admission Book',
      legalBasis: 'Illegal Deletion Attempt'
    });

    assert(resPermanentTamper.status === 422 || resPermanentTamper.status === 400, 'Attempt to assign temporary retention to Admission Register rejected');
    assert(resPermanentTamper.data.message.includes('Permanent under the Andhra Pradesh Education Act'), 'Error explains statutory permanent requirement');

    // Test Valid Retention Draft & Multi-Stage Lifecycle
    const testRuleId = `RET-TST-${Date.now().toString().slice(-4)}`;
    const resCreateDraft = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/retention/draft',
      method: 'POST'
    }, {
      ruleId: testRuleId,
      recordCategory: 'School Laboratory Chemical Hazardous Waste Logbook',
      applicableInstitution: 'ALL',
      retentionRule: '5 Calendar Years Post Inspection',
      retentionYears: 5,
      legalBasis: 'State Pollution Control Board School Safety Guidelines',
      changeSummary: 'New chemical registry retention draft'
    });

    assert(resCreateDraft.status === 201, 'POST /api/v1/platform/policies/retention/draft returns 201 Created');
    assert(resCreateDraft.data.data.reviewStatus === 'DRAFT', 'Draft created in DRAFT status');

    // Lifecycle Step 1: Submit for Review
    const resSubmitRev = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/retention/${testRuleId}/submit-review`,
      method: 'POST'
    });
    assert(resSubmitRev.status === 200, 'Submit for review returns 200 OK');
    assert(resSubmitRev.data.data.reviewStatus === 'UNDER_REVIEW', 'Status progressed to UNDER_REVIEW');

    // Lifecycle Step 2: Approve
    const resApproveRule = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/retention/${testRuleId}/approve`,
      method: 'POST'
    }, {
      approvedBy: 'State Board of Education & Trust Legal Directorate'
    });
    assert(resApproveRule.status === 200, 'Approve rule returns 200 OK');
    assert(resApproveRule.data.data.reviewStatus === 'APPROVED', 'Status progressed to APPROVED');

    // Lifecycle Step 3: Publish
    const resPublishRule = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/retention/${testRuleId}/publish`,
      method: 'POST'
    });
    assert(resPublishRule.status === 200, 'Publish rule returns 200 OK');
    assert(resPublishRule.data.data.reviewStatus === 'PUBLISHED', 'Status progressed to PUBLISHED');

    // Versions history check
    const resVersions = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/retention/${testRuleId}/versions`,
      method: 'GET'
    });
    assert(resVersions.status === 200, 'GET versions returns 200 OK');
    assert(Array.isArray(resVersions.data.versions) && resVersions.data.versions.length >= 1, 'Versions history contains initial version');

    // -------------------------------------------------------------
    // Test Group 3: 17.3 Data Requests & Governance Safeguards
    // -------------------------------------------------------------
    console.log('\n--- Test Group 3: 17.3 Data Requests & Controlled Deletion Governance ---');
    const resReqList = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/requests',
      method: 'GET'
    });

    assert(resReqList.status === 200, 'GET /api/v1/platform/policies/requests returns 200 OK');
    assert(resReqList.data.success === true, 'Response indicates success = true');
    const requests = resReqList.data.data;
    assert(Array.isArray(requests) && requests.length >= 5, `Data requests count is ${requests.length} (expected at least 5)`);

    // Verify all 5 request types are represented
    const reqTypes = new Set(requests.map(r => r.requestType));
    const expectedTypes = [
      'RECORD_ACCESS',
      'DATA_CORRECTION',
      'DATA_EXPORT',
      'RETENTION_EXCEPTION',
      'DELETION_ANONYMIZATION'
    ];
    expectedTypes.forEach(t => {
      assert(reqTypes.has(t), `Data requests contains request type '${t}'`);
    });

    // Test Create New Data Request
    const testReqId = `REQ-TST-${Date.now().toString().slice(-4)}`;
    const resCreateReq = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/requests',
      method: 'POST'
    }, {
      requestId: testReqId,
      requestType: 'DATA_EXPORT',
      institutionScope: 'Sri Vidya High School, Hyderabad (Main Campus)',
      requesterName: 'B. Jagadeesh Chandra',
      requesterRole: 'District Educational Inspector',
      requesterEmail: 'deo.inspector@telangana.gov.in',
      targetSubject: '2025 Caste & Category Scholarship Disbursement Roster',
      businessJustification: 'Statutory government social welfare audit and scholarship subsidy reconciliation.'
    });

    assert(resCreateReq.status === 201, 'POST /api/v1/platform/policies/requests returns 201 Created');
    assert(resCreateReq.data.data.status === 'SUBMITTED', 'New request created in SUBMITTED status');

    // Test Approval & Signoff
    const resSignoff1 = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testReqId}/approve`,
      method: 'POST'
    }, {
      signoffBy: 'Dr. K. Srinivas Rao',
      role: 'School Principal',
      notes: 'Verified official DEO requisition letter #DEO-8849/2026.'
    });
    assert(resSignoff1.status === 200, 'Approve/Signoff endpoint returns 200 OK');
    assert(resSignoff1.data.data.authorizedSignoffs.length === 1, 'Signoff recorded in authorizedSignoffs');

    // Test Fulfill Request
    const resFulfill = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testReqId}/fulfill`,
      method: 'POST'
    }, {
      fulfillmentDetails: 'Encrypted scholarship roster transmitted to DEO secure portal.'
    });
    assert(resFulfill.status === 200, 'Fulfill endpoint returns 200 OK');
    assert(resFulfill.data.data.status === 'FULFILLED', 'Status updated to FULFILLED');
    assert(!!resFulfill.data.data.fulfilledAt, 'Fulfillment timestamp recorded');

    // Test Controlled Deletion Invariant (Section 17.3)
    console.log('Testing Section 17.3 Invariant: Lone operator cannot delete school records...');
    const testDelId = `REQ-DEL-${Date.now().toString().slice(-4)}`;
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/requests',
      method: 'POST'
    }, {
      requestId: testDelId,
      requestType: 'DELETION_ANONYMIZATION',
      institutionScope: 'Sri Vidya Academy, Secunderabad',
      requesterName: 'Local Administrative Assistant',
      requesterRole: 'Clerical Staff',
      requesterEmail: 'clerk@srividya.edu.in',
      targetSubject: 'Inactive Student Visitor Passes 2021',
      businessJustification: 'Routine cleanup of expired visitor entry logs.'
    });

    // Attempting fulfillment without dual signoff MUST fail
    const resUnilateralFulfill = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testDelId}/fulfill`,
      method: 'POST'
    }, {
      fulfillmentDetails: 'Operator attempt to purge records unilaterally'
    });

    assert(resUnilateralFulfill.status === 403, 'Unilateral operator deletion rejected with 403 Forbidden');
    assert(resUnilateralFulfill.data.governanceSafeguardBlocked === true, 'Response flags governanceSafeguardBlocked = true');
    assert(resUnilateralFulfill.data.message.includes('Platform operators cannot unilaterally delete'), 'Error explains dual signoff mandate');

    // Attempting deletion of statutory permanent records MUST fail even if attempted
    console.log('Testing Permanent record deletion immunity...');
    const testPermDelId = `REQ-PERM-${Date.now().toString().slice(-4)}`;
    await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/platform/policies/requests',
      method: 'POST'
    }, {
      requestId: testPermDelId,
      requestType: 'DELETION_ANONYMIZATION',
      institutionScope: 'Sri Vidya High School, Hyderabad (Main Campus)',
      requesterName: 'Junior Sysadmin',
      requesterRole: 'System Operator',
      requesterEmail: 'operator@srividya.edu.in',
      targetSubject: 'Purge Student Master General Register Archives 2010',
      businessJustification: 'Disk reclamation request'
    });

    // Provide dual signoffs but on statutory permanent record
    await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testPermDelId}/approve`,
      method: 'POST'
    }, { signoffBy: 'School Principal', role: 'School Principal' });

    await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testPermDelId}/approve`,
      method: 'POST'
    }, { signoffBy: 'Trust Legal Directorate', role: 'Trust Legal Counsel' });

    const resPermanentPurgeAttempt = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/platform/policies/requests/${testPermDelId}/fulfill`,
      method: 'POST'
    });

    assert(resPermanentPurgeAttempt.status === 403, 'Permanent register purge attempt rejected with 403 Forbidden');
    assert(resPermanentPurgeAttempt.data.message.includes('STATUTORY NON-PURGEABLE VIOLATION'), 'Error confirms General Register cannot be deleted');

    // -------------------------------------------------------------
    // Test Group 4: UI View, Modals, CSS & JS Interfaces
    // -------------------------------------------------------------
    console.log('\n--- Test Group 4: UI View, Modals, CSS & JS Public Interfaces ---');
    const htmlContent = fs.readFileSync(path.join(__dirname, '../frontend/platform-admin/index.html'), 'utf8');
    const cssContent = fs.readFileSync(path.join(__dirname, '../frontend/css/platform-admin.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, '../frontend/js/platform-admin.js'), 'utf8');

    // Check HTML IDs
    const requiredHtmlElements = [
      'id="view-policies"',
      'id="btnPolTabRegister"',
      'id="btnPolTabRetention"',
      'id="btnPolTabDataRequests"',
      'id="polSectionRegister"',
      'id="polSectionRetention"',
      'id="polSectionDataRequests"',
      'id="tbodyGovernancePolicies"',
      'id="tbodyRetentionRules"',
      'id="tbodyDataRequests"',
      'id="modalCreatePolicy"',
      'id="modalRetentionDraft"',
      'id="modalRetentionVersions"',
      'id="modalSubmitDataRequest"',
      'id="modalDataRequestDetail"'
    ];

    requiredHtmlElements.forEach(elem => {
      assert(htmlContent.includes(elem), `HTML contains element '${elem}'`);
    });

    // Check CSS classes
    const requiredCssClasses = [
      '.pol-subnav',
      '.pol-subnav-btn',
      '.pol-statutory-alert',
      '.badge-pol-category',
      '.badge-ret-permanent',
      '.badge-req-deletion'
    ];

    requiredCssClasses.forEach(cls => {
      assert(cssContent.includes(cls), `CSS contains class rule '${cls}'`);
    });

    // Check JS exports
    const requiredJsExports = [
      'loadPlatformPoliciesData',
      'switchPoliciesSubTab',
      'renderPoliciesTable',
      'filterPoliciesTable',
      'resetPolicyFilters',
      'openCreatePolicyModal',
      'submitCreatePolicy',
      'renderRetentionRulesTable',
      'filterRetentionTable',
      'openCreateRetentionDraftModal',
      'submitCreateRetentionDraft',
      'submitRetentionForReview',
      'approveRetentionRule',
      'publishRetentionRule',
      'openRetentionVersionsModal',
      'renderDataRequestsTable',
      'filterDataRequestsTable',
      'openSubmitDataRequestModal',
      'submitDataRequest',
      'openDataRequestDetailModal',
      'approveCurrentDataRequest',
      'rejectCurrentDataRequest',
      'fulfillCurrentDataRequest'
    ];

    requiredJsExports.forEach(fn => {
      assert(jsContent.includes(fn), `JavaScript includes/exports function '${fn}'`);
    });

    console.log('\n=============================================================');
    console.log(`  ALL MODULE 17 TESTS PASSED: ${passedTests}/${totalTests} (100%)`);
    console.log('=============================================================\n');

  } catch (err) {
    console.error('\nTest Suite Terminated with Error:', err.message);
    process.exit(1);
  }
}

runTests();
