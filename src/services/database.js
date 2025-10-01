// Database service for Kuzco Telegram Bot
const mongoose = require('mongoose');
const config = require('../config');

// User Session Schema
const userSessionSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  currentPosition: { type: Number, default: 0 },
  loadedLaptops: [{ type: String }], // Array of laptop IDs
  activeFilters: { type: Object, default: {} },
  searchQuery: { type: String, default: '' },
  navigationHistory: [{ type: Object }],
  lastActivity: { type: Date, default: Date.now },
  customerId: { type: String }
}, {
  timestamps: true
});

// Customer Schema (Local cache)
const customerSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true }, // ID from kuzco-server
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: { type: String, default: '' },
  preferences: { type: Object, default: {} }
}, {
  timestamps: true
});

// Cache Schema
const cacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, required: true }
}, {
  timestamps: true
});

// Create indexes (only for non-unique fields)
userSessionSchema.index({ lastActivity: 1 });
customerSchema.index({ customerId: 1 });
cacheSchema.index({ expiresAt: 1 });

// Models
const UserSession = mongoose.model('UserSession', userSessionSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Cache = mongoose.model('Cache', cacheSchema);

class DatabaseService {
  async connect() {
    try {
      await mongoose.connect(config.mongodbUri);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
    }
  }

  // User Session methods
  async getUserSession(chatId) {
    return await UserSession.findOne({ chatId });
  }

  async createOrUpdateUserSession(chatId, sessionData) {
    return await UserSession.findOneAndUpdate(
      { chatId },
      { ...sessionData, lastActivity: new Date() },
      { upsert: true, new: true }
    );
  }

  async updateUserSession(chatId, updates) {
    return await UserSession.findOneAndUpdate(
      { chatId },
      { ...updates, lastActivity: new Date() },
      { new: true }
    );
  }

  async deleteUserSession(chatId) {
    return await UserSession.findOneAndDelete({ chatId });
  }

  // Customer methods
  async getCustomer(chatId) {
    return await Customer.findOne({ chatId });
  }

  async createOrUpdateCustomer(customerData) {
    return await Customer.findOneAndUpdate(
      { chatId: customerData.chatId },
      customerData,
      { upsert: true, new: true }
    );
  }

  async updateCustomerPreferences(chatId, preferences) {
    return await Customer.findOneAndUpdate(
      { chatId },
      { preferences, updatedAt: new Date() },
      { new: true }
    );
  }

  // Cache methods
  async setCache(key, value, expiresAt, type) {
    return await Cache.findOneAndUpdate(
      { key },
      { value, expiresAt, type },
      { upsert: true, new: true }
    );
  }

  async getCache(key) {
    const cache = await Cache.findOne({ key });
    if (!cache) return null;
    
    if (cache.expiresAt < new Date()) {
      await this.deleteCache(key);
      return null;
    }
    
    return cache.value;
  }

  async deleteCache(key) {
    return await Cache.findOneAndDelete({ key });
  }

  async clearExpiredCache() {
    return await Cache.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  // Cleanup methods
  async cleanupOldSessions(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return await UserSession.deleteMany({ lastActivity: { $lt: cutoffDate } });
  }
}

module.exports = new DatabaseService();
