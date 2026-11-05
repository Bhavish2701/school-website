/**
 * Sri Vidya Educational Trust - Subscriptions, Plans & Entitlements Service
 * Module 10: Multi-Tenant Commercial Plans Directory, Institution Subscriptions,
 * Usage Tracking, and Statutory Record Non-Disruption Guarantees
 */

const mongoose = require('mongoose');
const { Plan, Subscription } = require('../models/subscription.model');
const PlatformAuditService = require('./platformAudit.service');

// In-memory fallback stores
const inMemoryPlans = [];
const inMemorySubscriptions = [];

const DEFAULT_PLANS_SEED = [
  {
    planId: 'PLAN-SVT-CORE',
    name: 'Trust Foundation License',
    code: 'SVT-CORE',
    description: 'Essential institutional management for standalone Trust branch campuses and early-stage schools.',
    includedFeatures: [
      'Student Information System (SIS)',
      'Daily Attendance & Roll Registers',
      'Basic Fee Collection & Cash Receipts',
      'Continuous Assessment (CCE) Marks Register',
      'Statutory Transfer Certificate (TC) Engine',
      'Daily Automated Database Backups'
    ],
    limits: {
      maxStudents: 500,
      maxStaff: 50,
      storageGB: 50,
      apiRequestsPerDay: 25000
    },
    price: 0,
    currency: 'INR',
    billingInterval: 'Annual',
    status: 'Published',
    entitlements: ['students', 'teachers', 'attendance', 'exams', 'fees']
  },
  {
    planId: 'PLAN-SVT-PRO',
    name: 'Comprehensive Campus Pro',
    code: 'SVT-PRO',
    description: 'Advanced full-stack institutional software with parent-student portals, payment gateway, and timetable automation.',
    includedFeatures: [
      'All Foundation Features',
      'Parent & Student Self-Service Portals',
      'Integrated Online Fee Payment Gateway (Razorpay/Easebuzz)',
      'Automated Master Timetable & Conflict Solver',
      'State Board & CBSE Progress Card Generation',
      'Custom Domain, Official Email & SMS Gateway',
      'Dedicated Institutional Security Sentry'
    ],
    limits: {
      maxStudents: 1500,
      maxStaff: 150,
      storageGB: 200,
      apiRequestsPerDay: 75000
    },
    price: 45000,
    currency: 'INR',
    billingInterval: 'Termly',
    status: 'Published',
    entitlements: ['students', 'teachers', 'attendance', 'exams', 'fees', 'timetable', 'portal', 'audit']
  },
  {
    planId: 'PLAN-SVT-ENT',
    name: 'Multi-Academy Network Enterprise',
    code: 'SVT-ENTERPRISE',
    description: 'High-availability multi-campus deployment with central Trust governance, data warehousing, and custom SLA.',
    includedFeatures: [
      'All Campus Pro Features',
      'Multi-Tenant Trust Senate Central Analytics',
      'Granular RBAC Custom Role Templates',
      'Immutable Cryptographic Audit Logs & DLP',
      'Unlimited Historical Archive & Permanent Vault',
      'Custom Biometric Hardware Attendance Integration',
      '24/7 Dedicated Support & 99.95% Guaranteed SLA'
    ],
    limits: {
      maxStudents: 5000,
      maxStaff: 500,
      storageGB: 1000,
      apiRequestsPerDay: 250000
    },
    price: 120000,
    currency: 'INR',
    billingInterval: 'Annual',
    status: 'Published',
    entitlements: ['students', 'teachers', 'attendance', 'exams', 'fees', 'timetable', 'portal', 'audit', 'security']
  },
  {
    planId: 'PLAN-SVT-GRANT',
    name: 'Rural Outreach Grant License',
    code: 'SVT-GRANT',
    description: 'Subsidized institutional license for rural welfare schools operated under Sri Vidya Educational Trust.',
    includedFeatures: [
      'Essential Student & Attendance Registers',
      'Government Mid-Day Meal Accounting',
      'Free Uniform & Textbook Tracking',
      'AP State Board Marks Registers'
    ],
    limits: {
      maxStudents: 300,
      maxStaff: 30,
      storageGB: 30,
      apiRequestsPerDay: 10000
    },
    price: 0,
    currency: 'INR',
    billingInterval: 'Perpetual',
    status: 'Draft',
    entitlements: ['students', 'teachers', 'attendance', 'exams']
  }
];

