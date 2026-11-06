/**
 * Role Templates & RBAC Permissions - Service Layer
 * Business rules, calculations, and operational orchestration
 */

const Repository = require('./roles-permissions.repository');
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class RolesPermissionsService {
  static async getOverview(req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({}, req);
    const records = await Repository.find(scopedQuery);

    return {
      success: true,
      module: 'roles-permissions',
      title: 'Role Templates & RBAC Permissions',
      count: records.length,
      data: records,
      timestamp: new Date()
    };
  }

  static async getById(id, req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({ _id: id }, req);
    const item = await Repository.findOne(scopedQuery);
    if (!item) {
      return { success: false, message: 'Record not found or access unauthorized for current tenant.' };
    }
    return { success: true, data: item };
  }

  static async processOperation(payload, operator = 'Platform Super Administrator') {
    const created = await Repository.create(Object.assign({}, payload, {
      createdAt: new Date(),
      createdBy: operator
    }));

    return {
      success: true,
      message: `Operation executed successfully in ${'Role Templates & RBAC Permissions'}.`,
      data: created
    };
  }
}

module.exports = RolesPermissionsService;
