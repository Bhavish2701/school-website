/**
 * Legal, Privacy & Compliance Routes
 * Mount path: /api/v1/compliance
 */
const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { optionalAuthenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');

// 1. Consent Recording & Queries (DPDP Act & GDPR Article 7)
router.post('/consent', optionalAuthenticateUser, complianceController.recordConsent);
router.get('/consent/my', authenticate, complianceController.getMyConsents);
router.get(
  '/consent/ledger',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.getConsentLedger
);

// 2. Policy Version Governance
router.get('/policies', complianceController.getPolicies);
router.post(
  '/policies',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.publishPolicyVersion
);

// 3. Third-Party Data Processing Agreements (DPAs) & Processor Disclosures
router.get('/dpas', complianceController.getThirdPartyDpas);
router.post(
  '/dpas',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'),
  complianceController.registerDpa
);

// 4. Data Breach Incident Management (CERT-In / DPBI Directions)
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

// 5. Data Subject Access Request (SAR / Portability Export)
router.get('/dsr/export/:userId', authenticate, complianceController.exportUserDataDossier);

// 6. Open-Source Software Licenses & Intellectual Property
router.get('/licenses', complianceController.getLicenseAudit);

module.exports = router;
