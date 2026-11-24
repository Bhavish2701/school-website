/**
 * Student Archival & Record Inactivation Service
 * Sri Vidya English Medium High School - ERP
 *
 * Implements authoritative business rules:
 * - Student archival closes active enrolment while 100% preserving historical records.
 * - ZERO DATA DELETION: Never permanently purges student identity, grades, fees, or documents.
 * - Departmental clearances must be satisfied or waived prior to completion.
 * - Principal holds final executive approval authority.
 */

const StudentArchival = require('../models/studentArchival.model');
const { Student } = require('../models/student.model');
const liveSyncBus = require('../utils/liveSyncBus');

class StudentArchivalService {
  async getArchivalRequests(filter = {}, options = {}) {
    const query = {};
    if (filter.institutionId) query.institutionId = filter.institutionId;
    if (filter.status) query.status = filter.status;
    if (filter.admissionNo) query.admissionNo = filter.admissionNo.toUpperCase();
    if (filter.search) {
      query.$or = [
        { studentName: { $regex: filter.search, $options: 'i' } },
        { admissionNo: { $regex: filter.search, $options: 'i' } },
        { archivalRequestId: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      StudentArchival.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StudentArchival.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getArchivalRequestById(id) {
    const record = await StudentArchival.findOne({
      $or: [{ _id: id }, { archivalRequestId: id }],
    });
    if (!record) {
      const err = new Error('Student archival docket not found.');
      err.statusCode = 404;
      throw err;
    }
    return record;
  }

  async createArchivalRequest(data, user) {
    const existingActive = await StudentArchival.findOne({
      admissionNo: data.admissionNo.toUpperCase(),
      status: { $in: ['Pending Review', 'Under Review', 'Approved'] },
    });
    if (existingActive) {
      const err = new Error(`An active archival request (${existingActive.archivalRequestId}) already exists for student ${data.admissionNo}.`);
      err.statusCode = 409;
      throw err;
    }

    const reqId = data.archivalRequestId || `ARC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const actorName = (user && user.fullName) || 'Administrative Staff';
    const actorRole = (user && user.role) || 'clerk';

    const newRecord = new StudentArchival({
      ...data,
      archivalRequestId: reqId,
      status: data.status || 'Pending Review',
      executiveAuthorization: {
        requestedBy: actorName,
        requestingEmployeeId: (user && user.employeeId) || 'SV100012',
        requestDate: new Date(),
        approvalStatus: 'Pending Review',
        effectiveDate: data.effectiveDate || new Date(),
      },
      auditHistory: [
        {
          timestamp: new Date(),
          actor: actorName,
          role: actorRole,
          action: 'Archival Request Initiated',
          oldValue: 'Active Enrolled',
          newValue: 'Archival Under Review',
          remarks: data.reasonExplanation || 'Controlled student archival docket created.',
        },
      ],
    });

    return await newRecord.save();
  }

  async updateDepartmentClearance(id, deptKey, clearanceData, user) {
    const record = await this.getArchivalRequestById(id);
    if (!record.departmentalClearances[deptKey]) {
      const err = new Error(`Invalid department key: ${deptKey}`);
      err.statusCode = 400;
      throw err;
    }

    const validStatuses = ['Pending', 'In Progress', 'Cleared', 'Not Applicable', 'Correction Required', 'Waiver Requested', 'Waiver Approved'];
    if (!validStatuses.includes(clearanceData.status)) {
      const err = new Error(`Invalid clearance status: ${clearanceData.status}`);
      err.statusCode = 400;
      throw err;
    }

    record.departmentalClearances[deptKey].status = clearanceData.status;
    record.departmentalClearances[deptKey].verifiedDate = new Date();
    record.departmentalClearances[deptKey].verifiedBy = (user && user.fullName) || clearanceData.verifiedBy || 'Authorized Department Staff';
    if (clearanceData.remarks) record.departmentalClearances[deptKey].remarks = clearanceData.remarks;
    if (clearanceData.outstanding) record.departmentalClearances[deptKey].outstanding = clearanceData.outstanding;
    if (clearanceData.waiverApproved !== undefined) record.departmentalClearances[deptKey].waiverApproved = clearanceData.waiverApproved;

    record.auditHistory.push({
      timestamp: new Date(),
      actor: (user && user.fullName) || 'Department Staff',
      role: (user && user.role) || 'staff',
      action: `Department Clearance Updated: ${deptKey.toUpperCase()}`,
      newValue: clearanceData.status,
      remarks: clearanceData.remarks || `Clearance status updated to ${clearanceData.status}`,
    });

    return await record.save();
  }

  async executiveApprovalDecision(id, decision, remarks, user) {
    const record = await this.getArchivalRequestById(id);
    const actorRole = (user && user.role) ? String(user.role).toUpperCase() : '';
    const actorName = (user && user.fullName) || 'Authorized Executive';

    if (!['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(actorRole)) {
      const err = new Error('Unauthorized: Only Principal or Vice Principal can authorize student archival.');
      err.statusCode = 403;
      throw err;
    }

    if (decision === 'Approved') {
      record.status = 'Approved';
      record.executiveAuthorization.approvalStatus = 'Approved';
      record.executiveAuthorization.approvalDate = new Date();
      record.executiveAuthorization.approvalReference = `EXEC-APP-2026-${String(Math.floor(100 + Math.random() * 900))}`;
      record.executiveAuthorization.approvalRemarks = remarks || 'Executive approval granted. All historical records preserved.';
    } else if (decision === 'Rejected') {
      record.status = 'Rejected';
      record.executiveAuthorization.approvalStatus = 'Rejected';
      record.executiveAuthorization.approvalDate = new Date();
      record.executiveAuthorization.approvalRemarks = remarks || 'Archival request rejected.';
    } else if (decision === 'Returned for Correction') {
      record.status = 'Returned for Correction';
      record.executiveAuthorization.approvalStatus = 'Returned for Correction';
      record.executiveAuthorization.approvalRemarks = remarks || 'Returned for departmental or physical document rectification.';
    } else {
      const err = new Error(`Invalid decision: ${decision}`);
      err.statusCode = 400;
      throw err;
    }

    record.auditHistory.push({
      timestamp: new Date(),
      actor: actorName,
      role: actorRole,
      action: `Executive Approval Decision: ${decision}`,
      newValue: record.status,
      remarks: remarks || `Executive decision: ${decision}`,
    });

    return await record.save();
  }

  async completeStudentArchival(id, user) {
    const record = await this.getArchivalRequestById(id);
    if (record.status !== 'Approved') {
      const err = new Error('Prerequisite Error: Student archival docket must be Approved by Executive Principal before completion.');
      err.statusCode = 400;
      throw err;
    }

    // Verify all 7 departments are satisfied
    const depts = record.departmentalClearances;
    const deptKeys = ['library', 'accounts', 'academic', 'examination', 'labAndSports', 'transport', 'administration'];
    for (const key of deptKeys) {
      const d = depts[key];
      if (d && d.status !== 'Cleared' && d.status !== 'Not Applicable' && d.status !== 'Waiver Approved') {
        const err = new Error(`Cannot complete archival: ${key.toUpperCase()} department clearance is ${d.status}.`);
        err.statusCode = 400;
        throw err;
      }
    }

    // Update Student Record (ZERO DATA DELETION GUARANTEE)
    const student = await Student.findOne({ admissionNo: record.admissionNo });
    if (student) {
      student.status = 'ARCHIVED';
      await student.save();
    }

    record.status = 'Completed';
    record.auditHistory.push({
      timestamp: new Date(),
      actor: (user && user.fullName) || 'Executive Principal Smt. Gorle Varalakshmi',
      role: (user && user.role) || 'principal',
      action: 'Student Archival Completed & Records Sealed',
      oldValue: 'Approved',
      newValue: 'Completed (Archived)',
      remarks: 'Active enrolment successfully closed. All historical academic, examination, attendance, and financial ledgers permanently retained under institutional retention policy. Zero data deletion enforced.',
    });

    return await record.save();
  }
}

module.exports = new StudentArchivalService();
