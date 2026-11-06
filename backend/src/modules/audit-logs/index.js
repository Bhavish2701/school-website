/**
 * Forensic Audit Logs Explorer - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./audit-logs.routes');
const controller = require('./audit-logs.controller');
const service = require('./audit-logs.service');
const repository = require('./audit-logs.repository');
const validation = require('./audit-logs.validation');
const policy = require('./audit-logs.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
