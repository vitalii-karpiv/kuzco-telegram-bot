// Command handlers for Kuzco Telegram Bot
const customerService = require('../services/customer');
const catalogCard = require('../components/catalogCard');

class CommandsHandler {
  async handleStart(ctx) {
    try {
      // Extract user data and create/update customer
      const userData = customerService.extractUserData(ctx);
      const customer = await customerService.createOrUpdateCustomer(userData.chatId, userData);
      
      const welcomeMessage = `👋 *Welcome to Kuzco Laptop Shop!*\n\n` +
        `I'm your personal assistant to help you find the perfect laptop.\n\n` +
        `Here's what you can do:\n` +
        `🖥️ Browse our laptop catalog\n` +
        `🔍 Search for specific laptops\n` +
        `🔧 Filter by specifications\n` +
        `ℹ️ Get detailed information\n` +
        `🛒 Place orders directly\n\n` +
        `Let's get started! What would you like to do?`;
      
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: catalogCard.createMainMenuKeyboard().reply_markup
      });
      
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply('Sorry, there was an error starting the bot. Please try again later.');
    }
  }

  async handleHelp(ctx) {
    const helpMessage = `ℹ️ *Kuzco Bot Help*\n\n` +
      `*Available Commands:*\n` +
      `/start - Start the bot and see main menu\n` +
      `/help - Show this help message\n` +
      `/catalog - Browse laptop catalog\n` +
      `/search - Search for laptops\n` +
      `/filters - Apply filters\n\n` +
      `*How to Use:*\n` +
      `1. Use the main menu buttons to navigate\n` +
      `2. Browse laptops one by one with Next/Previous buttons\n` +
      `3. Use filters to narrow down your search\n` +
      `4. Click "Details" for more information\n` +
      `5. Click "Order" to place an order\n\n` +
      `*Need Help?*\n` +
      `Contact our support team for assistance.`;
    
    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: catalogCard.createMainMenuKeyboard().reply_markup
    });
  }

  async handleCatalog(ctx) {
    // This will be handled by the catalog handler
    // For now, just show a message
    await ctx.reply('🖥️ *Laptop Catalog*\n\nLoading laptops...', {
      parse_mode: 'Markdown'
    });
  }

  async handleSearch(ctx) {
    await ctx.reply('🔍 *Search Laptops*\n\nPlease enter the laptop name you\'re looking for:', {
      parse_mode: 'Markdown',
      reply_markup: catalogCard.createSearchKeyboard().reply_markup
    });
  }

  async handleFilters(ctx) {
    await ctx.reply('🔧 *Filters*\n\nChoose filters to narrow down your search:', {
      parse_mode: 'Markdown',
      reply_markup: catalogCard.createSearchKeyboard().reply_markup
    });
  }
}

module.exports = new CommandsHandler();
