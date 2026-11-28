
const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemHealth.controller');

router.get('/', controller.getServiceHealth);

module.exports = router;