const DEFAULT_SUBSCRIPTIONS_SEED = [
  {
    subscriptionId: 'SUB-2026-001',
    institutionId: 'INST-001',
    institutionName: 'Sri Vidya E.M High School (Main Campus)',
    planId: 'PLAN-SVT-PRO',
    planName: 'Comprehensive Campus Pro',
    planCode: 'SVT-PRO',
    startDate: new Date('2026-04-01T00:00:00Z'),
    renewalDate: new Date('2027-03-31T23:59:59Z'),
    subscriptionStatus: 'Active',
    paymentStatus: 'Paid',
    usage: {
      activeStudents: 855,
      activeStaff: 72,
      storageUsedGB: 42.8,
      apiRequestsToday: 12450
    },
    billingAdjustments: [
      {
        adjustmentId: 'ADJ-101',
        date: new Date('2026-04-05T00:00:00Z'),
        amount: 5000,
        type: 'CONCESSION',
        reason: 'Trust Founder Anniversary concession authorized by Managing Trustee',
        authorizedBy: 'Managing Trustee Sri P. Venkatasubba Rao'
      }
    ],
    contractualNotes: 'AP Education Code statutory mandate: Record read access and student report exports preserved unconditionally.'
  },
  {
    subscriptionId: 'SUB-2026-002',
    institutionId: 'INST-002',
    institutionName: 'Sri Vidya High School (City Branch)',
    planId: 'PLAN-SVT-CORE',
    planName: 'Trust Foundation License',
    planCode: 'SVT-CORE',
    startDate: new Date('2026-04-01T00:00:00Z'),
    renewalDate: new Date('2027-03-31T23:59:59Z'),
    subscriptionStatus: 'Active',
    paymentStatus: 'Paid',
    usage: {
      activeStudents: 420,
      activeStaff: 38,
      storageUsedGB: 18.2,
      apiRequestsToday: 6100
    },
    billingAdjustments: [],
    contractualNotes: 'AP Education Code statutory mandate: Record read access and student report exports preserved unconditionally.'
  },
  {
    subscriptionId: 'SUB-2026-003',
    institutionId: 'INST-003',
    institutionName: 'Sri Vidya Rural Academy',
    planId: 'PLAN-SVT-CORE',
    planName: 'Trust Foundation License',
    planCode: 'SVT-CORE',
    startDate: new Date('2026-06-01T00:00:00Z'),
    renewalDate: new Date('2027-05-31T23:59:59Z'),
    subscriptionStatus: 'Active',
    paymentStatus: 'Waived (Internal Trust)',
    usage: {
      activeStudents: 290,
      activeStaff: 24,
      storageUsedGB: 11.5,
      apiRequestsToday: 3400
    },
    billingAdjustments: [
      {
        adjustmentId: 'ADJ-102',
        date: new Date('2026-06-01T00:00:00Z'),
        amount: 0,
        type: 'WAIVER',
        reason: '100% Trust Grant Waiver for rural branch operations',
        authorizedBy: 'Sri Vidya Educational Trust Board'
      }
    ],
    contractualNotes: 'AP Education Code statutory mandate: Record read access and student report exports preserved unconditionally.'
  }
];

class SubscriptionService {

  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async seedIfEmpty() {
    if (!this.isMongoReady()) {
      this._seedInMemory();
      return;
    }

    try {
      const planCount = await Plan.countDocuments();
      if (planCount === 0) {
        await Plan.insertMany(DEFAULT_PLANS_SEED);
      }
      const subCount = await Subscription.countDocuments();
      if (subCount === 0) {
        await Subscription.insertMany(DEFAULT_SUBSCRIPTIONS_SEED);
      }
    } catch (e) {
      console.warn('[SubscriptionService] Mongo seed fallback:', e.message || e);
      this._seedInMemory();
    }
  }

