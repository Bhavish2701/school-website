/**
 * System Health & Telemetry - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class SystemHealthPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'health.read',
      auditCategory: 'SYSTEM_HEALTH',
      auditAction: 'READ_SYSTEM_HEALTH'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'health.read',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'SYSTEM_HEALTH',
      auditAction: 'WRITE_SYSTEM_HEALTH'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SYSTEM_HEALTH',
      auditAction: 'SENSITIVE_ACTION_SYSTEM_HEALTH'
    })(req, res, next);
  }
}

module.exports = SystemHealthPolicy;
