/**
 * API Gateway & Client Management - Repository Layer
 * Manages database access and persistence
 */

const mongoose = require('mongoose');
const { ApiClient } = require('../../models/integration.model');

class ApiManagementRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async find(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await ApiClient.find(query).lean();
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static async findOne(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await ApiClient.findOne(query).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  static async create(data) {
    if (this.isMongoReady()) {
      try {
        return await ApiClient.create(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  static async update(query, updateData) {
    if (this.isMongoReady()) {
      try {
        return await ApiClient.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

module.exports = ApiManagementRepository;
