/**
 * Deployment History & Lifecycle - Repository Layer
 * Manages database access and persistence
 */

const mongoose = require('mongoose');
const { DeploymentHistory } = require('../../models/systemHealth.model');

class DeploymentsRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async find(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await DeploymentHistory.find(query).lean();
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static async findOne(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await DeploymentHistory.findOne(query).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  static async create(data) {
    if (this.isMongoReady()) {
      try {
        return await DeploymentHistory.create(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  static async update(query, updateData) {
    if (this.isMongoReady()) {
      try {
        return await DeploymentHistory.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

module.exports = DeploymentsRepository;
