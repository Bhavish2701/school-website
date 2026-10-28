const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/circulars', (req, res) => {
  res.json(formatSuccess([
    { id: 'circ-1', title: 'Diwali Festival Holidays & Campus Reopening Notice', date: '2026-10-22', targetAudience: 'All Parents & Staff', status: 'PUBLISHED' },
    { id: 'circ-2', title: 'Schedule for Term-1 Summative Assessments (SA-1)', date: '2026-10-18', targetAudience: 'Grades 6 to 10', status: 'PUBLISHED' }
  ], 'Circulars retrieved'));
});

router.post('/broadcast', (req, res) => {
  res.status(201).json(formatSuccess({
    broadcastId: 'bc-' + Date.now(),
    channel: req.body.channel || 'SMS & App Notification',
    recipientCount: 850,
    status: 'DELIVERED',
    timestamp: new Date().toISOString()
  }, 'Broadcast message transmitted'));
});

module.exports = router;
