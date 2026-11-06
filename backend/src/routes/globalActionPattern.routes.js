/**
 * Sri Vidya Educational Trust - Global Action Patterns Routes
 * Consistent Confirmation Dialogs, Field Validation, Duplicate Checking,
 * and Post-Backend Success Feedback.
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/globalActionPattern.controller');

// Pattern Registry
router.get('/patterns', controller.getPatterns);
router.get('/', controller.getPatterns);

// Validation
router.post('/validate', controller.validateAction);

// Execution / Confirmation
router.post('/confirm', controller.confirmAction);
router.post('/execute', controller.confirmAction);

module.exports = router;

