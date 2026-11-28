const express = require('express');
const router = express.Router();
const schoolConfigController = require('../controllers/schoolConfig.controller');

router.get('/', (req, res) => schoolConfigController.getConfig(req, res));
router.get('/:institutionId', (req, res) => schoolConfigController.getConfig(req, res));

router.post('/profile', (req, res) => schoolConfigController.updateProfile(req, res));

router.post('/academic', (req, res) => schoolConfigController.updateAcademic(req, res));

router.post('/operational', (req, res) => schoolConfigController.updateOperational(req, res));

router.get('/templates/list', (req, res) => schoolConfigController.listTemplates(req, res));
router.post('/templates/:templateId', (req, res) => schoolConfigController.updateTemplate(req, res));

module.exports = router;

