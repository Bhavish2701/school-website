
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class GlobalSettingsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'settings.manage',
      auditCategory: 'GLOBAL_SETTINGS',
      auditAction: 'READ_GLOBAL_SETTINGS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'settings.manage',
      requirePlatformWideScope: false,
      auditCategory: 'GLOBAL_SETTINGS',
      auditAction: 'WRITE_GLOBAL_SETTINGS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'GLOBAL_SETTINGS',
      auditAction: 'SENSITIVE_ACTION_GLOBAL_SETTINGS'
    })(req, res, next);
  }
}

module.exports = GlobalSettingsPolicy;