  static _seedInMemory() {
    if (inMemoryPlans.length === 0) {
      DEFAULT_PLANS_SEED.forEach(p => inMemoryPlans.push(JSON.parse(JSON.stringify(p))));
    }
    if (inMemorySubscriptions.length === 0) {
      DEFAULT_SUBSCRIPTIONS_SEED.forEach(s => inMemorySubscriptions.push(JSON.parse(JSON.stringify(s))));
    }
  }

  // Summary Metrics for Dashboard
  static async getSubscriptionSummary() {
    await this.seedIfEmpty();
    const plansRes = await this.listPlans();
    const subsRes = await this.listSubscriptions();

    const plans = plansRes.data || [];
    const subs = subsRes.data || [];

    const totalSubscriptions = subs.length;
    const activePlans = plans.filter(p => p.status === 'Published').length;
    const totalStudents = subs.reduce((sum, s) => sum + (s.usage?.activeStudents || 0), 0);
    const totalStorageGB = subs.reduce((sum, s) => sum + (s.usage?.storageUsedGB || 0), 0);

    return {
      totalSubscriptions,
      activePublishedPlans: activePlans,
      totalActiveStudentsEnrolled: totalStudents,
      totalCloudStorageGB: Number(totalStorageGB.toFixed(1)),
      statutoryGuarantee: 'AP_EDU_CODE_ACTIVE_NON_DISRUPTION'
    };
  }

  // =========================================================================
  // 10.1 Commercial Plans Directory Operations
  // =========================================================================

