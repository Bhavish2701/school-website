
const { PlatformAudit } = require('../../models/platformAudit.model');
const mongoose = require('mongoose');

class MultiInstitutionSecurity {

  static resolveActor(req) {
    if (req?.headers && (req.headers['x-actor-role'] || req.headers['x-actor-id'])) {
      const hRole = req.headers['x-actor-role'] || 'GUEST';
      const hScope = req.headers['x-institution-scope'] || 'INSTITUTION_ONLY';
      const isSuper = hRole === 'SUPER_ADMIN' || hRole === 'Super Administrator' || hScope === 'PLATFORM_WIDE';
      const isPrincipal = hRole === 'Institutional Principal' || hRole === 'PRINCIPAL' || hRole === 'VICE_PRINCIPAL';
      const defaultPerms = isSuper || isPrincipal ? ['*', 'institutions.manage', 'institutions.read', 'institutions.write'] : ['institutions.read', 'institutions.write', 'onboarding.read'];
      return {
        userId: String(req.headers['x-actor-id'] || 'HEADER-ACTOR'),
        name: req.headers['x-actor-name'] || 'Header Actor',
        email: `${req.headers['x-actor-id'] || 'operator'}@srividya.edu.in`,
        role: hRole,
        institutionId: req.headers['x-actor-institution-id'] || (isSuper ? 'TRUST-ALL' : 'INST-001'),
        scope: hScope,
        permissions: req.headers['x-actor-permissions'] ? req.headers['x-actor-permissions'].split(',') : defaultPerms
      };
    }

    if (!req || !req.user) {
      return {
        userId: 'UNAUTHENTICATED',
        name: 'Unauthenticated Request',
        role: 'GUEST',
        institutionId: 'NONE',
        scope: 'INSTITUTION_ONLY',
        permissions: []
      };
    }

    const rawRole = req.user.role || (Array.isArray(req.user.roles) ? req.user.roles[0] : 'GUEST');
    const isSuper = rawRole === 'SUPER_ADMIN' || rawRole === 'Super Administrator';
    return {
      userId: String(req.user.userId || req.user._id || req.user.id || 'UNKNOWN'),
      name: req.user.fullName || req.user.name || req.user.username || 'Authenticated User',
      email: req.user.email || `${req.user.username || 'operator'}@srividya.edu.in`,
      role: rawRole,
      institutionId: req.user.institutionId || (isSuper ? 'TRUST-ALL' : 'INST-001'),
      scope: req.user.scope || (isSuper ? 'PLATFORM_WIDE' : 'INSTITUTION_ONLY'),
      permissions: isSuper ? ['*'] : (req.user.permissions || [])
    };
  }

