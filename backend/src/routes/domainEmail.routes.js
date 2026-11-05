/**
 * Sri Vidya Educational Trust - Domains, Email & Notifications Routes
 * Module 15: Domain Directory, DNS Configuration, Email Services, and Notification Templates
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/domainEmail.controller');

// 15.3 Email Service Management
router.get('/email/services', controller.listEmailServices);
router.post('/email/services/:id/test', controller.sendTestEmail);
router.post('/email/services/:id/verify-sender', controller.verifySender);
router.post('/email/services/:id/toggle', controller.toggleEmailService);
router.get('/email/services/:id/logs', controller.getDeliveryLogs);

// 15.4 Notification Templates
router.get('/templates', controller.listTemplates);
router.get('/templates/:id', controller.getTemplate);
router.put('/templates/:id', controller.updateTemplate);
router.post('/templates/:id/preview', controller.previewTemplate);
router.post('/templates/:id/test-send', controller.testSendTemplate);

// 15.1 & 15.2 Domain Directory & DNS Verification
router.get('/', controller.listDomains);
router.post('/', controller.createDomain);
router.get('/:id', controller.getDomain);
router.get('/:id/dns', controller.getDomainDns);
router.post('/:id/verify', controller.verifyDomainOwnership);
router.post('/:id/check-dns', controller.checkDns);
router.post('/:id/retry', controller.retryVerification);
router.delete('/:id', controller.removeDomain);
router.post('/:id/toggle', controller.toggleDomain);

module.exports = router;
