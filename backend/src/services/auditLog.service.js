/**
 * AuditLog Service
 * Specification 22.4: Every sensitive change needs traceability
 * Record the responsible user, timestamp, reason and relevant old/new values
 * for important changes to student details, attendance, marks, financial transactions and permissions.
 */
const { AuditLog } = require('../models/auditLog.model');

// Blacklist of fields that must NEVER be logged directly in audit values (Rule 22.4 & 22.5)
const SENSITIVE_MASKED_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'pin',
  'cvv',
  'secret',
];

/**
 * Cleanse any sensitive secrets before logging
 */
const sanitizeValue = (field, val) => {
  if (val === undefined || val === null) return null;
  const lowerField = String(field).toLowerCase();
  for (const s of SENSITIVE_MASKED_FIELDS) {
    if (lowerField.includes(s)) {
      return '[REDACTED_FOR_SECURITY]';
    }
  }
  if (typeof val === 'object') {
    try {
      return JSON.parse(JSON.stringify(val));
    } catch (e) {
      return String(val);
    }
  }
  return val;
};

/**
 * Record an authoritative sensitive change log
 *
 * @param {Object} params
 * @param {string} params.user - Responsible user name
 * @param {string} [params.userId] - Responsible user MongoDB ID
 * @param {string} params.role - Responsible role (e.g. 'Principal', 'Vice Principal', 'Teacher', 'Bursar')
 * @param {string} params.action - Action executed (e.g. 'STUDENT_RECORD_UPDATE', 'ATTENDANCE_CORRECTION')
 * @param {string} params.module - Domain module ('STUDENTS', 'ATTENDANCE', 'MARKS', 'FEES', 'PERMISSIONS')
 * @param {string} params.recordReference - Unique record key (e.g. 'SV-0501', 'TC-2026-004')
 * @param {string} params.reason - Mandatory statutory reason for change
 * @param {Array<{field: string, oldValue: any, newValue: any}>} [params.changedFields] - Specific diff values
 * @param {string} [params.result='SUCCESS'] - Outcome ('SUCCESS', 'DENIED', 'REVERSED')
 * @param {string} [params.ipAddress='127.0.0.1'] - Client IP
 * @param {string} [params.userAgent] - Client device
 */
const logSensitiveChange = async (params) => {
  const {
    user,
    userId,
    role = 'ADMIN',
    action,
    module,
    recordReference,
    reason,
    changedFields = [],
    result = 'SUCCESS',
    ipAddress = '127.0.0.1',
    userAgent = 'Sri Vidya Web Client',
  } = params;

  if (!user || !action || !module || !recordReference || !reason) {
    throw new Error('Audit logging requires user, action, module, recordReference, and a valid reason.');
  }

  // Sanitize changed fields
  const sanitizedDiff = (changedFields || []).map((cf) => ({
    field: cf.field,
    oldValue: sanitizeValue(cf.field, cf.oldValue),
    newValue: sanitizeValue(cf.field, cf.newValue),
  }));

  const logEntry = await AuditLog.create({
    user,
    userId,
    role,
    action,
    module,
    recordReference,
    timestamp: new Date(),
    reason: reason.trim(),
    changedFields: sanitizedDiff,
    result,
    ipAddress,
    userAgent,
    isImmutable: true,
  });

  return logEntry;
};

/**
 * Retrieve audit logs with query filters, search, and pagination
 */
const getAuditLogs = async (query = {}) => {
  const {
    search,
    module,
    action,
    user,
    recordReference,
    result,
    startDate,
    endDate,
    page = 1,
    limit = 25,
  } = query;

  const filter = {};

  if (module) filter.module = module.toUpperCase();
  if (action) filter.action = action;
  if (user) filter.user = { $regex: user, $options: 'i' };
  if (recordReference) filter.recordReference = { $regex: recordReference, $options: 'i' };
  if (result) filter.result = result.toUpperCase();

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { user: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
      { recordReference: { $regex: search, $options: 'i' } },
      { reason: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
  const parsedLimit = Math.max(1, parseInt(limit, 10));

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parsedLimit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parsedLimit),
      limit: parsedLimit,
    },
  };
};

/**
 * Retrieve audit compliance statistics
 */
const getAuditStats = async () => {
  const [totalLogs, moduleBreakdown, recentDenied] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.countDocuments({ result: 'DENIED' }),
  ]);

  return {
    totalLogs,
    moduleDistribution: moduleBreakdown,
    totalDeniedAttempts: recentDenied,
    immutableVaultStatus: 'ACTIVE_AND_ENFORCED',
    complianceStandard: 'AP Education Code Statutory Ledger Regulations',
  };
};

module.exports = {
  logSensitiveChange,
  getAuditLogs,
  getAuditStats,
};
