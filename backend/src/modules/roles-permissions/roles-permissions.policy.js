/**
 * Role Templates & RBAC Permissions - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class RolesPermissionsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'roles.manage',
      auditCategory: 'ROLES_PERMISSIONS',
      auditAction: 'READ_ROLES_PERMISSIONS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'roles.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'ROLES_PERMISSIONS',
      auditAction: 'WRITE_ROLES_PERMISSIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'ROLES_PERMISSIONS',
      auditAction: 'SENSITIVE_ACTION_ROLES_PERMISSIONS'
    })(req, res, next);
  }
}

module.exports = RolesPermissionsPolicy;
