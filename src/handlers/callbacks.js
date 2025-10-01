// Callback handlers for Kuzco Telegram Bot
const catalogHandler = require('./catalog');
const productHandler = require('./product');
const searchHandler = require('./search');
const commandsHandler = require('./commands');
const databaseService = require('../services/database');

class CallbacksHandler {
  async handleCallback(ctx) {
    try {
      const callbackData = ctx.callbackQuery.data;
      
      // Navigation callbacks
      if (callbackData.startsWith('nav_')) {
        await this.handleNavigationCallback(ctx, callbackData);
      }
      // Filter callbacks
      else if (callbackData.startsWith('filter_')) {
        await this.handleFilterCallback(ctx, callbackData);
      }
      // Product detail callbacks
      else if (callbackData.startsWith('detail_')) {
        await this.handleDetailCallback(ctx, callbackData);
      }
      // Order callbacks
      else if (callbackData.startsWith('order_')) {
        await this.handleOrderCallback(ctx, callbackData);
      }
      // Image callbacks
      else if (callbackData.startsWith('img_')) {
        await this.handleImageCallback(ctx, callbackData);
      }
      // Search callbacks
      else if (callbackData.startsWith('search')) {
        await this.handleSearchCallback(ctx, callbackData);
      }
      // Menu callbacks
      else if (callbackData.startsWith('main_menu') || callbackData.startsWith('browse_')) {
        await this.handleMenuCallback(ctx, callbackData);
      }
      // Back callbacks
      else if (callbackData.startsWith('back_')) {
        await this.handleBackCallback(ctx, callbackData);
      }
      // Apply filters
      else if (callbackData === 'apply_filters') {
        await this.handleApplyFilters(ctx);
      }
      // Clear filters
      else if (callbackData === 'clear_filters') {
        await catalogHandler.clearFilters(ctx);
      }
      // Help
      else if (callbackData === 'help') {
        await commandsHandler.handleHelp(ctx);
      }
      else {
        await ctx.answerCbQuery('Unknown action');
      }
      
    } catch (error) {
      console.error('Error handling callback:', error);
      await ctx.answerCbQuery('Sorry, there was an error processing your request.');
    }
  }

  async handleNavigationCallback(ctx, callbackData) {
    if (callbackData === 'nav_next') {
      await catalogHandler.handleNavigation(ctx, 'next');
    } else if (callbackData === 'nav_prev') {
      await catalogHandler.handleNavigation(ctx, 'prev');
    }
    
    await ctx.answerCbQuery();
  }

  async handleFilterCallback(ctx, callbackData) {
    const parts = callbackData.split('_');
    
    if (parts.length < 3) {
      await ctx.answerCbQuery('Invalid filter action');
      return;
    }
    
    const filterType = parts[1];
    const value = parts[2];
    
    await catalogHandler.handleFilterSelection(ctx, filterType, value);
    await ctx.answerCbQuery();
  }

  async handleDetailCallback(ctx, callbackData) {
    const laptopId = callbackData.replace('detail_', '');
    await productHandler.showProductDetail(ctx, laptopId);
    await ctx.answerCbQuery();
  }

  async handleOrderCallback(ctx, callbackData) {
    if (callbackData === 'order_from_gallery') {
      // Handle order from gallery - need to get laptop ID from context
      await ctx.answerCbQuery('Please go back to product details to place an order.');
      return;
    }
    
    const laptopId = callbackData.replace('order_', '');
    
    if (callbackData.startsWith('confirm_order_')) {
      await productHandler.confirmOrder(ctx, laptopId);
    } else if (callbackData.startsWith('cancel_order_')) {
      await productHandler.cancelOrder(ctx, laptopId);
    } else {
      await productHandler.handleOrderAction(ctx, laptopId);
    }
    
    await ctx.answerCbQuery();
  }

  async handleImageCallback(ctx, callbackData) {
    const parts = callbackData.split('_');
    
    if (parts.length < 3) {
      await ctx.answerCbQuery('Invalid image action');
      return;
    }
    
    const action = parts[1];
    const laptopId = parts[2];
    const imageIndex = parseInt(parts[3]) || 0;
    
    if (action === 'prev' || action === 'next') {
      await productHandler.handleImageNavigation(ctx, action, laptopId, imageIndex);
    } else if (action === 'info') {
      await ctx.answerCbQuery(`Image ${imageIndex + 1}`);
      return;
    }
    
    await ctx.answerCbQuery();
  }

  async handleSearchCallback(ctx, callbackData) {
    if (callbackData === 'search') {
      await commandsHandler.handleSearch(ctx);
    } else if (callbackData === 'search_by_name') {
      await ctx.reply('Please enter the laptop name you\'re looking for:');
    }
    
    await ctx.answerCbQuery();
  }

  async handleMenuCallback(ctx, callbackData) {
    if (callbackData === 'main_menu' || callbackData === 'browse_laptops') {
      await commandsHandler.handleCatalog(ctx);
    }
    
    await ctx.answerCbQuery();
  }

  async handleBackCallback(ctx, callbackData) {
    if (callbackData === 'back_to_catalog') {
      await commandsHandler.handleCatalog(ctx);
    } else if (callbackData === 'back_to_detail') {
      // Handle back to detail - need to get laptop ID from context
      await ctx.answerCbQuery('Please use the main menu to navigate.');
    }
    
    await ctx.answerCbQuery();
  }

  async handleApplyFilters(ctx) {
    try {
      const chatId = ctx.from.id.toString();
      const session = await databaseService.getUserSession(chatId);
      
      if (!session) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      // Reload laptops with current filters
      await catalogHandler.loadMoreLaptops(ctx, session);
      
    } catch (error) {
      console.error('Error applying filters:', error);
      await ctx.reply('Sorry, there was an error applying filters. Please try again.');
    }
    
    await ctx.answerCbQuery();
  }
}

module.exports = new CallbacksHandler();