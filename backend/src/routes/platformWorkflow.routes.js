/**
 * Sri Vidya Educational Trust - Platform Administration Workflows Routes
 * Workflows A through F
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/platformWorkflow.controller');

// Overview
router.get('/overview', controller.getOverview);
router.get('/', controller.getOverview);

// Workflow A: Register a new school
router.post('/register-school', controller.registerSchool);

// Workflow B: Invite a new school administrator
router.post('/invite-admin', controller.inviteAdmin);
router.post('/activate-admin', controller.activateAdmin);

// Workflow C: Deploy a new application version
router.post('/deploy-version', controller.deployVersion);
router.post('/deploy-rollback', controller.rollbackDeployment);
router.post('/deploy-rollback/:deploymentId', controller.rollbackDeployment);

// Workflow D: Resolve a system incident
router.post('/create-incident', controller.createIncident);
router.post('/resolve-incident', controller.resolveIncident);
router.post('/resolve-incident/:incidentId', controller.resolveIncident);

// Workflow E: Suspend a compromised account
router.post('/suspend-account', controller.suspendAccount);
router.post('/reinstate-account', controller.reinstateAccount);

// Workflow F: Import an existing school's records
router.post('/import-records/test', controller.testImport);
router.post('/import-records/approve', controller.approveImport);

module.exports = router;
