/**
 * API Version 1 Master Router
 * Mounts all v1 sub-routers
 */
const express = require('express');
const router = express.Router();
const liveSyncBus = require('../utils/liveSyncBus');

// Broadcast live-sync invalidation after any successful mutation request
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const seg = (req.path || '/').split('/').filter(Boolean)[0] || 'GENERAL';
        const domainMap = {
          students: 'STUDENTS',
          teachers: 'TEACHERS',
          academic: 'ACADEMICS',
          attendance: 'ATTENDANCE',
          timetable: 'TIMETABLE',
          exams: 'EXAMS',
          'report-cards': 'EXAMS',
          fees: 'FEES',
          payments: 'FEES',
          admissions: 'ADMISSIONS',
          'student-exits': 'EXITS',
          'student-archivals': 'ARCHIVALS',
          discipline: 'DISCIPLINE',
          events: 'EVENTS',
          appointments: 'APPOINTMENTS',
          management: 'MANAGEMENT',
          platform: 'PLATFORM',
          institutions: 'PLATFORM',
          onboarding: 'PLATFORM',
          support: 'PLATFORM',
          settings: 'PLATFORM',
          'schools': 'PLATFORM',
        };
        liveSyncBus.emitSync(domainMap[seg] || seg.toUpperCase(), req.method, { path: req.path });
      }
    });
  }
  next();
});
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

// Mount Student Exit & Transfer Certificate Docket endpoints at /api/v1/transfers and /api/v1/student-exits
const studentExitRoutes = require('./studentExit.routes');
router.use('/transfers', studentExitRoutes);
router.use('/student-exits', studentExitRoutes);

// Mount Controlled Student Archival & Record Inactivation endpoints at /api/v1/student-archivals
const studentArchivalRoutes = require('./studentArchival.routes');
router.use('/student-archivals', studentArchivalRoutes);
router.use('/archivals', studentArchivalRoutes);

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

// Mount scholastic report cards module endpoints at /api/v1/report-cards and /api/v1/reports/scholastic
const reportCardRoutes = require('./reportCard.routes');
router.use('/report-cards', reportCardRoutes);
router.use('/reports/scholastic', reportCardRoutes);

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
const schoolGatewayRoutes = require('./schoolGateway.routes');
const globalActionPatternRoutes = require('./globalActionPattern.routes');
const platformWorkflowRoutes = require('./platformWorkflow.routes');
const { authenticateUser, authorizeRoles } = require('../middleware/rbac.middleware');
const requirePlatformAdmin = [authenticateUser, authorizeRoles('SUPER_ADMIN')];

const platformRouter = express.Router();
platformRouter.use(authenticateUser, authorizeRoles('SUPER_ADMIN'));
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
platformRouter.use('/gateways', schoolGatewayRoutes);
platformRouter.use('/actions', globalActionPatternRoutes);
platformRouter.use('/workflows', platformWorkflowRoutes);

// Mount Modular Backend Architecture (Specification 10: Backend Architecture for Platform Administration)
const masterModulesRouter = require('../modules');
platformRouter.use('/modules', masterModulesRouter);
router.use('/modules', masterModulesRouter);

router.use('/platform', platformRouter);
router.use('/institutions', ...requirePlatformAdmin, institutionRoutes);
router.use('/schools/config', authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'), schoolConfigRoutes);
router.use('/onboarding', ...requirePlatformAdmin, onboardingRoutes);
router.use('/platform/users', ...requirePlatformAdmin, userAccountRoutes);
router.use('/platform/roles', ...requirePlatformAdmin, roleTemplateRoutes);
router.use('/platform/audit', ...requirePlatformAdmin, platformAuditRoutes);
router.use('/platform/security', ...requirePlatformAdmin, securityMonitoringRoutes);
router.use('/platform/subscriptions', ...requirePlatformAdmin, subscriptionRoutes);
router.use('/platform/plans', ...requirePlatformAdmin, planRoutes);
router.use('/platform/health', ...requirePlatformAdmin, systemHealthRoutes);
router.use('/platform/deployments', ...requirePlatformAdmin, deploymentRoutes);
router.use('/platform/logs', ...requirePlatformAdmin, appLogRoutes);
router.use('/platform/jobs', ...requirePlatformAdmin, backgroundJobRoutes);
router.use('/platform/backups', ...requirePlatformAdmin, backupRoutes);
router.use('/platform/integrations', ...requirePlatformAdmin, integrationRoutes);
router.use('/platform/support', ...requirePlatformAdmin, supportTicketRoutes);
router.use('/support', ...requirePlatformAdmin, supportTicketRoutes);
router.use('/platform/domains', ...requirePlatformAdmin, domainEmailRoutes);
router.use('/domains', ...requirePlatformAdmin, domainEmailRoutes);
router.use('/platform/settings', ...requirePlatformAdmin, globalSettingsRoutes);
router.use('/settings', ...requirePlatformAdmin, globalSettingsRoutes);
router.use('/platform/policies', ...requirePlatformAdmin, platformPolicyRoutes);
router.use('/policies', ...requirePlatformAdmin, platformPolicyRoutes);
router.use('/platform/gateways', ...requirePlatformAdmin, schoolGatewayRoutes);
router.use('/gateways', ...requirePlatformAdmin, schoolGatewayRoutes);
router.use('/platform/actions', ...requirePlatformAdmin, globalActionPatternRoutes);
router.use('/actions', ...requirePlatformAdmin, globalActionPatternRoutes);
router.use('/platform/workflows', ...requirePlatformAdmin, platformWorkflowRoutes);
router.use('/workflows', ...requirePlatformAdmin, platformWorkflowRoutes);

// Mount timetable module endpoints at /api/v1/timetable
const timetableRoutes = require('./timetable.routes');
router.use('/timetable', timetableRoutes);

// Mount Discipline, Events, and Appointments endpoints (Management & Authorized Faculty)
const disciplineRoutes = require('./discipline.routes');
const eventRoutes = require('./event.routes');
const appointmentRoutes = require('../modules/appointments/routes');
router.use('/discipline', disciplineRoutes);
router.use('/events', eventRoutes);
router.use('/appointments', appointmentRoutes);

// Mount Production Readiness Subsystems:
// 1. Privacy-Conscious In-House Analytics (DPDP Act 2023 Compliant)
const analyticsRoutes = require('./analytics.routes');
router.use('/analytics', analyticsRoutes);

// 2. Centralized Frontend & Backend Error Monitoring
const systemErrorRoutes = require('./systemError.routes');
router.use('/system', systemErrorRoutes);

// 3. Account Deletion & Deactivation with Statutory Preservations
const accountDeletionRoutes = require('./accountDeletion.routes');
router.use('/users', accountDeletionRoutes);

// 4. Executive Database Backup & Disaster Recovery
router.use('/backups', authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), backupRoutes);
router.use('/backup', authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), backupRoutes);

// 5. Legal, Privacy & Compliance Management (DPDP Act, GDPR, DPAs, Consent, Breaches)
const complianceRoutes = require('./compliance.routes');
router.use('/compliance', complianceRoutes);

module.exports = router;
