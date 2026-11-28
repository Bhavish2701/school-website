const StudentExit = require('../models/studentExit.model');
const { Student } = require('../models/student.model');
const { AttendanceRecord } = require('../models/attendance.model');
const liveSyncBus = require('../utils/liveSyncBus');

class StudentExitService {
  async getExitRequests(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.exitType) filter.exitType = query.exitType;
    if (query.class) filter.class = query.class;
    if (query.search) {
      filter.$or = [
        { studentName: { $regex: query.search, $options: 'i' } },
        { admissionNo: { $regex: query.search, $options: 'i' } },
        { exitRequestId: { $regex: query.search, $options: 'i' } },
        { 'transferCertificate.tcNumber': { $regex: query.search, $options: 'i' } }
      ];
    }
    return await StudentExit.find(filter).sort({ createdAt: -1 });
  }

  async getExitRequestById(id) {
    let rec = await StudentExit.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { exitRequestId: id }, { admissionNo: id }]
    });
    return rec;
  }

  async createExitRequest(data, user) {
    const count = await StudentExit.countDocuments();
    const exitRequestId = data.exitRequestId || `EXT-2026-${String(count + 1).padStart(4, '0')}`;

    const exitRec = new StudentExit({
      ...data,
      exitRequestId,
      status: 'Request Submitted',
      auditHistory: [
        {
          timestamp: new Date().toLocaleString(),
          actor: user?.fullName || 'Sri Ch. Venkat (Office Admin)',
          role: user?.role || 'OFFICE',
          field: 'Exit Request Initiation',
          oldValue: 'None',
          newValue: 'Request Submitted',
          reason: `Statutory ${data.exitType} request registered for ${data.studentName} (${data.admissionNo}).`
        }
      ]
    });

    return await exitRec.save();
  }

  async verifyParentRequest(id, verificationData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    exitRec.parentVerification = {
      ...exitRec.parentVerification,
      ...verificationData,
      verifiedBy: user?.fullName || 'Sri Ch. Venkat (Head Clerk)',
      verificationDate: new Date().toISOString().split('T')[0]
    };

    if (verificationData.identityVerificationStatus === 'Verified') {
      exitRec.status = 'Clearance In Progress';
    } else if (verificationData.identityVerificationStatus === 'Rejected') {
      exitRec.status = 'Rejected';
    } else if (verificationData.identityVerificationStatus === 'Correction Required') {
      exitRec.status = 'Under Verification';
    }

    exitRec.auditHistory.unshift({
      timestamp: new Date().toLocaleString(),
      actor: user?.fullName || 'Sri Ch. Venkat (Head Clerk)',
      role: user?.role || 'OFFICE',
      field: 'Parent Request Verification',
      oldValue: 'Pending',
      newValue: verificationData.identityVerificationStatus,
      reason: verificationData.verificationRemarks || 'Parent physical request credentials audited.'
    });

    return await exitRec.save();
  }

  async updateDepartmentClearance(id, deptKey, clearanceData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    if (!exitRec.departmentClearances) {
      exitRec.departmentClearances = {};
    }
    if (!exitRec.departmentClearances[deptKey]) {
      exitRec.departmentClearances[deptKey] = {};
    }

    const currentDept = exitRec.departmentClearances[deptKey] || {};
    const action = (clearanceData.action || 'SUBMIT').toUpperCase();
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const timestampStr = now.toLocaleString();

    const deptPrefix = (deptKey || 'CLR').substring(0, 3).toUpperCase();
    const referenceNo = clearanceData.referenceNo || currentDept.referenceNo || `CLR-${deptPrefix}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (action === 'REVOKE') {
      const revokedReason = (clearanceData.revokedReason || '').trim();
      if (!revokedReason || revokedReason.length < 10) {
        throw new Error('A mandatory revocation reason of at least 10 characters is required when revoking a departmental clearance sign-off.');
      }

      if (!Array.isArray(currentDept.history)) currentDept.history = [];
      currentDept.history.unshift({
        timestamp: timestampStr,
        action: 'REVOKE',
        status: 'Revoked',
        referenceNo: currentDept.referenceNo || referenceNo,
        officer: user?.fullName || currentDept.verifiedBy || 'Department Officer',
        duesAmount: currentDept.duesAmount || 0,
        assetReturnDetails: currentDept.assetReturnDetails || '',
        remarks: clearanceData.remarks || currentDept.remarks || '',
        revokedReason,
        revokedBy: user?.fullName || 'Administrator',
        revokedDate: nowStr,
        supportingDocName: currentDept.supportingDocName || ''
      });

      exitRec.departmentClearances[deptKey] = {
        ...currentDept,
        status: 'Revoked',
        isRevoked: true,
        revokedReason,
        revokedBy: user?.fullName || 'Department In-Charge',
        revokedDate: nowStr,
        verifiedTime: timeStr,
        referenceNo
      };

      exitRec.auditHistory.unshift({
        timestamp: timestampStr,
        actor: user?.fullName || 'Department In-Charge',
        role: user?.role || 'STAFF',
        field: `${deptKey.toUpperCase()} Clearance REVOCATION`,
        oldValue: currentDept.status || 'Cleared',
        newValue: 'Revoked',
        reason: revokedReason
      });
    } else {
      if (!Array.isArray(currentDept.history)) currentDept.history = [];
      if (currentDept.status && currentDept.status !== 'Pending Verification') {
        currentDept.history.unshift({
          timestamp: timestampStr,
          action,
          status: clearanceData.status || currentDept.status || 'Cleared',
          referenceNo,
          officer: clearanceData.verifiedBy || user?.fullName || currentDept.inCharge || 'Department Officer',
          duesAmount: clearanceData.duesAmount !== undefined ? clearanceData.duesAmount : (currentDept.duesAmount || 0),
          assetReturnDetails: clearanceData.assetReturnDetails || currentDept.assetReturnDetails || '',
          remarks: clearanceData.remarks || currentDept.remarks || '',
          supportingDocName: clearanceData.supportingDocName || currentDept.supportingDocName || ''
        });
      }

      exitRec.departmentClearances[deptKey] = {
        ...currentDept,
        ...clearanceData,
        referenceNo,
        isRevoked: false,
        revokedReason: '',
        verifiedBy: clearanceData.verifiedBy || user?.fullName || currentDept.inCharge || 'Department Officer',
        verifiedDate: clearanceData.verifiedDate || nowStr,
        verifiedTime: clearanceData.verifiedTime || timeStr
      };

      exitRec.auditHistory.unshift({
        timestamp: timestampStr,
        actor: user?.fullName || 'Department In-Charge',
        role: user?.role || 'STAFF',
        field: `${deptKey.toUpperCase()} Clearance (${action})`,
        oldValue: currentDept.status || 'Pending Verification',
        newValue: clearanceData.status || 'Updated',
        reason: clearanceData.remarks || `Clearance ${action.toLowerCase()} recorded under Ref: ${referenceNo}`
      });
    }

    if (deptKey === 'scienceLab' || deptKey === 'sports') {
      const sci = exitRec.departmentClearances.scienceLab;
      const spt = exitRec.departmentClearances.sports;
      const combinedCleared = (sci && (sci.status === 'Cleared' || sci.isApplicable === false)) &&
                              (spt && (spt.status === 'Cleared' || spt.isApplicable === false));
      exitRec.departmentClearances.labAndSports = {
        status: combinedCleared ? 'Cleared' : (sci?.status || spt?.status || 'Pending Verification'),
        inCharge: 'Sri K. Ramu (Labs) & Sri V. Ramesh Babu (Sports)',
        verifiedBy: user?.fullName || 'Labs & Sports Council',
        verifiedDate: nowStr,
        equipmentReturned: true,
        remarks: 'Synchronized from Science Lab and Sports Clearance sign-offs'
      };
    }

    const allDepts = ['accounts', 'library', 'scienceLab', 'sports', 'transport', 'itLab', 'hostel', 'academic'];
    const allCleared = allDepts.every(d => {
      const dep = exitRec.departmentClearances[d];
      if (!dep) {
        if (d === 'scienceLab' || d === 'sports') {
          const leg = exitRec.departmentClearances.labAndSports;
          return leg && (leg.status === 'Cleared' || leg.status === 'Waiver Approved' || leg.isNotApplicable === true);
        }
        return false;
      }
      if (dep.isApplicable === false || dep.isNotApplicable === true || dep.status === 'Not Applicable') return true;
      if (dep.isRevoked) return false;
      return dep.status === 'Cleared' || dep.status === 'Waiver Approved' || dep.status === 'Statutory Undertaking';
    });

    if (allCleared && exitRec.status !== 'Approved' && exitRec.status !== 'TC Generated' && exitRec.status !== 'Completed') {
      exitRec.status = 'Awaiting Principal Approval';
    } else if (!allCleared && exitRec.status === 'Awaiting Principal Approval') {
      exitRec.status = 'Clearance Pending';
    }

    return await exitRec.save();
  }

  async requestOrApproveWaiver(id, waiverData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    const accounts = exitRec.departmentClearances.accounts;
    if (waiverData.action === 'APPROVE') {
      accounts.waiverApproved = true;
      accounts.status = 'Waiver Approved';
      accounts.waiverApprovedBy = user?.fullName || 'Smt. Gorle Varalakshmi (Executive Principal)';
      accounts.waiverReason = waiverData.reason || 'Managing Committee authorized statutory financial settlement.';
    } else {
      accounts.waiverRequested = true;
      accounts.status = 'Waiver Requested';
      accounts.waiverReason = waiverData.reason || 'Parent concession request forwarded.';
    }

    exitRec.auditHistory.unshift({
      timestamp: new Date().toLocaleString(),
      actor: user?.fullName || 'Executive Authority',
      role: user?.role || 'PRINCIPAL',
      field: 'Financial Fee Waiver Decision',
      oldValue: accounts.status,
      newValue: waiverData.action === 'APPROVE' ? 'Waiver Approved' : 'Waiver Requested',
      reason: waiverData.reason || 'Fee waiver processing.'
    });

    return await exitRec.save();
  }

  async principalDecision(id, decisionData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    exitRec.approval = {
      principalDecision: decisionData.decision,
      decisionDate: new Date().toISOString().split('T')[0],
      decidedBy: user?.fullName || 'Smt. Gorle Varalakshmi (Executive Principal)',
      remarks: decisionData.remarks || ''
    };

    if (decisionData.decision === 'Approved') {
      exitRec.status = 'Approved';
    } else if (decisionData.decision === 'Rejected') {
      exitRec.status = 'Rejected';
    } else if (decisionData.decision === 'Returned for Correction') {
      exitRec.status = 'Under Verification';
    }

    exitRec.auditHistory.unshift({
      timestamp: new Date().toLocaleString(),
      actor: user?.fullName || 'Smt. Gorle Varalakshmi (Executive Principal)',
      role: 'PRINCIPAL',
      field: 'Executive Principal Exit Decision',
      oldValue: 'Awaiting Principal Approval',
      newValue: decisionData.decision,
      reason: decisionData.remarks || 'Statutory review completed.'
    });

    return await exitRec.save();
  }

  async issueTransferCertificate(id, tcData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    const isDraft = (tcData.action || '').toUpperCase() === 'SAVE_DRAFT';

    if (!isDraft) {
      const depts = exitRec.departmentClearances || {};
      const revokedDepts = Object.keys(depts).filter(k => depts[k]?.isRevoked);
      if (revokedDepts.length > 0) {
        throw new Error(`Cannot issue Transfer Certificate: ${revokedDepts.join(', ')} clearance is REVOKED. Resolve departmental objections first.`);
      }

      if (exitRec.status !== 'Approved' && exitRec.status !== 'TC Generated' && exitRec.status !== 'Completed') {
        throw new Error('Transfer Certificate can only be issued after Executive Principal Approval');
      }
    }

    const yearSuffix = (exitRec.academicYear || '2025-2026').slice(0, 4);
    const tcNo = (tcData.tcNumber || exitRec.transferCertificate?.tcNumber || `SV/${yearSuffix}/${String(Math.floor(40 + Math.random() * 900)).padStart(3, '0')}`).trim();

    if (!isDraft) {
      const duplicate = await StudentExit.findOne({
        'transferCertificate.tcNumber': tcNo,
        exitRequestId: { $ne: exitRec.exitRequestId }
      });
      if (duplicate) {
        throw new Error(`Duplicate TC Serial Number detected: ${tcNo} has already been issued to ${duplicate.studentName} (${duplicate.admissionNo}). Each TC must bear a unique statutory number.`);
      }
    }

    const validConducts = ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement', 'Not Evaluated'];
    let conductVal = tcData.conduct || exitRec.transferCertificate?.conduct || 'Excellent';
    if (!validConducts.includes(conductVal)) {
      if (conductVal.toLowerCase().includes('very')) conductVal = 'Very Good';
      else if (conductVal.toLowerCase().includes('good')) conductVal = 'Good';
      else if (conductVal.toLowerCase().includes('satisfactory')) conductVal = 'Satisfactory';
      else if (conductVal.toLowerCase().includes('needs')) conductVal = 'Needs Improvement';
      else if (conductVal.toLowerCase().includes('not')) conductVal = 'Not Evaluated';
      else conductVal = 'Excellent';
    }

    const issueDate = tcData.issueDate || exitRec.transferCertificate?.issueDate || new Date().toISOString().split('T')[0];
    const leavingDate = tcData.leavingDate || exitRec.proposedLastDate || exitRec.officialLeavingDate || exitRec.transferCertificate?.leavingDate || issueDate;
    const digiHash = tcData.digitalSignatureHash || exitRec.transferCertificate?.digitalSignatureHash || ('SV-DIGISIGN-' + Math.random().toString(36).substring(2, 11).toUpperCase());

    let computedAttendanceSummary = tcData.attendanceVerification || exitRec.departmentClearances?.academic?.attendanceDays;
    if (!computedAttendanceSummary) {
      const studentDoc = await Student.findOne({ admissionNo: exitRec.admissionNo }).select('_id').lean();
      if (studentDoc) {
        const [totalDays, presentDays] = await Promise.all([
          AttendanceRecord.countDocuments({ student: studentDoc._id }),
          AttendanceRecord.countDocuments({ student: studentDoc._id, status: { $in: ['PRESENT', 'LATE', 'EXCUSED'] } }),
        ]);
        if (totalDays > 0) {
          const pct = Math.round((presentDays / totalDays) * 1000) / 10;
          computedAttendanceSummary = `${presentDays} / ${totalDays} Working Days (${pct}%)`;
        } else {
          computedAttendanceSummary = 'No attendance records recorded';
        }
      } else {
        computedAttendanceSummary = 'Student attendance ledger unavailable';
      }
    }

    exitRec.transferCertificate = {
      ...exitRec.transferCertificate,
      tcNumber: tcNo,
      issueDate: issueDate,
      leavingDate: leavingDate,
      admissionNo: exitRec.admissionNo,
      studentName: exitRec.studentName,
      class: exitRec.class,
      academicYear: exitRec.academicYear || '',
      signatoryName: tcData.signatoryName || (user && user.fullName) || 'Executive Principal',
      signatoryDesignation: tcData.signatoryDesignation || 'Executive Principal & Headmistress',
      signatoryEmployeeId: tcData.signatoryEmployeeId || '',
      digitalSignatureHash: digiHash,
      officialSchoolSeal: 'Proceedings of DEO R.C.No. 72 B1 / 79 Dt. 30-5-80 • District Educational Officer Approved',
      conduct: conductVal,
      conductRemarks: tcData.conductRemarks || exitRec.conductEvaluation?.teacherRemarks || '',
      academicVerification: {
        lastClassStudied: tcData.lastClassStudied || exitRec.class,
        lastAcademicYear: tcData.lastAcademicYear || exitRec.academicYear || '',
        lastExamCompleted: tcData.lastExamCompleted || exitRec.departmentClearances?.academic?.lastExam || '',
        examResult: tcData.examResult || exitRec.departmentClearances?.academic?.promotionStatus || '',
        promotionEligibility: tcData.promotionEligibility || '',
        attendanceVerification: computedAttendanceSummary,
        recordsPreserved: true
      },
      authorizationChecklist: {
        departmentalClearances: tcData.checklistClearances ?? true,
        parentVerification: tcData.checklistParent ?? true,
        financialClearance: tcData.checklistFinancial ?? true,
        studentDocuments: tcData.checklistDocs ?? true,
        principalApproval: tcData.checklistApproval ?? true
      },
      status: isDraft ? 'Draft' : 'Generated & Signed',
      printableHtml: tcData.printableHtml || exitRec.transferCertificate?.printableHtml || '',
      issuedBy: user?.fullName || 'Smt. Gorle Varalakshmi (Executive Principal)',
      issuedTimestamp: new Date().toLocaleString()
    };

    if (!isDraft) {
      exitRec.status = 'TC Generated';

      const targetStatus = exitRec.exitType === 'Withdrawal' ? 'WITHDRAWN' : 'TRANSFERRED';
      await Student.findOneAndUpdate(
        { admissionNo: exitRec.admissionNo },
        {
          $set: {
            status: targetStatus,
            effectiveWithdrawalDate: issueDate,
            tcNumber: tcNo,
            updatedAt: new Date()
          }
        }
      );

      exitRec.auditHistory.unshift({
        timestamp: new Date().toLocaleString(),
        actor: user?.fullName || 'Smt. Gorle Varalakshmi (Executive Principal)',
        role: user?.role || 'PRINCIPAL',
        field: 'Official Transfer Certificate Issuance',
        oldValue: exitRec.status,
        newValue: `TC Issued (${tcNo})`,
        reason: `Formal Transfer Certificate ${tcNo} authorized, digitally stamped, and sealed. Student transitioned to ${targetStatus} with all historical records preserved.`
      });
    } else {
      exitRec.auditHistory.unshift({
        timestamp: new Date().toLocaleString(),
        actor: user?.fullName || 'Office Executive',
        role: user?.role || 'OFFICE',
        field: 'Transfer Certificate Draft Saved',
        oldValue: 'Draft',
        newValue: `TC Draft (${tcNo})`,
        reason: 'Transfer Certificate authorization details saved as draft.'
      });
    }

    return await exitRec.save();
  }

  async amendTransferCertificate(id, amendmentData, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    const reason = (amendmentData.reason || '').trim();
    if (!reason || reason.length < 10) {
      throw new Error('A mandatory amendment reason of at least 10 characters is required by statutory regulations.');
    }

    const previousTCNumber = exitRec.transferCertificate?.tcNumber || '';
    if (amendmentData.updates) {
      Object.assign(exitRec.transferCertificate, amendmentData.updates);
    }
    exitRec.transferCertificate.isAmended = true;
    exitRec.transferCertificate.amendmentReason = reason;
    exitRec.transferCertificate.amendedBy = user?.fullName || 'Executive Authority';
    exitRec.transferCertificate.amendedDate = new Date().toISOString().split('T')[0];

    exitRec.auditHistory.unshift({
      timestamp: new Date().toLocaleString(),
      actor: user?.fullName || 'Executive Authority',
      role: 'PRINCIPAL',
      field: 'Transfer Certificate Statutory Amendment',
      oldValue: `TC ${previousTCNumber}`,
      newValue: `TC ${exitRec.transferCertificate.tcNumber} (Amended)`,
      reason: reason
    });

    return await exitRec.save();
  }

  async completeStudentExit(id, user) {
    const exitRec = await this.getExitRequestById(id);
    if (!exitRec) throw new Error('Exit request not found');

    exitRec.status = 'Completed';

    const isWithdrawal = ['Withdrawal', 'Mid-Year Withdrawal', 'Medical Withdrawal'].includes(exitRec.exitType);
    const targetStatus = isWithdrawal ? 'WITHDRAWN' : 'TRANSFERRED';
    await Student.findOneAndUpdate(
      { admissionNo: exitRec.admissionNo },
      {
        $set: {
          status: targetStatus,
          updatedAt: new Date()
        }
      }
    );

    liveSyncBus.emitSync('TRANSFERS', 'COMPLETED', { entityId: exitRec._id });
    liveSyncBus.emitSync('STUDENTS', 'UPDATED', { entityId: exitRec.student });

    exitRec.auditHistory.unshift({
      timestamp: new Date().toLocaleString(),
      actor: (user && user.fullName) || 'Executive Principal',
      role: (user && user.role) || 'PRINCIPAL',
      field: 'Student Exit Finalization',
      oldValue: 'Enrolled Active',
      newValue: targetStatus,
      reason: 'Formal exit process finalized. All academic, demographic, and financial records sealed in permanent statutory archive.'
    });

    return await exitRec.save();
  }
}

module.exports = new StudentExitService();
