/**
 * Sri Vidya Educational Trust - Platform Policies & Data Retention Routes
 * Module 17: Governance Policy Register, Granular Retention Rules, and Controlled Data Requests
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/platformPolicy.controller');

// 17.1 Policy Register
router.get('/', controller.listPolicies);
router.get('/register', controller.listPolicies);
router.get('/register/:id', controller.getPolicy);
router.post('/register', controller.createPolicy);
router.put('/register/:id', controller.updatePolicy);

// 17.2 Data Retention Configuration & Safeguards
router.get('/retention', controller.listRetentionRules);
router.get('/retention/:id', controller.getRetentionRule);
router.post('/retention/draft', controller.createRetentionDraft);
router.post('/retention/:id/submit-review', controller.submitRetentionReview);
router.post('/retention/:id/approve', controller.approveRetentionRule);
router.post('/retention/:id/publish', controller.publishRetentionRule);
router.get('/retention/:id/versions', controller.getRetentionVersions);

// 17.3 Data Requests & Governance Safeguards
router.get('/requests', controller.listDataRequests);
router.get('/requests/:id', controller.getDataRequest);
router.post('/requests', controller.createDataRequest);
router.post('/requests/:id/approve', controller.approveDataRequest);
router.post('/requests/:id/reject', controller.rejectDataRequest);
router.post('/requests/:id/fulfill', controller.fulfillDataRequest);

module.exports = router;
