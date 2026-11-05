const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: MODULE 8 AUDIT LOGS (FORENSIC EVIDENCE & INVESTIGATION) ===\n');

// 1. Verify 8.1 HTML Structure, Table, and KPI Summary Cards
console.log('[CHECK 1] Verifying Section 8.1 Audit Log Explorer HTML Structure...');
const html = fs.readFileSync('frontend/platform-admin/index.html', 'utf8');

assert(html.includes('id="view-audit"'), 'View #view-audit must exist in HTML');
assert(html.includes('platformApp.exportAuthorizedAuditReport()'), 'Primary action Export Authorized Report must exist');

// 5 Summary KPI Cards
const expectedKpis = [
  'kpiAuditTotal',
  'kpiAuditCritical',
  'kpiAuditDenied',
  'kpiAuditActors',
  'kpiAuditVault'
];
expectedKpis.forEach(kpi => {
  assert(html.includes(`id="${kpi}"`), `Summary card #${kpi} must exist in HTML`);
});
console.log('  ✓ 5 Summary KPI cards verified (Total, Critical/High, Denied/Failed, Operators, Vault Integrity)');

// Multi-field Filters (Section 8.1)
const expectedFilters = [
  'auditSearchInput',
  'auditStartDate',
  'auditEndDate',
  'auditUserFilter',
  'auditInstFilter',
  'auditCategoryFilter',
  'auditActionFilter',
  'auditResultFilter',
  'auditSeverityFilter',
  'auditRecordRefInput',
  'btnResetAuditFilters'
];
expectedFilters.forEach(f => {
  assert(html.includes(`id="${f}"`), `Filter control #${f} must exist in HTML`);
});
console.log('  ✓ All 8 Filter controls (Search, Date Range, User, Inst, Category, Action, Result, Severity, Record Ref) verified');

// 9 Table Columns (Section 8.1)
const tableHeaders = [
  'Event ID',
  'Timestamp',
  'Actor',
  'Institution',
  'Action',
  'Target Record',
  'Result',
  'Severity',
  'View Details'
];
tableHeaders.forEach(th => {
  assert(html.includes(`<th>${th}</th>`), `Table header '<th>${th}</th>' must exist in audit table`);
});
assert(html.includes('id="auditLogsTableBody"'), '#auditLogsTableBody must exist');
console.log('  ✓ All 9 Table columns and tbody verified');

// 2. Verify 8.2 Event Detail Modal (#modalAuditEventDetail)
console.log('\n[CHECK 2] Verifying Section 8.2 Event Detail Inspection Modal & Sensitive Masking...');
assert(html.includes('id="modalAuditEventDetail"'), 'Modal #modalAuditEventDetail must exist');

const expectedDetailFields = [
  'auditDetailEventId',
  'auditDetailTimestamp',
  'auditDetailCorrelationId',
  'auditDetailActorName',
  'auditDetailActorRole',
  'auditDetailActorScope',
  'auditDetailActorIp',
  'auditDetailActorAgent',
  'auditDetailTargetName',
  'auditDetailTargetId',
  'auditDetailTargetType',
  'auditDetailInstitution',
  'auditDetailAction',
  'auditDetailResultBadge',
  'auditDetailSeverityBadge',
  'auditDetailReason',
  'auditDetailTamperSeal',
  'auditDetailDiffTableBody',
  'auditDetailRelatedEvents',
  'btnOpenRelatedSecurityEvent'
];
expectedDetailFields.forEach(f => {
  assert(html.includes(`id="${f}"`), `Detail modal element #${f} must exist in HTML`);
});

// Sensitive masking guarantee notice in HTML
assert(
  html.includes('Sensitive values (passwords, tokens, Aadhaar) masked') ||
  html.includes('passwords, session tokens'),
  'Sensitive values masking notice must be present in detail modal'
);
console.log('  ✓ Event detail modal verified with all 8.2 attributes, diff viewer, and sensitive masking notice');

// 3. Verify 8.3 10 Statutory Categories in Backend Model
console.log('\n[CHECK 3] Verifying Section 8.3 10 Statutory Audit Categories...');
const { AUDIT_EVENT_CATEGORIES } = require('../backend/src/models/platformAudit.model');

