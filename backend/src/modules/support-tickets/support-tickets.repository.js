/**
 * Support & Issue Management - Repository Layer
 * Manages database access and persistence
 */

const mongoose = require('mongoose');
const { SupportTicket } = require('../../models/supportTicket.model');

class SupportTicketsRepository {
  static isMongoReady() {
    return !!(mongoose.connection && mongoose.connection.readyState === 1);
  }

  static async find(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await SupportTicket.find(query).lean();
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static async findOne(query = {}) {
    if (this.isMongoReady()) {
      try {
        return await SupportTicket.findOne(query).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  static async create(data) {
    if (this.isMongoReady()) {
      try {
        return await SupportTicket.create(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  static async update(query, updateData) {
    if (this.isMongoReady()) {
      try {
        return await SupportTicket.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

module.exports = SupportTicketsRepository;
