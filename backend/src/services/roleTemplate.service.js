/**
 * Sri Vidya Educational Trust - Role Templates & Permissions Service
 * Module 7: RBAC Architecture, Permission Editor Matrix, Safeguards & Backend Enforcement
 */

const mongoose = require('mongoose');
const { RoleTemplate } = require('../models/roleTemplate.model');

// In-memory fallback repository when running without active MongoDB
const inMemoryRoles = [];

const DEFAULT_ROLE_TEMPLATES_SEED = [
  // 1. Platform Owner (Platform Scope, Built-in, Privileged)
  {
    roleId: 'ROLE-PLT-001',
    name: 'Platform Owner',
    slug: 'platform-owner',
    scope: 'Platform',
    description: 'Full statutory governance across all Trust platforms, infrastructure, root cryptography, and institutional policies.',
    isBuiltIn: true,
    isPrivileged: true,
    status: 'Active',
    assignedUsersCount: 1,
    permissions: {
      institutions: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      user_accounts: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      school_config: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      system_health: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: true, create_edit: true, approve: true, export: true, manage_access: true }
    },
    recordScope: 'all_records',
    sensitiveFields: ['aadhaar_pii', 'financial_ledgers', 'staff_compensation', 'mark_moderation'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'can_delegate',
    exportRestrictions: 'unrestricted',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: [
      { action: 'Role Template Initialized', performedBy: 'System Bootstrap', timestamp: new Date('2026-01-01T00:00:00Z'), details: 'Platform Owner master role initialized with critical privileges safeguard.' }
    ]
  },
  // 2. Platform Administrator (Platform Scope, Built-in, Privileged)
  {
    roleId: 'ROLE-PLT-002',
    name: 'Platform Administrator',
    slug: 'platform-administrator',
    scope: 'Platform',
    description: 'Multi-tenant institutional provisioning, system health monitoring, operator account administration, and backup management.',
    isBuiltIn: true,
    isPrivileged: true,
    status: 'Active',
    assignedUsersCount: 3,
    permissions: {
      institutions: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      user_accounts: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      school_config: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      system_health: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: true, create_edit: true, approve: false, export: true, manage_access: false }
    },
    recordScope: 'all_records',
    sensitiveFields: ['aadhaar_pii', 'financial_ledgers'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'can_delegate',
    exportRestrictions: 'approval_required',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: [
      { action: 'Role Template Initialized', performedBy: 'System Bootstrap', timestamp: new Date('2026-01-01T00:00:00Z'), details: 'Platform Administrator role initialized.' }
    ]
  },
  // 3. Platform Operations (Platform Scope, Built-in)
  {
    roleId: 'ROLE-PLT-003',
    name: 'Platform Operations',
    slug: 'platform-operations',
    scope: 'Platform',
    description: 'Infrastructure metrics telemetry, service cluster health, database failover diagnostics, and background job queues.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 2,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      user_accounts: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      system_health: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: true, create_edit: true, approve: false, export: false, manage_access: false }
    },
    recordScope: 'all_records',
    sensitiveFields: [],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'masked_pii',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 4. Platform Support (Platform Scope, Built-in)
  {
    roleId: 'ROLE-PLT-004',
    name: 'Platform Support',
    slug: 'platform-support',
    scope: 'Platform',
    description: 'First-line ticket triage, tenant diagnostic reporting, and non-sensitive user identity onboarding support.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 4,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      user_accounts: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      system_health: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'all_records',
    sensitiveFields: [],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'prohibited',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 5. Institution Administrator (Platform Scope / Cross-Institution Onboarding, Built-in)
  {
    roleId: 'ROLE-PLT-005',
    name: 'Institution Administrator',
    slug: 'institution-administrator',
    scope: 'Platform',
    description: 'Manages institution onboarding workflows, campus profile updates, and primary administrative dispatch for branch schools.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 5,
    permissions: {
      institutions: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      user_accounts: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      school_config: { view: true, create_edit: true, approve: true, export: true, manage_access: false },
      system_health: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: true, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'own_campus',
    sensitiveFields: ['aadhaar_pii', 'financial_ledgers'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'can_delegate',
    exportRestrictions: 'masked_pii',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 6. Principal (Institution Scope, Built-in, Privileged)
  {
    roleId: 'ROLE-INST-006',
    name: 'Principal',
    slug: 'principal',
    scope: 'Institution',
    description: 'Executive institutional head with final statutory sign-off on admissions, faculty rosters, fee concessions, and board exam results.',
    isBuiltIn: true,
    isPrivileged: true,
    status: 'Active',
    assignedUsersCount: 4,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      user_accounts: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      school_config: { view: true, create_edit: true, approve: true, export: true, manage_access: true },
      system_health: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: true, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'own_campus',
    sensitiveFields: ['aadhaar_pii', 'financial_ledgers', 'staff_compensation', 'mark_moderation'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'can_delegate',
    exportRestrictions: 'unrestricted',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 7. Vice Principal (Institution Scope, Built-in)
  {
    roleId: 'ROLE-INST-007',
    name: 'Vice Principal',
    slug: 'vice-principal',
    scope: 'Institution',
    description: 'Academic dean governing master timetables, examination schedules, teacher classroom allocations, and marks moderation.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 6,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      user_accounts: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      school_config: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      system_health: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'own_campus',
    sensitiveFields: ['mark_moderation'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'masked_pii',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 8. Office Staff (Institution Scope, Built-in)
  {
    roleId: 'ROLE-INST-008',
    name: 'Office Staff',
    slug: 'office-staff',
    scope: 'Institution',
    description: 'Admissions inquiry processing, student record document verification, transfer certificate clearance, and parent communication.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 18,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      user_accounts: { view: true, create_edit: true, approve: false, export: true, manage_access: false },
      school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      system_health: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'own_campus',
    sensitiveFields: ['aadhaar_pii'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'masked_pii',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 9. Accounts Staff (Institution Scope, Built-in)
  {
    roleId: 'ROLE-INST-009',
    name: 'Accounts Staff',
    slug: 'accounts-staff',
    scope: 'Institution',
    description: 'Fee collection register maintenance, offline receipt verification, daily cash reconciliation, and outstanding dues reporting.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 8,
    permissions: {
      institutions: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      user_accounts: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      system_health: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: true, create_edit: false, approve: false, export: true, manage_access: false },
      integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'own_campus',
    sensitiveFields: ['financial_ledgers'],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'approval_required',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  },
  // 10. Teacher (Institution Scope, Built-in)
  {
    roleId: 'ROLE-INST-010',
    name: 'Teacher',
    slug: 'teacher',
    scope: 'Institution',
    description: 'Classroom attendance register submission, student progress tracking, periodic assessment marks entry, and student notes.',
    isBuiltIn: true,
    isPrivileged: false,
    status: 'Active',
    assignedUsersCount: 85,
    permissions: {
      institutions: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      user_accounts: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
      system_health: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      audit_logs: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
      integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
    },
    recordScope: 'assigned_classes',
    sensitiveFields: [],
    effectiveDate: new Date('2026-01-01T00:00:00Z'),
    expiryDate: null,
    delegatedAuthority: 'no_delegation',
    exportRestrictions: 'prohibited',
    reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
    changeHistory: []
  }
];

class RoleTemplateService {

  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) {
      this._seedInMemory();
      return;
    }

    try {
      const count = await RoleTemplate.countDocuments();
      if (count === 0) {
        await RoleTemplate.insertMany(DEFAULT_ROLE_TEMPLATES_SEED);
      }
    } catch (e) {
      this._seedInMemory();
    }
  }

  static _seedInMemory() {
    if (inMemoryRoles.length === 0) {
      DEFAULT_ROLE_TEMPLATES_SEED.forEach(r => inMemoryRoles.push(JSON.parse(JSON.stringify(r))));
    }
  }

  /**
   * 7.2 Summary KPI Counters
   */
  static async getRolesSummary() {
    await this.seedIfEmpty();

    let all = [];
    if (!this.isMongoReady()) {
      all = inMemoryRoles;
    } else {
      try {
        all = await RoleTemplate.find();
      } catch (e) {
        all = inMemoryRoles;
      }
    }

    const totalRoles = all.length;
    const platformRoles = all.filter(r => r.scope === 'Platform').length;
    const institutionRoles = all.filter(r => r.scope === 'Institution').length;
    const customRoles = all.filter(r => !r.isBuiltIn).length;
    const totalAssignedUsers = all.reduce((sum, r) => sum + (r.assignedUsersCount || 0), 0);

    return {
      totalRoles,
      platformRoles,
      institutionRoles,
      customRoles,
      totalAssignedUsers
    };
  }

  /**
   * 7.2 Role Directory Listing with Search & Filters
   */
  static async listRoles(filter = {}) {
    await this.seedIfEmpty();

    let roles = [];
    if (!this.isMongoReady()) {
      roles = inMemoryRoles;
    } else {
      try {
        roles = await RoleTemplate.find().sort({ scope: 1, isBuiltIn: -1, createdAt: 1 });
      } catch (e) {
        roles = inMemoryRoles;
      }
    }

    const q = (filter.query || '').toLowerCase().trim();
    const scope = filter.scope || '';
    const type = filter.type || '';
    const status = filter.status || '';

    const filtered = roles.filter(r => {
      // 1. Text Search (Name, Description, RoleId, Slug)
      if (q && !r.name.toLowerCase().includes(q) &&
          !r.description.toLowerCase().includes(q) &&
          !r.roleId.toLowerCase().includes(q) &&
          !r.slug.toLowerCase().includes(q)) {
        return false;
      }
      // 2. Scope Filter (Platform vs Institution)
      if (scope && scope !== 'all' && r.scope.toLowerCase() !== scope.toLowerCase()) {
        return false;
      }
      // 3. Type Filter (Built-in vs Custom)
      if (type && type !== 'all') {
        if (type === 'builtin' && !r.isBuiltIn) return false;
        if (type === 'custom' && r.isBuiltIn) return false;
      }
      // 4. Status Filter
      if (status && status !== 'all' && r.status !== status) {
        return false;
      }
      return true;
    });

    const summary = await this.getRolesSummary();

    return {
      success: true,
      total: filtered.length,
      summary,
      data: filtered
    };
  }

  /**
   * Get single role by roleId or slug
   */
  static async getRoleById(roleId) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const r = inMemoryRoles.find(x => x.roleId === roleId || x.slug === roleId);
      return { success: !!r, data: r };
    }

    try {
      const r = await RoleTemplate.findOne({ $or: [{ roleId }, { slug: roleId }] });
      return { success: !!r, data: r };
    } catch (e) {
      const r = inMemoryRoles.find(x => x.roleId === roleId || x.slug === roleId);
      return { success: !!r, data: r };
    }
  }

  /**
   * 7.4 Compute Permission Diff
   */
  static computePermissionDiff(oldPerms = {}, newPerms = {}) {
    const modules = ['institutions', 'user_accounts', 'school_config', 'system_health', 'audit_logs', 'integrations'];
    const actions = ['view', 'create_edit', 'approve', 'export', 'manage_access'];

    const added = [];
    const removed = [];

    modules.forEach(mod => {
      actions.forEach(act => {
        const wasGranted = !!(oldPerms[mod] && oldPerms[mod][act]);
        const isGranted = !!(newPerms[mod] && newPerms[mod][act]);

        if (!wasGranted && isGranted) {
          added.push({ module: mod, action: act, label: `${mod.toUpperCase()} -> ${act.toUpperCase()}` });
        } else if (wasGranted && !isGranted) {
          removed.push({ module: mod, action: act, label: `${mod.toUpperCase()} -> ${act.toUpperCase()}` });
        }
      });
    });

    return {
      added,
      removed,
      hasChanges: added.length > 0 || removed.length > 0
    };
  }

  /**
   * 7.2 Primary Action: Create Custom Role
   */
  static async createRole(roleData, operator = 'Platform Administrator') {
    const nextSeq = Math.floor(100 + Math.random() * 900);
    const scopePrefix = (roleData.scope || 'Institution') === 'Platform' ? 'PLT' : 'INST';
    const roleId = `ROLE-${scopePrefix}-CUS${nextSeq}`;
    const slug = (roleData.name || 'custom-role').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${nextSeq}`;

    const newRole = {
      roleId,
      name: roleData.name,
      slug,
      scope: roleData.scope || 'Institution',
      description: roleData.description || 'Custom institutional delegation role template.',
      isBuiltIn: false,
      isPrivileged: false,
      status: 'Active',
      assignedUsersCount: 0,
      permissions: roleData.permissions || {
        institutions: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
        user_accounts: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
        school_config: { view: true, create_edit: false, approve: false, export: false, manage_access: false },
        system_health: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
        audit_logs: { view: false, create_edit: false, approve: false, export: false, manage_access: false },
        integrations: { view: false, create_edit: false, approve: false, export: false, manage_access: false }
      },
      recordScope: roleData.recordScope || 'own_campus',
      sensitiveFields: roleData.sensitiveFields || [],
      effectiveDate: roleData.effectiveDate ? new Date(roleData.effectiveDate) : new Date(),
      expiryDate: roleData.expiryDate ? new Date(roleData.expiryDate) : null,
      delegatedAuthority: roleData.delegatedAuthority || 'no_delegation',
      exportRestrictions: roleData.exportRestrictions || 'masked_pii',
      reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
      changeHistory: [{
        action: 'Custom Role Created',
        performedBy: operator,
        timestamp: new Date(),
        details: `Custom role '${roleData.name}' created with ${roleData.scope} scope.`,
        oldPermissions: null,
        newPermissions: roleData.permissions
      }]
    };

    if (!this.isMongoReady()) {
      inMemoryRoles.push(newRole);
      return { success: true, data: newRole };
    }

    try {
      const created = await RoleTemplate.create(newRole);
      return { success: true, data: created };
    } catch (e) {
      inMemoryRoles.push(newRole);
      return { success: true, data: newRole };
    }
  }

  /**
   * 7.2 Action: Duplicate Role
   */
  static async duplicateRole(roleId, newName, operator = 'Platform Administrator') {
    const origRes = await this.getRoleById(roleId);
    if (!origRes.success || !origRes.data) {
      return { success: false, message: 'Source role not found' };
    }

    const orig = origRes.data;
    const clonedName = newName || `Copy of ${orig.name}`;
    const nextSeq = Math.floor(100 + Math.random() * 900);
    const scopePrefix = orig.scope === 'Platform' ? 'PLT' : 'INST';
    const newRoleId = `ROLE-${scopePrefix}-CUS${nextSeq}`;
    const slug = clonedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${nextSeq}`;

    const duplicated = {
      roleId: newRoleId,
      name: clonedName,
      slug,
      scope: orig.scope,
      description: `Duplicated from ${orig.name}. ${orig.description}`,
      isBuiltIn: false,
      isPrivileged: false,
      status: 'Active',
      assignedUsersCount: 0,
      permissions: JSON.parse(JSON.stringify(orig.permissions || {})),
      recordScope: orig.recordScope,
      sensitiveFields: [...(orig.sensitiveFields || [])],
      effectiveDate: new Date(),
      expiryDate: null,
      delegatedAuthority: orig.delegatedAuthority,
      exportRestrictions: orig.exportRestrictions,
      reviewDetails: { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null },
      changeHistory: [{
        action: 'Role Duplicated',
        performedBy: operator,
        timestamp: new Date(),
        details: `Duplicated from base template '${orig.name}' (${orig.roleId}).`,
        oldPermissions: orig.permissions,
        newPermissions: orig.permissions
      }]
    };

    if (!this.isMongoReady()) {
      inMemoryRoles.push(duplicated);
      return { success: true, data: duplicated };
    }

    try {
      const created = await RoleTemplate.create(duplicated);
      return { success: true, data: created };
    } catch (e) {
      inMemoryRoles.push(duplicated);
      return { success: true, data: duplicated };
    }
  }

  /**
   * 7.4 Permission Change Workflow: Update Role & Enforce Safeguards
   */
  static async updateRole(roleId, updates, operator = 'Platform Administrator', rationale = '') {
    const roleRes = await this.getRoleById(roleId);
    if (!roleRes.success || !roleRes.data) {
      return { success: false, message: 'Role not found' };
    }

    const role = roleRes.data;
    const oldPermissions = JSON.parse(JSON.stringify(role.permissions || {}));
    const newPermissions = updates.permissions || oldPermissions;
    const diff = this.computePermissionDiff(oldPermissions, newPermissions);

    // Safeguard 7.4.5: Changes to privileged or built-in critical roles require review submission
    const isCritical = role.isPrivileged || (role.isBuiltIn && role.scope === 'Platform');
    const requiresReview = isCritical && updates.skipReview !== true;

    if (requiresReview) {
      // Record review draft without immediately applying changes to live active permissions
      role.status = 'Pending Review';
      role.reviewDetails = {
        isPendingReview: true,
        requestedBy: operator,
        requestedAt: new Date(),
        rationale: rationale || 'Administrative privilege adjustment',
        changesDiff: diff,
        draftUpdates: updates
      };

      role.changeHistory.unshift({
        action: 'Permission Review Requested',
        performedBy: operator,
        timestamp: new Date(),
        details: `Changes submitted for statutory review. Added: ${diff.added.length}, Removed: ${diff.removed.length}. Rationale: ${rationale || 'None provided'}.`,
        oldPermissions,
        newPermissions
      });

      if (this.isMongoReady() && typeof role.save === 'function') await role.save();

      return {
        success: true,
        requiresReview: true,
        message: 'Changes submitted for authorized reviewer approval under privileged role safeguards.',
        diff,
        data: role
      };
    }

    // Direct apply for custom or pre-approved roles
    if (updates.name && !role.isBuiltIn) role.name = updates.name;
    if (updates.description) role.description = updates.description;
    if (updates.permissions) role.permissions = updates.permissions;
    if (updates.recordScope) role.recordScope = updates.recordScope;
    if (updates.sensitiveFields) role.sensitiveFields = updates.sensitiveFields;
    if (updates.effectiveDate) role.effectiveDate = new Date(updates.effectiveDate);
    if (updates.expiryDate !== undefined) role.expiryDate = updates.expiryDate ? new Date(updates.expiryDate) : null;
    if (updates.delegatedAuthority) role.delegatedAuthority = updates.delegatedAuthority;
    if (updates.exportRestrictions) role.exportRestrictions = updates.exportRestrictions;
    role.status = 'Active';
    role.reviewDetails = { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null };

    role.changeHistory.unshift({
      action: 'Permissions Updated',
      performedBy: operator,
      timestamp: new Date(),
      details: `Permissions updated. Added: ${diff.added.length}, Removed: ${diff.removed.length}. Rationale: ${rationale || 'Administrative update'}.`,
      oldPermissions,
      newPermissions
    });

    if (this.isMongoReady() && typeof role.save === 'function') await role.save();

    return {
      success: true,
      requiresReview: false,
      message: 'Role permissions updated and activated.',
      diff,
      data: role
    };
  }

  /**
   * 7.4 Action: Approve or Reject Pending Role Review
   */
  static async reviewRoleChange(roleId, decision, reviewer = 'Platform Owner', reviewNotes = '') {
    const roleRes = await this.getRoleById(roleId);
    if (!roleRes.success || !roleRes.data) {
      return { success: false, message: 'Role not found' };
    }

    const role = roleRes.data;
    if (!role.reviewDetails?.isPendingReview) {
      return { success: false, message: 'No pending review for this role' };
    }

    if (decision === 'Approved') {
      const draft = role.reviewDetails.draftUpdates || {};
      const oldPermissions = JSON.parse(JSON.stringify(role.permissions || {}));
      if (draft.permissions) role.permissions = draft.permissions;
      if (draft.recordScope) role.recordScope = draft.recordScope;
      if (draft.sensitiveFields) role.sensitiveFields = draft.sensitiveFields;
      if (draft.exportRestrictions) role.exportRestrictions = draft.exportRestrictions;
      role.status = 'Active';

      role.changeHistory.unshift({
        action: 'Review Approved',
        performedBy: reviewer,
        timestamp: new Date(),
        details: `Privilege changes approved by ${reviewer}. Notes: ${reviewNotes || 'Approved as requested'}.`,
        oldPermissions,
        newPermissions: role.permissions
      });
      role.reviewDetails = { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null };
    } else {
      role.status = 'Active';
      role.changeHistory.unshift({
        action: 'Review Rejected',
        performedBy: reviewer,
        timestamp: new Date(),
        details: `Privilege changes rejected by ${reviewer}. Reason: ${reviewNotes || 'Rejected by authorized reviewer'}.`
      });
      role.reviewDetails = { isPendingReview: false, requestedBy: null, requestedAt: null, rationale: null, changesDiff: null };
    }

    if (this.isMongoReady() && typeof role.save === 'function') await role.save();

    return {
      success: true,
      decision,
      message: `Role change request has been ${decision.toLowerCase()}.`,
      data: role
    };
  }

  /**
   * 7.2 Action: Toggle Role Status (Deactivate / Reactivate)
   * Safeguard: Built-in roles with critical privileges cannot be deactivated!
   */
  static async toggleRoleStatus(roleId, operator = 'Platform Administrator') {
    const roleRes = await this.getRoleById(roleId);
    if (!roleRes.success || !roleRes.data) {
      return { success: false, message: 'Role not found' };
    }

    const role = roleRes.data;

    // Safeguard: built-in roles cannot be deactivated
    if (role.isBuiltIn) {
      return {
        success: false,
        message: 'Built-in statutory role templates cannot be deactivated. Create a custom role to define restricted permissions.'
      };
    }

    const newStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    role.status = newStatus;

    role.changeHistory.unshift({
      action: newStatus === 'Active' ? 'Role Reactivated' : 'Role Deactivated',
      performedBy: operator,
      timestamp: new Date(),
      details: `Role status toggled to ${newStatus}.`
    });

    if (this.isMongoReady() && typeof role.save === 'function') await role.save();

    return {
      success: true,
      newStatus,
      data: role
    };
  }

  /**
   * 7.2 Action: Assign Users to Role
   */
  static async assignUsersToRole(roleId, countDelta = 1, operator = 'Platform Administrator') {
    const roleRes = await this.getRoleById(roleId);
    if (!roleRes.success || !roleRes.data) return { success: false, message: 'Role not found' };

    const role = roleRes.data;
    role.assignedUsersCount = Math.max(0, (role.assignedUsersCount || 0) + countDelta);

    role.changeHistory.unshift({
      action: 'Users Assigned',
      performedBy: operator,
      timestamp: new Date(),
      details: `User assignment count adjusted by ${countDelta > 0 ? '+' : ''}${countDelta}. Total assigned: ${role.assignedUsersCount}.`
    });

    if (this.isMongoReady() && typeof role.save === 'function') await role.save();
    return { success: true, assignedUsersCount: role.assignedUsersCount, data: role };
  }

  /**
   * Backend Permission Enforcement Engine (Section 7.4 Invariant)
   * Evaluates if a set of roles satisfies the requested module + action + context
   */
  static async evaluatePermission(userRoleNames = [], moduleName, action, context = {}) {
    await this.seedIfEmpty();

    let allRoles = [];
    if (!this.isMongoReady()) {
      allRoles = inMemoryRoles;
    } else {
      try {
        allRoles = await RoleTemplate.find({ status: 'Active' });
      } catch (e) {
        allRoles = inMemoryRoles;
      }
    }

    // If super admin / platform owner is among roles, grant full access
    if (userRoleNames.includes('Super Administrator') || userRoleNames.includes('Platform Owner')) {
      return { allowed: true, reason: 'Platform Owner / Super Administrator root override' };
    }

    // Find all matching active role templates for this user
    const matchingRoles = allRoles.filter(r =>
      userRoleNames.some(name => name.toLowerCase() === r.name.toLowerCase() || name.toLowerCase() === r.slug.toLowerCase())
    );

    if (matchingRoles.length === 0) {
      return { allowed: false, reason: 'No active role templates assigned to user' };
    }

    // Check if ANY assigned role grants the required action on the module
    const hasModuleAction = matchingRoles.some(r => {
      const modPerms = r.permissions?.[moduleName];
      if (!modPerms) return false;
      return !!modPerms[action];
    });

    if (!hasModuleAction) {
      return {
        allowed: false,
        reason: `Forbidden: None of your assigned roles (${userRoleNames.join(', ')}) possess '${action}' privilege on module '${moduleName}'.`
      };
    }

    // Context check 1: Institution Scope Check
    if (context.institutionId) {
      const hasScope = matchingRoles.some(r => {
        if (r.scope === 'Platform') return true; // Platform roles can access all campuses
        if (r.recordScope === 'all_records') return true;
        if (context.userInstitutionId && context.institutionId === context.userInstitutionId) return true;
        return false;
      });

      if (!hasScope) {
        return {
          allowed: false,
          reason: `Forbidden: Cross-campus access violation. Role is bounded to local campus.`
        };
      }
    }

    // Context check 2: Sensitive Fields
    if (context.requestedSensitiveField) {
      const hasSensitiveAccess = matchingRoles.some(r =>
        (r.sensitiveFields || []).includes(context.requestedSensitiveField)
      );
      if (!hasSensitiveAccess) {
        return {
          allowed: false,
          reason: `Forbidden: Role lacks clearance for sensitive field '${context.requestedSensitiveField}'.`
        };
      }
    }

    // Context check 3: Export Restrictions
    if (action === 'export') {
      const isProhibited = matchingRoles.every(r => r.exportRestrictions === 'prohibited');
      if (isProhibited) {
        return { allowed: false, reason: 'Forbidden: Data export is prohibited by role policy.' };
      }
    }

    return { allowed: true, matchingRoles: matchingRoles.map(r => r.name) };
  }
}

module.exports = RoleTemplateService;
