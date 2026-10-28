const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/', (req, res) => {
  res.json(formatSuccess([
    { id: 'apt-1', parentName: 'K. Subrahmanyam', studentName: 'K. Sai Krishna (10-A)', facultyName: 'M. Sreenivasa Rao', date: '2026-10-26', time: '04:15 PM', status: 'CONFIRMED', agenda: 'Board Exam Preparation & Mathematics Counseling' },
    { id: 'apt-2', parentName: 'V. Ramanjaneyulu', studentName: 'V. Sai Sneha (10-A)', facultyName: 'Principal', date: '2026-10-28', time: '11:00 AM', status: 'PENDING_APPROVAL', agenda: 'Olympiad Training and Fee Structure' }
  ], 'Appointments retrieved successfully'));
});

router.post('/book', (req, res) => {
  res.status(201).json(formatSuccess({ id: 'apt-' + Date.now(), ...req.body, status: 'CONFIRMED' }, 'Appointment booked successfully'));
});

router.patch('/:id/status', (req, res) => {
  res.json(formatSuccess({ id: req.params.id, status: req.body.status || 'CONFIRMED' }, 'Appointment status updated'));
});

module.exports = router;
