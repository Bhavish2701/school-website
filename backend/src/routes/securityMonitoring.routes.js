
const express = require('express');
const router = express.Router();
const controller = require('../controllers/securityMonitoring.controller');

router.get('/overview', controller.getOverview);

router.get('/events', controller.listEvents);
router.get('/events/:eventId', controller.getEvent);
router.get('/', controller.listEvents);

router.post('/events/:eventId/triage', controller.triageEvent);
router.post('/events/:eventId/assign', controller.assignInvestigator);
router.post('/events/:eventId/investigate', controller.markUnderInvestigation);
router.post('/events/:eventId/findings', controller.recordFindings);
router.post('/events/:eventId/contain', controller.containOrRemediate);
router.post('/events/:eventId/close', controller.closeEvent);
router.post('/events/:eventId/escalate', controller.escalateEvent);

router.get('/reviews', controller.listAccessReviews);
router.post('/reviews/:reviewId/outcome', controller.recordAccessReviewOutcome);

module.exports = router;

