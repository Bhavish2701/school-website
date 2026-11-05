/**
 * School Configuration Routes
 * REST API for Institution Profile, Academic Standards, Operational Defaults,
 * and Document Templates.
 */
const express = require('express');
const router = express.Router();
const schoolConfigController = require('../controllers/schoolConfig.controller');

// Read config
router.get('/', (req, res) => schoolConfigController.getConfig(req, res));
router.get('/:institutionId', (req, res) => schoolConfigController.getConfig(req, res));

// 4.1 School Profile
router.post('/profile', (req, res) => schoolConfigController.updateProfile(req, res));

// 4.2 Academic Configuration
router.post('/academic', (req, res) => schoolConfigController.updateAcademic(req, res));

// 4.3 Operational Defaults
router.post('/operational', (req, res) => schoolConfigController.updateOperational(req, res));

// 4.4 Document Templates
router.get('/templates/list', (req, res) => schoolConfigController.listTemplates(req, res));
router.post('/templates/:templateId', (req, res) => schoolConfigController.updateTemplate(req, res));

module.exports = router;
