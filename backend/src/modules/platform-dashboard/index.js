/**
 * Platform Dashboard Telemetry - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./platform-dashboard.routes');
const controller = require('./platform-dashboard.controller');
const service = require('./platform-dashboard.service');
const repository = require('./platform-dashboard.repository');
const validation = require('./platform-dashboard.validation');
const policy = require('./platform-dashboard.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
