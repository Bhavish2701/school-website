/**
 * Sri Vidya Educational Trust - Integrations & API Management Routes
 * Module 13: Integrations Directory, Configuration, API Clients, and Event Logs
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/integration.controller');

// 13.3 API Management (External Clients)
router.get('/api-clients', controller.listApiClients);
router.post('/api-clients', controller.registerApiClient);
router.post('/api-clients/:clientId/rotate', controller.rotateApiClientCredentials);
router.post('/api-clients/:clientId/revoke', controller.revokeApiClient);

// 13.4 Integration Event Logs
router.get('/logs', controller.listEventLogs);
router.post('/logs/:eventId/reconcile', controller.reconcilePaymentEvent);

// 13.1 & 13.2 Integrations Directory & Configuration
router.get('/', controller.listIntegrations);
router.post('/', controller.createIntegration);
router.get('/:id', controller.getIntegration);
router.put('/:id', controller.updateIntegration);
router.post('/:id/test', controller.testConnection);
router.post('/:id/toggle', controller.toggleIntegration);
router.post('/:id/rotate', controller.rotateCredentials);
router.post('/:id/disconnect', controller.disconnectIntegration);

module.exports = router;

