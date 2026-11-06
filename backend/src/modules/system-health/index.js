/**
 * System Health & Telemetry - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./system-health.routes');
const controller = require('./system-health.controller');
const service = require('./system-health.service');
const repository = require('./system-health.repository');
const validation = require('./system-health.validation');
const policy = require('./system-health.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