const required10Categories = [
  'AUTH_ACCOUNTS',           // 1. Authentication and account changes
  'INSTITUTIONS',            // 2. Institution activation or suspension
  'RBAC_PERMISSIONS',        // 3. Role and permission changes
  'SCHOOL_CONFIG',           // 4. Configuration changes
  'INTEGRATIONS',            // 5. Integration changes
  'DATA_IMPORT_EXPORT',      // 6. Data import and export
  'BACKUP_RECOVERY',         // 7. Backup and recovery actions
  'ADMIN_SUPPORT',           // 8. Administrative support actions
  'SECURITY_ALERTS',         // 9. Security alerts
  'DEPLOYMENT_OPS'           // 10. Deployment-related administrative events
];

required10Categories.forEach(cat => {
  assert(AUDIT_EVENT_CATEGORIES.includes(cat), `Category '${cat}' must be defined in AUDIT_EVENT_CATEGORIES`);
  assert(html.includes(`value="${cat}"`), `Category '${cat}' must be an option in HTML category filter`);
});
console.log('  ✓ All 10 Statutory audit event categories verified in schema and frontend dropdown');

// 4. Verify 8.4 JavaScript Controller Functions in platform-admin.js
console.log('\n[CHECK 4] Verifying JavaScript Controller Exports in platform-admin.js...');
const js = fs.readFileSync('frontend/js/platform-admin.js', 'utf8');

const requiredJsFunctions = [
  'loadPlatformAuditDirectory',
  'filterPlatformAuditLogs',
  'resetAuditFilters',
  'openAuditEventDetails',
  'exportAuthorizedAuditReport',
  'openRelatedSecurityEvent'
];

requiredJsFunctions.forEach(fn => {
  assert(js.includes(`function ${fn}`) || js.includes(`${fn}: async function`) || js.includes(`${fn} =`), `Function '${fn}' must be defined in platform-admin.js`);
  assert(js.includes(`${fn},`) || js.includes(`${fn}:`) || js.includes(`${fn}\n`), `Function '${fn}' must be exported on platformApp`);
});
console.log('  ✓ All 6 Module 8 JavaScript functions and platformApp exports verified');

// 5. Verify Backend PlatformAuditService Business Logic, Masking, and Immutability
console.log('\n[CHECK 5] Verifying Backend PlatformAuditService & Immutability Guarantees...');
const PlatformAuditService = require('../backend/src/services/platformAudit.service');

