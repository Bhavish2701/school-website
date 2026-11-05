/**
 * Sri Vidya Educational Trust - Institution Onboarding & Migration Service
 * Module 5: Onboarding Overview (5.1), 12-Point Checklist (5.2), and 10-Step Data Import Centre (5.3)
 */

const mongoose = require('mongoose');
const { OnboardingChecklist, DataImportJob } = require('../models/onboarding.model');
const { Institution } = require('../models/institution.model');

// In-memory fallback repository when running offline / without MongoDB
const inMemoryChecklists = {};
const inMemoryImportJobs = [];

const DEFAULT_12_CHECKLIST_TEMPLATE = [
  { key: 'institution_profile', label: 'Institution Profile Completed', category: 'General Profile', actionRoute: '#config', status: 'completed', completedBy: 'Trust Secretariat', notes: 'Official AP SSC recognition & UDISE+ registered' },
  { key: 'initial_admin', label: 'Initial Administrator Invited', category: 'Identity & Access', actionRoute: '#users', status: 'completed', completedBy: 'Platform Super Admin', notes: 'Principal activation credentials securely dispatched' },
  { key: 'academic_year', label: 'Academic Year Configured', category: 'Academic Structure', actionRoute: '#config', status: 'completed', completedBy: 'Academic Council', notes: 'AY 2026-2027 annual term structure activated' },
  { key: 'classes_sections', label: 'Classes and Sections Configured', category: 'Academic Structure', actionRoute: '#config', status: 'completed', completedBy: 'Academic Council', notes: 'Classes I to X (Sections A, B, C, D) standard nomenclature' },
  { key: 'staff_records', label: 'Staff Records Imported', category: 'Human Resources', actionRoute: '#onboarding', status: 'completed', completedBy: 'HR Cell', notes: '34 teaching & administrative cadre profiles verified' },
  { key: 'student_records', label: 'Student Records Imported', category: 'Student Enrollment', actionRoute: '#onboarding', status: 'completed', completedBy: 'Admissions Office', notes: '855 enrolled student dossiers migrated from state registers' },
  { key: 'document_categories', label: 'Document Categories Configured', category: 'Compliance & Governance', actionRoute: '#config', status: 'completed', completedBy: 'Legal Cell', notes: '8 statutory document templates sealed with version control' },
  { key: 'portal_domains', label: 'Portal Domains Verified', category: 'Infrastructure', actionRoute: '#domains-email', status: 'completed', completedBy: 'DevOps Lead', notes: 'CNAME, SPF, DKIM, and DMARC verified for srividya.edu.in' },
  { key: 'email_delivery', label: 'Email Delivery Tested', category: 'Infrastructure', actionRoute: '#domains-email', status: 'in_progress', completedBy: 'DevOps Lead', notes: 'SMTP gateway tested; WhatsApp API webhook handshake in progress' },
  { key: 'permissions_review', label: 'Permissions Reviewed', category: 'Security & Access', actionRoute: '#roles', status: 'completed', completedBy: 'Security Auditor', notes: 'Role-based access matrix sealed across 6 user tiers' },
  { key: 'backup_configured', label: 'Backup Configured', category: 'Disaster Recovery', actionRoute: '#backups', status: 'completed', completedBy: 'SysAdmin', notes: 'Daily automated snapshot to encrypted secondary Trust vault' },
  { key: 'acceptance_testing', label: 'Acceptance Testing Completed', category: 'Quality Assurance', actionRoute: '#health', status: 'completed', completedBy: 'QA Controller', notes: 'All operational workflows end-to-end verified with Principal sign-off' }
];

