// Main entry point for Kuzco Telegram Bot
const { Telegraf } = require('telegraf');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const databaseService = require('./src/services/database');

// Import handlers
const commandsHandler = require('./src/handlers/commands');
const callbacksHandler = require('./src/handlers/callbacks');
const messagesHandler = require('./src/handlers/messages');
const catalogHandler = require('./src/handlers/catalog');

// Create bot instance
const bot = new Telegraf(config.botToken);

// Middleware for logging
bot.use((ctx, next) => {
  logger.info(`Received ${ctx.updateType} from ${ctx.from?.id || 'unknown'}`);
  return next();
});

// Error handling middleware
bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error('Bot error:', error);
    await ctx.reply('Sorry, there was an error processing your request. Please try again later.');
  }
});

// Command handlers
bot.start(commandsHandler.handleStart);
bot.help(commandsHandler.handleHelp);
bot.command('catalog', commandsHandler.handleCatalog);
bot.command('search', commandsHandler.handleSearch);
bot.command('filters', commandsHandler.handleFilters);

// Callback query handlers
bot.on('callback_query', callbacksHandler.handleCallback);

// Message handlers
bot.on('text', messagesHandler.handleTextMessage);
bot.on('photo', messagesHandler.handlePhotoMessage);
bot.on('document', messagesHandler.handleDocumentMessage);
bot.on('sticker', messagesHandler.handleStickerMessage);
bot.on('location', messagesHandler.handleLocationMessage);
bot.on('contact', messagesHandler.handleContactMessage);
bot.on('voice', messagesHandler.handleVoiceMessage);
bot.on('video', messagesHandler.handleVideoMessage);
bot.on('audio', messagesHandler.handleAudioMessage);
bot.on('video_note', messagesHandler.handleVideoNoteMessage);
bot.on('animation', messagesHandler.handleAnimationMessage);
bot.on('dice', messagesHandler.handleDiceMessage);
bot.on('poll', messagesHandler.handlePollMessage);
bot.on('venue', messagesHandler.handleVenueMessage);
bot.on('game', messagesHandler.handleGameMessage);
bot.on('invoice', messagesHandler.handleInvoiceMessage);
bot.on('successful_payment', messagesHandler.handleSuccessfulPaymentMessage);
bot.on('passport_data', messagesHandler.handlePassportDataMessage);
bot.on('proximity_alert_triggered', messagesHandler.handleProximityAlertTriggeredMessage);
// Additional message handlers can be added here as needed

// Error handling
bot.catch((err, ctx) => {
  logger.error('Bot error:', err);
  ctx.reply('Sorry, there was an error processing your request. Please try again later.');
});

// Graceful shutdown
process.once('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  bot.stop('SIGINT');
  databaseService.disconnect();
  process.exit(0);
});

process.once('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  bot.stop('SIGTERM');
  databaseService.disconnect();
  process.exit(0);
});

// Start the bot
async function startBot() {
  try {
    // Connect to database
    await databaseService.connect();
    
    // Start the bot
    if (config.webhookUrl) {
      // Use webhook for production
      await bot.launch({
        webhook: {
          domain: config.webhookUrl,
          port: config.port
        }
      });
      logger.info(`Bot started with webhook on port ${config.port}`);
    } else {
      // Use polling for development
      await bot.launch();
      logger.info('Bot started with polling');
    }
    
    logger.info('Kuzco Telegram Bot is running!');
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
startBot();