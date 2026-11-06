/**
 * Backups & Disaster Recovery - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class BackupsRecoveryPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'backups.manage',
      auditCategory: 'BACKUPS_RECOVERY',
      auditAction: 'READ_BACKUPS_RECOVERY'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'backups.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'BACKUPS_RECOVERY',
      auditAction: 'WRITE_BACKUPS_RECOVERY'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'BACKUPS_RECOVERY',
      auditAction: 'SENSITIVE_ACTION_BACKUPS_RECOVERY'
    })(req, res, next);
  }
}

module.exports = BackupsRecoveryPolicy;
