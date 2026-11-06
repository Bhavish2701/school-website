/**
 * API Gateway & Client Management - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./api-management.routes');
const controller = require('./api-management.controller');
const service = require('./api-management.service');
const repository = require('./api-management.repository');
const validation = require('./api-management.validation');
const policy = require('./api-management.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
