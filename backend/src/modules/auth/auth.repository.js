/**
 * Authentication & Session Security - Repository Layer
 * Manages database access and persistence
 */

const mongoose = require('mongoose');
const { UserAccount } = require('../../models/userAccount.model');

class AuthRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async find(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await UserAccount.find(query).lean();
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static async findOne(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await UserAccount.findOne(query).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  static async create(data) {
    if (this.isMongoReady()) {
      try {
        return await UserAccount.create(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  static async update(query, updateData) {
    if (this.isMongoReady()) {
      try {
        return await UserAccount.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

module.exports = AuthRepository;
