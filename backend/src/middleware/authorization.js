/**
 * Authorization Middleware (RBAC & Permissions)
 * Verifies roles and fine-grained permissions for secured endpoints
 */
const {
  authorizeRoles,
  authorizeResource,
  requireRole,
  requirePermission,
} = require('./rbac.middleware');

module.exports = {
  authorizeRoles,
  authorizeResource,
  requireRole,
  requirePermission,
  authorize: authorizeRoles,
};
