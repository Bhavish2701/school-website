const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/', (req, res) => {
  res.json(formatSuccess([
    { id: 'usr-1', name: 'Admin Office', role: 'admin', email: 'admin@srividyaschool.edu.in', status: 'ACTIVE' },
    { id: 'usr-2', name: 'M. Sreenivasa Rao', role: 'teacher', email: 'sreenivas.m@srividyaschool.edu.in', status: 'ACTIVE' },
    { id: 'usr-3', name: 'B. Rajesh Kumar', role: 'student', email: 'rajesh.2024@srividyaschool.edu.in', status: 'ACTIVE' },
    { id: 'usr-4', name: 'K. Subrahmanyam', role: 'parent', email: 'k.subrahmanyam@gmail.com', status: 'ACTIVE' }
  ], 'Users retrieved successfully'));
});

router.get('/:id', (req, res) => {
  res.json(formatSuccess({
    id: req.params.id,
    name: 'User ' + req.params.id,
    status: 'ACTIVE'
  }, 'User details retrieved'));
});

router.post('/', (req, res) => {
  res.status(201).json(formatSuccess({ id: 'usr-' + Date.now(), ...req.body }, 'User created successfully'));
});

router.put('/:id', (req, res) => {
  res.json(formatSuccess({ id: req.params.id, ...req.body }, 'User updated successfully'));
});

router.patch('/:id/status', (req, res) => {
  res.json(formatSuccess({ id: req.params.id, status: req.body.status || 'ACTIVE' }, 'User status updated'));
});

module.exports = router;
