/**
 * External Integrations Directory - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class IntegrationsPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'integrations.manage',
      auditCategory: 'INTEGRATIONS',
      auditAction: 'READ_INTEGRATIONS'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'integrations.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'INTEGRATIONS',
      auditAction: 'WRITE_INTEGRATIONS'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'INTEGRATIONS',
      auditAction: 'SENSITIVE_ACTION_INTEGRATIONS'
    })(req, res, next);
  }
}

module.exports = IntegrationsPolicy;
