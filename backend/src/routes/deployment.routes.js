/**
 * Sri Vidya Educational Trust - Deployment History Routes (11.2)
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemHealth.controller');

router.get('/', controller.listDeployments);
router.post('/', controller.initiateDeployment);
router.get('/:deploymentId', controller.getDeployment);
router.post('/:deploymentId/rollback', controller.requestRollback);

module.exports = router;
