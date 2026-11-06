/**
 * Sri Vidya Master Modular Architecture Aggregator
 * Bundles all 21 Platform Administration and Core ERP Modules
 */

const express = require('express');
const router = express.Router();

// 21 Platform Administration Modules
const authModule = require('./auth');
router.use('/auth', authModule.routes);
const platform_dashboardModule = require('./platform-dashboard');
router.use('/platform-dashboard', platform_dashboardModule.routes);
const institutionsModule = require('./institutions');
router.use('/institutions', institutionsModule.routes);
const institution_onboardingModule = require('./institution-onboarding');
router.use('/institution-onboarding', institution_onboardingModule.routes);
const school_configurationModule = require('./school-configuration');
router.use('/school-configuration', school_configurationModule.routes);
const usersModule = require('./users');
router.use('/users', usersModule.routes);
const roles_permissionsModule = require('./roles-permissions');
router.use('/roles-permissions', roles_permissionsModule.routes);
const audit_logsModule = require('./audit-logs');
router.use('/audit-logs', audit_logsModule.routes);
const security_monitoringModule = require('./security-monitoring');
router.use('/security-monitoring', security_monitoringModule.routes);
const subscriptionsModule = require('./subscriptions');
router.use('/subscriptions', subscriptionsModule.routes);
const system_healthModule = require('./system-health');
router.use('/system-health', system_healthModule.routes);
const deploymentsModule = require('./deployments');
router.use('/deployments', deploymentsModule.routes);
const backups_recoveryModule = require('./backups-recovery');
router.use('/backups-recovery', backups_recoveryModule.routes);
const integrationsModule = require('./integrations');
router.use('/integrations', integrationsModule.routes);
const api_managementModule = require('./api-management');
router.use('/api-management', api_managementModule.routes);
const support_ticketsModule = require('./support-tickets');
router.use('/support-tickets', support_ticketsModule.routes);
const domainsModule = require('./domains');
router.use('/domains', domainsModule.routes);
const email_notificationsModule = require('./email-notifications');
router.use('/email-notifications', email_notificationsModule.routes);
const global_settingsModule = require('./global-settings');
router.use('/global-settings', global_settingsModule.routes);
const platform_policiesModule = require('./platform-policies');
router.use('/platform-policies', platform_policiesModule.routes);
const data_retentionModule = require('./data-retention');
router.use('/data-retention', data_retentionModule.routes);

// Core Institutional ERP Modules
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
const workflowsModule = require('./workflows');
router.use('/workflows', workflowsModule.routes);
const system_rulesModule = require('./system-rules');
router.use('/system-rules', system_rulesModule.routes);

module.exports = router;
