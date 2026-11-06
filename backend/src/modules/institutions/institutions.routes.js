/**
 * Institutions Module - Route Layer
 * Connects endpoints with validation and policy middleware
 */

const express = require('express');
const router = express.Router();
const controller = require('./institutions.controller');
const validation = require('./institutions.validation');
const policy = require('./institutions.policy');

router.get('/', policy.readPolicy, controller.list);
router.post('/', policy.createPolicy, validation.validateCreate, controller.create);
router.get('/:id', policy.readPolicy, controller.getById);
router.post('/:id/suspend', policy.suspendPolicy, validation.validateSuspension, controller.suspend);

module.exports = router;
