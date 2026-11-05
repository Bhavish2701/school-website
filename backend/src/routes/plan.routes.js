/**
 * Sri Vidya Educational Trust - Commercial Plans Routes
 * Module 10.1: Commercial Plans Directory Endpoints
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/subscription.controller');

router.get('/', controller.listPlans);
router.post('/', controller.createPlan);
router.get('/:planId', controller.getPlan);
router.put('/:planId', controller.updatePlan);
router.patch('/:planId', controller.updatePlan);
router.post('/:planId/publish', controller.publishPlan);
router.post('/:planId/archive', controller.archivePlan);

module.exports = router;

