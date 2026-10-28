const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/roles', (req, res) => {
  res.json(formatSuccess([
    { role: 'admin', description: 'Platform Administrator with full systemic access' },
    { role: 'management', description: 'Executive School Board & Principal Management' },
    { role: 'teacher', description: 'Faculty & Class Teachers' },
    { role: 'student', description: 'Enrolled Students' },
    { role: 'parent', description: 'Authorized Parents / Legal Guardians' }
  ], 'Defined system roles retrieved'));
});

router.get('/permissions', (req, res) => {
  res.json(formatSuccess([
    'students:read', 'students:create', 'students:update', 'students:delete',
    'attendance:read', 'attendance:mark', 'attendance:correct', 'attendance:approve',
    'timetable:read', 'timetable:manage',
    'exams:read', 'exams:marks_entry', 'exams:moderation', 'exams:publish',
    'fees:read', 'fees:collect', 'fees:concessions', 'fees:reports',
    'audit:read', 'reports:export'
  ], 'Role permissions catalog retrieved'));
});

router.post('/assign', (req, res) => {
  res.json(formatSuccess(req.body, 'Role assigned to user successfully'));
});

module.exports = router;
