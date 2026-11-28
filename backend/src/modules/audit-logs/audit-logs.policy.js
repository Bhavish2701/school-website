
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class AuditLogsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'audit.read',
      auditCategory: 'AUDIT_LOGS',
      auditAction: 'READ_AUDIT_LOGS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'audit.read',
      requirePlatformWideScope: false,
      auditCategory: 'AUDIT_LOGS',
      auditAction: 'WRITE_AUDIT_LOGS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'AUDIT_LOGS',
      auditAction: 'SENSITIVE_ACTION_AUDIT_LOGS'
    })(req, res, next);
  }
}

module.exports = AuditLogsPolicy;
