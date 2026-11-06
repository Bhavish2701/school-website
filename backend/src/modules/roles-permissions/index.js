/**
 * Role Templates & RBAC Permissions - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./roles-permissions.routes');
const controller = require('./roles-permissions.controller');
const service = require('./roles-permissions.service');
const repository = require('./roles-permissions.repository');
const validation = require('./roles-permissions.validation');
const policy = require('./roles-permissions.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
