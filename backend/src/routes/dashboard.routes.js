const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const liveSyncBus = require('../utils/liveSyncBus');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/rbac.middleware');

router.get('/stream', authenticateUser, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('connected', {
    role: req.user.role,
    userId: req.user._id,
    timestamp: new Date().toISOString(),
  });

  const onSync = (payload) => {
    if (payload.roles && payload.roles.length > 0 && !payload.roles.includes(req.user.role)) {
      return;
    }
    sendEvent('sync', payload);
  };

  liveSyncBus.on('sync', onSync);

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    liveSyncBus.off('sync', onSync);
  });
});

router.get(
  '/management',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  dashboardController.getManagementDashboard
);

router.get(
  '/management/timetable',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  dashboardController.getManagementTimetable
);

router.get(
  '/management/exams',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  dashboardController.getManagementUpcomingExams
);

router.get(
  '/management/fees',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE'),
  dashboardController.getManagementFees
);

router.get(
  '/teacher',
  authenticateUser,
  authorizeRoles('TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  dashboardController.getTeacherDashboard
);

router.get(
  '/student',
  authenticateUser,
  authorizeRoles('STUDENT', 'PARENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'OFFICE', 'TEACHER'),
  dashboardController.getStudentDashboard
);

router.get(
  '/parent',
  authenticateUser,
  authorizeRoles('PARENT', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  dashboardController.getParentDashboard
);

router.get(
  '/platform',
  authenticateUser,
  authorizeRoles('SUPER_ADMIN'),
  dashboardController.getPlatformDashboard
);

module.exports = router;
