
const routes = require('./institutions.routes');
const controller = require('./institutions.controller');
const service = require('./institutions.service');
const repository = require('./institutions.repository');
const validation = require('./institutions.validation');
const policy = require('./institutions.policy');

module.exports = {
  routes,
  controller,
  service,
  repository,
  validation,
  policy
};
