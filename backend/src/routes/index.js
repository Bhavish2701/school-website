/**
 * API Version 1 Master Router
 * Mounts all v1 sub-routers
 */
const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// Mount health check endpoints at /api/v1/health
router.use('/health', healthRoutes);

// Mount authentication endpoints at /api/v1/auth
router.use('/auth', authRoutes);

// Mount student academic records endpoints at /api/v1/records
const recordRoutes = require('./studentRecord.routes');
router.use('/records', recordRoutes);

// Mount management endpoints at /api/v1/management
const managementRoutes = require('./management.routes');
router.use('/management', managementRoutes);

// Mount student administrative module endpoints at /api/v1/students
const studentRoutes = require('./student.routes');
router.use('/students', studentRoutes);

// Mount future Student Portal self-service endpoints (Specification 20.1)
const studentPortalRoutes = require('./studentPortal.routes');
router.use('/student-portal', studentPortalRoutes);
router.use('/student', studentPortalRoutes);

// Mount teacher module endpoints at /api/v1/teachers
const teacherRoutes = require('./teacher.routes');
router.use('/teachers', teacherRoutes);

// Mount parent module & future Parent Portal endpoints (Specification 20.2)
const parentRoutes = require('./parent.routes');
router.use('/parents', parentRoutes);
router.use('/parent', parentRoutes);
router.use('/parent-portal', parentRoutes);

// Mount academic module endpoints at /api/v1/academic
const academicRoutes = require('./academic.routes');
router.use('/academic', academicRoutes);

// Mount attendance module endpoints at /api/v1/attendance
const attendanceRoutes = require('./attendance.routes');
router.use('/attendance', attendanceRoutes);

// Mount examination module endpoints at /api/v1/exams
const examRoutes = require('./exam.routes');
router.use('/exams', examRoutes);

// Mount fee module endpoints at /api/v1/fees
const feeRoutes = require('./fee.routes');
router.use('/fees', feeRoutes);

// Mount payment module endpoints at /api/v1/payments
const paymentRoutes = require('./payment.routes');
router.use('/payments', paymentRoutes);

// Mount admission module endpoints at /api/v1/admissions
const admissionRoutes = require('./admission.routes');
router.use('/admissions', admissionRoutes);

// Mount dashboard module endpoints at /api/v1/dashboard
const dashboardRoutes = require('./dashboard.routes');
router.use('/dashboard', dashboardRoutes);

// Mount platform administration endpoints at /api/v1/platform
const dashboardController = require('../controllers/dashboard.controller');
const institutionRoutes = require('./institution.routes');
const schoolConfigRoutes = require('./schoolConfig.routes');
const onboardingRoutes = require('./onboarding.routes');
const userAccountRoutes = require('./userAccount.routes');
const roleTemplateRoutes = require('./roleTemplate.routes');
const platformAuditRoutes = require('./platformAudit.routes');
const securityMonitoringRoutes = require('./securityMonitoring.routes');
const subscriptionRoutes = require('./subscription.routes');
const planRoutes = require('./plan.routes');
const systemHealthRoutes = require('./systemHealth.routes');
const deploymentRoutes = require('./deployment.routes');
const appLogRoutes = require('./appLog.routes');
const backgroundJobRoutes = require('./backgroundJob.routes');
const backupRoutes = require('./backup.routes');
const integrationRoutes = require('./integration.routes');
const supportTicketRoutes = require('./supportTicket.routes');
const domainEmailRoutes = require('./domainEmail.routes');
const globalSettingsRoutes = require('./globalSettings.routes');
const platformPolicyRoutes = require('./platformPolicy.routes');
const platformRouter = express.Router();
platformRouter.get('/dashboard', dashboardController.getPlatformDashboard);
platformRouter.use('/institutions', institutionRoutes);
platformRouter.use('/config', schoolConfigRoutes);
platformRouter.use('/onboarding', onboardingRoutes);
platformRouter.use('/users', userAccountRoutes);
platformRouter.use('/roles', roleTemplateRoutes);
platformRouter.use('/audit', platformAuditRoutes);
platformRouter.use('/security', securityMonitoringRoutes);
platformRouter.use('/subscriptions', subscriptionRoutes);
platformRouter.use('/plans', planRoutes);
platformRouter.use('/health', systemHealthRoutes);
platformRouter.use('/deployments', deploymentRoutes);
platformRouter.use('/logs', appLogRoutes);
platformRouter.use('/jobs', backgroundJobRoutes);
platformRouter.use('/backups', backupRoutes);
platformRouter.use('/integrations', integrationRoutes);
platformRouter.use('/support', supportTicketRoutes);
platformRouter.use('/domains', domainEmailRoutes);
platformRouter.use('/settings', globalSettingsRoutes);
platformRouter.use('/policies', platformPolicyRoutes);
router.use('/platform', platformRouter);
router.use('/institutions', institutionRoutes);
router.use('/schools/config', schoolConfigRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/platform/users', userAccountRoutes);
router.use('/platform/roles', roleTemplateRoutes);
router.use('/platform/audit', platformAuditRoutes);
router.use('/platform/security', securityMonitoringRoutes);
router.use('/platform/subscriptions', subscriptionRoutes);
router.use('/platform/plans', planRoutes);
router.use('/platform/health', systemHealthRoutes);
router.use('/platform/deployments', deploymentRoutes);
router.use('/platform/logs', appLogRoutes);
router.use('/platform/jobs', backgroundJobRoutes);
router.use('/platform/backups', backupRoutes);
router.use('/platform/integrations', integrationRoutes);
router.use('/platform/support', supportTicketRoutes);
router.use('/support', supportTicketRoutes);
router.use('/platform/domains', domainEmailRoutes);
router.use('/domains', domainEmailRoutes);
router.use('/platform/settings', globalSettingsRoutes);
router.use('/settings', globalSettingsRoutes);
router.use('/platform/policies', platformPolicyRoutes);
router.use('/policies', platformPolicyRoutes);

// Mount timetable module endpoints at /api/v1/timetable
const timetableRoutes = require('./timetable.routes');
router.use('/timetable', timetableRoutes);

module.exports = router;
