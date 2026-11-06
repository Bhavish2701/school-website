/**
 * Forensic Audit Logs Explorer - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

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
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'AUDIT_LOGS',
      auditAction: 'WRITE_AUDIT_LOGS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'AUDIT_LOGS',
      auditAction: 'SENSITIVE_ACTION_AUDIT_LOGS'
    })(req, res, next);
  }
}

module.exports = AuditLogsPolicy;