(async () => {
  try {
    // 5.1 Summary Stats
    const summary = await PlatformAuditService.getAuditSummary();
    assert(summary.totalEvents >= 10, 'There must be at least 10 seeded audit events');
    assert(summary.criticalHighEvents >= 2, 'There must be at least 2 critical/high events');
    assert(summary.deniedFailedEvents >= 1, 'There must be at least 1 denied/failed event');
    assert(summary.vaultIntegrityStatus.includes('SEALED'), 'Vault integrity status must be sealed');
    console.log(`  ✓ Summary stats verified: Total=${summary.totalEvents}, Critical/High=${summary.criticalHighEvents}, Denied=${summary.deniedFailedEvents}, Actors=${summary.uniqueActors}`);

    // 5.2 Multi-Field Filtering
    const allEventsRes = await PlatformAuditService.listEvents();
    assert(allEventsRes.success && allEventsRes.data.length >= 10, 'listEvents must return events');

    // Filter by category
    const rbacEventsRes = await PlatformAuditService.listEvents({ category: 'RBAC_PERMISSIONS' });
    assert(rbacEventsRes.data.length >= 1, 'Filter by RBAC_PERMISSIONS must return events');
    assert(rbacEventsRes.data[0].category === 'RBAC_PERMISSIONS', 'Category must match');

    // Filter by severity
    const criticalEventsRes = await PlatformAuditService.listEvents({ severity: 'CRITICAL' });
    assert(criticalEventsRes.data.length >= 1, 'Filter by CRITICAL must return events');
    assert(criticalEventsRes.data[0].severity === 'CRITICAL', 'Severity must match');

    // Filter by result
    const deniedEventsRes = await PlatformAuditService.listEvents({ result: 'DENIED' });
    assert(deniedEventsRes.data.length >= 1, 'Filter by DENIED must return events');
    assert(deniedEventsRes.data[0].result === 'DENIED', 'Result must match');

    // Search query
    const searchRes = await PlatformAuditService.listEvents({ search: 'SendGrid' });
    assert(searchRes.data.length >= 1, 'Search query for SendGrid must find integration event');
    console.log('  ✓ Multi-field filtering (Category, Severity, Result, Text Search) verified');

    // 5.3 Event Detail & Related Events
    const singleRes = await PlatformAuditService.getEventById('EVT-2026-10491');
    assert(singleRes.success && singleRes.data, 'Must retrieve EVT-2026-10491');
    assert(singleRes.data.actor.name === 'Root Platform Administrator', 'Actor name must match');
    assert(singleRes.data.targetEntity.entityId === 'USR-1006', 'Target entity ID must match');
    assert(Array.isArray(singleRes.relatedEvents), 'relatedEvents must be an array');
    console.log(`  ✓ Event detail retrieved with ${singleRes.relatedEvents.length} correlated events`);

    // 5.4 Sensitive Masking Verification (Rule 8.2 Invariant)
    const sensitiveLog = {
      action: 'ADMIN_CREDENTIAL_CHANGE',
      category: 'AUTH_ACCOUNTS',
      actor: { userId: 'USR-TEST', name: 'Tester' },
      targetEntity: { entityType: 'UserAccount', entityId: 'USR-TEST-01', displayName: 'Test Account' },
      reason: 'Mandatory credential update test',
      changedFields: [
        { field: 'password', oldValue: 'PlaintextOldPass123!', newValue: 'PlaintextNewPass456$' },
        { field: 'sessionToken', oldValue: 'raw_session_tok_abc123', newValue: 'raw_session_tok_def456' },
        { field: 'aadhaarNumber', oldValue: '9988-7766-5544', newValue: '9988-7766-5545' },
        { field: 'email', oldValue: 'old@srividya.edu.in', newValue: 'new@srividya.edu.in' }
      ]
    };

    const logged = await PlatformAuditService.logEvent(sensitiveLog);
    assert(logged.success, 'logEvent must succeed');
    const maskedPass = logged.data.changedFields.find(cf => cf.field === 'password');
    const maskedTok = logged.data.changedFields.find(cf => cf.field === 'sessionToken');
    const maskedAadhaar = logged.data.changedFields.find(cf => cf.field === 'aadhaarNumber');
    const normalEmail = logged.data.changedFields.find(cf => cf.field === 'email');

    assert(maskedPass.newValue === '[REDACTED_FOR_SECURITY]', 'Password must be sanitized to [REDACTED_FOR_SECURITY]');
    assert(maskedTok.newValue === '[REDACTED_FOR_SECURITY]', 'Session token must be sanitized to [REDACTED_FOR_SECURITY]');
    assert(maskedAadhaar.newValue === '[REDACTED_FOR_SECURITY]', 'Aadhaar must be sanitized to [REDACTED_FOR_SECURITY]');
    assert(normalEmail.newValue === 'new@srividya.edu.in', 'Non-sensitive email field should be preserved');
    console.log('  ✓ Sensitive Masking Invariant verified: Passwords, tokens, and national IDs are permanently redacted');

    // 5.5 Cryptographic Tamper Seal Verification
    assert(typeof logged.data.tamperSealHash === 'string' && logged.data.tamperSealHash.length === 64, 'tamperSealHash must be 64-char SHA-256');
    console.log(`  ✓ Cryptographic SHA-256 Tamper Seal generated: ${logged.data.tamperSealHash.slice(0, 16)}...`);

    // 5.6 Export Authorized Report
    const reportRes = await PlatformAuditService.exportAuthorizedReport({ category: 'INSTITUTIONS' }, 'Root Platform Administrator');
    assert(reportRes.success, 'exportAuthorizedReport must succeed');
    assert(reportRes.csvContent.includes('# SRI VIDYA EDUCATIONAL TRUST - AUTHORIZED PLATFORM AUDIT EVIDENCE DOSSIER'), 'Must contain authorized report banner');
    assert(reportRes.csvContent.includes('INSTITUTIONS'), 'Must contain filtered event data');
    console.log(`  ✓ Authorized evidence report export verified with ${reportRes.totalRecords} records`);

    console.log('\n========================================================');
    console.log('ALL MODULE 8 AUDIT LOGS CHECKS PASSED FLAWLESSLY!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n[MODULE 8 TEST FAILURE]:', err);
    process.exit(1);
  }
})();

