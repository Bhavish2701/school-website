/**
 * Deployment History & Lifecycle - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./deployments.routes');
const controller = require('./deployments.controller');
const service = require('./deployments.service');
const repository = require('./deployments.repository');
const validation = require('./deployments.validation');
const policy = require('./deployments.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
