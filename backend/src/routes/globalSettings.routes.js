
const express = require('express');
const router = express.Router();
const controller = require('../controllers/globalSettings.controller');

router.get('/', controller.getSettings);
router.put('/general', controller.updateGeneral);

router.put('/authentication', controller.updateAuthentication);

router.get('/features', controller.listFeatures);
router.get('/features/:id', controller.getFeature);
router.post('/features', controller.createFeature);
router.put('/features/:id', controller.updateFeature);
router.post('/features/:id/toggle', controller.toggleFeature);

router.get('/maintenance', controller.getMaintenance);
router.post('/maintenance/schedule', controller.scheduleMaintenance);
router.post('/maintenance/toggle', controller.toggleMaintenance);
router.post('/maintenance/preview', controller.previewMaintenance);
router.get('/maintenance/preview', controller.previewMaintenance);

module.exports = router;

