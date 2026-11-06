/**
 * Security & Access Threat Monitoring - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class SecurityMonitoringPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'security.monitor',
      auditCategory: 'SECURITY_MONITORING',
      auditAction: 'READ_SECURITY_MONITORING'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'security.monitor',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'SECURITY_MONITORING',
      auditAction: 'WRITE_SECURITY_MONITORING'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'SECURITY_MONITORING',
      auditAction: 'SENSITIVE_ACTION_SECURITY_MONITORING'
    })(req, res, next);
  }
}

module.exports = SecurityMonitoringPolicy;
