const express = require('express');
const router = express.Router();
const attendanceRoutes = require('../../routes/attendance.routes');
const { formatSuccess } = require('../../utils/apiResponse');

// Submenu Modular Routes:
// 1. Late Arrivals
router.get('/late-arrivals', (req, res) => {
  res.json(formatSuccess([
    { id: 'late-1', studentName: 'V. Sai Sneha', rollNo: '10-A-14', class: 'Grade 10-A', arrivalTime: '08:48 AM', expectedTime: '08:30 AM', reason: 'School Bus Route 4 delayed by railway crossing' },
    { id: 'late-2', studentName: 'K. Dinesh', rollNo: '8-B-08', class: 'Grade 8-B', arrivalTime: '08:42 AM', expectedTime: '08:30 AM', reason: 'Heavy traffic at Kadapa Bypass' }
  ], 'Late arrivals retrieved'));
});

// 2. Absences Tracking
router.get('/absences', (req, res) => {
  res.json(formatSuccess([
    { id: 'abs-1', studentName: 'P. Charan Tej', rollNo: '9-A-21', class: 'Grade 9-A', absenceType: 'Excused (Medical)', fromDate: '2026-10-23', toDate: '2026-10-25', status: 'Approved' },
    { id: 'abs-2', studentName: 'M. Haritha', rollNo: '7-C-11', class: 'Grade 7-C', absenceType: 'Unexcused', fromDate: '2026-10-24', toDate: '2026-10-24', status: 'Pending Verification' }
  ], 'Absences records retrieved'));
});

// 3. Attendance Corrections
router.get('/corrections', (req, res) => {
  res.json(formatSuccess([
    { id: 'corr-101', studentName: 'R. Manoj Kumar', class: 'Grade 10-B', date: '2026-10-23', requestedBy: 'Mrs. K. Sunitha (Maths Faculty)', originalStatus: 'ABSENT', correctedStatus: 'PRESENT', reason: 'Present in Science Lab during morning roll call', status: 'PENDING_APPROVAL' }
  ], 'Attendance corrections retrieved'));
});

router.post('/corrections', (req, res) => {
  res.status(201).json(formatSuccess({ id: 'corr-' + Date.now(), ...req.body, status: 'SUBMITTED' }, 'Correction submitted'));
});

// 4. Daily / Monthly Summaries
router.get('/summaries', (req, res) => {
  res.json(formatSuccess({
    date: '2026-10-24',
    totalEnrolled: 850,
    presentToday: 825,
    absentToday: 21,
    lateToday: 4,
    dailyAttendanceRate: '97.05%',
    monthlyAverage: '96.2%',
    staffAttendanceRate: '100%'
  }, 'Attendance summary retrieved'));
});

// Base attendance routes
router.use('/', attendanceRoutes);

module.exports = router;
