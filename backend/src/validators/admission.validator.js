const validate = require('../middleware/validate.middleware');
const { ADMISSION_STATUSES, GENDERS, DOCUMENT_TYPES } = require('../models/admission.model');
const ApiError = require('../utils/apiError');

const validateSubmitApplication = validate({
  studentName: {
    required: true,
    minLength: 2,
    label: 'Student Full Name',
  },
  dob: {
    required: true,
    label: 'Date of Birth',
  },
  gender: {
    required: true,
    enum: GENDERS,
    label: 'Gender',
  },
  applyingClass: {
    required: true,
    label: 'Class Applying For',
  },
  parentName: {
    required: true,
    minLength: 2,
    label: 'Parent/Guardian Name',
  },
  phone: {
    required: true,
    minLength: 10,
    maxLength: 15,
    label: 'Contact Phone Number',
  },
});

const validateCheckStatus = (req, res, next) => {
  const { applicationNumber, phone } = req.query;
  const errors = {};

  if (!applicationNumber || !applicationNumber.trim()) {
    errors.applicationNumber = 'Application reference number is required';
  }

  if (!phone || !phone.trim()) {
    errors.phone = 'Registered phone number is required';
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation(errors, 'Status inquiry validation failed');
  }

  next();
};

const validateUpdateStatus = validate({
  status: {
    required: true,
    enum: ADMISSION_STATUSES,
    label: 'Admission Status',
  },
});

const validateUploadDocument = validate({
  docName: {
    required: true,
    label: 'Document Name',
  },
  docUrl: {
    required: true,
    label: 'Document URL',
  },
  docType: {
    enum: DOCUMENT_TYPES,
    label: 'Document Type',
  },
});

module.exports = {
  validateSubmitApplication,
  validateCheckStatus,
  validateUpdateStatus,
  validateUploadDocument,
};
