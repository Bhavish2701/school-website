const studentService = require('../services/student.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getStudents = asyncHandler(async (req, res) => {
  const result = await studentService.getStudents(req.query, req.user);
  sendSuccess(
    res,
    {
      students: result.records,
      pagination: result.pagination,
    },
    'Students retrieved successfully',
    200
  );
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id, req.user);
  sendSuccess(res, { student }, 'Student details retrieved successfully', 200);
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body, req.user);
  sendSuccess(res, { student }, 'Student registered successfully', 201);
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body, req.user);
  sendSuccess(res, { student }, 'Student updated successfully', 200);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const result = await studentService.deleteStudent(req.params.id, req.user);
  sendSuccess(res, result, 'Student deleted successfully', 200);
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await studentService.getStudentDashboardStats(req.user);
  sendSuccess(res, { stats }, 'Student dashboard statistics retrieved successfully', 200);
});

const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { docId } = req.params;
  const { status, remarks, reason, category, verifiedBy } = req.body || {};

  const actorName = verifiedBy || (req.user && req.user.fullName) || 'Smt. Gorle Varalakshmi (Principal)';
  const timestamp = new Date().toISOString();

  try {
    const AuditLog = require('../models/auditLog.model');
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      username: (req.user && req.user.username) || 'principal',
      userRole: (req.user && req.user.role) || 'PRINCIPAL',
      action: 'STUDENT_DOCUMENT_' + (status || 'VERIFIED').toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      module: 'STUDENTS',
      targetId: docId,
      description: `Document ${docId} status updated to "${status}" by ${actorName}. Notes: ${remarks || reason || 'Statutory verification authorized'}`,
      status: 'SUCCESS',
      ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1',
    });
  } catch (err) {
    console.warn('[AuditLog Warning] Could not record document status audit log:', err.message);
  }

  res.status(200).json({
    success: true,
    message: `Document ${docId} marked as ${status || 'Verified'} successfully`,
    data: {
      docId,
      status: status || 'Verified',
      verifiedBy: actorName,
      verificationDate: timestamp,
      remarks: remarks || reason || 'Statutory institutional authorization recorded.',
    }
  });
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboardStats,
  updateDocumentStatus,
};
