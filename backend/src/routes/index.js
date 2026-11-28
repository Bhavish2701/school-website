const express = require('express');
const router = express.Router();
const liveSyncBus = require('../utils/liveSyncBus');

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

router.use('/health', healthRoutes);

router.use('/auth', authRoutes);

const recordRoutes = require('./studentRecord.routes');
router.use('/records', recordRoutes);

const managementRoutes = require('./management.routes');
router.use('/management', managementRoutes);

const studentRoutes = require('./student.routes');
router.use('/students', studentRoutes);

const studentExitRoutes = require('./studentExit.routes');
router.use('/transfers', studentExitRoutes);
router.use('/student-exits', studentExitRoutes);

const studentArchivalRoutes = require('./studentArchival.routes');
router.use('/student-archivals', studentArchivalRoutes);
router.use('/archivals', studentArchivalRoutes);

const studentPortalRoutes = require('./studentPortal.routes');
router.use('/student-portal', studentPortalRoutes);
router.use('/student', studentPortalRoutes);

const teacherRoutes = require('./teacher.routes');
router.use('/teachers', teacherRoutes);

const parentRoutes = require('./parent.routes');
router.use('/parents', parentRoutes);
router.use('/parent', parentRoutes);
router.use('/parent-portal', parentRoutes);

const academicRoutes = require('./academic.routes');
router.use('/academic', academicRoutes);

const attendanceRoutes = require('./attendance.routes');
router.use('/attendance', attendanceRoutes);

const examRoutes = require('./exam.routes');
router.use('/exams', examRoutes);

const reportCardRoutes = require('./reportCard.routes');
router.use('/report-cards', reportCardRoutes);
router.use('/reports/scholastic', reportCardRoutes);

const feeRoutes = require('./fee.routes');
router.use('/fees', feeRoutes);

const paymentRoutes = require('./payment.routes');
router.use('/payments', paymentRoutes);

const admissionRoutes = require('./admission.routes');
router.use('/admissions', admissionRoutes);

const dashboardRoutes = require('./dashboard.routes');
router.use('/dashboard', dashboardRoutes);

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

const timetableRoutes = require('./timetable.routes');
router.use('/timetable', timetableRoutes);

const disciplineRoutes = require('./discipline.routes');
const eventRoutes = require('./event.routes');
const appointmentRoutes = require('../modules/appointments/routes');
router.use('/discipline', disciplineRoutes);
router.use('/events', eventRoutes);
router.use('/appointments', appointmentRoutes);

const analyticsRoutes = require('./analytics.routes');
router.use('/analytics', analyticsRoutes);

const systemErrorRoutes = require('./systemError.routes');
router.use('/system', systemErrorRoutes);

const accountDeletionRoutes = require('./accountDeletion.routes');
router.use('/users', accountDeletionRoutes);

router.use('/backups', authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), backupRoutes);
router.use('/backup', authenticateUser, authorizeRoles('SUPER_ADMIN', 'PRINCIPAL'), backupRoutes);

const complianceRoutes = require('./compliance.routes');
router.use('/compliance', complianceRoutes);

module.exports = router;
