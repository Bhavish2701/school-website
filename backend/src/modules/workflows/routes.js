/**
 * Institutional Workflows Router
 * Specification: THE MOST IMPORTANT SCHOOL WORKFLOWS (Workflows A through J)
 *
 * Workflow A: New student admission (12 steps)
 * Workflow B: Student attendance (8 steps)
 * Workflow C: Examinations and results (10 steps)
 * Workflow D: Fees (9 steps)
 * Workflow E: Teacher onboarding (8 steps)
 * Workflow F: Staff leave (7 steps)
 * Workflow G: Principal appointment (9 steps)
 * Workflow H: Student transfer (9 steps)
 * Workflow I: Purchase request (9 steps)
 * Workflow J: School announcement (7 steps)
 */
const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

const INSTITUTIONAL_WORKFLOWS_REGISTRY = [
  {
    id: 'WF-A',
    code: 'Workflow A',
    title: 'New student admission',
    category: 'Admissions & Enrolment',
    domain: 'Academic',
    sla: '48 Hours',
    currentActiveStep: 8,
    totalSteps: 12,
    overallStatus: 'IN_PROGRESS',
    description: 'Enquiry → Application → Document Verification → Eligibility Review → Admission Decision → Offer Acceptance → Required Payment/Clearance → Enrolment → Admission Number → Class Allocation → Guardian Linking → Account Invitation, when available.',
    steps: [
      { stepNo: 1, name: 'Enquiry', responsibleUser: 'Reception Desk / Parent', responsibleRole: 'Admissions Office', status: 'COMPLETED', timestamp: '2026-10-24 09:30 AM IST', nextAction: 'Issue formal registration prospectus & application form' },
      { stepNo: 2, name: 'Application', responsibleUser: 'P. Venkata Ramana (Parent)', responsibleRole: 'Applicant / Guardian', status: 'COMPLETED', timestamp: '2026-10-25 02:15 PM IST', nextAction: 'Scrutinize original statutory documents & certificates' },
      { stepNo: 3, name: 'Document Verification', responsibleUser: 'Sri Ch. Ramesh (Office In-Charge)', responsibleRole: 'Office Staff', status: 'COMPLETED', timestamp: '2026-10-26 11:00 AM IST', nextAction: 'Convene academic eligibility evaluation committee' },
      { stepNo: 4, name: 'Eligibility Review', responsibleUser: 'Academic Assessment Panel', responsibleRole: 'Designated Authority', status: 'COMPLETED', timestamp: '2026-10-27 03:45 PM IST', nextAction: 'Transmit recommendation docket to Principal for final decision' },
      { stepNo: 5, name: 'Admission Decision', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'COMPLETED', timestamp: '2026-10-28 10:30 AM IST', nextAction: 'Dispatch formal admission offer docket to parent via SMS & Email' },
      { stepNo: 6, name: 'Offer Acceptance', responsibleUser: 'P. Venkata Ramana (Parent)', responsibleRole: 'Parent / Guardian', status: 'COMPLETED', timestamp: '2026-10-29 01:10 PM IST', nextAction: 'Collect initial admission fee & issue accounts clearance' },
      { stepNo: 7, name: 'Required Payment/Clearance', responsibleUser: 'Accounts Officer Sri S. Ramu', responsibleRole: 'Accounts Officer', status: 'COMPLETED', timestamp: '2026-10-30 11:20 AM IST', nextAction: 'Record student entry in Master Admission Register Folio #142' },
      { stepNo: 8, name: 'Enrolment', responsibleUser: 'Registrar / Senior Admin Officer', responsibleRole: 'Administrative Officer', status: 'IN_PROGRESS', timestamp: '2026-10-31 09:00 AM IST', nextAction: 'Allocate permanent statutory Admission Number' },
      { stepNo: 9, name: 'Admission Number', responsibleUser: 'System Auto-Allocator', responsibleRole: 'System Registrar', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Allocate class grade level, section, and roll number' },
      { stepNo: 10, name: 'Class Allocation', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Vice Principal (Academics)', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Verify guardian relationship & link parent credentials' },
      { stepNo: 11, name: 'Guardian Linking', responsibleUser: 'Student Records In-Charge', responsibleRole: 'Office Staff', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Dispatch student and parent portal account activation credentials' },
      { stepNo: 12, name: 'Account Invitation, when available', responsibleUser: 'Portal Identity Provisioner', responsibleRole: 'Portal System Admin', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Parent and student activate accounts upon portal launch' },
    ],
  },
  {
    id: 'WF-B',
    code: 'Workflow B',
    title: 'Student attendance',
    category: 'Daily Turnout & Biometrics',
    domain: 'Academic',
    sla: 'Same Day (10:30 AM)',
    currentActiveStep: 6,
    totalSteps: 8,
    overallStatus: 'IN_PROGRESS',
    description: 'Class Register → Attendance Entry → Validation → Teacher Submission → Attendance Summary → Authorized Parent Notification, if configured → Management Reporting → Correction Request, if needed.',
    steps: [
      { stepNo: 1, name: 'Class Register', responsibleUser: 'Portal Attendance Engine', responsibleRole: 'System Scheduler', status: 'COMPLETED', timestamp: '2026-11-05 08:30 AM IST', nextAction: 'Generate period-1 student classroom roster' },
      { stepNo: 2, name: 'Attendance Entry', responsibleUser: 'Assigned Class Teacher (Ms. Anjali)', responsibleRole: 'Class Teacher', status: 'COMPLETED', timestamp: '2026-11-05 08:55 AM IST', nextAction: 'Cross-check marked absences against medical leave slips' },
      { stepNo: 3, name: 'Validation', responsibleUser: 'Attendance Audit Cell', responsibleRole: 'Attendance Coordinator', status: 'COMPLETED', timestamp: '2026-11-05 09:15 AM IST', nextAction: 'Electronically sign & submit class attendance register' },
      { stepNo: 4, name: 'Teacher Submission', responsibleUser: 'Assigned Class Teacher (Ms. Anjali)', responsibleRole: 'Class Teacher', status: 'COMPLETED', timestamp: '2026-11-05 09:20 AM IST', nextAction: 'Aggregate school-wide turnout summary and alert thresholds' },
      { stepNo: 5, name: 'Attendance Summary', responsibleUser: 'System Analytics Engine', responsibleRole: 'Analytics Service', status: 'COMPLETED', timestamp: '2026-11-05 09:25 AM IST', nextAction: 'Trigger automated absent SMS to verified parent phones' },
      { stepNo: 6, name: 'Authorized Parent Notification, if configured', responsibleUser: 'SMS & WhatsApp Notification Gateway', responsibleRole: 'Notification Service', status: 'IN_PROGRESS', timestamp: '2026-11-05 09:30 AM IST', nextAction: 'Compile daily executive turnout digest for Principal' },
      { stepNo: 7, name: 'Management Reporting', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Vice Principal', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Monitor and process legitimate attendance correction appeals' },
      { stepNo: 8, name: 'Correction Request, if needed', responsibleUser: 'Class Teacher / Office Authority', responsibleRole: 'Designated Approver', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Verify medical evidence and audit reopen log before approval' },
    ],
  },
  {
    id: 'WF-C',
    code: 'Workflow C',
    title: 'Examinations and results',
    category: 'Assessment & Tabulation',
    domain: 'Academic',
    sla: '5 Business Days',
    currentActiveStep: 7,
    totalSteps: 10,
    overallStatus: 'IN_PROGRESS',
    description: 'Exam Creation → Schedule Approval → Examination Conducted → Marks Entry → Validation → Review/Moderation → Result Approval → Report Card Generation → Publication → Student/Parent Access, when enabled.',
    steps: [
      { stepNo: 1, name: 'Exam Creation', responsibleUser: 'Examination Controller Sri K. V. Rao', responsibleRole: 'Exam Board In-Charge', status: 'COMPLETED', timestamp: '2026-10-10 11:00 AM IST', nextAction: 'Draft exam timetable, room plan, and max score rubrics' },
      { stepNo: 2, name: 'Schedule Approval', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal', status: 'COMPLETED', timestamp: '2026-10-12 04:00 PM IST', nextAction: 'Print hall tickets and deliver invigilation kits' },
      { stepNo: 3, name: 'Examination Conducted', responsibleUser: 'Chief Superintendent & Invigilators', responsibleRole: 'Examination Faculty', status: 'COMPLETED', timestamp: '2026-10-22 01:00 PM IST', nextAction: 'Handover sealed answer booklets to subject evaluators' },
      { stepNo: 4, name: 'Marks Entry', responsibleUser: 'Subject Evaluation Faculty', responsibleRole: 'Subject Teachers', status: 'COMPLETED', timestamp: '2026-10-26 05:30 PM IST', nextAction: 'Perform statistical zero-defect score range validation' },
      { stepNo: 5, name: 'Validation', responsibleUser: 'Academic Audit Cell', responsibleRole: 'Academic Coordinator', status: 'COMPLETED', timestamp: '2026-10-27 02:00 PM IST', nextAction: 'Convene Department Moderation Board for boundary cases' },
      { stepNo: 6, name: 'Review/Moderation', responsibleUser: 'Department Moderation Board', responsibleRole: 'Academic Review Committee', status: 'COMPLETED', timestamp: '2026-10-28 04:30 PM IST', nextAction: 'Submit moderated tabulation register for executive approval' },
      { stepNo: 7, name: 'Result Approval', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'IN_PROGRESS', timestamp: '2026-10-29 11:00 AM IST', nextAction: 'Authorize automated bilingual report card PDF compilation' },
      { stepNo: 8, name: 'Report Card Generation', responsibleUser: 'Result Publishing System Engine', responsibleRole: 'System Report Generator', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Formally seal and publish results in permanent school ledger' },
      { stepNo: 9, name: 'Publication', responsibleUser: 'Examination Controller Sri K. V. Rao', responsibleRole: 'Exam Controller', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Enable student and parent self-service portal result views' },
      { stepNo: 10, name: 'Student/Parent Access, when enabled', responsibleUser: 'Future Portal Integration Service', responsibleRole: 'Portal System Admin', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Parents and students view published cards upon portal launch' },
    ],
  },
  {
    id: 'WF-D',
    code: 'Workflow D',
    title: 'Fees',
    category: 'Finance & Accounts',
    domain: 'Financial',
    sla: '24 Hours',
    currentActiveStep: 5,
    totalSteps: 9,
    overallStatus: 'IN_PROGRESS',
    description: 'Fee Structure → Student Invoice → Payment or Offline Receipt → Transaction Verification → Ledger Entry → Receipt → Outstanding Balance Update → Reconciliation → Authorized Financial Reporting.',
    steps: [
      { stepNo: 1, name: 'Fee Structure', responsibleUser: 'School Management Committee', responsibleRole: 'Governing Body', status: 'COMPLETED', timestamp: '2026-06-01 10:00 AM IST', nextAction: 'Generate term student fee demand invoices' },
      { stepNo: 2, name: 'Student Invoice', responsibleUser: 'Accounts Officer Sri S. Ramu', responsibleRole: 'Accounts Officer', status: 'COMPLETED', timestamp: '2026-06-05 03:00 PM IST', nextAction: 'Receive payment through digital gateway or counter cash/DD' },
      { stepNo: 3, name: 'Payment or Offline Receipt', responsibleUser: 'Cashier Sri K. Prasad', responsibleRole: 'Counter Cashier', status: 'COMPLETED', timestamp: '2026-11-04 11:45 AM IST', nextAction: 'Verify transaction reference with bank settlement sheet' },
      { stepNo: 4, name: 'Transaction Verification', responsibleUser: 'Senior Accounts Clerk', responsibleRole: 'Audit Clerk', status: 'COMPLETED', timestamp: '2026-11-04 02:30 PM IST', nextAction: 'Post double-entry credit in student general fee ledger' },
      { stepNo: 5, name: 'Ledger Entry', responsibleUser: 'Accounts Desk', responsibleRole: 'Accounts Clerk', status: 'IN_PROGRESS', timestamp: '2026-11-05 09:00 AM IST', nextAction: 'Generate official stamp-sealed numbered receipt' },
      { stepNo: 6, name: 'Receipt', responsibleUser: 'Billing System / Cashier', responsibleRole: 'Billing In-Charge', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Recalculate remaining dues balance and update clearance pill' },
      { stepNo: 7, name: 'Outstanding Balance Update', responsibleUser: 'Automated Financial Ledger Engine', responsibleRole: 'Ledger Engine', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Execute daily counter cash tally and bank scroll reconciliation' },
      { stepNo: 8, name: 'Reconciliation', responsibleUser: 'Bursar / Finance Manager', responsibleRole: 'Finance Manager', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Compile executive monthly collection audit and arrears report' },
      { stepNo: 9, name: 'Authorized Financial Reporting', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Executive Authority', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Submit quarterly compliance filing to Management Committee' },
    ],
  },
  {
    id: 'WF-E',
    code: 'Workflow E',
    title: 'Teacher onboarding',
    category: 'Human Resources & Faculty Integration',
    domain: 'Administrative',
    sla: '72 Hours',
    currentActiveStep: 6,
    totalSteps: 8,
    overallStatus: 'IN_PROGRESS',
    description: 'Staff Record → Document Verification → Employment Approval → Class/Subject Allocation → User Account Creation → Permission Assignment → Timetable Allocation → Active Faculty Account.',
    steps: [
      { stepNo: 1, name: 'Staff Record', responsibleUser: 'HR Coordinator Smt. M. Vani', responsibleRole: 'HR Desk', status: 'COMPLETED', timestamp: '2026-10-18 10:00 AM IST', nextAction: 'Scrutinize original TET, B.Ed, degree, and police clearance certificates' },
      { stepNo: 2, name: 'Document Verification', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Vice Principal', status: 'COMPLETED', timestamp: '2026-10-19 02:30 PM IST', nextAction: 'Issue formal appointment order and confirm pay scale' },
      { stepNo: 3, name: 'Employment Approval', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'COMPLETED', timestamp: '2026-10-20 11:15 AM IST', nextAction: 'Assign teaching classes, subjects, and Class Teacher duties' },
      { stepNo: 4, name: 'Class/Subject Allocation', responsibleUser: 'Academic Dean Sri Ch. Ramesh', responsibleRole: 'Academic Coordinator', status: 'COMPLETED', timestamp: '2026-10-21 04:00 PM IST', nextAction: 'Create institutional user account (@srividya.edu.in)' },
      { stepNo: 5, name: 'User Account Creation', responsibleUser: 'Platform Admin / IT Team', responsibleRole: 'System Administrator', status: 'COMPLETED', timestamp: '2026-10-22 10:30 AM IST', nextAction: 'Assign role-based permissions (Attendance, Marks, Class Broadcast)' },
      { stepNo: 6, name: 'Permission Assignment', responsibleUser: 'Platform Admin / IT Team', responsibleRole: 'System Administrator', status: 'IN_PROGRESS', timestamp: '2026-10-23 09:00 AM IST', nextAction: 'Allocate teaching slots and free periods in master timetable' },
      { stepNo: 7, name: 'Timetable Allocation', responsibleUser: 'Timetable In-Charge Sri B. Ramana', responsibleRole: 'Timetable Coordinator', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Complete biometric enrollment and orientation for active status' },
      { stepNo: 8, name: 'Active Faculty Account', responsibleUser: 'Faculty Member / HR Coordinator', responsibleRole: 'Active Faculty', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Deliver curriculum syllabus and classroom keys' },
    ],
  },
  {
    id: 'WF-F',
    code: 'Workflow F',
    title: 'Staff leave',
    category: 'Faculty Leave & Substitution',
    domain: 'Administrative',
    sla: '24 Hours',
    currentActiveStep: 4,
    totalSteps: 7,
    overallStatus: 'IN_PROGRESS',
    description: 'Leave Request → Policy Validation → Designated Approver → Decision → Staff Availability Update → Substitution Planning, if needed → Attendance Reconciliation.',
    steps: [
      { stepNo: 1, name: 'Leave Request', responsibleUser: 'Sri K. Venkat Rao (Senior Faculty)', responsibleRole: 'Applicant Faculty', status: 'COMPLETED', timestamp: '2026-11-04 03:00 PM IST', nextAction: 'Validate leave balance and minimum advance notice' },
      { stepNo: 2, name: 'Policy Validation', responsibleUser: 'Automated HR Policy Engine', responsibleRole: 'HR System', status: 'COMPLETED', timestamp: '2026-11-04 03:05 PM IST', nextAction: 'Forward to Department Head & Vice Principal for review' },
      { stepNo: 3, name: 'Designated Approver', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Vice Principal', status: 'COMPLETED', timestamp: '2026-11-04 05:00 PM IST', nextAction: 'Record formal sanction decision with justification' },
      { stepNo: 4, name: 'Decision', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'IN_PROGRESS', timestamp: '2026-11-05 09:15 AM IST', nextAction: 'Update faculty availability register and mark absent in timetable' },
      { stepNo: 5, name: 'Staff Availability Update', responsibleUser: 'Portal Attendance State Engine', responsibleRole: 'System State Engine', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Assign available teachers to cover unattended classroom periods' },
      { stepNo: 6, name: 'Substitution Planning, if needed', responsibleUser: 'Timetable In-Charge Sri B. Ramana', responsibleRole: 'Timetable In-Charge', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Reconcile leave deductions against monthly payroll attendance' },
      { stepNo: 7, name: 'Attendance Reconciliation', responsibleUser: 'Accounts Officer Sri S. Ramu', responsibleRole: 'Payroll In-Charge', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Archive approved leave application slip in employee dossier' },
    ],
  },
  {
    id: 'WF-G',
    code: 'Workflow G',
    title: 'Principal appointment',
    category: 'Executive Diary & Security',
    domain: 'Administrative',
    sla: '24 Hours',
    currentActiveStep: 5,
    totalSteps: 9,
    overallStatus: 'IN_PROGRESS',
    description: 'Appointment Request → Availability Check → Review → Approval/Rescheduling → Confirmation → Visitor Check-in → Meeting → Follow-up → Completion.',
    steps: [
      { stepNo: 1, name: 'Appointment Request', responsibleUser: 'Sri K. Subrahmanyam (Parent)', responsibleRole: 'Visitor / Parent', status: 'COMPLETED', timestamp: '2026-11-03 04:30 PM IST', nextAction: 'Cross-check request against Principal\'s executive calendar' },
      { stepNo: 2, name: 'Availability Check', responsibleUser: 'Executive Assistant Smt. T. Padma', responsibleRole: 'Office Secretary', status: 'COMPLETED', timestamp: '2026-11-04 10:00 AM IST', nextAction: 'Screen agenda and determine meeting necessity & urgency' },
      { stepNo: 3, name: 'Review', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Executive Office', status: 'COMPLETED', timestamp: '2026-11-04 11:30 AM IST', nextAction: 'Approve slot or suggest nearest alternative consultation window' },
      { stepNo: 4, name: 'Approval/Rescheduling', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'COMPLETED', timestamp: '2026-11-04 02:00 PM IST', nextAction: 'Dispatch electronic confirmation pass with token and reporting time' },
      { stepNo: 5, name: 'Confirmation', responsibleUser: 'Office Secretary / SMS Gateway', responsibleRole: 'Communication In-Charge', status: 'IN_PROGRESS', timestamp: '2026-11-04 03:00 PM IST', nextAction: 'Security desk verifies visitor identity and issues visitor pass' },
      { stepNo: 6, name: 'Visitor Check-in', responsibleUser: 'Campus Security Supervisor', responsibleRole: 'Main Gate Security', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Convene conference in Principal Chamber' },
      { stepNo: 7, name: 'Meeting', responsibleUser: 'Principal & Visitor', responsibleRole: 'Executive Conference', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Record meeting decisions, directives, and departmental taskings' },
      { stepNo: 8, name: 'Follow-up', responsibleUser: 'Executive Assistant Smt. T. Padma', responsibleRole: 'Executive Secretary', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Confirm departmental task completion and archive meeting minutes' },
      { stepNo: 9, name: 'Completion', responsibleUser: 'Principal Office', responsibleRole: 'Executive Archive', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Review follow-up outcome within 7 business days' },
    ],
  },
  {
    id: 'WF-H',
    code: 'Workflow H',
    title: 'Student transfer',
    category: 'Records & Statutory Certificates',
    domain: 'Academic',
    sla: '48 Hours',
    currentActiveStep: 4,
    totalSteps: 9,
    overallStatus: 'IN_PROGRESS',
    description: 'Transfer Request → Identity Verification → Academic Clearance → Required Departmental Checks → Authorized Decision → TC Generation → Issue Record → Enrolment Status Update → Historical Record Retention.',
    steps: [
      { stepNo: 1, name: 'Transfer Request', responsibleUser: 'Parent / Guardian Written Application', responsibleRole: 'Parent / Guardian', status: 'COMPLETED', timestamp: '2026-11-02 10:15 AM IST', nextAction: 'Verify student admission folio and permanent enrollment details' },
      { stepNo: 2, name: 'Identity Verification', responsibleUser: 'Senior Administrative Officer', responsibleRole: 'Administrative Officer', status: 'COMPLETED', timestamp: '2026-11-02 02:00 PM IST', nextAction: 'Obtain academic conduct, attendance, and promotion standing' },
      { stepNo: 3, name: 'Academic Clearance', responsibleUser: 'Assigned Class Teacher (Ms. Anjali)', responsibleRole: 'Class Teacher', status: 'COMPLETED', timestamp: '2026-11-03 11:30 AM IST', nextAction: 'Conduct mandatory 4-department No-Dues audit' },
      { stepNo: 4, name: 'Required Departmental Checks', responsibleUser: 'Library, Lab, Sports & Transport Custodians', responsibleRole: 'Department Custodians', status: 'IN_PROGRESS', timestamp: '2026-11-04 09:30 AM IST', nextAction: 'Review statutory compliance under Rule 99 AP Code' },
      { stepNo: 5, name: 'Authorized Decision', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Generate statutory Transfer Certificate (Form Appendix 16)' },
      { stepNo: 6, name: 'TC Generation', responsibleUser: 'Examination & Records Officer', responsibleRole: 'Records Officer', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Record issuance in Statutory TC Register Book with parent signature' },
      { stepNo: 7, name: 'Issue Record', responsibleUser: 'Office Superintendent', responsibleRole: 'Office Superintendent', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Transition student status to TRANSFERRED in master database' },
      { stepNo: 8, name: 'Enrolment Status Update', responsibleUser: 'Database Administrator', responsibleRole: 'Database Administrator', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Archive student dossier in immutable permanent historical vault' },
      { stepNo: 9, name: 'Historical Record Retention', responsibleUser: 'Statutory Archive Custodian', responsibleRole: 'Registrar / Archive Custodian', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Retain records indefinitely for verification and duplicate requests' },
    ],
  },
  {
    id: 'WF-I',
    code: 'Workflow I',
    title: 'Purchase request',
    category: 'Procurement & Inventory',
    domain: 'Financial',
    sla: '48 Hours',
    currentActiveStep: 3,
    totalSteps: 9,
    overallStatus: 'IN_PROGRESS',
    description: 'Department Request → Budget/Need Review → Approval → Vendor/Quotation Process → Purchase Order → Goods Received → Invoice Matching → Authorized Payment → Asset/Stock Register Update.',
    steps: [
      { stepNo: 1, name: 'Department Request', responsibleUser: 'Science Lab In-Charge Sri M. Srinivas', responsibleRole: 'Department Head', status: 'COMPLETED', timestamp: '2026-11-01 11:00 AM IST', nextAction: 'Check departmental budget balance and current stock' },
      { stepNo: 2, name: 'Budget/Need Review', responsibleUser: 'Accounts Officer Sri S. Ramu', responsibleRole: 'Accounts Officer', status: 'COMPLETED', timestamp: '2026-11-02 03:30 PM IST', nextAction: 'Route to competent approving authority for financial sanction' },
      { stepNo: 3, name: 'Approval', responsibleUser: 'Principal Smt. Gorle Varalakshmi', responsibleRole: 'Principal / Head of Institution', status: 'IN_PROGRESS', timestamp: '2026-11-03 10:00 AM IST', nextAction: 'Solicit 3 competitive vendor quotations' },
      { stepNo: 4, name: 'Vendor/Quotation Process', responsibleUser: 'Institutional Purchasing Committee', responsibleRole: 'Purchasing Committee', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Issue official numbered Purchase Order (PO-2026-XXXX)' },
      { stepNo: 5, name: 'Purchase Order', responsibleUser: 'Store Custodian / Accounts Desk', responsibleRole: 'Procurement In-Charge', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Inspect delivered items against PO specifications and inward challan' },
      { stepNo: 6, name: 'Goods Received', responsibleUser: 'Department Custodian & Store In-Charge', responsibleRole: 'Store Custodian', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Perform 3-way matching of PO, delivery challan, and tax invoice' },
      { stepNo: 7, name: 'Invoice Matching', responsibleUser: 'Accounts Audit Clerk', responsibleRole: 'Accounts Clerk', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Sanction and release payment disbursement to supplier' },
      { stepNo: 8, name: 'Authorized Payment', responsibleUser: 'Principal & Accounts Officer', responsibleRole: 'Disbursing Authority', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Tag equipment with asset barcodes and update stock ledger' },
      { stepNo: 9, name: 'Asset/Stock Register Update', responsibleUser: 'Store Custodian / Lab In-Charge', responsibleRole: 'Asset Custodian', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'File warranty documents and schedule annual physical verification' },
    ],
  },
  {
    id: 'WF-J',
    code: 'Workflow J',
    title: 'School announcement',
    category: 'Communication & Bulletins',
    domain: 'Administrative',
    sla: '12 Hours',
    currentActiveStep: 4,
    totalSteps: 7,
    overallStatus: 'IN_PROGRESS',
    description: 'Draft → Audience Selection → Approval, if required → Preview → Publication/Scheduling → Delivery Tracking → Expiry/Archive.',
    steps: [
      { stepNo: 1, name: 'Draft', responsibleUser: 'Communication Officer Smt. R. Lakshmi', responsibleRole: 'Communication Officer', status: 'COMPLETED', timestamp: '2026-11-04 04:00 PM IST', nextAction: 'Define target broadcast audience and recipient segments' },
      { stepNo: 2, name: 'Audience Selection', responsibleUser: 'Communication In-Charge', responsibleRole: 'Broadcasting Desk', status: 'COMPLETED', timestamp: '2026-11-04 04:30 PM IST', nextAction: 'Review content for administrative & regulatory compliance' },
      { stepNo: 3, name: 'Approval, if required', responsibleUser: 'Vice Principal Sri Navva Anand', responsibleRole: 'Vice Principal', status: 'COMPLETED', timestamp: '2026-11-04 05:15 PM IST', nextAction: 'Generate multi-channel rendering preview (Web, App, SMS)' },
      { stepNo: 4, name: 'Preview', responsibleUser: 'Communication Desk', responsibleRole: 'Communication Officer', status: 'IN_PROGRESS', timestamp: '2026-11-05 08:30 AM IST', nextAction: 'Execute live publication and trigger scheduled push alerts' },
      { stepNo: 5, name: 'Publication/Scheduling', responsibleUser: 'Portal Automated Broadcast Service', responsibleRole: 'Automated Broadcast Engine', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Monitor delivery telemetry, open rates, and gateway bounce logs' },
      { stepNo: 6, name: 'Delivery Tracking', responsibleUser: 'IT & Communication Cell', responsibleRole: 'System Monitoring', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Retire announcement on expiry date to permanent notice vault' },
      { stepNo: 7, name: 'Expiry/Archive', responsibleUser: 'Portal Archival Daemon', responsibleRole: 'Archive System', status: 'PENDING_ACTION', timestamp: 'Pending', nextAction: 'Retain in historical circular vault for compliance audits' },
    ],
  },
];

// GET /api/v1/modules/workflows - List all 10 core institutional workflows
router.get('/', (req, res) => {
  res.json(
    formatSuccess(
      {
        totalWorkflows: INSTITUTIONAL_WORKFLOWS_REGISTRY.length,
        totalAuditSteps: INSTITUTIONAL_WORKFLOWS_REGISTRY.reduce((acc, w) => acc + w.totalSteps, 0),
        workflows: INSTITUTIONAL_WORKFLOWS_REGISTRY,
      },
      'Institutional Workflows (Workflows A - J) retrieved successfully'
    )
  );
});

// GET /api/v1/modules/workflows/:id - Get specific workflow with full step audit trail
router.get('/:id', (req, res) => {
  const wf = INSTITUTIONAL_WORKFLOWS_REGISTRY.find(
    (w) => w.id === req.params.id || w.code.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!wf) {
    return res.status(404).json({ success: false, message: `Workflow '${req.params.id}' not found` });
  }
  res.json(formatSuccess(wf, `Workflow details for ${wf.code} retrieved successfully`));
});

// POST /api/v1/modules/workflows/:id/advance - Advance workflow step
router.post('/:id/advance', (req, res) => {
  const wf = INSTITUTIONAL_WORKFLOWS_REGISTRY.find(
    (w) => w.id === req.params.id || w.code.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!wf) {
    return res.status(404).json({ success: false, message: `Workflow '${req.params.id}' not found` });
  }

  const currentIdx = wf.currentActiveStep - 1;
  if (currentIdx < wf.steps.length) {
    wf.steps[currentIdx].status = 'COMPLETED';
    wf.steps[currentIdx].timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  }

  if (wf.currentActiveStep < wf.totalSteps) {
    wf.currentActiveStep += 1;
    const nextIdx = wf.currentActiveStep - 1;
    wf.steps[nextIdx].status = 'IN_PROGRESS';
    wf.steps[nextIdx].timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  } else {
    wf.overallStatus = 'COMPLETED';
  }

  res.json(
    formatSuccess(
      {
        workflowId: wf.id,
        code: wf.code,
        currentActiveStep: wf.currentActiveStep,
        activeStepName: wf.steps[wf.currentActiveStep - 1]?.name,
        overallStatus: wf.overallStatus,
        requiredNextAction: wf.steps[wf.currentActiveStep - 1]?.nextAction,
      },
      `Workflow ${wf.code} advanced to Step ${wf.currentActiveStep}`
    )
  );
});

router.INSTITUTIONAL_WORKFLOWS_REGISTRY = INSTITUTIONAL_WORKFLOWS_REGISTRY;
module.exports = router;
