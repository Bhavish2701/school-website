/**
 * Authentication Middleware
 * Validates JWT tokens and injects authenticated user payload into req.user
 */
const { authenticateUser } = require('./rbac.middleware');

module.exports = authenticateUser;
module.exports.authenticate = authenticateUser;
module.exports.authenticateUser = authenticateUser;
