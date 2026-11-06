/**
 * Sri Vidya Educational Trust - School Gateways Routes
 * Module 18: Navigation Gateways, Identity Scoping, and Decoupled Telemetry
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/schoolGateway.controller');

// 18.3 Gateway Status & Decoupled Health Telemetry
router.get('/status', controller.getStatus);
router.get('/probe-website', controller.probeWebsite);
router.post('/probe-website', controller.probeWebsite);

// 18.1 School Administration Portal Access Verification & URL Token Leakage Prevention
router.get('/verify-admin', controller.verifyAdministrationAccess);
router.post('/verify-admin', controller.verifyAdministrationAccess);
router.get('/verify-access', controller.verifyAdministrationAccess);
router.post('/verify-access', controller.verifyAdministrationAccess);

// 18.2 Faculty & Teacher Portal Verification
router.get('/verify-faculty', controller.verifyFacultyAccess);
router.post('/verify-faculty', controller.verifyFacultyAccess);

module.exports = router;
