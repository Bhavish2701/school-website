
const express = require('express');
const router = express.Router();
const controller = require('../controllers/platformWorkflow.controller');

router.get('/overview', controller.getOverview);
router.get('/', controller.getOverview);

router.post('/register-school', controller.registerSchool);

router.post('/invite-admin', controller.inviteAdmin);
router.post('/activate-admin', controller.activateAdmin);

router.post('/deploy-version', controller.deployVersion);
router.post('/deploy-rollback', controller.rollbackDeployment);
router.post('/deploy-rollback/:deploymentId', controller.rollbackDeployment);

router.post('/create-incident', controller.createIncident);
router.post('/resolve-incident', controller.resolveIncident);
router.post('/resolve-incident/:incidentId', controller.resolveIncident);

router.post('/suspend-account', controller.suspendAccount);
router.post('/reinstate-account', controller.reinstateAccount);

router.post('/import-records/test', controller.testImport);
router.post('/import-records/approve', controller.approveImport);

module.exports = router;

