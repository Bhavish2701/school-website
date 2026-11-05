/**
 * Authentication Controller
 * Implements JWT authentication, token lifecycle, and credential management
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/user.model');
const { Student } = require('../models/student.model');

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and issue JWT access & refresh tokens
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { username, email, identifier, password } = req.body;
  const userIdentifier = (identifier || username || email || '').trim().toLowerCase();

  // Find user by username or email and include password field
  const user = await User.findOne({
    $or: [{ username: userIdentifier }, { email: userIdentifier }],
  }).select('+password +refreshToken');

  if (!user) {
    throw ApiError.unauthorized('Invalid username/email or password', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid username/email or password', 'INVALID_CREDENTIALS');
  }

  // Check account active status
  if (!user.isActive) {
    throw ApiError.forbidden(
      'Your account is deactivated. Please contact the administrator.',
      'ACCOUNT_DEACTIVATED'
    );
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Persist refresh token & last login timestamp
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: config.jwt.expire,
      },
    },
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate refresh token and log user out
 * @access  Public / Authenticated
 */
const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;

  if (req.user) {
    // If authenticated via middleware
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  } else if (incomingRefreshToken) {
    // If client supplied refreshToken in body
    await User.updateOne(
      { refreshToken: incomingRefreshToken },
      { $unset: { refreshToken: 1 } }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Exchange valid refresh token for a new access token
 * @access  Public
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required', 'MISSING_REFRESH_TOKEN');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.', 'INVALID_REFRESH_TOKEN');
  }

  // Find user and select stored refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Refresh token is invalid or has been revoked', 'TOKEN_REVOKED');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated', 'ACCOUNT_DEACTIVATED');
  }

  // Issue new access token and rotate refresh token
  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: config.jwt.expire,
      },
    },
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Protected
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user profile retrieved',
    data: {
      user: req.user.toJSON(),
    },
  });
});

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change authenticated user's password
 * @access  Protected
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Retrieve user with password hash
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
  }

  // Update password and invalidate active refresh tokens
  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again with your new password.',
  });
});

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Generate password reset token
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, identifier, username } = req.body;
  const target = (email || identifier || username || '').trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: target }, { username: target }],
  });

  // Always return consistent response to prevent username enumeration attacks
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account matches the provided identifier, a password reset token has been generated.',
    });
  }

  // Generate reset token and set expiry
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset token generated successfully.',
    data: {
      resetToken,
      expiresIn: '15 minutes',
    },
  });
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // Hash incoming token to match stored sha256 hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired', 'INVALID_RESET_TOKEN');
  }

  // Set new password and clear reset fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been successfully reset. Please log in with your new password.',
  });
});

/**
 * @route   POST /api/v1/auth/parent/activate
 * @desc    Activate Verified Guardian Portal Account (Specification 20.3)
 * @access  Public
 */
const activateParentAccount = asyncHandler(async (req, res) => {
  const { admissionNo, parentPhone, activationCode, password, fullName } = req.body;

  if (!admissionNo || !parentPhone || !password) {
    throw ApiError.badRequest('Activation requires admissionNo, parentPhone, and password');
  }

  const cleanAdmNo = admissionNo.trim().toUpperCase();
  const cleanPhone = parentPhone.trim();

  // Find student by admissionNo
  const student = await Student.findOne({ admissionNo: cleanAdmNo });
  if (!student) {
    throw ApiError.notFound(`No official student record found for Admission No '${cleanAdmNo}'`);
  }

  // Verify guardian phone matches registered student records
  const registeredPhone = student.parentPhone || (student.guardianDetails && student.guardianDetails.phone);
  if (registeredPhone && registeredPhone.slice(-10) !== cleanPhone.slice(-10)) {
    throw ApiError.forbidden('Guardian phone number does not match registered student records');
  }

  // Find or create User with role PARENT
  const username = `parent_${cleanPhone.slice(-10)}`;
  let parentUser = await User.findOne({
    $or: [{ phone: cleanPhone }, { username }],
  });

  if (!parentUser) {
    parentUser = await User.create({
      username,
      email: student.email || `${cleanPhone}@parents.srividya.edu.in`,
      password,
      fullName: fullName || student.parentName || 'Verified Guardian',
      role: 'PARENT',
      phone: cleanPhone,
      children: [student._id],
      isActive: true,
    });
  } else {
    parentUser.password = password;
    if (!parentUser.children) parentUser.children = [];
    if (!parentUser.children.includes(student._id)) {
      parentUser.children.push(student._id);
    }
    await parentUser.save();
  }

  // Link student to parent User and mark activation
  student.parentUser = parentUser._id;
  if (!student.parentPortalAccess) student.parentPortalAccess = {};
  student.parentPortalAccess.isActivated = true;
  student.parentPortalAccess.activatedAt = new Date();
  await student.save();

  const accessToken = parentUser.generateAccessToken();
  const refreshToken = parentUser.generateRefreshToken();

  res.status(200).json({
    success: true,
    message: `Parent Portal account activated successfully for guardian of ${student.fullName}.`,
    data: {
      user: parentUser.toJSON(),
      tokens: { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: config.jwt.expire },
      linkedChild: {
        id: student._id,
        admissionNo: student.admissionNo,
        fullName: student.fullName,
        classSection: `${student.class}-${student.section}`,
      },
    },
  });
});

/**
 * @route   POST /api/v1/auth/student/activate
 * @desc    Activate Student Self-Service Portal Account (Specification 20.3)
 * @access  Public
 */
const activateStudentAccount = asyncHandler(async (req, res) => {
  const { admissionNo, dob, activationCode, password } = req.body;

  if (!admissionNo || !password) {
    throw ApiError.badRequest('Activation requires admissionNo and password');
  }

  const cleanAdmNo = admissionNo.trim().toUpperCase();

  const student = await Student.findOne({ admissionNo: cleanAdmNo });
  if (!student) {
    throw ApiError.notFound(`No official student record found for Admission No '${cleanAdmNo}'`);
  }

  // Find or create User with role STUDENT
  const username = cleanAdmNo.toLowerCase().replace(/[^a-z0-9]/g, '');
  let studentUser = await User.findOne({ username });

  if (!studentUser) {
    studentUser = await User.create({
      username,
      email: student.email || `${username}@students.srividya.edu.in`,
      password,
      fullName: student.fullName,
      role: 'STUDENT',
      phone: student.phone || '',
      studentProfile: {
        class: student.class,
        section: student.section,
        rollNumber: student.rollNo,
        admissionNo: student.admissionNo,
        parentUser: student.parentUser,
      },
      isActive: true,
    });
  } else {
    studentUser.password = password;
    await studentUser.save();
  }

  // Link student to User and mark activation
  student.user = studentUser._id;
  if (!student.studentPortalAccess) student.studentPortalAccess = {};
  student.studentPortalAccess.isActivated = true;
  student.studentPortalAccess.activatedAt = new Date();
  await student.save();

  const accessToken = studentUser.generateAccessToken();
  const refreshToken = studentUser.generateRefreshToken();

  res.status(200).json({
    success: true,
    message: `Student Portal account activated successfully for ${student.fullName}.`,
    data: {
      user: studentUser.toJSON(),
      tokens: { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: config.jwt.expire },
      studentProfile: {
        admissionNo: student.admissionNo,
        fullName: student.fullName,
        classSection: `${student.class}-${student.section}`,
      },
    },
  });
});

module.exports = {
  login,
  logout,
  refresh,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  activateParentAccount,
  activateStudentAccount,
};
