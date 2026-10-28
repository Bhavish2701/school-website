const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/academic-overview', (req, res) => {
  res.json(formatSuccess({
    academicYear: '2026-2027',
    averagePassRate: '98.4%',
    distinctionRate: '68.2%',
    topSubject: 'Mathematics (92.4% avg)',
    totalStudentsEvaluated: 850
  }, 'Academic analytics report retrieved'));
});

router.get('/compliance', (req, res) => {
  res.json(formatSuccess({
    fireSafetyCertificate: 'VALID (Exp: 2028)',
    sanitaryCertificate: 'VALID (Exp: 2027)',
    buildingFitnessCertificate: 'VALID (Exp: 2029)',
    rteQuotaFulfillment: '100% compliant'
  }, 'Statutory compliance status retrieved'));
});

module.exports = router;
