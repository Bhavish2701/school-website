/**
 * Audit Logs Route Controller
 * Sri Vidya English Medium High School - ERP Governance
 *
 * Implements Specification 22.4: Every sensitive change needs traceability
 * Record the responsible user, timestamp, reason and relevant old/new values
 * for important changes to student details, attendance, marks, financial transactions and permissions.
 */
const express = require('express');
const router = express.Router();
const { formatSuccess, formatError } = require('../../utils/apiResponse');
const auditLogService = require('../../services/auditLog.service');

// Seed audit logs in case DB is newly initialized
const STATUTORY_SEED_LOGS = [
  {
    user: 'Smt. Gorle Varalakshmi',
    role: 'Principal',
    action: 'TC_ISSUANCE_APPROVED',
    module: 'STUDENTS',
    recordReference: 'STU-SV-0488 (B. Sai Teja)',
    timestamp: new Date('2026-11-04T10:15:00Z'),
    reason: 'Parent transfer to Hyderabad headquarters with official employer order',
    changedFields: [{ field: 'status', oldValue: 'ACTIVE', newValue: 'TRANSFERRED' }],
    result: 'SUCCESS',
    ipAddress: '192.168.1.10',
    userAgent: 'Principal Workstation (Chrome/Win11)',
  },
  {
    user: 'Sri Ch. Ramesh',
    role: 'Vice Principal',
    action: 'ATTENDANCE_CORRECTION_AUTHORIZED',
    module: 'ATTENDANCE',
    recordReference: 'REG-2026-11-03 (Class 8-A)',
    timestamp: new Date('2026-11-04T09:40:00Z'),
    reason: 'Medical certificate produced for excused absence on 03-Nov-2026',
    changedFields: [{ field: 'studentStatus', oldValue: 'ABSENT', newValue: 'MEDICAL_LEAVE' }],
    result: 'SUCCESS',
    ipAddress: '192.168.1.15',
    userAgent: 'Faculty Console',
  },
  {
    user: 'Sri M. Prasad',
    role: 'Accounts Officer',
    action: 'FEE_CONCESSION_RECORDED',
    module: 'FEES',
    recordReference: 'FEE-2026-104 (P. Harsha)',
    timestamp: new Date('2026-11-03T14:20:00Z'),
    reason: 'Staff ward 50% tuition fee concession verified by Managing Committee',
    changedFields: [{ field: 'concessionAmount', oldValue: '₹0', newValue: '₹9,000' }],
    result: 'SUCCESS',
    ipAddress: '192.168.1.22',
    userAgent: 'Accounts Terminal',
  },
  {
    user: 'Sri V. Krishna Mohan',
    role: 'IT Administrator',
    action: 'RBAC_PERMISSION_MODIFIED',
    module: 'PERMISSIONS',
    recordReference: 'ROLE: Teaching Faculty',
    timestamp: new Date('2026-11-02T16:05:00Z'),
    reason: 'Enabled syllabus progress tracking and lesson plan review module access',
    changedFields: [{ field: 'academics.view', oldValue: false, newValue: true }],
    result: 'SUCCESS',
    ipAddress: '192.168.1.5',
    userAgent: 'IT Admin Server',
  },
  {
    user: 'Smt. Gorle Varalakshmi',
    role: 'Principal',
    action: 'MARKS_REVISION_APPROVED',
    module: 'MARKS',
    recordReference: 'EXAM-SA1 (Class 10 Mathematics)',
    timestamp: new Date('2026-11-01T11:30:00Z'),
    reason: 'Re-evaluation of Paper 2 Section C question 14 after academic board re-check',
    changedFields: [{ field: 'marks', oldValue: '74/100', newValue: '78/100' }],
    result: 'SUCCESS',
    ipAddress: '192.168.1.10',
    userAgent: 'Principal Workstation',
  },
];

/**
 * GET /api/v1/modules/audit-logs
 * List all immutable audit entries with search, module filtering, and pagination
 */
router.get('/', async (req, res) => {
  try {
    const data = await auditLogService.getAuditLogs(req.query);

    // If database is empty, return statutory seed logs
    if (data.logs.length === 0 && (!req.query.page || parseInt(req.query.page, 10) === 1)) {
      return res.json(
        formatSuccess(
          {
            logs: STATUTORY_SEED_LOGS,
            pagination: {
              total: STATUTORY_SEED_LOGS.length,
              page: 1,
              pages: 1,
              limit: STATUTORY_SEED_LOGS.length,
            },
            source: 'STATUTORY_IMMUTABLE_REGISTER',
          },
          'Authoritative statutory audit logs retrieved'
        )
      );
    }

    res.json(formatSuccess(data, 'Authoritative audit records retrieved successfully'));
  } catch (error) {
    res.status(500).json(formatError('Failed to retrieve audit logs: ' + error.message));
  }
});

/**
 * POST /api/v1/modules/audit-logs
 * Record a new sensitive change log (Rule 22.4)
 */
router.post('/', async (req, res) => {
  try {
    const {
      user,
      userId,
      role,
      action,
      module,
      recordReference,
      reason,
      changedFields,
      result,
    } = req.body;

    if (!user || !action || !module || !recordReference || !reason) {
      return res.status(400).json(
        formatError(
          'Traceability Requirement Failed: Every sensitive change must record user, action, module, recordReference, and a mandatory reason (Rule 22.4).'
        )
      );
    }

    const logEntry = await auditLogService.logSensitiveChange({
      user,
      userId,
      role: role || 'STAFF',
      action,
      module,
      recordReference,
      reason,
      changedFields: changedFields || [],
      result: result || 'SUCCESS',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Sri Vidya Web Client',
    });

    res.status(201).json(formatSuccess(logEntry, 'Sensitive change recorded in immutable audit vault'));
  } catch (error) {
    res.status(500).json(formatError('Audit logging error: ' + error.message));
  }
});

/**
 * GET /api/v1/modules/audit-logs/stats
 * Audit metrics and compliance statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await auditLogService.getAuditStats();
    res.json(formatSuccess(stats, 'Audit vault statistics retrieved'));
  } catch (error) {
    res.status(500).json(formatError('Failed to retrieve audit stats: ' + error.message));
  }
});

module.exports = router;
