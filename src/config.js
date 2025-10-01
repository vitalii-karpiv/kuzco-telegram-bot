// Configuration file for Kuzco Telegram Bot
require('dotenv').config();

const config = {
  botToken: process.env.BOT_TOKEN || '',
  botUsername: process.env.BOT_USERNAME || '',
  serverUrl: (process.env.SERVER_URL || 'http://localhost:3000').replace(/\/$/, ''),
  apiKey: process.env.API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kuzco_telegram_bot',
  adminUserId: process.env.ADMIN_USER_ID || '',
  webhookUrl: process.env.WEBHOOK_URL || '',
  port: parseInt(process.env.PORT || '3001', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Google Drive Configuration
  googleDriveApiKey: process.env.GOOGLE_DRIVE_API_KEY || '',
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  googleDriveBaseUrl: process.env.GOOGLE_DRIVE_BASE_URL || 'https://drive.google.com/uc?id=',
  
  // Bot Settings
  itemsPerPage: parseInt(process.env.ITEMS_PER_PAGE || '10', 10),
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10),
};

module.exports = config;
