/**
 * API Gateway & Client Management - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class ApiManagementPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'api.manage',
      auditCategory: 'API_MANAGEMENT',
      auditAction: 'READ_API_MANAGEMENT'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'api.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'API_MANAGEMENT',
      auditAction: 'WRITE_API_MANAGEMENT'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'API_MANAGEMENT',
      auditAction: 'SENSITIVE_ACTION_API_MANAGEMENT'
    })(req, res, next);
  }
}

module.exports = ApiManagementPolicy;
