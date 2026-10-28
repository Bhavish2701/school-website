const express = require('express');
const router = express.Router();
const feeRoutes = require('../../routes/fee.routes');
const { formatSuccess } = require('../../utils/apiResponse');

// Submenu Modular Routes:
router.get('/pending-dues', (req, res) => {
  res.json(formatSuccess([
    { studentName: 'V. Akhil', rollNo: '10-A-04', grade: 'Grade 10-A', term: 'Term-2', dueAmount: 14500, dueDate: '2026-11-15' },
    { studentName: 'S. Meghana', rollNo: '9-B-18', grade: 'Grade 9-B', term: 'Term-2', dueAmount: 12000, dueDate: '2026-11-15' }
  ], 'Pending dues retrieved'));
});

router.get('/concessions', (req, res) => {
  res.json(formatSuccess([
    { id: 'con-1', studentName: 'K. Sai Krishna', category: 'Merit Scholarship (Top 1% State)', percentage: '50%', approvedBy: 'Director' }
  ], 'Fee concessions retrieved'));
});

router.get('/financial-reports', (req, res) => {
  res.json(formatSuccess({
    fiscalYear: '2026-2027',
    totalReceivable: 12500000,
    collectedToDate: 10450000,
    outstandingDues: 2050000,
    collectionPercentage: '83.6%'
  }, 'Financial summary report retrieved'));
});

// Base fee routes
router.use('/', feeRoutes);

module.exports = router;
