/**
 * Sri Vidya Educational Trust - Platform User & Account Management Service
 * Module 6: User Directory (6.1), User Provisioning (6.2), 7-Tab Dossier (6.3),
 * Account Invitation Lifecycle (6.4), and Session Security (6.5)
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { UserAccount } = require('../models/userAccount.model');

// In-memory fallback repository when running without active MongoDB
const inMemoryUsers = [];

const DEFAULT_USERS_SEED = [
  {
    userId: 'USR-1001',
    name: 'Root Platform Administrator',
    email: 'superadmin@srividya.edu.in',
    phone: '+91 891 2748100',
    institutionId: 'TRUST-ALL',
    institutionName: 'Sri Vidya Educational Trust (Multi-Tenant Central)',
    department: 'Trust Platform Operations',
    employeeRecordId: 'EMP-TRUST-001',
    roles: ['Super Administrator', 'Trust Security Auditor'],
    status: 'Active',
    mfa: { enabled: true, method: 'totp', enforcedAt: new Date('2026-06-01T09:00:00Z') },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: true, bindToRegisteredDevices: true },
    lastLogin: { timestamp: new Date('2026-11-05T18:45:00Z'), ipAddress: '106.51.24.112', device: 'Chrome 128 (Windows 11)' },
    invitation: { status: 'Verified' },
    sessions: [
      { sessionId: 'SES-9401', device: 'Workstation Alpha', browser: 'Chrome 128', os: 'Windows 11', ipAddress: '106.51.24.112', loginTime: new Date('2026-11-05T09:15:00Z'), lastActivity: new Date('2026-11-05T18:45:00Z'), authMethod: 'Password + TOTP MFA', isCurrent: true },
      { sessionId: 'SES-9402', device: 'Admin Tablet', browser: 'Safari 18', os: 'iPadOS', ipAddress: '106.51.24.115', loginTime: new Date('2026-11-04T14:20:00Z'), lastActivity: new Date('2026-11-04T16:00:00Z'), authMethod: 'Password + FIDO2 Key', isCurrent: false }
    ],
    auditHistory: [
      { action: 'Account Created', performedBy: 'System Bootstrap', timestamp: new Date('2026-06-01T09:00:00Z'), details: 'Master platform root account established.' }
    ]
  },
  {
    userId: 'USR-1002',
    name: 'Smt. Gorle Varalakshmi',
    email: 'srividyaschools2017@gmail.com',
    phone: '+91 863 2234567',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    department: 'Executive Leadership',
    employeeRecordId: 'EMP-SV-001',
    roles: ['Institutional Principal', 'Academic Senate Member'],
    status: 'Active',
    mfa: { enabled: true, method: 'sms', enforcedAt: new Date('2026-06-01T10:00:00Z') },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: true, bindToRegisteredDevices: false },
    lastLogin: { timestamp: new Date('2026-11-05T17:30:00Z'), ipAddress: '183.82.112.45', device: 'Edge 129 (macOS)' },
    invitation: { status: 'Verified' },
    sessions: [
      { sessionId: 'SES-9403', device: 'MacBook Air Principal Office', browser: 'Edge 129', os: 'macOS Sonoma', ipAddress: '183.82.112.45', loginTime: new Date('2026-11-05T10:00:00Z'), lastActivity: new Date('2026-11-05T17:30:00Z'), authMethod: 'Password + SMS OTP', isCurrent: true }
    ],
    auditHistory: [
      { action: 'Initial Invite Verified', performedBy: 'Self', timestamp: new Date('2026-06-01T10:15:00Z'), details: 'Activated account via cryptographic token.' }
    ]
  },
  {
    userId: 'USR-1003',
    name: 'Sri Navva Anand',
    email: 'navva.anand.personal@gmail.com',
    phone: '+91 9440123456',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    department: 'Mathematics & Academic Office',
    employeeRecordId: 'EMP-SV-002',
    roles: ['Vice Principal & HOD Maths', 'Timetable Controller'],
    status: 'Active',
    mfa: { enabled: true, method: 'totp', enforcedAt: new Date('2026-06-02T11:00:00Z') },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: true, bindToRegisteredDevices: false },
    lastLogin: { timestamp: new Date('2026-11-05T16:15:00Z'), ipAddress: '183.82.112.46', device: 'Chrome 128 (Windows 11)' },
    invitation: { status: 'Verified' },
    sessions: [
      { sessionId: 'SES-9404', device: 'Staff Room Desktop 02', browser: 'Chrome 128', os: 'Windows 11', ipAddress: '183.82.112.46', loginTime: new Date('2026-11-05T08:45:00Z'), lastActivity: new Date('2026-11-05T16:15:00Z'), authMethod: 'Password + TOTP MFA', isCurrent: false }
    ],
    auditHistory: [
      { action: 'Role Assigned', performedBy: 'Smt. Gorle Varalakshmi', timestamp: new Date('2026-06-02T11:30:00Z'), details: 'Assigned Vice Principal role.' }
    ]
  },
  {
    userId: 'USR-1004',
    name: 'Dr. K. S. Ramanujam',
    email: 'principal.main@srividya.edu.in',
    phone: '+91 891 2748102',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    department: 'Examination Control Division',
    employeeRecordId: 'EMP-SV-003',
    roles: ['Examination In-Charge', 'Statutory Records Officer'],
    status: 'Active',
    mfa: { enabled: true, method: 'totp', enforcedAt: new Date('2026-06-05T10:00:00Z') },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: true, bindToRegisteredDevices: true },
    lastLogin: { timestamp: new Date('2026-11-04T12:00:00Z'), ipAddress: '157.48.21.90', device: 'Firefox 130 (Ubuntu)' },
    invitation: { status: 'Verified' },
    sessions: [],
    auditHistory: []
  },
  {
    userId: 'USR-1005',
    name: 'Smt. P. Lakshmi Kameswari',
    email: 'office.clerk@srividya.edu.in',
    phone: '+91 891 2748103',
    institutionId: 'INST-002',
    institutionName: 'Sri Vidya High School (City Branch)',
    department: 'Office & Admissions Section',
    employeeRecordId: 'EMP-SV-014',
    roles: ['Office Clerk', 'Admissions Desk Clerk'],
    status: 'Pending Invitation',
    mfa: { enabled: false, method: 'none', enforcedAt: null },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: false, bindToRegisteredDevices: false },
    lastLogin: { timestamp: null, ipAddress: 'N/A', device: 'N/A' },
    invitation: {
      activeTokenHash: 'tok_5f8a92b10c',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'Dispatched',
      history: [
        { invitationId: 'INV-2026-081', tokenHash: 'tok_5f8a92b10c', channel: 'Official Email (SMTP)', dispatchedAt: new Date(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'Dispatched', dispatchedBy: 'Platform Super Administrator', notes: 'Initial employee invitation' }
      ]
    },
    sessions: [],
    auditHistory: [
      { action: 'Invitation Dispatched', performedBy: 'Platform Super Administrator', timestamp: new Date(), details: 'Dispatched 7-day token to office.clerk@srividya.edu.in' }
    ]
  },
  {
    userId: 'USR-1006',
    name: 'Sri T. Ramesh Kumar',
    email: 'ramesh.accounts@srividya.edu.in',
    phone: '+91 9440128899',
    institutionId: 'INST-002',
    institutionName: 'Sri Vidya High School (City Branch)',
    department: 'Accounts & Fee Collection',
    employeeRecordId: 'EMP-SV-022',
    roles: ['Fee Collection Clerk'],
    status: 'Suspended',
    suspensionDetails: {
      reason: 'Audit reconciliation pending for cash receipts discrepancy in Quarter 2',
      suspendedAt: new Date('2026-10-28T14:00:00Z'),
      suspendedBy: 'Managing Trustee Sri P. Venkatasubba Rao'
    },
    mfa: { enabled: true, method: 'sms', enforcedAt: new Date('2026-06-10T10:00:00Z') },
    securitySettings: { enforceMfaOnLogin: true, require90DayPasswordRotation: true, bindToRegisteredDevices: false },
    lastLogin: { timestamp: new Date('2026-10-28T13:45:00Z'), ipAddress: '183.82.112.50', device: 'Chrome 128 (Windows 10)' },
    invitation: { status: 'Verified' },
    sessions: [],
    auditHistory: [
      { action: 'Account Suspended', performedBy: 'Managing Trustee', timestamp: new Date('2026-10-28T14:00:00Z'), details: 'Suspended pending Q2 audit reconciliation.' }
    ]
  }
];

class UserAccountService {

  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) {
      this._seedInMemory();
      return;
    }

    try {
      const count = await UserAccount.countDocuments();
      if (count === 0) {
        await UserAccount.insertMany(DEFAULT_USERS_SEED);
      }
    } catch (e) {
      this._seedInMemory();
    }
  }

  static _seedInMemory() {
    if (inMemoryUsers.length === 0) {
      DEFAULT_USERS_SEED.forEach(u => inMemoryUsers.push(JSON.parse(JSON.stringify(u))));
    }
  }

  /**
   * Summary Cards for 6.1
   */
  static async getUsersSummary() {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const all = inMemoryUsers;
      return {
        totalAccounts: all.length,
        activeAccounts: all.filter(u => u.status === 'Active').length,
        pendingInvitations: all.filter(u => u.status === 'Pending Invitation').length,
        suspendedAccounts: all.filter(u => u.status === 'Suspended').length,
        accountsRequiringAttention: all.filter(u => !u.mfa?.enabled || u.status === 'Suspended').length
      };
    }

    try {
      const all = await UserAccount.find();
      return {
        totalAccounts: all.length,
        activeAccounts: all.filter(u => u.status === 'Active').length,
        pendingInvitations: all.filter(u => u.status === 'Pending Invitation').length,
        suspendedAccounts: all.filter(u => u.status === 'Suspended').length,
        accountsRequiringAttention: all.filter(u => !u.mfa?.enabled || u.status === 'Suspended').length
      };
    } catch (e) {
      const all = inMemoryUsers;
      return {
        totalAccounts: all.length,
        activeAccounts: all.filter(u => u.status === 'Active').length,
        pendingInvitations: all.filter(u => u.status === 'Pending Invitation').length,
        suspendedAccounts: all.filter(u => u.status === 'Suspended').length,
        accountsRequiringAttention: all.filter(u => !u.mfa?.enabled || u.status === 'Suspended').length
      };
    }
  }

  /**
   * 6.1 User Directory List & Multi-field Filtering
   */
  static async listUsers(filter = {}) {
    await this.seedIfEmpty();

    let users = [];
    if (!this.isMongoReady()) {
      users = inMemoryUsers;
    } else {
      try {
        users = await UserAccount.find().sort({ createdAt: -1 });
      } catch (e) {
        users = inMemoryUsers;
      }
    }

    // Multi-field Filtering
    const q = (filter.query || '').toLowerCase().trim();
    const instId = filter.institutionId || '';
    const role = filter.role || '';
    const status = filter.status || '';
    const inviteStatus = filter.invitationStatus || '';
    const mfaStatus = filter.mfaStatus || '';

    const filtered = users.filter(u => {
      // 1. Name or Email Search
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.userId.toLowerCase().includes(q)) {
        return false;
      }
      // 2. Institution
      if (instId && instId !== 'all' && u.institutionId !== instId) {
        return false;
      }
      // 3. Role
      if (role && role !== 'all' && !u.roles.some(r => r.toLowerCase().includes(role.toLowerCase()))) {
        return false;
      }
      // 4. Status
      if (status && status !== 'all' && u.status !== status) {
        return false;
      }
      // 5. Invitation Status
      if (inviteStatus && inviteStatus !== 'all' && u.invitation?.status !== inviteStatus) {
        return false;
      }
      // 6. MFA Status
      if (mfaStatus && mfaStatus !== 'all') {
        if (mfaStatus === 'enforced' && !u.mfa?.enabled) return false;
        if (mfaStatus === 'disabled' && u.mfa?.enabled) return false;
      }
      return true;
    });

    const summary = await this.getUsersSummary();

    return {
      success: true,
      total: filtered.length,
      summary: summary,
      data: filtered
    };
  }

  /**
   * 6.3 User Detail
   */
  static async getUserById(userId) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const u = inMemoryUsers.find(x => x.userId === userId || x.email === userId);
      return { success: !!u, data: u };
    }

    try {
      const u = await UserAccount.findOne({ $or: [{ userId }, { email: userId }] });
      return { success: !!u, data: u };
    } catch (e) {
      const u = inMemoryUsers.find(x => x.userId === userId || x.email === userId);
      return { success: !!u, data: u };
    }
  }

  /**
   * 6.2 Create User & Account Provisioning
   */
  static async createUser(userData, operator = 'Platform Super Administrator') {
    const nextSeq = Math.floor(1007 + Math.random() * 8990);
    const userId = `USR-${nextSeq}`;
    const tokenHash = `tok_${crypto.randomBytes(8).toString('hex')}`;
    const expiryHours = parseInt(userData.invitationExpiryHours || '168', 10); // 7 days = 168h default
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const isInvite = userData.activationMethod !== 'direct_password';

    const newUser = {
      userId,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || '',
      institutionId: userData.institutionId || 'INST-001',
      institutionName: userData.institutionName || 'Sri Vidya High School',
      department: userData.department || 'Administration',
      employeeRecordId: userData.employeeRecordId || null,
      roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles || 'Staff Member'],
      status: isInvite ? 'Pending Invitation' : 'Active',
      mfa: {
        enabled: userData.requireMfa !== false,
        method: 'totp',
        enforcedAt: new Date()
      },
      securitySettings: {
        enforceMfaOnLogin: userData.requireMfa !== false,
        require90DayPasswordRotation: userData.requirePasswordRotation !== false,
        bindToRegisteredDevices: userData.bindToRegisteredDevices === true
      },
      lastLogin: { timestamp: null, ipAddress: 'N/A', device: 'N/A' },
      invitation: {
        activeTokenHash: isInvite ? tokenHash : null,
        expiresAt: isInvite ? expiresAt : null,
        status: isInvite ? 'Dispatched' : 'Verified',
        history: isInvite ? [{
          invitationId: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          tokenHash,
          channel: 'Official Email (SMTP)',
          dispatchedAt: new Date(),
          expiresAt,
          status: 'Dispatched',
          dispatchedBy: operator,
          notes: 'Account onboarding invitation token'
        }] : []
      },
      sessions: [],
      auditHistory: [{
        action: 'Account Created',
        performedBy: operator,
        timestamp: new Date(),
        details: `Account provisioned with ${isInvite ? 'activation token dispatched' : 'direct password'}. Assigned roles: ${(userData.roles || []).join(', ')}.`
      }]
    };

    if (!this.isMongoReady()) {
      inMemoryUsers.unshift(newUser);
      return { success: true, data: newUser };
    }

    try {
      const created = await UserAccount.create(newUser);
      return { success: true, data: created };
    } catch (e) {
      inMemoryUsers.unshift(newUser);
      return { success: true, data: newUser };
    }
  }

  /**
   * 6.4 Resend Invitation
   */
  static async resendInvitation(userId, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) {
      return { success: false, message: 'User not found' };
    }

    const tokenHash = `tok_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day statutory window

    const newInviteLog = {
      invitationId: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      tokenHash,
      channel: 'Official Email (SMTP)',
      dispatchedAt: new Date(),
      expiresAt,
      status: 'Dispatched',
      dispatchedBy: operator,
      notes: 'Administrative re-issuance after token expiry or request'
    };

    const user = userRes.data;
    user.status = 'Pending Invitation';
    if (!user.invitation) user.invitation = {};
    user.invitation.activeTokenHash = tokenHash;
    user.invitation.expiresAt = expiresAt;
    user.invitation.status = 'Dispatched';
    if (!user.invitation.history) user.invitation.history = [];
    user.invitation.history.unshift(newInviteLog);

    user.auditHistory.unshift({
      action: 'Invitation Re-dispatched',
      performedBy: operator,
      timestamp: new Date(),
      details: `Cryptographic activation invitation re-issued to ${user.email}. Valid for 7 days.`
    });

    if (this.isMongoReady() && typeof user.save === 'function') {
      await user.save();
    }

    return { success: true, data: user };
  }

  /**
   * Suspend Account
   */
  static async suspendUser(userId, reason, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.status = 'Suspended';
    user.suspensionDetails = {
      reason: reason || 'Administrative suspension',
      suspendedAt: new Date(),
      suspendedBy: operator
    };
    user.sessions = []; // Terminate all sessions on suspension

    user.auditHistory.unshift({
      action: 'Account Suspended',
      performedBy: operator,
      timestamp: new Date(),
      details: `Account suspended. Reason: ${reason}. Active sessions terminated.`
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * Reactivate Account
   */
  static async reactivateUser(userId, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.status = 'Active';
    user.suspensionDetails = { reason: '', suspendedAt: null, suspendedBy: null };

    user.auditHistory.unshift({
      action: 'Account Reactivated',
      performedBy: operator,
      timestamp: new Date(),
      details: 'Account reactivated from suspension by authorized administrator.'
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * Deactivate Account (Audit Invariant: No permanent hard delete)
   */
  static async deactivateUser(userId, reason, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.status = 'Deactivated';
    user.sessions = [];

    user.auditHistory.unshift({
      action: 'Account Deactivated',
      performedBy: operator,
      timestamp: new Date(),
      details: `Account permanently deactivated (historical ledger retained). Reason: ${reason || 'Staff departure'}.`
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * 6.5 Session Management: Revoke single session
   */
  static async revokeSession(userId, sessionId, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.sessions = (user.sessions || []).filter(s => s.sessionId !== sessionId);

    user.auditHistory.unshift({
      action: 'Session Revoked',
      performedBy: operator,
      timestamp: new Date(),
      details: `Active login session #${sessionId} terminated.`
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * 6.5 Session Management: Revoke ALL sessions for a user
   */
  static async revokeAllSessions(userId, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    const count = (user.sessions || []).length;
    user.sessions = [];

    user.auditHistory.unshift({
      action: 'All Sessions Revoked',
      performedBy: operator,
      timestamp: new Date(),
      details: `All ${count} active login sessions forcefully terminated.`
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * Require Password Reset through secure flow
   */
  static async triggerPasswordReset(userId, operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.securitySettings.mustChangePasswordOnNextLogin = true;
    user.sessions = []; // Revoke sessions to force re-authentication

    user.auditHistory.unshift({
      action: 'Password Reset Required',
      performedBy: operator,
      timestamp: new Date(),
      details: 'Forced password change requirement applied. Active sessions revoked.'
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }

  /**
   * Enable / Enforce Supported MFA
   */
  static async toggleMfa(userId, enable, method = 'totp', operator = 'Platform Super Administrator') {
    const userRes = await this.getUserById(userId);
    if (!userRes.success || !userRes.data) return { success: false, message: 'User not found' };

    const user = userRes.data;
    user.mfa = {
      enabled: enable,
      method: method,
      enforcedAt: enable ? new Date() : null
    };
    user.securitySettings.enforceMfaOnLogin = enable;

    user.auditHistory.unshift({
      action: enable ? 'MFA Enforced' : 'MFA Disabled',
      performedBy: operator,
      timestamp: new Date(),
      details: enable ? `Multi-factor authentication (${method.toUpperCase()}) enforced for user login.` : 'Multi-factor authentication requirement disabled.'
    });

    if (this.isMongoReady() && typeof user.save === 'function') await user.save();
    return { success: true, data: user };
  }
}

module.exports = UserAccountService;

