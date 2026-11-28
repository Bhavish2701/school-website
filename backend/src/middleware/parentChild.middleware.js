const mongoose = require('mongoose');
const { Student } = require('../models/student.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyParentChildAccess = (paramKey = 'childId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const childId = req.params[paramKey];
    if (!childId) {
      throw ApiError.badRequest(`Missing child identifier parameter '${paramKey}'`);
    }

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      throw ApiError.badRequest(`Invalid child ID format: '${childId}'`);
    }

    const student = await Student.findById(childId);
    if (!student) {
      throw ApiError.notFound(`Child with ID '${childId}' not found`);
    }

    const userRole = req.user.role;
    const parentUserId = req.user._id.toString();

    if (['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(userRole)) {
      req.child = student;
      return next();
    }

    if (userRole === 'PARENT') {
      const parentUserOnStudent = student.parentUser ? student.parentUser.toString() : null;
      const registeredChildren = (req.user.children || []).map((id) => id.toString());

      const isLinkedParent =
        parentUserOnStudent === parentUserId ||
        registeredChildren.includes(student._id.toString()) ||
        (student.user && registeredChildren.includes(student.user.toString()));

      if (!isLinkedParent) {
        throw ApiError.forbidden(
          `Object-level authorization failed: A parent can access only records belonging to their own children. Access to child ID '${childId}' (${student.fullName}) is strictly denied.`
        );
      }

      req.child = student;
      return next();
    }

    throw ApiError.forbidden(
      `Role '${userRole}' is not authorized to access parent-child protected resources.`
    );
  });
};

module.exports = {
  verifyParentChildAccess,
};
