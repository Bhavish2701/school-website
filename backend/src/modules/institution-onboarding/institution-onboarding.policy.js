/**
 * Institution Onboarding & Migration - Policy & Authorization Layer
 * Enforces Multi-Institution Scoping, RBAC roles, and Audit Logging
 */

const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class InstitutionOnboardingPolicy {
  static readPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator', 'Trust Security Auditor'],
      requiredPermission: 'onboarding.manage',
      auditCategory: 'INSTITUTION_ONBOARDING',
      auditAction: 'READ_INSTITUTION_ONBOARDING'
    })(req, res, next);
  }

  static writePolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      allowedRoles: ['Super Administrator', 'Institutional Principal', 'Campus Administrator'],
      requiredPermission: 'onboarding.manage',
      requirePlatformWideScope: false, // permits scoped school operations
      auditCategory: 'INSTITUTION_ONBOARDING',
      auditAction: 'WRITE_INSTITUTION_ONBOARDING'
    })(req, res, next);
  }

  static sensitiveActionPolicy(req, res, next) {
    return MultiInstitutionSecurity.policyMiddleware({
      requirePlatformWideScope: true, // sensitive actions require platform super admin
      allowedRoles: ['Super Administrator'],
      requireApprovalSignatory: true,
      auditCategory: 'INSTITUTION_ONBOARDING',
      auditAction: 'SENSITIVE_ACTION_INSTITUTION_ONBOARDING'
    })(req, res, next);
  }
}

module.exports = InstitutionOnboardingPolicy;
