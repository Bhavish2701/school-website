/**
 * Sri Vidya Educational Trust - Background Jobs Routes (11.4)
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemHealth.controller');

router.get('/', controller.listJobs);
router.get('/:jobId', controller.getJob);
router.post('/:jobId/retry', controller.retryJob);
router.post('/:jobId/cancel', controller.cancelJob);

module.exports = router;

