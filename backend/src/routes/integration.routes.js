
const express = require('express');
const router = express.Router();
const controller = require('../controllers/integration.controller');

router.get('/api-clients', controller.listApiClients);
router.post('/api-clients', controller.registerApiClient);
router.post('/api-clients/:clientId/rotate', controller.rotateApiClientCredentials);
router.post('/api-clients/:clientId/revoke', controller.revokeApiClient);

router.get('/logs', controller.listEventLogs);
router.post('/logs/:eventId/reconcile', controller.reconcilePaymentEvent);

router.get('/', controller.listIntegrations);
router.post('/', controller.createIntegration);
router.get('/:id', controller.getIntegration);
router.put('/:id', controller.updateIntegration);
router.post('/:id/test', controller.testConnection);
router.post('/:id/toggle', controller.toggleIntegration);
router.post('/:id/rotate', controller.rotateCredentials);
router.post('/:id/disconnect', controller.disconnectIntegration);

module.exports = router;

