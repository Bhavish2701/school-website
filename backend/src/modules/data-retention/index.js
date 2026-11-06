/**
 * Statutory Data Retention & Requests - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./data-retention.routes');
const controller = require('./data-retention.controller');
const service = require('./data-retention.service');
const repository = require('./data-retention.repository');
const validation = require('./data-retention.validation');
const policy = require('./data-retention.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
