/**
 * Sri Vidya Educational Trust - Global Platform Settings Routes
 * Module 16: General Settings, Authentication Policies, Platform Feature Controls, and Maintenance Safeguards
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/globalSettings.controller');

// 16.1 General Settings
router.get('/', controller.getSettings);
router.put('/general', controller.updateGeneral);

// 16.2 Authentication Settings & Safety Invariants
router.put('/authentication', controller.updateAuthentication);

// 16.3 Platform Feature Controls
router.get('/features', controller.listFeatures);
router.get('/features/:id', controller.getFeature);
router.post('/features', controller.createFeature);
router.put('/features/:id', controller.updateFeature);
router.post('/features/:id/toggle', controller.toggleFeature);

// 16.4 Maintenance Settings & Safeguards
router.get('/maintenance', controller.getMaintenance);
router.post('/maintenance/schedule', controller.scheduleMaintenance);
router.post('/maintenance/toggle', controller.toggleMaintenance);
router.post('/maintenance/preview', controller.previewMaintenance);
router.get('/maintenance/preview', controller.previewMaintenance);

module.exports = router;

