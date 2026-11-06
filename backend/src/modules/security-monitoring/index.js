/**
 * Security & Access Threat Monitoring - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./security-monitoring.routes');
const controller = require('./security-monitoring.controller');
const service = require('./security-monitoring.service');
const repository = require('./security-monitoring.repository');
const validation = require('./security-monitoring.validation');
const policy = require('./security-monitoring.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
