/**
 * Sri Vidya Educational Trust - Service Health Routes (11.1)
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemHealth.controller');

router.get('/', controller.getServiceHealth);

module.exports = router;
