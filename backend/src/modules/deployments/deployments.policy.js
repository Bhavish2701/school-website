/**
 * Deployment History & Lifecycle - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class DeploymentsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'deployments.manage',
      auditCategory: 'DEPLOYMENTS',
      auditAction: 'READ_DEPLOYMENTS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'deployments.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'DEPLOYMENTS',
      auditAction: 'WRITE_DEPLOYMENTS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'DEPLOYMENTS',
      auditAction: 'SENSITIVE_ACTION_DEPLOYMENTS'
    })(req, res, next);
  }
}

module.exports = DeploymentsPolicy;
