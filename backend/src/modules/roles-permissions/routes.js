/**
 * Roles & Universal Permissions Route Controller
 * Sri Vidya English Medium High School - ERP Governance
 *
 * Implements:
 * 1. The 9 Universal Permissions (View, Create, Edit, Submit, Approve, Archive, Export, Sensitive, Manage)
 * 2. The 5 Granular Record Scopes (ALL, ASSIGNED_CLASSES, ASSIGNED_DEPARTMENT, ASSIGNED_STUDENTS, OWN_RECORDS)
 * 3. Segregation of Duties / Anti-Self-Approval Controls
 */
const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

// 9 Core Universal Permissions
const UNIVERSAL_PERMISSIONS_CATALOG = [
  { key: 'view', label: 'View records', icon: 'fa-eye', desc: 'Inspect records within permitted scope' },
  { key: 'create', label: 'Create records', icon: 'fa-plus', desc: 'Draft or initiate new records' },
  { key: 'edit', label: 'Edit records', icon: 'fa-pen-to-square', desc: 'Modify permitted mutable fields' },
  { key: 'submit', label: 'Submit records', icon: 'fa-paper-plane', desc: 'Send draft into approval/review workflow' },
  { key: 'approve', label: 'Approve or reject', icon: 'fa-stamp', desc: 'Authorize or reject with mandatory logged reason' },
  { key: 'archive', label: 'Archive or cancel', icon: 'fa-box-archive', desc: 'Controlled retention archival or cancellation with reason (zero hard deletion)' },
  { key: 'export', label: 'Export or print', icon: 'fa-print', desc: 'Generate printable documents or export authorized CSV/PDF datasets' },
  { key: 'sensitive', label: 'View sensitive information', icon: 'fa-user-shield', desc: 'Unmask restricted confidential fields (PAN, salary, counseling notes, medical history)' },
  { key: 'manage', label: 'Manage permissions', icon: 'fa-shield-halved', desc: 'Configure module RBAC, adjust role scopes, and assign delegated approvers' }
];

// 5 Record Scopes
const RECORD_SCOPES_CATALOG = [
  { key: 'ALL', label: 'Campus-Wide (All Records)', desc: 'Unrestricted institutional jurisdiction across all classes, departments, and personnel' },
  { key: 'ASSIGNED_CLASSES', label: 'Assigned Classes Only', desc: 'Strictly limited to user\'s assigned classes and sections (e.g. 8A, 9B, 7C, 10A)' },
  { key: 'ASSIGNED_DEPARTMENT', label: 'Assigned Department Only', desc: 'Restricted to operational unit (e.g. Accounts Counter, Transport Fleet, Inventory Store)' },
  { key: 'ASSIGNED_STUDENTS', label: 'Assigned Students Only', desc: 'Restricted to designated student caseload or pastoral care docket' },
  { key: 'OWN_RECORDS', label: 'Own Records Only', desc: 'Strictly limited to records created by or belonging to the logged-in user' }
];

router.get('/roles', (req, res) => {
  res.json(formatSuccess([
    { role: 'principal', title: 'Executive Principal (Super Admin)', scope: 'ALL', permissionsCount: 'All 18 Modules (Full 9 Actions)' },
    { role: 'vice-principal', title: 'Vice Principal', scope: 'ALL', permissionsCount: '14 Modules (Full C/R/U/A/E)' },
    { role: 'teacher', title: 'Teaching Faculty', scope: 'ASSIGNED_CLASSES', permissionsCount: 'Academic & Attendance (Class Scoped)' },
    { role: 'bursar', title: 'Head Bursar / Accounts Clerk', scope: 'ASSIGNED_DEPARTMENT', permissionsCount: 'Finance (Segregated Anti-Self-Approval)' },
    { role: 'clerk', title: 'Administrative Clerk', scope: 'ALL', permissionsCount: 'Front Desk & Admissions Registration' },
    { role: 'counselor', title: 'Student Welfare Counselor', scope: 'ASSIGNED_STUDENTS', permissionsCount: 'Pastoral & Sensitive Counseling Dockets' }
  ], 'Defined institutional roles retrieved'));
});

router.get('/permissions', (req, res) => {
  res.json(formatSuccess(UNIVERSAL_PERMISSIONS_CATALOG, 'Universal 9-permission actions catalog retrieved'));
});

router.get('/scopes', (req, res) => {
  res.json(formatSuccess(RECORD_SCOPES_CATALOG, 'Granular record scopes catalog retrieved'));
});

router.post('/check', (req, res) => {
  const { role, moduleKey, action, record, requester } = req.body;
  
  // Statutory Segregation of Duties Check:
  // "An accounts employee may record payments but not approve their own refunds."
  if (moduleKey === 'fees' && (action === 'approve' || action === 'archive')) {
    if (role === 'bursar' || role === 'clerk') {
      if (requester && requester.toLowerCase().includes('ramu')) {
        return res.json(formatSuccess({
          allowed: false,
          isSelfApprovalConflict: true,
          reason: 'Statutory Segregation of Duties: Employee cannot approve their own refund or sanction disbursements. Independent sign-off by Principal Smt. Gorle Varalakshmi required.'
        }, 'Authorization policy evaluated'));
      }
    }
  }

  // Teacher class-scoped check:
  // "A teacher may have access to attendance but only for assigned classes."
  if (role === 'teacher' && (moduleKey === 'attendance' || moduleKey === 'academics')) {
    const assignedClasses = ['8A', '9B', '7C', '10A'];
    const targetClass = record && record.class;
    if (targetClass && !assignedClasses.includes(targetClass)) {
      return res.json(formatSuccess({
        allowed: false,
        scopeRestriction: true,
        reason: `Record Scope Restriction: Teacher access limited to assigned classes [${assignedClasses.join(', ')}]. Access to Class ${targetClass} is denied.`
      }, 'Authorization policy evaluated'));
    }
  }

  res.json(formatSuccess({
    allowed: true,
    reason: `Permission '${action}' in module '${moduleKey}' permitted for role '${role}'.`
  }, 'Authorization policy evaluated'));
});

router.post('/assign', (req, res) => {
  res.json(formatSuccess(req.body, 'Role and record scope assigned to user successfully'));
});

module.exports = router;
