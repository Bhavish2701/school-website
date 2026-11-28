
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
      requirePlatformWideScope: false,
      auditCategory: 'ROLES_PERMISSIONS',
      auditAction: 'WRITE_ROLES_PERMISSIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true,
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'ROLES_PERMISSIONS',
      auditAction: 'SENSITIVE_ACTION_ROLES_PERMISSIONS'
    })(req, res, next);
  }
}

module.exports = RolesPermissionsPolicy;
