const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const RoleTemplateService = require('../../services/roleTemplate.service');
const { authenticateUser, authorizeRoles } = require('../../middleware/rbac.middleware');

const UNIVERSAL_PERMISSIONS_CATALOG = [
  { key: 'view', label: 'View records', desc: 'Inspect records within permitted scope' },
  { key: 'create', label: 'Create records', desc: 'Draft or initiate new records' },
  { key: 'edit', label: 'Edit records', desc: 'Modify permitted mutable fields' },
  { key: 'submit', label: 'Submit records', desc: 'Send draft into approval/review workflow' },
  { key: 'approve', label: 'Approve or reject', desc: 'Authorize or reject with mandatory logged reason' },
  { key: 'archive', label: 'Archive or cancel', desc: 'Controlled retention archival or cancellation with reason' },
  { key: 'export', label: 'Export or print', desc: 'Generate printable documents or export authorized datasets' },
  { key: 'sensitive', label: 'View sensitive information', desc: 'Unmask restricted confidential fields' },
  { key: 'manage', label: 'Manage permissions', desc: 'Configure module RBAC and scopes' },
];

const RECORD_SCOPES_CATALOG = [
  { key: 'ALL', label: 'Campus-Wide (All Records)', desc: 'Full institutional jurisdiction' },
  { key: 'ASSIGNED_CLASSES', label: 'Assigned Classes Only', desc: 'Strictly limited to assigned classes/sections' },
  { key: 'ASSIGNED_DEPARTMENT', label: 'Assigned Department Only', desc: 'Restricted to operational department' },
  { key: 'ASSIGNED_STUDENTS', label: 'Assigned Students Only', desc: 'Restricted to designated student caseload' },
  { key: 'OWN_RECORDS', label: 'Own Records Only', desc: 'Strictly limited to own records' },
];

router.use(authenticateUser);

router.get(
  '/roles',
  authorizeRoles('SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  asyncHandler(async (req, res) => {
    const result = await RoleTemplateService.listRoles(req.query);
    return sendSuccess(res, result.data || [], 'Institutional roles retrieved');
  })
);

router.get('/permissions', (req, res) => {
  return sendSuccess(res, UNIVERSAL_PERMISSIONS_CATALOG, 'Universal permissions catalog retrieved');
});

router.get('/scopes', (req, res) => {
  return sendSuccess(res, RECORD_SCOPES_CATALOG, 'Record scopes catalog retrieved');
});

router.post(
  '/check',
  asyncHandler(async (req, res) => {
    const roleName = req.user.role;
    const { moduleKey, action, record } = req.body;
    if (roleName === 'TEACHER' && (moduleKey === 'attendance' || moduleKey === 'academics')) {
      const assigned = Array.isArray(req.user.assignedClasses) ? req.user.assignedClasses : [];
      const targetClass = record && record.class;
      const targetSection = (record && record.section) || 'A';
      if (targetClass && !assigned.some((c) => c.class === String(targetClass) && (!record.section || c.section === targetSection))) {
        return sendSuccess(res, {
          allowed: false,
          scopeRestriction: true,
          reason: `Record Scope Restriction: Class ${targetClass}-${targetSection} is not in user's assigned classes.`,
        });
      }
    }
    const evalRes = await RoleTemplateService.evaluatePermission([roleName], moduleKey, action, record || {});
    return sendSuccess(res, evalRes, 'Authorization policy evaluated');
  })
);

module.exports = router;
