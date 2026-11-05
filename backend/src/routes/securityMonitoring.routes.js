/**
 * Sri Vidya Educational Trust - Security & Access Monitoring Routes
 * Module 9: Real-time Threat Defense, 9.1 Overview, 9.2 Event Register,
 * 9.3 Privileged Access Reviews, and 9.4 7-Step Incident Workflow
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/securityMonitoring.controller');

// 9.1 Security Overview KPIs
router.get('/overview', controller.getOverview);

// 9.2 Security Events Register
router.get('/events', controller.listEvents);
router.get('/events/:eventId', controller.getEvent);
router.get('/', controller.listEvents);

// 9.4 Incident Lifecycle Transitions & Actions
router.post('/events/:eventId/triage', controller.triageEvent);
router.post('/events/:eventId/assign', controller.assignInvestigator);
router.post('/events/:eventId/investigate', controller.markUnderInvestigation);
router.post('/events/:eventId/findings', controller.recordFindings);
router.post('/events/:eventId/contain', controller.containOrRemediate);
router.post('/events/:eventId/close', controller.closeEvent);
router.post('/events/:eventId/escalate', controller.escalateEvent);

// 9.3 Privileged Access Reviews
router.get('/reviews', controller.listAccessReviews);
router.post('/reviews/:reviewId/outcome', controller.recordAccessReviewOutcome);

module.exports = router;
