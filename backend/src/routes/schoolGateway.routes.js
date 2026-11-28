
const express = require('express');
const router = express.Router();
const controller = require('../controllers/schoolGateway.controller');

router.get('/status', controller.getStatus);
router.get('/probe-website', controller.probeWebsite);
router.post('/probe-website', controller.probeWebsite);

router.get('/verify-admin', controller.verifyAdministrationAccess);
router.post('/verify-admin', controller.verifyAdministrationAccess);
router.get('/verify-access', controller.verifyAdministrationAccess);
router.post('/verify-access', controller.verifyAdministrationAccess);

router.get('/verify-faculty', controller.verifyFacultyAccess);
router.post('/verify-faculty', controller.verifyFacultyAccess);

module.exports = router;