  static async enforcePolicy(req, res, options = {}) {
    const actor = this.resolveActor(req);
    const targetInstitutionId = options.targetInstitutionId ||
      req?.params?.institutionId ||
      req?.params?.id ||
      req?.body?.institutionId ||
      req?.query?.institutionId;

    if (actor.scope === 'INSTITUTION_ONLY') {
      if (targetInstitutionId && targetInstitutionId !== 'ALL' && targetInstitutionId !== actor.institutionId) {
        await this.logSecurityViolation(actor, 'CROSS_INSTITUTION_ACCESS_ATTEMPT', {
          attemptedInstitution: targetInstitutionId,
          userAssignedInstitution: actor.institutionId,
          endpoint: req?.originalUrl || req?.url || 'INTERNAL'
        });

        res.status(403).json({
          success: false,
          errorCode: 'CROSS_INSTITUTION_ACCESS_DENIED',
          message: `Security Policy Violation: Access denied. Your account is scoped to institution '${actor.institutionId}' and cannot perform operations on institution '${targetInstitutionId}'.`
        });
        return false;
      }

      if (options.requirePlatformWideScope) {
        await this.logSecurityViolation(actor, 'PLATFORM_WIDE_OPERATION_DENIED', {
          requiredScope: 'PLATFORM_WIDE',
          userScope: actor.scope,
          endpoint: req?.originalUrl || req?.url || 'INTERNAL'
        });

        res.status(403).json({
          success: false,
          errorCode: 'PLATFORM_SCOPE_REQUIRED',
          message: 'Security Policy Violation: This administrative operation requires explicit Platform-Wide authorization.'
        });
        return false;
      }
    }

    if (options.allowedRoles && options.allowedRoles.length > 0) {
      const hasRole = options.allowedRoles.includes(actor.role) || actor.role === 'Super Administrator';
      if (!hasRole) {
        res.status(403).json({
          success: false,
          errorCode: 'INSUFFICIENT_ROLE_AUTHORITY',
          message: `Security Policy Violation: Role '${actor.role}' lacks required tier authority. Allowed roles: ${options.allowedRoles.join(', ')}`
        });
        return false;
      }
    }

    if (options.requiredPermission && !actor.permissions.includes('*')) {
      const hasPerm = actor.permissions.includes(options.requiredPermission);
      if (!hasPerm) {
        res.status(403).json({
          success: false,
          errorCode: 'MISSING_REQUIRED_PERMISSION',
          message: `Security Policy Violation: Account lacks required permission '${options.requiredPermission}'.`
        });
        return false;
      }
    }

    if (typeof options.recordRestrictionCheck === 'function') {
      const restriction = options.recordRestrictionCheck(req);
      if (restriction && restriction.blocked) {
        res.status(403).json({
          success: false,
          errorCode: restriction.code || 'RECORD_RESTRICTION_BLOCKED',
          message: restriction.message || 'Operation blocked by record-level statutory restriction.'
        });
        return false;
      }
    }

    if (options.requireApprovalSignatory) {
      const signatory = req?.body?.approvalSignatory || req?.body?.approvedBy || req?.headers?.['x-approval-signatory'];
      if (!signatory) {
        res.status(403).json({
          success: false,
          errorCode: 'APPROVAL_SIGNATORY_REQUIRED',
          message: 'Sensitive Operation Invariant: Formal authorized approval signatory reference is required for this operation.'
        });
        return false;
      }
    }

    if (options.requireTicketReference) {
      const ticketRef = req?.body?.changeRequestId || req?.body?.recoveryTicketId || req?.body?.ticketId;
      if (!ticketRef) {
        res.status(403).json({
          success: false,
          errorCode: 'TICKET_REFERENCE_REQUIRED',
          message: 'Sensitive Operation Invariant: Approved Change Request or Docket ID reference is required.'
        });
        return false;
      }
    }

    if (options.auditAction) {
      await this.logAuditRecord(actor, options.auditCategory || 'PLATFORM_OPERATION', options.auditAction, {
        targetInstitutionId: targetInstitutionId || 'PLATFORM_WIDE',
        endpoint: req?.originalUrl || req?.url || 'INTERNAL',
        method: req?.method || 'INTERNAL',
        details: options.auditDetails || {}
      });
    }

    return true;
  }

  static policyMiddleware(options = {}) {
    return async (req, res, next) => {
      try {
        const allowed = await MultiInstitutionSecurity.enforcePolicy(req, res, options);
        if (allowed) {
          next();
        }
      } catch (err) {
        res.status(500).json({ success: false, message: 'Policy enforcement error: ' + err.message });
      }
    };
  }

  static scopeQuery(baseQuery = {}, req, explicitInstitutionId = null) {
    const actor = this.resolveActor(req);
    const resolvedInstId = explicitInstitutionId || req?.params?.institutionId || req?.query?.institutionId;

    if (actor.scope === 'INSTITUTION_ONLY') {
      return Object.assign({}, baseQuery, { institutionId: actor.institutionId });
    }

    if (resolvedInstId && resolvedInstId !== 'ALL') {
      return Object.assign({}, baseQuery, { institutionId: resolvedInstId });
    }

    return baseQuery;
  }

