/**
 * Statutory Data Retention & Requests - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class DataRetentionPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'retention.manage',
      auditCategory: 'DATA_RETENTION',
      auditAction: 'READ_DATA_RETENTION'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'retention.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'DATA_RETENTION',
      auditAction: 'WRITE_DATA_RETENTION'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'DATA_RETENTION',
      auditAction: 'SENSITIVE_ACTION_DATA_RETENTION'
    })(req, res, next);
  }
}

module.exports = DataRetentionPolicy;
