const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

router.post('/consent', optionalAuthenticateUser, complianceController.recordConsent);
router.get('/consent/my', authenticate, complianceController.getMyConsents);
router.get(
  '/consent/ledger',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.getConsentLedger
);

router.get('/policies', complianceController.getPolicies);
router.post(
  '/policies',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.publishPolicyVersion
);

router.get('/dpas', complianceController.getThirdPartyDpas);
router.post(
  '/dpas',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.registerDpa
);

router.get(
  '/breaches',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.listBreachIncidents
);
router.post(
  '/breaches',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.createBreachIncident
);
router.patch(
  '/breaches/:id',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.updateBreachIncident
);

router.get('/dsr/export/:userId', authenticate, complianceController.exportUserDataDossier);

router.get('/licenses', complianceController.getLicenseAudit);

module.exports = router;
