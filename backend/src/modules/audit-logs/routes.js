const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/', (req, res) => {
  res.json(formatSuccess([
    { id: 'log-1', timestamp: '2026-10-24T11:45:10Z', actor: 'admin@srividyaschool.edu.in', action: 'ATTENDANCE_CORRECTION_APPROVED', target: 'Student: R. Manoj Kumar (10-B)', ip: '192.168.1.10' },
    { id: 'log-2', timestamp: '2026-10-24T10:12:35Z', actor: 'principal@srividyaschool.edu.in', action: 'EXAM_TIMETABLE_PUBLISHED', target: 'SA-1 Term-1 Schedule', ip: '192.168.1.15' },
    { id: 'log-3', timestamp: '2026-10-24T09:05:00Z', actor: 'system_cron', action: 'DAILY_ATTENDANCE_AGGREGATION', target: '850 Records Processed', ip: '127.0.0.1' }
  ], 'Audit logs retrieved'));
});

module.exports = router;
