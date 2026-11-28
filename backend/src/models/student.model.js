const mongoose = require('mongoose');

const STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ALUMNI', 'TRANSFERRED', 'WITHDRAWN', 'ARCHIVED'];
const GENDER_VALUES = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const FEE_STATUSES = ['Paid', 'Partial', 'Pending'];

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: {
        values: GENDER_VALUES,
        message: '{VALUE} is not a valid gender',
      },
      required: [true, 'Gender is required'],
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      default: 'A',
      index: true,
    },
    rollNo: {
      type: String,
      trim: true,
      index: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: '{VALUE} is not a valid student status',
      },
      default: 'ACTIVE',
      index: true,
    },
    tcNumber: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    effectiveWithdrawalDate: {
      type: String,
      trim: true,
      default: '',
    },
    withdrawalReason: {
      type: String,
      trim: true,
      default: '',
    },
    dob: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group',
      },
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: 'Visakhapatnam, Andhra Pradesh',
    },
    parentName: {
      type: String,
      trim: true,
      default: '',
    },
    parentPhone: {
      type: String,
      trim: true,
      default: '',
    },
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    attendancePercentage: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    gpa: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    feeStatus: {
      type: String,
      enum: {
        values: FEE_STATUSES,
        message: '{VALUE} is not a valid fee status',
      },
      default: 'Paid',
      index: true,
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: 'Parent' },
      phone: { type: String, trim: true, default: '' },
    },
    guardianDetails: {
      name: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: 'Parent' },
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
      isVerified: { type: Boolean, default: true },
      verifiedAt: { type: Date, default: Date.now },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    studentPortalAccess: {
      isEligible: { type: Boolean, default: true },
      isActivated: { type: Boolean, default: false },
      username: { type: String, trim: true, lowercase: true },
      activationToken: { type: String, select: false },
      activatedAt: { type: Date },
    },
    parentPortalAccess: {
      isEligible: { type: Boolean, default: true },
      isActivated: { type: Boolean, default: false },
      primaryPhone: { type: String, trim: true },
      activationToken: { type: String, select: false },
      activatedAt: { type: Date },
    },
    transportDetails: {
      isApplicable: { type: Boolean, default: true },
      assignedRoute: { type: String, default: 'Route 4 (Maddilapalem - School)' },
      busNumber: { type: String, default: 'AP 31 TZ 4042' },
      pickupStop: { type: String, default: 'Maddilapalem Junction' },
      pickupTime: { type: String, default: '07:45 AM' },
      dropTime: { type: String, default: '04:30 PM' },
      driverName: { type: String, default: 'B. Appa Rao' },
      driverPhone: { type: String, default: '9848123456' },
    },
    libraryDetails: {
      isImplemented: { type: Boolean, default: true },
      libraryCardNo: { type: String, default: '' },
      booksIssued: [
        {
          bookTitle: { type: String, required: true },
          accessionNo: { type: String, required: true },
          issueDate: { type: Date, default: Date.now },
          dueDate: { type: Date },
          returned: { type: Boolean, default: false },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.virtual('classSection').get(function () {
  return `${this.class}-${this.section}`;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = {
  Student,
  STATUS_VALUES,
  GENDER_VALUES,
  BLOOD_GROUPS,
  FEE_STATUSES,
};