  static async listPlans(query = {}) {
    await this.seedIfEmpty();
    let plans = [];

    if (!this.isMongoReady()) {
      plans = inMemoryPlans;
    } else {
      try {
        plans = await Plan.find().sort({ price: 1 });
      } catch (e) {
        plans = inMemoryPlans;
      }
    }

    const q = (query.search || '').toLowerCase().trim();
    const status = query.status || '';
    const interval = query.billingInterval || '';

    const filtered = plans.filter(p => {
      if (q) {
        const hay = `${p.planId} ${p.name} ${p.code} ${p.description} ${p.includedFeatures.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status && status !== 'all' && p.status !== status) return false;
      if (interval && interval !== 'all' && p.billingInterval !== interval) return false;
      return true;
    });

    return {
      success: true,
      total: filtered.length,
      data: filtered
    };
  }

  static async getPlanById(planId) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const p = inMemoryPlans.find(x => x.planId === planId || x.code === planId);
      return { success: !!p, data: p };
    }

    try {
      const p = await Plan.findOne({ $or: [{ planId }, { code: planId }] });
      return { success: !!p, data: p };
    } catch (e) {
      const p = inMemoryPlans.find(x => x.planId === planId || x.code === planId);
      return { success: !!p, data: p };
    }
  }

  static async createPlan(planData, operator = 'Platform Administrator') {
    await this.seedIfEmpty();

    const planId = planData.planId || `PLAN-SVT-${Date.now().toString(36).toUpperCase()}`;
    const code = (planData.code || planData.planId || `PLN-${Math.floor(100 + Math.random() * 900)}`).toUpperCase();

    const newPlan = {
      planId,
      name: planData.name || 'Custom Trust Tier',
      code,
      description: planData.description || '',
      includedFeatures: Array.isArray(planData.includedFeatures) ? planData.includedFeatures : (planData.includedFeatures || '').split(',').map(s => s.trim()).filter(Boolean),
      limits: {
        maxStudents: Number(planData.limits?.maxStudents || 1000),
        maxStaff: Number(planData.limits?.maxStaff || 100),
        storageGB: Number(planData.limits?.storageGB || 100),
        apiRequestsPerDay: Number(planData.limits?.apiRequestsPerDay || 25000)
      },
      price: Number(planData.price || 0),
      currency: planData.currency || 'INR',
      billingInterval: planData.billingInterval || 'Annual',
      status: planData.status || 'Published',
      entitlements: Array.isArray(planData.entitlements) ? planData.entitlements : (planData.entitlements || '').split(',').map(s => s.trim()).filter(Boolean)
    };

    if (this.isMongoReady()) {
      try {
        const created = await Plan.create(newPlan);
        await this._logPlanAudit('COMMERCIAL_PLAN_CREATED', created.planId, created.name, operator, 'Created new commercial plan');
        return { success: true, data: created };
      } catch (e) {
        console.warn('Mongo create plan fallback:', e.message);
      }
    }

    inMemoryPlans.push(newPlan);
    await this._logPlanAudit('COMMERCIAL_PLAN_CREATED', newPlan.planId, newPlan.name, operator, 'Created in-memory commercial plan');
    return { success: true, data: newPlan };
  }

  static async updatePlan(planId, updateData, operator = 'Platform Administrator') {
    await this.seedIfEmpty();

    let plan = null;
    if (this.isMongoReady()) {
      try {
        plan = await Plan.findOne({ planId });
        if (plan) {
          if (updateData.name) plan.name = updateData.name;
          if (updateData.description) plan.description = updateData.description;
          if (updateData.price !== undefined) plan.price = Number(updateData.price);
          if (updateData.billingInterval) plan.billingInterval = updateData.billingInterval;
          if (updateData.status) plan.status = updateData.status;
          if (updateData.limits) {
            plan.limits = { ...plan.limits, ...updateData.limits };
          }
          if (updateData.includedFeatures) {
            plan.includedFeatures = Array.isArray(updateData.includedFeatures) ? updateData.includedFeatures : updateData.includedFeatures.split(',').map(s => s.trim()).filter(Boolean);
          }
          if (updateData.entitlements) {
            plan.entitlements = Array.isArray(updateData.entitlements) ? updateData.entitlements : updateData.entitlements.split(',').map(s => s.trim()).filter(Boolean);
          }
          await plan.save();
          await this._logPlanAudit('COMMERCIAL_PLAN_UPDATED', plan.planId, plan.name, operator, 'Updated commercial plan properties');
          return { success: true, data: plan };
        }
      } catch (e) {
        console.warn('Mongo update plan fallback:', e.message);
      }
    }

    plan = inMemoryPlans.find(p => p.planId === planId);
    if (!plan) return { success: false, message: 'Plan not found' };

    Object.assign(plan, updateData);
    await this._logPlanAudit('COMMERCIAL_PLAN_UPDATED', plan.planId, plan.name, operator, 'Updated in-memory commercial plan');
    return { success: true, data: plan };
  }

  static async publishPlan(planId, operator = 'Platform Administrator') {
    return this.updatePlan(planId, { status: 'Published' }, operator);
  }

  static async archivePlan(planId, operator = 'Platform Administrator') {
    return this.updatePlan(planId, { status: 'Archived' }, operator);
  }

  // =========================================================================
  // 10.2 Institution Subscriptions Operations
  // =========================================================================

  static async listSubscriptions(query = {}) {
    await this.seedIfEmpty();
    let subs = [];

    if (!this.isMongoReady()) {
      subs = inMemorySubscriptions;
    } else {
      try {
        subs = await Subscription.find().sort({ renewalDate: 1 });
      } catch (e) {
        subs = inMemorySubscriptions;
      }
    }

    const q = (query.search || '').toLowerCase().trim();
    const instId = query.institutionId || '';
    const status = query.subscriptionStatus || query.status || '';
    const payment = query.paymentStatus || '';

    const filtered = subs.filter(s => {
      if (q) {
        const hay = `${s.subscriptionId} ${s.institutionName} ${s.institutionId} ${s.planName} ${s.planCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (instId && instId !== 'all' && s.institutionId !== instId) return false;
      if (status && status !== 'all' && s.subscriptionStatus !== status) return false;
      if (payment && payment !== 'all' && s.paymentStatus !== payment) return false;
      return true;
    });

    return {
      success: true,
      total: filtered.length,
      data: filtered
    };
  }

  static async getSubscriptionById(subscriptionId) {
    await this.seedIfEmpty();

    if (!this.isMongoReady()) {
      const s = inMemorySubscriptions.find(x => x.subscriptionId === subscriptionId || x.institutionId === subscriptionId);
      return { success: !!s, data: s };
    }

    try {
      const s = await Subscription.findOne({ $or: [{ subscriptionId }, { institutionId: subscriptionId }] });
      return { success: !!s, data: s };
    } catch (e) {
      const s = inMemorySubscriptions.find(x => x.subscriptionId === subscriptionId || x.institutionId === subscriptionId);
      return { success: !!s, data: s };
    }
  }

  static async assignPlan(institutionId, planId, options = {}, operator = 'Platform Administrator') {
    await this.seedIfEmpty();
    const planRes = await this.getPlanById(planId);
    if (!planRes.success || !planRes.data) return { success: false, message: 'Specified plan not found' };

    const plan = planRes.data;
    const existing = await this.getSubscriptionById(institutionId);

    const subscriptionData = {
      subscriptionId: existing.data?.subscriptionId || `SUB-2026-${Math.floor(100 + Math.random() * 900)}`,
      institutionId,
      institutionName: options.institutionName || existing.data?.institutionName || `Institution ${institutionId}`,
      planId: plan.planId,
      planName: plan.name,
      planCode: plan.code,
      startDate: options.startDate ? new Date(options.startDate) : new Date(),
      renewalDate: options.renewalDate ? new Date(options.renewalDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      subscriptionStatus: 'Active',
      paymentStatus: options.paymentStatus || 'Paid',
      usage: existing.data?.usage || {
        activeStudents: 100,
        activeStaff: 15,
        storageUsedGB: 5.0,
        apiRequestsToday: 1000
      },
      billingAdjustments: existing.data?.billingAdjustments || [],
      contractualNotes: options.contractualNotes || 'Standard Trust Institutional License'
    };

    if (this.isMongoReady()) {
      try {
        const sub = await Subscription.findOneAndUpdate(
          { institutionId },
          subscriptionData,
          { upsert: true, new: true }
        );
        await this._logSubAudit('SUBSCRIPTION_PLAN_ASSIGNED', sub.subscriptionId, sub.institutionId, sub.planName, operator, 'Assigned commercial plan to institution');
        return { success: true, data: sub };
      } catch (e) {
        console.warn('Mongo assignPlan fallback:', e.message);
      }
    }

    const idx = inMemorySubscriptions.findIndex(s => s.institutionId === institutionId);
    if (idx >= 0) inMemorySubscriptions[idx] = subscriptionData;
    else inMemorySubscriptions.push(subscriptionData);

    await this._logSubAudit('SUBSCRIPTION_PLAN_ASSIGNED', subscriptionData.subscriptionId, institutionId, subscriptionData.planName, operator, 'Assigned in-memory commercial plan');
    return { success: true, data: subscriptionData };
  }

  static async renewSubscription(subscriptionId, options = {}, operator = 'Platform Administrator') {
    await this.seedIfEmpty();
    const subRes = await this.getSubscriptionById(subscriptionId);
    if (!subRes.success || !subRes.data) return { success: false, message: 'Subscription record not found' };

    const sub = subRes.data;
    const currentRenewal = new Date(sub.renewalDate);
    const newRenewal = options.renewalDate ? new Date(options.renewalDate) : new Date(currentRenewal.setFullYear(currentRenewal.getFullYear() + 1));

    sub.renewalDate = newRenewal;
    sub.subscriptionStatus = 'Renewed';
    sub.paymentStatus = options.paymentStatus || 'Paid';

    if (this.isMongoReady() && typeof sub.save === 'function') {
      await sub.save();
    }

    await this._logSubAudit('SUBSCRIPTION_RENEWED', sub.subscriptionId, sub.institutionId, sub.planName, operator, `Renewed subscription to ${newRenewal.toISOString().slice(0, 10)}`);
    return { success: true, data: sub };
  }

  static async changePlan(subscriptionId, newPlanId, operator = 'Platform Administrator') {
    await this.seedIfEmpty();
    const planRes = await this.getPlanById(newPlanId);
    if (!planRes.success || !planRes.data) return { success: false, message: 'Target plan not found' };

    const plan = planRes.data;
    const subRes = await this.getSubscriptionById(subscriptionId);
    if (!subRes.success || !subRes.data) return { success: false, message: 'Subscription not found' };

    const sub = subRes.data;
    const oldPlanName = sub.planName;
    sub.planId = plan.planId;
    sub.planName = plan.name;
    sub.planCode = plan.code;

    if (this.isMongoReady() && typeof sub.save === 'function') {
      await sub.save();
    }

    await this._logSubAudit('SUBSCRIPTION_PLAN_CHANGED', sub.subscriptionId, sub.institutionId, plan.name, operator, `Upgraded/Migrated plan from ${oldPlanName} to ${plan.name}`);
    return { success: true, data: sub };
  }

  static async recordBillingAdjustment(subscriptionId, adjustmentData, operator = 'Platform Administrator') {
    await this.seedIfEmpty();
    const subRes = await this.getSubscriptionById(subscriptionId);
    if (!subRes.success || !subRes.data) return { success: false, message: 'Subscription not found' };

    const sub = subRes.data;
    const adjustment = {
      adjustmentId: `ADJ-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date(),
      amount: Number(adjustmentData.amount || 0),
      type: adjustmentData.type || 'CONCESSION',
      reason: adjustmentData.reason || 'Authorized statutory adjustment',
      authorizedBy: operator
    };

    if (!Array.isArray(sub.billingAdjustments)) sub.billingAdjustments = [];
    sub.billingAdjustments.unshift(adjustment);

    if (this.isMongoReady() && typeof sub.save === 'function') {
      await sub.save();
    }

    await this._logSubAudit('SUBSCRIPTION_ADJUSTMENT_RECORDED', sub.subscriptionId, sub.institutionId, `${adjustment.type}: Rs ${adjustment.amount}`, operator, `Adjustment authorized: ${adjustment.reason}`);
    return { success: true, adjustment, data: sub };
  }

  /**
   * Suspend or Cancel According to Contract
   * Invariant: Section 10.3 Non-disruption guarantee
   */
  static async suspendOrCancelSubscription(subscriptionId, action = 'Suspend', reason = '', operator = 'Platform Administrator') {
    await this.seedIfEmpty();
    const subRes = await this.getSubscriptionById(subscriptionId);
    if (!subRes.success || !subRes.data) return { success: false, message: 'Subscription not found' };

    const sub = subRes.data;
    const isCancel = action.toLowerCase().includes('cancel');
    sub.subscriptionStatus = isCancel ? 'Cancelled' : 'Suspended';
    
    // Invariant Guarantee: Contractual notes explicitly mandate preserved read & export access
    sub.contractualNotes = `[${new Date().toISOString().slice(0, 10)}] ${action} Action executed: ${reason || 'Contractual adjustment'}. AP Statutory Invariant: Read & Export access unconditionally preserved.`;

    if (this.isMongoReady() && typeof sub.save === 'function') {
      await sub.save();
    }

    await this._logSubAudit(isCancel ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_SUSPENDED', sub.subscriptionId, sub.institutionId, sub.planName, operator, `Action: ${action}. Reason: ${reason}. Access preserved under statutory guarantee.`);
    return { success: true, status: sub.subscriptionStatus, data: sub };
  }

  // =========================================================================
  // 10.3 Usage and Entitlements
  // =========================================================================

  static async getUsageAndEntitlements(institutionId = 'INST-001') {
    await this.seedIfEmpty();
    const subRes = await this.getSubscriptionById(institutionId);
    let sub = subRes.data;
    if (!sub) {
      const all = await this.listSubscriptions();
      sub = all.data?.[0];
    }

    if (!sub) {
      return { success: false, message: 'No subscription found for institution' };
    }

    const planRes = await this.getPlanById(sub.planId);
    const plan = planRes.data || DEFAULT_PLANS_SEED[1];

    const studentLimit = plan.limits?.maxStudents || 1500;
    const staffLimit = plan.limits?.maxStaff || 150;
    const storageLimit = plan.limits?.storageGB || 200;
    const apiLimit = plan.limits?.apiRequestsPerDay || 50000;

    const studentUsed = sub.usage?.activeStudents || 855;
    const staffUsed = sub.usage?.activeStaff || 72;
    const storageUsed = sub.usage?.storageUsedGB || 42.8;
    const apiUsed = sub.usage?.apiRequestsToday || 12450;

    const studentPct = Math.round((studentUsed / studentLimit) * 100);
    const storagePct = Math.round((storageUsed / storageLimit) * 100);
    const apiPct = Math.round((apiUsed / apiLimit) * 100);

    const warnings = [];
    if (studentPct >= 85) warnings.push({ type: 'STUDENT_LIMIT', message: `Active student enrollment is at ${studentPct}% of allocated quota (${studentUsed}/${studentLimit}).` });
    if (storagePct >= 85) warnings.push({ type: 'STORAGE_LIMIT', message: `Cloud vault storage is at ${storagePct}% of capacity (${storageUsed}/${storageLimit} GB).` });
    if (apiPct >= 85) warnings.push({ type: 'API_LIMIT', message: `Daily API usage is at ${apiPct}% of rate limit (${apiUsed}/${apiLimit}).` });

    return {
      success: true,
      institutionId: sub.institutionId,
      institutionName: sub.institutionName,
      plan: {
        planId: plan.planId,
        name: plan.name,
        code: plan.code,
        entitlements: plan.entitlements || ['students', 'teachers', 'attendance', 'exams', 'fees', 'timetable', 'portal', 'audit']
      },
      subscription: {
        subscriptionId: sub.subscriptionId,
        status: sub.subscriptionStatus,
        paymentStatus: sub.paymentStatus,
        renewalDate: sub.renewalDate
      },
      usage: {
        activeStudents: { used: studentUsed, limit: studentLimit, percentage: studentPct },
        activeStaff: { used: staffUsed, limit: staffLimit },
        storageGB: { used: storageUsed, limit: storageLimit, percentage: storagePct },
        apiRequestsToday: { used: apiUsed, limit: apiLimit, percentage: apiPct }
      },
      enabledModules: plan.entitlements || [],
      warnings,
      statutoryNonDisruptionGuarantee: {
        isProtected: true,
        statement: 'Pursuant to AP Education Code rules, records and student exports are strictly guaranteed and will not be disabled during subscription renewals or billing disputes.'
      }
    };
  }

  // Internal Audit Logger Helper
  static async _logPlanAudit(action, planId, planName, operator, reason) {
    try {
      await PlatformAuditService.logEvent({
        action,
        category: 'CONFIGURATION_CHANGES',
        actor: { userId: 'PLATFORM-ADMIN', name: operator, role: 'Platform Administrator' },
        institutionId: 'TRUST-ALL',
        institutionName: 'Sri Vidya Educational Trust',
        targetEntity: { entityType: 'CommercialPlan', entityId: planId, displayName: planName },
        result: 'SUCCESS',
        severity: 'MEDIUM',
        reason
      });
    } catch (e) {
      console.warn('Audit log skip in subscription service:', e.message);
    }
  }

  static async _logSubAudit(action, subId, institutionId, planName, operator, reason) {
    try {
      await PlatformAuditService.logEvent({
        action,
        category: 'SUBSCRIPTIONS_PLANS',
        actor: { userId: 'PLATFORM-ADMIN', name: operator, role: 'Platform Administrator' },
        institutionId,
        institutionName: `Institution ${institutionId}`,
        targetEntity: { entityType: 'InstitutionSubscription', entityId: subId, displayName: planName },
        result: 'SUCCESS',
        severity: action.includes('CANCEL') || action.includes('SUSPEND') ? 'HIGH' : 'MEDIUM',
        reason
      });
    } catch (e) {
      console.warn('Audit log skip in subscription service:', e.message);
    }
  }
}

module.exports = SubscriptionService;

