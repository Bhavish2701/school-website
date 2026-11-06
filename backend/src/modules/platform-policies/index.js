/**
 * Platform Policies & Governance Register - Module Aggregator
 * Exports all 6 architectural layers
 */

const routes = require('./platform-policies.routes');
const controller = require('./platform-policies.controller');
const service = require('./platform-policies.service');
const repository = require('./platform-policies.repository');
const validation = require('./platform-policies.validation');
const policy = require('./platform-policies.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
