/**
 * Modular ERP Architecture - Master Modules Aggregator
 * Sri Vidya English Medium High School ERP Core
 */
const express = require('express');
const router = express.Router();

const authModule = require('./auth');
router.use('/auth', authModule.routes);
const institutionsModule = require('./institutions');
router.use('/institutions', institutionsModule.routes);
const usersModule = require('./users');
router.use('/users', usersModule.routes);
const roles_permissionsModule = require('./roles-permissions');
router.use('/roles-permissions', roles_permissionsModule.routes);
const studentsModule = require('./students');
router.use('/students', studentsModule.routes);
const staffModule = require('./staff');
router.use('/staff', staffModule.routes);
const academicsModule = require('./academics');
router.use('/academics', academicsModule.routes);
const attendanceModule = require('./attendance');
router.use('/attendance', attendanceModule.routes);
const timetableModule = require('./timetable');
router.use('/timetable', timetableModule.routes);
const examinationsModule = require('./examinations');
router.use('/examinations', examinationsModule.routes);
const feesModule = require('./fees');
router.use('/fees', feesModule.routes);
const appointmentsModule = require('./appointments');
router.use('/appointments', appointmentsModule.routes);
const communicationModule = require('./communication');
router.use('/communication', communicationModule.routes);
const reportsModule = require('./reports');
router.use('/reports', reportsModule.routes);
const filesModule = require('./files');
router.use('/files', filesModule.routes);
const audit_logsModule = require('./audit-logs');
router.use('/audit-logs', audit_logsModule.routes);

module.exports = router;
