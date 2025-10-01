// Sale service for Kuzco Telegram Bot
const axios = require('axios');
const config = require('../config');

class SaleService {
  async createSale(laptopId, customerId, chatId) {
    try {
      const saleData = {
        laptopId: laptopId,
        customerId: customerId,
        chatId: chatId,
        status: 'pending',
        source: 'telegram_bot',
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(`${config.serverUrl}/sale/create`, saleData, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  async getSaleStatus(saleId) {
    try {
      const response = await axios.get(`${config.serverUrl}/sale/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting sale status:', error);
      return null;
    }
  }

  async getSalesByCustomer(customerId) {
    try {
      const response = await axios.get(`${config.serverUrl}/sale/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting sales by customer:', error);
      return [];
    }
  }

  // Helper method to format sale confirmation message
  formatSaleConfirmation(sale) {
    return `✅ *Order Created Successfully!*\n\n` +
           `Order ID: \`${sale.id}\`\n` +
           `Status: ${sale.status}\n` +
           `Created: ${new Date(sale.createdAt).toLocaleString()}\n\n` +
           `Our manager will contact you shortly to confirm the order details and arrange delivery.\n\n` +
           `Thank you for choosing Kuzco! 🚀`;
  }
}

module.exports = new SaleService();
