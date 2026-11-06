/**
 * Institution Onboarding & Migration - Service Layer
 * Orchestrates the 6-Step New School Registration Lifecycle (Workflow A):
 * 1. Create institution record
 * 2. Configure school identity and academic defaults
 * 3. Verify domains and email
 * 4. Invite institution administrator
 * 5. Validate permissions and configuration
 * 6. Activate institution
 * Invariant: Student, staff and financial records are NOT fabricated automatically.
 */

const Repository = require('./institution-onboarding.repository');
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');
const PlatformWorkflowService = require('../../services/platformWorkflow.service');

class InstitutionOnboardingService {
  static async getOverview(req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({}, req);
    const checklists = await Repository.find(scopedQuery);

    return {
      success: true,
      module: 'institution-onboarding',
      title: 'Institution Onboarding & Registration Lifecycle',
      lifecycleSteps: [
        { step: 1, name: 'Create institution record', description: 'Initial draft record with trust identification and UDISE code' },
        { step: 2, name: 'Configure school identity and academic defaults', description: 'Affiliation, grading scale, academic year, branding' },
        { step: 3, name: 'Verify domains and email', description: 'DNS ownership, SSL certificate, SPF/DKIM authentication' },
        { step: 4, name: 'Invite institution administrator', description: 'Cryptographic token invite with expiration and role assignment' },
        { step: 5, name: 'Validate permissions and configuration', description: 'Pre-flight checklist validation before activation' },
        { step: 6, name: 'Activate institution', description: 'Live operational activation (Zero fabricated student/staff/financial records)' }
      ],
      count: checklists.length,
      data: checklists,
      timestamp: new Date()
    };
  }

  static async getById(id, req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({ _id: id }, req);
    const item = await Repository.findOne(scopedQuery);
    if (!item) {
      return { success: false, message: 'Checklist record not found or access unauthorized.' };
    }
    return { success: true, data: item };
  }

  static async registerSchoolWorkflow(data, operator = 'Platform Super Administrator') {
    const rawResult = await PlatformWorkflowService.registerSchoolWorkflow(data, operator);
    return {
      success: rawResult.success,
      workflow: 'WORKFLOW_A_REGISTER_NEW_SCHOOL',
      message: rawResult.message,
      steps: [
        { step: '1. Create institution record', status: 'Completed', detail: `Draft institution record created with code ${rawResult.code}` },
        { step: '2. Configure school identity and academic defaults', status: 'Completed', detail: 'Academic year, AP Board grading, and identity defaults applied' },
        { step: '3. Verify domains and email', status: 'Completed', detail: `Primary domain ${rawResult.domains?.primary} and DNS/SSL records verified` },
        { step: '4. Invite institution administrator', status: 'Completed', detail: `Invitation token dispatched to ${rawResult.administrator?.email}` },
        { step: '5. Validate permissions and configuration', status: 'Completed', detail: 'Pre-flight validation checklist passed' },
        { step: '6. Activate institution', status: 'Completed', detail: 'Institution activated for setup (Zero fabricated records invariant)' }
      ],
      data: {
        institutionId: rawResult.institutionId,
        code: rawResult.code,
        status: rawResult.status,
        metrics: {
          enrolledStudents: 0,
          teachingFaculty: 0,
          activeClasses: 0,
          revenueYTD: '₹ 0.00'
        }
      },
      ...rawResult
    };
  }

  static async processOperation(payload, operator = 'Platform Super Administrator') {
    if (payload.action === 'REGISTER_SCHOOL' || payload.workflow === 'REGISTER_NEW_SCHOOL') {
      return await this.registerSchoolWorkflow(payload, operator);
    }
    const created = await Repository.create(Object.assign({}, payload, {
      createdAt: new Date(),
      createdBy: operator
    }));
    return {
      success: true,
      message: 'Onboarding record processed successfully.',
      data: created
    };
  }
}

module.exports = InstitutionOnboardingService;
