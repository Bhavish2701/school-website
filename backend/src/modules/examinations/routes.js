const express = require('express');
const router = express.Router();
const examRoutes = require('../../routes/exam.routes');
const { formatSuccess } = require('../../utils/apiResponse');

// Submenu Modular Routes:
router.get('/schedules', (req, res) => {
  res.json(formatSuccess([
    { examName: 'Term-1 Summative Assessment (SA-1)', startDate: '2026-11-10', endDate: '2026-11-18', grades: '1st - 10th' }
  ], 'Exam schedules retrieved'));
});

router.get('/invigilation', (req, res) => {
  res.json(formatSuccess([
    { date: '2026-11-10', session: 'Morning (09:30 AM - 12:30 PM)', hall: 'Hall-3', invigilator: 'M. Sreenivasa Rao' }
  ], 'Invigilation roster retrieved'));
});

router.get('/moderation', (req, res) => {
  res.json(formatSuccess({ status: 'PENDING_FACULTY_SUBMISSION', moderatedBy: 'Examination Committee', deadline: '2026-11-20' }, 'Moderation status retrieved'));
});

router.get('/publications', (req, res) => {
  res.json(formatSuccess([
    { exam: 'Unit Assessment 2', publishedOn: '2026-10-15', portalStatus: 'LIVE_TO_PARENTS' }
  ], 'Result publications retrieved'));
});

// Base exam routes
router.use('/', examRoutes);

module.exports = router;
