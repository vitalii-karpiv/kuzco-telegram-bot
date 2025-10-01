// Customer service for Kuzco Telegram Bot
const axios = require('axios');
const config = require('../config');
const cache = require('./cache');

class CustomerService {
  async createOrUpdateCustomer(chatId, userData) {
    const cacheKey = cache.KEYS.CUSTOMER(chatId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const customerData = {
        phone: userData.phone || chatId, // Use chatId as phone if no phone provided
        pib: userData.pib || `TG_${chatId}` // Use chatId as PIB if no PIB provided
      };

      const response = await axios.post(`${config.serverUrl}/customer`, customerData, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const customer = response.data;
      cache.set(cacheKey, customer, 1800); // Cache for 30 minutes
      return customer;
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  }

  async getCustomerByChatId(chatId) {
    const cacheKey = cache.KEYS.CUSTOMER(chatId);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${config.serverUrl}/customer/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      const customer = response.data;
      cache.set(cacheKey, customer, 1800);
      return customer;
    } catch (error) {
      console.error('Error getting customer by chat ID:', error);
      return null;
    }
  }

  async updateCustomerPreferences(chatId, preferences) {
    try {
      const customer = await this.getCustomerByChatId(chatId);
      if (!customer) return null;

      const response = await axios.patch(`${config.serverUrl}/customer/${customer.id}`, {
        preferences: preferences
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Clear cache
      cache.delete(cache.KEYS.CUSTOMER(chatId));
      return response.data;
    } catch (error) {
      console.error('Error updating customer preferences:', error);
      throw error;
    }
  }

  // Helper method to extract user data from Telegram context
  extractUserData(ctx) {
    const user = ctx.from;
    return {
      chatId: user.id.toString(),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code
    };
  }
}

module.exports = new CustomerService();
