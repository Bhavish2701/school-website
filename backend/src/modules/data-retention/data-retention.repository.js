/**
 * Statutory Data Retention & Requests - Repository Layer
 * Manages database access and persistence
 */

const mongoose = require('mongoose');
const { RetentionRule, DataRequest } = require('../../models/platformPolicy.model');

class DataRetentionRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async find(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await RetentionRule.find(query).lean();
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static async findOne(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await RetentionRule.findOne(query).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  static async create(data) {
    if (this.isMongoReady()) {
      try {
        return await RetentionRule.create(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  static async update(query, updateData) {
    if (this.isMongoReady()) {
      try {
        return await RetentionRule.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

module.exports = DataRetentionRepository;
