const cp = require('child_process');

const testSuites = [
  'scripts/test_subscription_suite.js',
  'scripts/test_security_monitoring_suite.js',
  'scripts/test_audit_logs_suite.js',
  'scripts/test_role_templates_suite.js',
  'scripts/test_user_account_suite.js',
  'scripts/test_institution_onboarding_suite.js',
  'scripts/test_platform_sidebar_click_suite.js',
  'scripts/test_school_config_suite.js',
  'scripts/test_tc_toolbar_alignment.js',
  'scripts/test_admissions_alignment_suite.js',
  'scripts/test_institution_management_suite.js',
  'scripts/test_platform_dashboard_suite.js',
  'scripts/test_system_wide_rules_suite.js',
  'scripts/test_school_workflows_suite.js',
  'scripts/test_future_portals_backend_suite.js',
  'scripts/test_faculty_portal_suite.js',
  'scripts/test_settings_suite.js',
  'scripts/test_page_acceptance_criteria_suite.js'
];

let failedCount = 0;

console.log('========================================================');
console.log('RUNNING FULL MASTER VERIFICATION ACROSS ALL MODULES');
console.log('========================================================\n');

testSuites.forEach(suite => {
  try {
    const out = cp.execFileSync('node', [suite], { encoding: 'utf8' });
    console.log(`[PASS] ${suite}`);
  } catch (err) {
    console.error(`[FAIL] ${suite}`);
    console.error(err.stdout || err.message);
    failedCount++;
  }
});

console.log('\n========================================================');
if (failedCount === 0) {
  console.log(`ALL ${testSuites.length} TEST SUITES PASSED FLAWLESSLY (100%)!`);
} else {
  console.log(`${failedCount} test suites failed.`);
  process.exit(1);
}
console.log('========================================================');
