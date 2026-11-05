/**
 * Sri Vidya Educational Trust - Module 9: Security & Access Monitoring Acceptance Test Suite
 * Validates:
 * 1. 9.1 Overview (7 KPI metrics)
 * 2. 9.2 Security Events Register (9-column table, multi-field filtering, detail view)
 * 3. 9.3 Privileged Access Reviews (8 columns, review outcomes, role reduction/revocation audit)
 * 4. 9.4 7-Step Incident Workflow Lifecycle (Triage -> Assign -> Investigate -> Contain -> Close -> Escalate)
 * 5. Immutable Audit Invariant: High-impact actions logged to Module 8 PlatformAudit
 * 6. UI & Template Integrity in platform-admin index.html & platform-admin.js
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
  console.log('SRI VIDYA TRUST: MODULE 9 SECURITY & ACCESS MONITORING ACCEPTANCE SUITE');
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

  // 1. 9.1 Overview KPIs
  await asyncTest('GET /api/v1/platform/security/overview returns 7 statutory KPI metrics', async () => {
    const res = await request('GET', '/api/v1/platform/security/overview');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const d = res.body.data;
    assert(typeof d.failedAuthAttempts === 'number', 'failedAuthAttempts must be number');
    assert(typeof d.suspiciousLoginPatterns === 'number', 'suspiciousLoginPatterns must be number');
    assert(typeof d.privilegedRoleChanges === 'number', 'privilegedRoleChanges must be number');
    assert(typeof d.unusualAccessActivity === 'number', 'unusualAccessActivity must be number');
    assert(typeof d.unresolvedSecurityAlerts === 'number', 'unresolvedSecurityAlerts must be number');
    assert(typeof d.accountsRequiringReview === 'number', 'accountsRequiringReview must be number');
    assert(typeof d.recentSecurityIncidents === 'number', 'recentSecurityIncidents must be number');
    assert.strictEqual(d.threatDefensePosture, 'ACTIVE_GUARD');
  });

  // 2. 9.2 Security Events Register List & Filters
  await asyncTest('GET /api/v1/platform/security/events returns populated security events', async () => {
    const res = await request('GET', '/api/v1/platform/security/events');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data), 'data must be an array');
    assert(res.body.data.length >= 4, 'Must seed at least 4 default security events');

    const first = res.body.data[0];
    assert(first.eventId, 'Must have eventId');
    assert(first.eventType, 'Must have eventType');
    assert(first.riskClassification, 'Must have riskClassification');
    assert(first.status, 'Must have status');
    assert(first.assignedInvestigator, 'Must have assignedInvestigator');
  });

  await asyncTest('GET /api/v1/platform/security/events filters by risk classification', async () => {
    const res = await request('GET', '/api/v1/platform/security/events?risk=HIGH');
    assert.strictEqual(res.status, 200);
    assert(res.body.data.every(e => e.riskClassification === 'HIGH'), 'All returned events must be HIGH risk');
  });

  await asyncTest('GET /api/v1/platform/security/events filters by campus institutionId', async () => {
    const res = await request('GET', '/api/v1/platform/security/events?institutionId=INST-002');
    assert.strictEqual(res.status, 200);
    assert(res.body.data.every(e => e.institutionId === 'INST-002'), 'All returned events must belong to INST-002');
  });

  // 3. 9.2 Single Security Event Detail
  await asyncTest('GET /api/v1/platform/security/events/SEC-2026-088 returns full telemetry & timeline', async () => {
    const res = await request('GET', '/api/v1/platform/security/events/SEC-2026-088');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const ev = res.body.data;
    assert.strictEqual(ev.eventId, 'SEC-2026-088');
    assert(ev.telemetry?.ipAddress, 'Telemetry must contain source IP');
    assert(Array.isArray(ev.timeline), 'Must contain timeline history');
    assert(ev.timeline.length > 0, 'Timeline must have at least 1 entry');
  });

  // 4. 9.4 7-Step Incident Workflow Lifecycle Transitions
  await asyncTest('POST /api/v1/platform/security/events/:id/triage updates risk and stage', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-089/triage', {
      riskClassification: 'HIGH',
      operator: 'SecOps Analyst Sri M. Prasad'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Triage');
    assert.strictEqual(res.body.data.riskClassification, 'HIGH');
    assert.strictEqual(res.body.data.timeline[0].stage, 'Triage');
  });

  await asyncTest('POST /api/v1/platform/security/events/:id/assign designates investigator with SLA', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-089/assign', {
      investigatorName: 'Sri V. Krishna Mohan (SecOps Lead)',
      slaHours: 2,
      operator: 'Platform Administrator'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Assign Investigator');
    assert.strictEqual(res.body.data.assignedInvestigator.name, 'Sri V. Krishna Mohan (SecOps Lead)');
    assert.strictEqual(res.body.data.assignedInvestigator.slaTargetHours, 2);
  });

  await asyncTest('POST /api/v1/platform/security/events/:id/investigate marks stage Under Investigation', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-089/investigate', {
      operator: 'Sri V. Krishna Mohan'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Under Investigation');
  });

  await asyncTest('POST /api/v1/platform/security/events/:id/findings records root cause & forensic evidence', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-089/findings', {
      rootCause: 'Legitimate off-hours principal login confirmed via secondary voice verification',
      evidence: 'Principal traveling for inter-school state athletic meet coordination',
      remediationNotes: 'No further action required; marked benign',
      operator: 'Sri V. Krishna Mohan'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Investigate');
    assert(res.body.data.findings.rootCause.includes('Legitimate off-hours'), 'Findings must be saved');
  });

  // 5. High-Impact Containment & Audit Invariant
  await asyncTest('POST /api/v1/platform/security/events/:id/contain invalidates session & records PlatformAudit', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-090/contain', {
      terminateSession: true,
      actionSummary: 'Cross-campus bulk download quarantined and session invalidated',
      operator: 'SecOps Administrator'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Contain or Remediate');
    assert.strictEqual(res.body.data.telemetry.sessionTerminated, true);

    // Verify PlatformAudit has an immutable log entry
    const auditRes = await request('GET', '/api/v1/platform/audit?category=SECURITY_ALERTS');
    assert.strictEqual(auditRes.status, 200);
    const auditEntry = auditRes.body.data.find(a => a.action === 'SECURITY_CONTAINMENT_EXECUTED');
    assert(auditEntry, 'Must create SECURITY_CONTAINMENT_EXECUTED audit event in PlatformAudit');
    assert.strictEqual(auditEntry.severity, 'HIGH');
    assert.strictEqual(auditEntry.result, 'SUCCESS');
  });

  // 6. High-Impact Escalation & Audit Invariant
  await asyncTest('POST /api/v1/platform/security/events/:id/escalate escalates incident & records PlatformAudit', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-090/escalate', {
      escalationLevel: 'L3_EXECUTIVE_SENATE',
      reason: 'Cross-campus confidential ledger exfiltration attempt by unauthorized operator',
      operator: 'Chief Security Officer'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Escalated');
    assert.strictEqual(res.body.data.riskClassification, 'CRITICAL');
    assert.strictEqual(res.body.data.escalationDetails.isEscalated, true);
    assert.strictEqual(res.body.data.escalationDetails.escalationLevel, 'L3_EXECUTIVE_SENATE');

    // Verify PlatformAudit has an immutable log entry
    const auditRes = await request('GET', '/api/v1/platform/audit?category=SECURITY_ALERTS');
    assert.strictEqual(auditRes.status, 200);
    const auditEntry = auditRes.body.data.find(a => a.action === 'SECURITY_INCIDENT_ESCALATED');
    assert(auditEntry, 'Must create SECURITY_INCIDENT_ESCALATED audit event in PlatformAudit');
    assert.strictEqual(auditEntry.severity, 'CRITICAL');
  });

  // 7. Close Security Event
  await asyncTest('POST /api/v1/platform/security/events/:id/close completes lifecycle', async () => {
    const res = await request('POST', '/api/v1/platform/security/events/SEC-2026-089/close', {
      resolutionNotes: 'Investigation completed; identity validated by institutional management',
      operator: 'Sri V. Krishna Mohan'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, 'Close');
    assert.strictEqual(res.body.data.timeline[0].stage, 'Close');
  });

  // 8. 9.3 Privileged Access Reviews
  await asyncTest('GET /api/v1/platform/security/reviews returns privileged user access list', async () => {
    const res = await request('GET', '/api/v1/platform/security/reviews');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.data), 'Reviews must be an array');
    assert(res.body.data.length >= 4, 'Must seed at least 4 privileged reviews');

    const review = res.body.data[0];
    assert(review.reviewId, 'Must have reviewId');
    assert(review.userName, 'Must have userName');
    assert(review.institutionScope, 'Must have institutionScope');
    assert(Array.isArray(review.privilegedRoles), 'Must have privilegedRoles array');
    assert(review.reviewDueDate, 'Must have reviewDueDate');
    assert(review.reviewerName, 'Must have reviewerName');
    assert(review.reviewStatus, 'Must have reviewStatus');
  });

  await asyncTest('POST /api/v1/platform/security/reviews/:id/outcome records confirmation', async () => {
    const res = await request('POST', '/api/v1/platform/security/reviews/REV-2026-002/outcome', {
      decision: 'confirm',
      notes: 'Institutional principal role re-certified for Academic Year 2026-2027',
      operator: 'Managing Trustee Sri P. Venkatasubba Rao'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.reviewStatus, 'Confirmed');
    assert.strictEqual(res.body.data.reviewStatus, 'Confirmed');
  });

  await asyncTest('POST /api/v1/platform/security/reviews/:id/outcome records role revocation & generates RBAC audit', async () => {
    const res = await request('POST', '/api/v1/platform/security/reviews/REV-2026-004/outcome', {
      decision: 'revoke',
      notes: 'Accounts clerk role revoked following financial reconciliation discrepancy',
      operator: 'Trust Internal Auditor'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.reviewStatus, 'Role Revoked');
    assert.strictEqual(res.body.data.reviewStatus, 'Role Revoked');

    // Verify PlatformAudit has an immutable log entry
    const auditRes = await request('GET', '/api/v1/platform/audit?category=RBAC_PERMISSIONS');
    assert.strictEqual(auditRes.status, 200);
    const auditEntry = auditRes.body.data.find(a => a.action === 'PRIVILEGED_ROLE_REVOKED_AUDIT');
    assert(auditEntry, 'Must log PRIVILEGED_ROLE_REVOKED_AUDIT to PlatformAudit');
    assert.strictEqual(auditEntry.severity, 'HIGH');
  });

  // 9. UI & Template Integrity in index.html
  test('frontend/platform-admin/index.html includes 9.1 KPI cards, 9.4 pipeline, 9.2 table, 9.3 table, and 5 modals', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'platform-admin', 'index.html'), 'utf8');

    // Section root
    assert(html.includes('id="view-security-monitoring"'), 'Must have #view-security-monitoring');

    // Sub tabs
    assert(html.includes('id="btnSecTabOverview"'), 'Must have #btnSecTabOverview');
    assert(html.includes('id="btnSecTabEvents"'), 'Must have #btnSecTabEvents');
    assert(html.includes('id="btnSecTabReviews"'), 'Must have #btnSecTabReviews');

    // 7 KPI cards
    assert(html.includes('id="kpiSecFailedLogins"'), 'Must have #kpiSecFailedLogins');
    assert(html.includes('id="kpiSecSuspiciousPatterns"'), 'Must have #kpiSecSuspiciousPatterns');
    assert(html.includes('id="kpiSecPrivRoleChanges"'), 'Must have #kpiSecPrivRoleChanges');
    assert(html.includes('id="kpiSecUnusualAccess"'), 'Must have #kpiSecUnusualAccess');
    assert(html.includes('id="kpiSecUnresolvedAlerts"'), 'Must have #kpiSecUnresolvedAlerts');
    assert(html.includes('id="kpiSecAccountsReview"'), 'Must have #kpiSecAccountsReview');
    assert(html.includes('id="kpiSecRecentIncidents"'), 'Must have #kpiSecRecentIncidents');

    // 9.4 7-Step Workflow Stepper
    assert(html.includes('sec-workflow-stepper'), 'Must have .sec-workflow-stepper');
    assert(html.includes('1. Alert Detected'), 'Must have Step 1 Alert Detected');
    assert(html.includes('2. Triage'), 'Must have Step 2 Triage');
    assert(html.includes('3. Assign Investigator'), 'Must have Step 3 Assign Investigator');
    assert(html.includes('4. Investigate'), 'Must have Step 4 Investigate');
    assert(html.includes('5. Contain / Remediate'), 'Must have Step 5 Contain / Remediate');
    assert(html.includes('6. Validate Resolution'), 'Must have Step 6 Validate Resolution');
    assert(html.includes('7. Close'), 'Must have Step 7 Close');

    // 9.2 Security Events Register table
    assert(html.includes('id="tblSecurityEventsBody"'), 'Must have #tblSecurityEventsBody');
    assert(html.includes('id="txtSecFilterSearch"'), 'Must have #txtSecFilterSearch');
    assert(html.includes('id="selSecFilterRisk"'), 'Must have #selSecFilterRisk');

    // 9.3 Privileged Access Reviews table
    assert(html.includes('id="tblAccessReviewsBody"'), 'Must have #tblAccessReviewsBody');
    assert(html.includes('id="txtRevFilterSearch"'), 'Must have #txtRevFilterSearch');
    assert(html.includes('id="selRevFilterStatus"'), 'Must have #selRevFilterStatus');

    // 5 Modals
    assert(html.includes('id="modalSecurityEventDetail"'), 'Must have #modalSecurityEventDetail');
    assert(html.includes('id="modalAssignInvestigator"'), 'Must have #modalAssignInvestigator');
    assert(html.includes('id="modalRecordFindings"'), 'Must have #modalRecordFindings');
    assert(html.includes('id="modalEscalateIncident"'), 'Must have #modalEscalateIncident');
    assert(html.includes('id="modalAccessReviewAction"'), 'Must have #modalAccessReviewAction');
  });

  // 10. Controller exports integrity in platform-admin.js
  test('frontend/js/platform-admin.js exports all Module 9 controller functions', () => {
    const js = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'js', 'platform-admin.js'), 'utf8');

    const expectedMethods = [
      'loadSecurityMonitoringData',
      'switchSecuritySubTab',
      'filterSecurityEvents',
      'resetSecurityEventFilters',
      'openSecurityEventDetails',
      'markEventUnderInvestigation',
      'openAssignInvestigatorModal',
      'submitAssignInvestigator',
      'openRecordFindingsModal',
      'submitRecordFindings',
      'executeContainment',
      'closeSecurityEvent',
      'openEscalateModal',
      'submitEscalateIncident',
      'filterAccessReviews',
      'resetAccessReviewFilters',
      'openAccessReviewModal',
      'submitAccessReviewAction',
      'exportSecurityDossierCSV'
    ];

    expectedMethods.forEach(method => {
      const regex = new RegExp(`\\b${method}\\b`);
      assert(regex.test(js), `platform-admin.js must export or define ${method}`);
    });
  });

  console.log('\n------------------------------------------------------------------------');
  console.log(`MODULE 9 TEST SUMMARY: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('------------------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
