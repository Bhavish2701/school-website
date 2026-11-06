/**
 * Institutions Module - Repository Layer
 * Manages database access and persistence for institutional tenants
 */

const { Institution } = require('../../models/institution.model');
const mongoose = require('mongoose');

class InstitutionsRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async findAll(query = {}) {
    if (this.isMongoReady()) {
      return await Institution.find(query).lean();
    }
    return [];
  }

  static async findByIdOrCode(idOrCode) {
    if (this.isMongoReady()) {
      return await Institution.findOne({
        $or: [{ institutionId: idOrCode }, { code: (idOrCode || '').toUpperCase() }]
      }).lean();
    }
    return null;
  }

  static async create(institutionData) {
    if (this.isMongoReady()) {
      return await Institution.create(institutionData);
    }
    return institutionData;
  }

  static async update(idOrCode, updateData) {
    if (this.isMongoReady()) {
      return await Institution.findOneAndUpdate(
        { $or: [{ institutionId: idOrCode }, { code: (idOrCode || '').toUpperCase() }] },
        { $set: updateData },
        { new: true }
      ).lean();
    }
    return null;
  }

  static async checkDuplicateCodeOrDomain(code, domain, excludeId = null) {
    if (!this.isMongoReady()) return { duplicate: false };
    const query = {
      $or: [
        { code: (code || '').toUpperCase() },
        { 'domains.primary': domain }
      ]
    };
    if (excludeId) {
      query.institutionId = { $ne: excludeId };
    }
    const found = await Institution.findOne(query).lean();
    if (found) {
      return {
        duplicate: true,
        field: found.code === (code || '').toUpperCase() ? 'code' : 'domain',
        existing: found
      };
    }
    return { duplicate: false };
  }
}

module.exports = InstitutionsRepository;

