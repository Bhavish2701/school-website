const express = require('express');
const router = express.Router();
const timetableRoutes = require('../../routes/timetable.routes');
const { formatSuccess } = require('../../utils/apiResponse');

// Submenu Modular Routes:
router.get('/teacher-allocations', (req, res) => {
  res.json(formatSuccess([
    { teacherId: 't-1', name: 'M. Sreenivasa Rao', subject: 'Mathematics', weeklyHours: 24, classes: ['10-A', '10-B', '9-A'] },
    { teacherId: 't-2', name: 'B. Anuradha', subject: 'Physical Science', weeklyHours: 22, classes: ['10-A', '9-B', '8-A'] }
  ], 'Teacher allocations retrieved'));
});

router.get('/substitutions', (req, res) => {
  res.json(formatSuccess([
    { id: 'sub-1', absentTeacher: 'K. Ramesh (Telugu)', substituteTeacher: 'P. Venkat Rao', period: 3, class: '9-B', date: '2026-10-24', status: 'CONFIRMED' }
  ], 'Substitutions retrieved'));
});

router.get('/room-bookings', (req, res) => {
  res.json(formatSuccess([
    { room: 'Audio-Visual Seminar Hall', bookedBy: 'English Dept.', date: '2026-10-24', period: 'Period 4-5', purpose: 'Phonetics & Debate Workshop' }
  ], 'Room bookings retrieved'));
});

router.get('/lab-allocations', (req, res) => {
  res.json(formatSuccess([
    { lab: 'Tinkering Science Lab', class: 'Grade 10-A', faculty: 'B. Anuradha', time: '10:30 AM - 12:00 PM', topic: 'Ohm’s Law & Electric Circuits' },
    { lab: 'Computer Information Lab', class: 'Grade 8-B', faculty: 'S. Divya', time: '01:30 PM - 02:45 PM', topic: 'Python Loops & Algorithms' }
  ], 'Lab allocations retrieved'));
});

// Base timetable routes
router.use('/', timetableRoutes);

module.exports = router;