  static async logSecurityViolation(actor, violationType, details) {
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const now = Date.now();
        await PlatformAudit.create({
          eventId: `SEC-VIOLATION-${now}`,
          correlationId: `CORR-SEC-${now}`,
          timestamp: new Date(),
          category: 'SECURITY_ALERTS',
          action: violationType || 'SECURITY_POLICY_VIOLATION',
          actor: {
            userId: String(actor?.userId || 'SYSTEM'),
            name: actor?.name || 'System Security Policy',
            email: actor?.email || 'security@srividya.edu.in',
            role: actor?.role || 'UNKNOWN',
            scope: actor?.scope === 'PLATFORM_WIDE' ? 'Platform' : 'Institution',
          },
          institutionId: actor?.institutionId || 'TRUST-ALL',
          targetEntity: {
            entityType: 'SecurityPolicy',
            entityId: String(details?.targetInstitutionId || actor?.institutionId || 'TRUST-ALL'),
            displayName: violationType || 'Policy Check',
          },
          result: 'DENIED',
          severity: 'HIGH',
          reason: details?.reason || 'Cross-institution or unauthorized access attempt blocked',
          details
        });
      }
    } catch (e) {}
  }

  static async logAuditRecord(actor, category, action, details = {}) {
    const validCategories = ['AUTH_ACCOUNTS','INSTITUTIONS','RBAC_PERMISSIONS','SCHOOL_CONFIG','INTEGRATIONS','DATA_IMPORT_EXPORT','BACKUP_RECOVERY','ADMIN_SUPPORT','SECURITY_ALERTS','DEPLOYMENT_OPS'];
    const mappedCategory = validCategories.includes(category) ? category : 'SECURITY_ALERTS';
    const validResults = ['SUCCESS', 'FAILED', 'DENIED', 'WARNING'];
    const mappedResult = validResults.includes(details.result) ? details.result : 'SUCCESS';
    const now = Date.now();
    const eventId = `AUD-${now}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const auditDoc = {
      eventId,
      correlationId: details.correlationId || `CORR-${now}`,
      timestamp: new Date(),
      category: mappedCategory,
      action: action || 'PLATFORM_ACTION',
      actor: {
        userId: String(actor?.userId || actor?.id || 'SYSTEM'),
        name: actor?.name || 'Platform Operator',
        email: actor?.email || 'admin@srividya.edu.in',
        role: actor?.role || 'SUPER_ADMIN',
        scope: actor?.scope === 'INSTITUTION_ONLY' ? 'Institution' : 'Platform',
      },
      institutionId: details.targetInstitutionId || actor?.institutionId || 'TRUST-ALL',
      targetEntity: {
        entityType: details.entityType || 'PlatformEntity',
        entityId: String(details.targetId || details.targetInstitutionId || actor?.institutionId || 'TRUST-ALL'),
        displayName: details.displayName || action || 'Platform Audit Event',
      },
      result: mappedResult,
      severity: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(details.severity) ? details.severity : 'INFO',
      reason: details.reason || `Recorded ${action || 'action'} via security policy controller`,
      details
    };

    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await PlatformAudit.create(auditDoc);
      }
    } catch (e) {}

    return auditDoc;
  }

  static async logSecurityEvent(params = {}) {
    const {
      actor = { id: 'auditor', name: 'Security Auditor', role: 'Trust Security Auditor', scope: 'PLATFORM_WIDE' },
      institutionId = 'ALL',
      action = 'SECURITY_AUDIT',
      category = 'SECURITY_MONITORING',
      result = 'SUCCESS',
      severity = 'INFO',
      details = {}
    } = params;

    return await this.logAuditRecord(actor, category, action, Object.assign({}, details, {
      targetInstitutionId: institutionId,
      result,
      severity
    }));
  }
}

module.exports = MultiInstitutionSecurity;