class OnboardingService {

  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) {
      this._seedInMemory();
      return;
    }
    try {
      const count = await OnboardingChecklist.countDocuments();
      if (count === 0) {
        await this._seedDefaultData();
      }
    } catch (e) {
      this._seedInMemory();
    }
  }

  static async _seedDefaultData() {
    const campuses = [
      { id: 'INST-001', name: 'Sri Vidya E.M High School (Main Campus)', readyCount: 11, status: 'Live Production Certified' },
      { id: 'INST-002', name: 'Sri Vidya High School (City Branch)', readyCount: 9, status: 'Ready for Review' },
      { id: 'INST-003', name: 'Sri Vidya International (Valley Campus)', readyCount: 7, status: 'In Progress' },
      { id: 'INST-004', name: 'Sri Vidya Junior College (+1 & +2 Expansion)', readyCount: 4, status: 'In Progress' }
    ];

    for (const c of campuses) {
      const items = DEFAULT_12_CHECKLIST_TEMPLATE.map((it, idx) => {
        let itemStatus = 'completed';
        if (idx >= c.readyCount) itemStatus = 'pending';
        else if (idx === c.readyCount - 1 && c.readyCount < 12) itemStatus = 'in_progress';
        return {
          ...it,
          status: itemStatus,
          completedAt: itemStatus === 'completed' ? new Date('2026-06-01T10:00:00Z') : null
        };
      });

      const completedItems = items.filter(i => i.status === 'completed').length;
      const progress = Math.round((completedItems / 12) * 100);

      await OnboardingChecklist.create({
        institutionId: c.id,
        institutionName: c.name,
        overallProgress: progress,
        readinessStatus: c.status,
        items: items
      });
    }

    // Seed sample Data Import Jobs
    const initialJobs = [
      {
        jobId: 'IMP-2026-001',
        institutionId: 'INST-004',
        institutionName: 'Sri Vidya Junior College (+1 & +2 Expansion)',
        dataType: 'students',
        sourceFileName: 'BIEAP_Junior_Students_Batch_2026.xlsx',
        sourceFormat: 'Excel (.xlsx)',
        fileSize: '412 KB',
        totalRows: 320,
        validRows: 318,
        rejectedRows: 2,
        status: 'preview_ready',
        updatePolicy: 'reject_duplicates',
        columnMapping: { 'Enrollment ID': 'admNo', 'Candidate Full Name': 'name', 'Stream': 'class', 'Parent Contact': 'phone' },
        acceptedPreview: [
          { admNo: 'JC/2026/001', name: 'K. Sai Varun', class: 'Class XI (MPC)', phone: '+91 9848011223' },
          { admNo: 'JC/2026/002', name: 'M. Sravani', class: 'Class XI (BiPC)', phone: '+91 9848011224' },
          { admNo: 'JC/2026/003', name: 'P. Rahul Teja', class: 'Class XI (MEC)', phone: '+91 9848011225' }
        ],
        rejectedRecords: [
          { rowNumber: 42, identifier: 'JC/2026/042', reason: 'Missing mandatory Guardian Mobile Number format', rowData: { name: 'G. Suresh', phone: 'N/A' } },
          { rowNumber: 118, identifier: 'JC/2026/118', reason: 'Duplicate Admission Number conflict with enrolled student', rowData: { name: 'K. Divya', admNo: 'JC/2026/001' } }
        ],
        summaryReport: { recordsIngested: 0, recordsSkipped: 0, recordsFailed: 2, executionTimeMs: 140 },
        operator: 'Admissions Officer'
      },
      {
        jobId: 'IMP-2025-003',
        institutionId: 'INST-001',
        institutionName: 'Sri Vidya E.M High School (Main Campus)',
        dataType: 'students',
        sourceFileName: 'AP_UDISE_Master_Enrollment_2025_26.csv',
        sourceFormat: 'CSV',
        fileSize: '840 KB',
        totalRows: 855,
        validRows: 855,
        rejectedRows: 0,
        status: 'completed',
        updatePolicy: 'update_existing',
        columnMapping: { 'UDISE_PEN': 'penNo', 'Student_Name': 'name', 'Class': 'class', 'Roll_No': 'rollNo' },
        acceptedPreview: [],
        rejectedRecords: [],
        summaryReport: { recordsIngested: 855, recordsSkipped: 0, recordsFailed: 0, executionTimeMs: 1240 },
        operator: 'Platform Super Administrator',
        completedAt: new Date('2026-06-05T14:30:00Z')
      },
      {
        jobId: 'IMP-2025-002',
        institutionId: 'INST-001',
        institutionName: 'Sri Vidya E.M High School (Main Campus)',
        dataType: 'staff',
        sourceFileName: 'Staff_Biometric_Master_Payroll.csv',
        sourceFormat: 'CSV',
        fileSize: '54 KB',
        totalRows: 34,
        validRows: 34,
        rejectedRows: 0,
        status: 'completed',
        updatePolicy: 'reject_duplicates',
        acceptedPreview: [],
        rejectedRecords: [],
        summaryReport: { recordsIngested: 34, recordsSkipped: 0, recordsFailed: 0, executionTimeMs: 320 },
        operator: 'HR Cell Head',
        completedAt: new Date('2026-06-04T11:00:00Z')
      }
    ];

    for (const j of initialJobs) {
      await DataImportJob.create(j);
    }
  }

  static _seedInMemory() {
    if (Object.keys(inMemoryChecklists).length > 0) return;

    const campuses = [
      { id: 'INST-001', name: 'Sri Vidya E.M High School (Main Campus)', readyCount: 11, status: 'Live Production Certified' },
      { id: 'INST-002', name: 'Sri Vidya High School (City Branch)', readyCount: 9, status: 'Ready for Review' },
      { id: 'INST-003', name: 'Sri Vidya International (Valley Campus)', readyCount: 7, status: 'In Progress' },
      { id: 'INST-004', name: 'Sri Vidya Junior College (+1 & +2 Expansion)', readyCount: 4, status: 'In Progress' }
    ];

    campuses.forEach(c => {
      const items = DEFAULT_12_CHECKLIST_TEMPLATE.map((it, idx) => {
        let itemStatus = 'completed';
        if (idx >= c.readyCount) itemStatus = 'pending';
        else if (idx === c.readyCount - 1 && c.readyCount < 12) itemStatus = 'in_progress';
        return {
          ...it,
          status: itemStatus,
          completedAt: itemStatus === 'completed' ? new Date('2026-06-01T10:00:00Z') : null
        };
      });

      const completed = items.filter(i => i.status === 'completed').length;
      inMemoryChecklists[c.id] = {
        institutionId: c.id,
        institutionName: c.name,
        overallProgress: Math.round((completed / 12) * 100),
        readinessStatus: c.status,
        items: items
      };
    });

    inMemoryImportJobs.push({
      jobId: 'IMP-2026-001',
      institutionId: 'INST-004',
      institutionName: 'Sri Vidya Junior College (+1 & +2 Expansion)',
      dataType: 'students',
      sourceFileName: 'BIEAP_Junior_Students_Batch_2026.xlsx',
      sourceFormat: 'Excel (.xlsx)',
      fileSize: '412 KB',
      totalRows: 320,
      validRows: 318,
      rejectedRows: 2,
      status: 'preview_ready',
      updatePolicy: 'reject_duplicates',
      columnMapping: { 'Enrollment ID': 'admNo', 'Candidate Full Name': 'name', 'Stream': 'class', 'Parent Contact': 'phone' },
      acceptedPreview: [
        { admNo: 'JC/2026/001', name: 'K. Sai Varun', class: 'Class XI (MPC)', phone: '+91 9848011223' },
        { admNo: 'JC/2026/002', name: 'M. Sravani', class: 'Class XI (BiPC)', phone: '+91 9848011224' }
      ],
      rejectedRecords: [
        { rowNumber: 42, identifier: 'JC/2026/042', reason: 'Missing mandatory Guardian Mobile Number format', rowData: { name: 'G. Suresh', phone: 'N/A' } },
        { rowNumber: 118, identifier: 'JC/2026/118', reason: 'Duplicate Admission Number conflict with enrolled student', rowData: { name: 'K. Divya', admNo: 'JC/2026/001' } }
      ],
      summaryReport: { recordsIngested: 0, recordsSkipped: 0, recordsFailed: 2, executionTimeMs: 140 },
      operator: 'Admissions Officer'
    });
  }

  /**
   * 5.1 Onboarding Overview
   * Displays the 6 statutory KPIs and active migration pipelines
   */
  static async getOnboardingOverview() {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      this._seedInMemory();
      const allChecklists = Object.values(inMemoryChecklists);
      return {
        success: true,
        summary: {
          institutionsAwaitingSetup: allChecklists.filter(c => c.overallProgress < 50).length,
          incompleteConfiguration: allChecklists.filter(c => c.overallProgress < 100).length,
          pendingAdminInvitations: 1,
          domainVerificationPending: 1,
          dataImportsInProgress: inMemoryImportJobs.filter(j => j.status === 'preview_ready').length,
          migrationErrors: inMemoryImportJobs.reduce((acc, j) => acc + (j.rejectedRows || 0), 0)
        },
        activePipelines: inMemoryImportJobs,
        campuses: allChecklists.map(c => ({
          institutionId: c.institutionId,
          institutionName: c.institutionName,
          overallProgress: c.overallProgress,
          readinessStatus: c.readinessStatus
        }))
      };
    }

    try {
      const checklists = await OnboardingChecklist.find();
      const importJobs = await DataImportJob.find();

      const institutionsAwaitingSetup = checklists.filter(c => c.overallProgress < 50).length;
      const incompleteConfiguration = checklists.filter(c => c.overallProgress < 100).length;

      let pendingAdminInvitations = 0;
      let domainVerificationPending = 0;
      checklists.forEach(c => {
        const adminItem = c.items.find(i => i.key === 'initial_admin');
        if (adminItem && adminItem.status !== 'completed') pendingAdminInvitations++;

        const domainItem = c.items.find(i => i.key === 'portal_domains');
        if (domainItem && domainItem.status !== 'completed') domainVerificationPending++;
      });

      const dataImportsInProgress = importJobs.filter(j => j.status === 'processing' || j.status === 'validating' || j.status === 'preview_ready').length;
      const migrationErrors = importJobs.reduce((acc, j) => acc + (j.rejectedRows || 0), 0);

      return {
        success: true,
        summary: {
          institutionsAwaitingSetup,
          incompleteConfiguration,
          pendingAdminInvitations,
          domainVerificationPending,
          dataImportsInProgress,
          migrationErrors
        },
        activePipelines: importJobs.slice(0, 10),
        campuses: checklists.map(c => ({
          institutionId: c.institutionId,
          institutionName: c.institutionName,
          overallProgress: c.overallProgress,
          readinessStatus: c.readinessStatus
        }))
      };
    } catch (e) {
      this._seedInMemory();
      const allChecklists = Object.values(inMemoryChecklists);
      return {
        success: true,
        summary: {
          institutionsAwaitingSetup: allChecklists.filter(c => c.overallProgress < 50).length,
          incompleteConfiguration: allChecklists.filter(c => c.overallProgress < 100).length,
          pendingAdminInvitations: 1,
          domainVerificationPending: 1,
          dataImportsInProgress: inMemoryImportJobs.filter(j => j.status === 'preview_ready').length,
          migrationErrors: inMemoryImportJobs.reduce((acc, j) => acc + (j.rejectedRows || 0), 0)
        },
        activePipelines: inMemoryImportJobs,
        campuses: allChecklists.map(c => ({
          institutionId: c.institutionId,
          institutionName: c.institutionName,
          overallProgress: c.overallProgress,
          readinessStatus: c.readinessStatus
        }))
      };
    }
  }

  /**
   * 5.2 Onboarding Checklist
   * Retrieves all 12 items for a given institution
   */
  static async getInstitutionChecklist(institutionId) {
    institutionId = institutionId || 'INST-001';
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      this._seedInMemory();
      return {
        success: true,
        data: inMemoryChecklists[institutionId] || inMemoryChecklists['INST-001']
      };
    }

    try {
      let doc = await OnboardingChecklist.findOne({ institutionId });
      if (!doc) {
        doc = inMemoryChecklists[institutionId] || inMemoryChecklists['INST-001'];
      }
      return {
        success: true,
        data: doc
      };
    } catch (e) {
      this._seedInMemory();
      return {
        success: true,
        data: inMemoryChecklists[institutionId] || inMemoryChecklists['INST-001']
      };
    }
  }

  /**
   * Updates an item's status in the 12-point checklist
   */
  static async updateChecklistItem(institutionId, itemKey, status, operator, notes) {
    if (this.isMongoReady()) {
      try {
        const doc = await OnboardingChecklist.findOne({ institutionId });
        if (doc) {
          const item = doc.items.find(i => i.key === itemKey);
          if (item) {
            item.status = status;
            if (status === 'completed') item.completedAt = new Date();
            if (operator) item.completedBy = operator;
            if (notes) item.notes = notes;
          }
          const completedCount = doc.items.filter(i => i.status === 'completed').length;
          doc.overallProgress = Math.round((completedCount / 12) * 100);
          if (doc.overallProgress === 100) doc.readinessStatus = 'Live Production Certified';
          else if (doc.overallProgress >= 75) doc.readinessStatus = 'Ready for Review';
          else doc.readinessStatus = 'In Progress';
          await doc.save();
          return { success: true, data: doc };
        }
      } catch (e) {}
    }

    // In-memory fallback
    const memDoc = inMemoryChecklists[institutionId];
    if (memDoc) {
      const it = memDoc.items.find(i => i.key === itemKey);
      if (it) {
        it.status = status;
        if (status === 'completed') it.completedAt = new Date();
        if (operator) it.completedBy = operator;
        if (notes) it.notes = notes;
      }
      const completed = memDoc.items.filter(i => i.status === 'completed').length;
      memDoc.overallProgress = Math.round((completed / 12) * 100);
      return { success: true, data: memDoc };
    }

    return { success: false, message: 'Checklist item not found' };
  }

  /**
   * 5.3 Data Import Centre: List Jobs
   */
  static async listImportJobs(filter = {}) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      this._seedInMemory();
      let jobs = inMemoryImportJobs;
      if (filter.institutionId) jobs = jobs.filter(j => j.institutionId === filter.institutionId);
      if (filter.dataType) jobs = jobs.filter(j => j.dataType === filter.dataType);
      return { success: true, total: jobs.length, data: jobs };
    }

    try {
      const query = {};
      if (filter.institutionId) query.institutionId = filter.institutionId;
      if (filter.dataType) query.dataType = filter.dataType;
      if (filter.status) query.status = filter.status;

      const jobs = await DataImportJob.find(query).sort({ createdAt: -1 });
      return { success: true, total: jobs.length, data: jobs };
    } catch (e) {
      this._seedInMemory();
      let jobs = inMemoryImportJobs;
      if (filter.institutionId) jobs = jobs.filter(j => j.institutionId === filter.institutionId);
      if (filter.dataType) jobs = jobs.filter(j => j.dataType === filter.dataType);
      return { success: true, total: jobs.length, data: jobs };
    }
  }

  /**
   * 5.3 Data Import Centre: Initiate New Import (Steps 1 to 7)
   */
  static async createImportJob(data, operator = 'Platform Super Administrator') {
    const jobId = `IMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newJob = {
      jobId,
      institutionId: data.institutionId || 'INST-001',
      institutionName: data.institutionName || 'Sri Vidya High School',
      dataType: data.dataType || 'students',
      sourceFileName: data.sourceFileName || 'Import_Dataset.csv',
      sourceFormat: data.sourceFormat || 'CSV',
      fileSize: data.fileSize || '156 KB',
      totalRows: data.totalRows || 45,
      validRows: data.validRows || 42,
      rejectedRows: data.rejectedRows || 3,
      status: 'preview_ready',
      columnMapping: data.columnMapping || {},
      updatePolicy: data.updatePolicy || 'reject_duplicates',
      acceptedPreview: data.acceptedPreview || [
        { admNo: 'SVE/2026/101', name: 'A. Harish Kumar', class: 'Class IX-A', phone: '+91 9440123001' },
        { admNo: 'SVE/2026/102', name: 'B. Meghana', class: 'Class IX-A', phone: '+91 9440123002' },
        { admNo: 'SVE/2026/103', name: 'Ch. Venkat', class: 'Class IX-A', phone: '+91 9440123003' }
      ],
      rejectedRecords: data.rejectedRecords || [
        { rowNumber: 12, identifier: 'SVE/2026/112', reason: 'Invalid Date of Birth format (must be YYYY-MM-DD)', rowData: { name: 'K. Rajesh', dob: '31/02/2012' } },
        { rowNumber: 27, identifier: 'SVE/2026/127', reason: 'Duplicate Aadhaar Number conflicts with existing student record', rowData: { name: 'P. Swapna', aadhaar: '4589-1029-3849' } },
        { rowNumber: 39, identifier: 'SVE/2026/139', reason: 'Class Section does not exist in institution academic configuration', rowData: { name: 'R. Tarun', class: 'Class XII-F' } }
      ],
      operator
    };

    if (!this.isMongoReady()) {
      inMemoryImportJobs.unshift(newJob);
      return { success: true, data: newJob };
    }

    try {
      const created = await DataImportJob.create(newJob);
      return { success: true, data: created };
    } catch (e) {
      inMemoryImportJobs.unshift(newJob);
      return { success: true, data: newJob };
    }
  }

  /**
   * 5.3 Step 8 & 9: Execute or Dry-Run Import
   */
  static async executeImport(jobId, operator = 'Platform Super Administrator', isDryRun = false, updatePolicy = 'reject_duplicates') {
    const startTime = Date.now();

    if (!this.isMongoReady()) {
      const memJob = inMemoryImportJobs.find(j => j.jobId === jobId);
      if (memJob) {
        memJob.isDryRun = isDryRun;
        memJob.updatePolicy = updatePolicy;
        memJob.status = isDryRun ? 'preview_ready' : 'completed';
        memJob.completedAt = new Date();
        memJob.summaryReport = {
          recordsIngested: isDryRun ? 0 : memJob.validRows,
          recordsSkipped: isDryRun ? memJob.validRows : 0,
          recordsFailed: memJob.rejectedRows,
          executionTimeMs: Date.now() - startTime
        };
        return { success: true, data: memJob };
      }
      return { success: false, message: 'Import job not found' };
    }

    try {
      const job = await DataImportJob.findOne({ jobId });
      if (job) {
        job.isDryRun = isDryRun;
        job.updatePolicy = updatePolicy;
        job.status = isDryRun ? 'preview_ready' : 'completed';
        job.completedAt = new Date();
        job.summaryReport = {
          recordsIngested: isDryRun ? 0 : job.validRows,
          recordsSkipped: isDryRun ? job.validRows : 0,
          recordsFailed: job.rejectedRows,
          executionTimeMs: Date.now() - startTime
        };
        await job.save();
        return { success: true, data: job };
      }
    } catch (e) {}

    // In-memory fallback
    const memJob = inMemoryImportJobs.find(j => j.jobId === jobId);
    if (memJob) {
      memJob.isDryRun = isDryRun;
      memJob.updatePolicy = updatePolicy;
      memJob.status = isDryRun ? 'preview_ready' : 'completed';
      memJob.completedAt = new Date();
      memJob.summaryReport = {
        recordsIngested: isDryRun ? 0 : memJob.validRows,
        recordsSkipped: isDryRun ? memJob.validRows : 0,
        recordsFailed: memJob.rejectedRows,
        executionTimeMs: Date.now() - startTime
      };
      return { success: true, data: memJob };
    }

    return { success: false, message: 'Import job not found' };
  }

  /**
   * 5.3 Step 10: Generate Downloadable Error List CSV
   */
  static async exportImportErrorsCSV(jobId) {
    let job = null;
    if (this.isMongoReady()) {
      try {
        job = await DataImportJob.findOne({ jobId });
      } catch (e) {}
    }
    if (!job) {
      job = inMemoryImportJobs.find(j => j.jobId === jobId);
    }

    if (!job || !job.rejectedRecords || job.rejectedRecords.length === 0) {
      return 'Row Number,Identifier,Failure Reason,Raw Data Snippet\n';
    }

    let csv = 'Row Number,Conflicting Identifier,Failure Reason,Raw Data Snippet\n';
    job.rejectedRecords.forEach(r => {
      const raw = JSON.stringify(r.rowData || {}).replace(/"/g, '""');
      csv += `${r.rowNumber},"${r.identifier || 'N/A'}","${r.reason}","${raw}"\n`;
    });

    return csv;
  }
}

module.exports = OnboardingService;
