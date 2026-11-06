/**
 * Platform Policies & Governance Register - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class PlatformPoliciesPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'policies.manage',
      auditCategory: 'PLATFORM_POLICIES',
      auditAction: 'READ_PLATFORM_POLICIES'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'policies.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'PLATFORM_POLICIES',
      auditAction: 'WRITE_PLATFORM_POLICIES'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'PLATFORM_POLICIES',
      auditAction: 'SENSITIVE_ACTION_PLATFORM_POLICIES'
    })(req, res, next);
  }
}

module.exports = PlatformPoliciesPolicy;
