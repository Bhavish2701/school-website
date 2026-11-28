
const express = require('express');
const router = express.Router();
const controller = require('../controllers/globalActionPattern.controller');

router.get('/patterns', controller.getPatterns);
router.get('/', controller.getPatterns);

router.post('/validate', controller.validateAction);

router.post('/confirm', controller.confirmAction);
router.post('/execute', controller.confirmAction);

module.exports = router;

