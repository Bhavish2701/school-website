
const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscription.controller');

router.get('/summary', controller.getSummary);

router.get('/usage', controller.getUsage);
router.get('/usage/:institutionId', controller.getUsage);

router.get('/plans', controller.listPlans);
router.post('/plans', controller.createPlan);
router.get('/plans/:planId', controller.getPlan);
router.put('/plans/:planId', controller.updatePlan);
router.patch('/plans/:planId', controller.updatePlan);
router.post('/plans/:planId/publish', controller.publishPlan);
router.post('/plans/:planId/archive', controller.archivePlan);

router.get('/', controller.listSubscriptions);
router.get('/subscriptions', controller.listSubscriptions);
router.post('/assign', controller.assignPlan);
router.post('/subscriptions/assign', controller.assignPlan);
router.get('/:subscriptionId', controller.getSubscription);
router.post('/:subscriptionId/renew', controller.renewSubscription);
router.post('/:subscriptionId/change-plan', controller.changePlan);
router.post('/:subscriptionId/adjustments', controller.recordAdjustment);
router.post('/:subscriptionId/status', controller.suspendOrCancel);

module.exports = router;
