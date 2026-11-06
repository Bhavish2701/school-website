/**
 * Global Platform Settings - Service Layer
 * Business rules, calculations, and operational orchestration
 */

const Repository = require('./global-settings.repository');
const MultiInstitutionSecurity = require('../common/multiInstitutionSecurity');

class GlobalSettingsService {
  static async getOverview(req) {
    const scopedQuery = MultiInstitutionSecurity.scopeQuery({}, req);
    const records = await Repository.find(scopedQuery);

    return {
      success: true,
      module: 'global-settings',
      title: 'Global Platform Settings',
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
      message: `Operation executed successfully in ${'Global Platform Settings'}.`,
      data: created
    };
  }
}

module.exports = GlobalSettingsService;
