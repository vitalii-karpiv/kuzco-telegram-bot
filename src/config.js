// Configuration file for Kuzco Telegram Bot
require('dotenv').config();

const config = {
  botToken: process.env.BOT_TOKEN || '',
  botUsername: process.env.BOT_USERNAME || '',
  serverUrl: process.env.SERVER_URL || 'http://localhost:3000',
  apiKey: process.env.API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kuzco_telegram_bot',
  adminUserId: process.env.ADMIN_USER_ID || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  port: parseInt(process.env.PORT || '3001', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
