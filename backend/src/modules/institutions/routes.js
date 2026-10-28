const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/profile', (req, res) => {
  res.json(formatSuccess({
    id: 'inst-001',
    name: 'Sri Vidya English Medium High School',
    code: 'SVEMHS',
    affiliation: 'State Board of Secondary Education, AP (Recognized by Govt. of Andhra Pradesh)',
    recognitionCode: 'AP-EDS-2024-SVEMHS',
    established: 1998,
    address: 'Main Campus, Trunk Road, Rayachoty, Annamayya Dist., Andhra Pradesh - 516269',
    contact: {
      phone: '+91 94402 34567',
      email: 'contact@srividyaschool.edu.in',
      admissionsEmail: 'admissions@srividyaschool.edu.in'
    },
    accreditation: 'A+ Grade Institutional Excellence Rating',
    curriculum: ['State Board (AP)', 'Pre-Primary Playgroup', 'Primary Grades 1-5', 'Secondary Grades 6-10'],
    capacity: 1200,
    currentStrength: 850
  }, 'Institution profile retrieved successfully'));
});

router.put('/profile', (req, res) => {
  res.json(formatSuccess(req.body, 'Institution profile updated successfully'));
});

router.get('/branches', (req, res) => {
  res.json(formatSuccess([
    { id: 'branch-1', name: 'Main High School Campus', address: 'Trunk Road, Rayachoty', grades: '6th - 10th' },
    { id: 'branch-2', name: 'Primary & Kindergarten Campus', address: 'Bypass Road, Rayachoty', grades: 'Nursery - 5th' }
  ], 'Branches retrieved successfully'));
});

module.exports = router;
