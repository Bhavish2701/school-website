/**
 * Institutional Domains & DNS - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./domains.routes');
const controller = require('./domains.controller');
const service = require('./domains.service');
const repository = require('./domains.repository');
const validation = require('./domains.validation');
const policy = require('./domains.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
