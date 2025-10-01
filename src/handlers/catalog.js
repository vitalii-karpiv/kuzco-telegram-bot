// Catalog handler for Kuzco Telegram Bot
const laptopService = require('../services/laptop');
const databaseService = require('../services/database');
const catalogCard = require('../components/catalogCard');

class CatalogHandler {
  async showLaptop(ctx, laptop, position, total) {
    try {
      // Format laptop for display
      const formattedLaptop = laptopService.formatLaptopForDisplay(laptop);
      
      // Get main image
      const mainImage = await laptopService.getLaptopMainImage(laptop);
      
      // Create caption
      const caption = catalogCard.formatLaptopCard(formattedLaptop, position, total);
      
      // Create keyboard
      const keyboard = catalogCard.createNavigationKeyboard(position, total, position < total);
      
      // Send or edit message
      if (ctx.callbackQuery) {
        // Edit existing message
        if (mainImage) {
          await ctx.editMessageMedia({
            type: 'photo',
            media: mainImage.url,
            caption: caption,
            parse_mode: 'Markdown'
          });
        } else {
          await ctx.editMessageText(caption, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
          });
        }
      } else {
        // Send new message
        if (mainImage) {
          await ctx.replyWithPhoto(mainImage.url, {
            caption: caption,
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
          });
        } else {
          await ctx.reply(caption, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup
          });
        }
      }
      
    } catch (error) {
      console.error('Error showing laptop:', error);
      await ctx.reply('Sorry, there was an error loading the laptop. Please try again.');
    }
  }

  async handleNavigation(ctx, action) {
    try {
      const chatId = ctx.from.id.toString();
      const session = await databaseService.getUserSession(chatId);
      
      if (!session) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      let newPosition = session.currentPosition;
      const loadedLaptops = session.loadedLaptops || [];
      
      if (action === 'next') {
        newPosition += 1;
        
        // Check if we need to load more laptops
        if (newPosition >= loadedLaptops.length) {
          await this.loadMoreLaptops(ctx, session);
          return;
        }
      } else if (action === 'prev') {
        newPosition = Math.max(0, newPosition - 1);
      }
      
      // Update session
      await databaseService.updateUserSession(chatId, {
        currentPosition: newPosition
      });
      
      // Get laptop details
      const laptopId = loadedLaptops[newPosition];
      if (!laptopId) {
        await ctx.reply('No more laptops available.');
        return;
      }
      
      const laptop = await laptopService.fetchLaptopById(laptopId);
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      // Show laptop
      await this.showLaptop(ctx, laptop, newPosition + 1, loadedLaptops.length);
      
    } catch (error) {
      console.error('Error handling navigation:', error);
      await ctx.reply('Sorry, there was an error navigating. Please try again.');
    }
  }

  async loadMoreLaptops(ctx, session) {
    try {
      const chatId = ctx.from.id.toString();
      const loadedLaptops = session.loadedLaptops || [];
      const offset = loadedLaptops.length;
      
      // Fetch more laptops
      const result = await laptopService.fetchLaptops(
        session.activeFilters || {},
        offset,
        10
      );
      
      if (result.laptops.length === 0) {
        await ctx.reply('No more laptops available.');
        return;
      }
      
      // Update session with new laptops
      const newLaptopIds = result.laptops.map(laptop => laptop._id);
      await databaseService.updateUserSession(chatId, {
        loadedLaptops: [...loadedLaptops, ...newLaptopIds]
      });
      
      // Show the first new laptop
      const firstLaptop = result.laptops[0];
      const newPosition = loadedLaptops.length;
      
      await this.showLaptop(ctx, firstLaptop, newPosition + 1, loadedLaptops.length + result.laptops.length);
      
    } catch (error) {
      console.error('Error loading more laptops:', error);
      await ctx.reply('Sorry, there was an error loading more laptops. Please try again.');
    }
  }

  async handleFilterSelection(ctx, filterType, value) {
    try {
      const chatId = ctx.from.id.toString();
      const session = await databaseService.getUserSession(chatId);
      
      if (!session) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      const activeFilters = session.activeFilters || {};
      
      // Update filters based on type
      switch (filterType) {
        case 'brand':
          if (!activeFilters.brands) activeFilters.brands = [];
          if (activeFilters.brands.includes(value)) {
            activeFilters.brands = activeFilters.brands.filter(b => b !== value);
          } else {
            activeFilters.brands.push(value);
          }
          break;
          
        case 'ram':
          activeFilters.ram = activeFilters.ram === value ? undefined : value;
          break;
          
        case 'ssd':
          activeFilters.ssd = activeFilters.ssd === value ? undefined : value;
          break;
          
        case 'price':
          activeFilters.priceRange = activeFilters.priceRange === value ? undefined : value;
          break;
      }
      
      // Update session
      await databaseService.updateUserSession(chatId, {
        activeFilters: activeFilters,
        currentPosition: 0,
        loadedLaptops: []
      });
      
      // Reload laptops with new filters
      await this.loadMoreLaptops(ctx, { ...session, activeFilters });
      
    } catch (error) {
      console.error('Error handling filter selection:', error);
      await ctx.reply('Sorry, there was an error applying filters. Please try again.');
    }
  }

  async clearFilters(ctx) {
    try {
      const chatId = ctx.from.id.toString();
      
      // Update session to clear filters
      await databaseService.updateUserSession(chatId, {
        activeFilters: {},
        currentPosition: 0,
        loadedLaptops: []
      });
      
      // Reload laptops without filters
      const session = await databaseService.getUserSession(chatId);
      await this.loadMoreLaptops(ctx, session);
      
    } catch (error) {
      console.error('Error clearing filters:', error);
      await ctx.reply('Sorry, there was an error clearing filters. Please try again.');
    }
  }

  async showFilters(ctx) {
    try {
      const availableFilters = await laptopService.getAvailableFilters();
      const chatId = ctx.from.id.toString();
      const session = await databaseService.getUserSession(chatId);
      const activeFilters = session?.activeFilters || {};
      
      const keyboard = catalogCard.createFilterKeyboard(availableFilters, activeFilters);
      
      await ctx.reply('🔧 *Filters*\n\nChoose filters to narrow down your search:', {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error showing filters:', error);
      await ctx.reply('Sorry, there was an error loading filters. Please try again.');
    }
  }
}

module.exports = new CatalogHandler();
