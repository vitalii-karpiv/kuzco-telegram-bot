// Cache service for Kuzco Telegram Bot
const NodeCache = require('node-cache');
const config = require('../config');

class CacheService {
  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: config.cacheTtl,
      checkperiod: config.cacheTtl * 0.2,
      useClones: false
    });
  }

  set(key, value, ttl = null) {
    return this.cache.set(key, value, ttl || config.cacheTtl);
  }

  get(key) {
    return this.cache.get(key);
  }

  delete(key) {
    return this.cache.del(key);
  }

  clear() {
    return this.cache.flushAll();
  }

  has(key) {
    return this.cache.has(key);
  }

  // Cache keys for different data types
  static KEYS = {
    LAPTOPS: (filters, offset) => `laptops:${JSON.stringify(filters)}:${offset}`,
    LAPTOP_DETAIL: (id) => `laptop:${id}`,
    LAPTOP_IMAGES: (id) => `laptop_images:${id}`,
    CUSTOMER: (chatId) => `customer:${chatId}`,
    USER_SESSION: (chatId) => `session:${chatId}`,
    FILTERS: 'available_filters'
  };
}

const cacheService = new CacheService();
// Make KEYS accessible on the instance
cacheService.KEYS = CacheService.KEYS;
module.exports = cacheService;
