
const RoleTemplateService = require('../services/roleTemplate.service');

const requirePermission = (moduleName, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);

      if (userRoles.includes('Super Administrator') || userRoles.includes('Platform Owner') || req.user?.isSuperAdmin) {
        return next();
      }

      if (userRoles.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied: No role templates associated with request context.'
        });
      }

      const context = {
        institutionId: req.params.institutionId || req.body.institutionId || req.query.institutionId,
        userInstitutionId: req.user?.institutionId,
        requestedSensitiveField: options.sensitiveField || null
      };

      const result = await RoleTemplateService.evaluatePermission(userRoles, moduleName, action, context);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: result.reason || `Unauthorized: Requires '${action}' permission on '${moduleName}'.`
        });
      }

      req.permissionContext = result;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'PermissionEvaluationError',
        message: err.message
      });
    }
  };
};

module.exports = {
  requirePermission
};

