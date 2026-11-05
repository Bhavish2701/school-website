const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  institutionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Primary & Secondary School', 'Junior College', 'Early Childhood Centre', 'Branch Campus', 'K-12 School', 'Other'],
    default: 'Primary & Secondary School'
  },
  trust: {
    type: String,
    default: 'Sri Vidya Educational Trust'
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: 'Visakhapatnam' },
    state: { type: String, default: 'Andhra Pradesh' },
    pincode: { type: String, default: '530001' },
    country: { type: String, default: 'India' },
    region: { type: String, default: 'Andhra Pradesh' }
  },
  contact: {
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '+91 891 255 4899' },
    website: { type: String, default: 'srividya.edu.in' }
  },
  udise: {
    type: String,
    default: ''
  },
  board: {
    type: String,
    default: 'Andhra Pradesh State Board (AP SSC - English Medium)'
  },
  category: {
    type: String,
    default: 'High School & Primary (Class 1 to 10)'
  },
  configuration: {
    timezone: { type: String, default: 'Asia/Kolkata (IST +05:30)' },
    locale: { type: String, default: 'en-IN' },
    language: { type: String, default: 'English / Telugu' },
    currency: { type: String, default: 'INR (₹)' },
    academicYearFormat: { type: String, default: 'June to April (AP State Board)' },
    currentAcademicYear: { type: String, default: '2026–2027' },
    gradingScale: { type: String, default: 'AP Board CCE (A1-E Scale with 10.0 GPA)' },
    attendanceMode: { type: String, default: 'Daily Morning & Afternoon Register' },
    calendarSettings: { type: String, default: '6 Working Days (Mon-Sat, 2nd Saturday Holiday)' }
  },
  branding: {
    logoUrl: { type: String, default: '/assets/images/logo.png' },
    faviconUrl: { type: String, default: '/assets/images/favicon.ico' },
    primaryColor: { type: String, default: '#1e3a8a' },
    secondaryColor: { type: String, default: '#059669' },
    accentColor: { type: String, default: '#d97706' },
    documentHeader: { type: String, default: 'SRI VIDYA EDUCATIONAL TRUST • GOVT RECOGNIZED' }
  },
  domains: {
    primary: { type: String, default: 'srividya.edu.in' },
    website: { type: String, default: 'www.srividya.edu.in' },
    adminPortal: { type: String, default: 'admin.srividya.edu.in' },
    facultyPortal: { type: String, default: 'faculty.srividya.edu.in' },
    apiDomain: { type: String, default: 'api.srividya.edu.in' },
    dnsVerified: { type: Boolean, default: true },
    sslStatus: { type: String, default: 'Active (Let\'s Encrypt TLS 1.3)' },
    dkimStatus: { type: String, default: 'Verified (2048-bit RSA)' },
    spfStatus: { type: String, default: 'Valid (v=spf1 include:_spf.google.com ~all)' }
  },
  setupStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Complete'],
    default: 'Complete'
  },
  status: {
    type: String,
    enum: ['Draft', 'Setup in Progress', 'Configuration Review', 'Ready for Activation', 'Active', 'Suspended', 'Archived'],
    default: 'Active',
    index: true
  },
  suspension: {
    isSuspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    suspendedBy: { type: String },
    reason: { type: String, default: '' },
    accessPolicy: { type: String, default: 'Public & teacher portal login disabled. Authorized administrative audit access retained.' }
  },
  administrators: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      role: { type: String, default: 'Institutional Principal' },
      status: { type: String, default: 'Active' },
      inviteToken: { type: String },
      inviteExpiresAt: { type: Date },
      lastLogin: { type: String, default: 'Never' }
    }
  ],
  integrations: {
    smsGateway: { type: String, default: 'National CDAC Gateway (Govt DLT Approved)' },
    paymentGateway: { type: String, default: 'Razorpay & UPI Instant Settlement' },
    biometricEnabled: { type: Boolean, default: true },
    storageVault: { type: String, default: 'AWS S3 Mumbai (AES-256 Encrypted)' }
  },
  subscription: {
    tier: { type: String, default: 'Trust Enterprise Multi-Campus' },
    seatsTotal: { type: Number, default: 1200 },
    seatsUsed: { type: Number, default: 855 },
    renewalDate: { type: String, default: '2028-06-30' },
    storageQuotaGb: { type: Number, default: 250 }
  },
  metrics: {
    students: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    classrooms: { type: Number, default: 18 }
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  updatedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = {
  Institution
};
