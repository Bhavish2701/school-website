/**
 * Sri Vidya Educational Trust - Role Templates Routes
 * Module 7: RBAC API Endpoints
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/roleTemplate.controller');

// Read & Query
router.get('/summary', controller.getSummary);
router.get('/', controller.listRoles);
router.post('/evaluate', controller.evaluatePermission);
router.get('/:roleId', controller.getRole);

// Lifecycle Operations
router.post('/', controller.createRole);
router.post('/:roleId/duplicate', controller.duplicateRole);
router.put('/:roleId', controller.updateRole);
router.post('/:roleId/review', controller.reviewRoleChange);
router.post('/:roleId/toggle-status', controller.toggleRoleStatus);
router.post('/:roleId/assign-users', controller.assignUsers);

module.exports = router;
