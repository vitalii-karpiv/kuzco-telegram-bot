// Search handler for Kuzco Telegram Bot
const laptopService = require('../services/laptop');
const databaseService = require('../services/database');
const catalogCard = require('../components/catalogCard');

class SearchHandler {
  async handleSearchQuery(ctx, query) {
    try {
      const chatId = ctx.from.id.toString();
      
      if (!query || query.trim().length === 0) {
        await ctx.reply('Please enter a search query.');
        return;
      }
      
      // Update session with search query
      await databaseService.updateUserSession(chatId, {
        searchQuery: query.trim(),
        currentPosition: 0,
        loadedLaptops: []
      });
      
      // Perform search
      const result = await laptopService.searchLaptopsByName(query.trim());
      
      if (result.laptops.length === 0) {
        await ctx.reply(`No laptops found for "${query}". Try a different search term.`, {
          reply_markup: catalogCard.createSearchKeyboard().reply_markup
        });
        return;
      }
      
      // Update session with search results
      const laptopIds = result.laptops.map(laptop => laptop._id);
      await databaseService.updateUserSession(chatId, {
        loadedLaptops: laptopIds
      });
      
      // Show first result
      const firstLaptop = result.laptops[0];
      const caption = catalogCard.formatLaptopCard(
        laptopService.formatLaptopForDisplay(firstLaptop),
        1,
        result.laptops.length
      );
      
      const keyboard = catalogCard.createNavigationKeyboard(1, result.laptops.length, result.hasMore);
      
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error handling search query:', error);
      await ctx.reply('Sorry, there was an error searching. Please try again.');
    }
  }

  async showSearchResults(ctx, results, position, total) {
    try {
      if (results.length === 0) {
        await ctx.reply('No search results found.');
        return;
      }
      
      const laptop = results[position - 1];
      const formattedLaptop = laptopService.formatLaptopForDisplay(laptop);
      
      const caption = catalogCard.formatLaptopCard(formattedLaptop, position, total);
      const keyboard = catalogCard.createNavigationKeyboard(position, total, position < total);
      
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error showing search results:', error);
      await ctx.reply('Sorry, there was an error showing search results. Please try again.');
    }
  }

  async handleSearchNavigation(ctx, action) {
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
        
        // Check if we need to load more results
        if (newPosition >= loadedLaptops.length) {
          await this.loadMoreSearchResults(ctx, session);
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
        await ctx.reply('No more search results available.');
        return;
      }
      
      const laptop = await laptopService.fetchLaptopById(laptopId);
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      // Show laptop
      const formattedLaptop = laptopService.formatLaptopForDisplay(laptop);
      const caption = catalogCard.formatLaptopCard(formattedLaptop, newPosition + 1, loadedLaptops.length);
      const keyboard = catalogCard.createNavigationKeyboard(newPosition + 1, loadedLaptops.length, newPosition < loadedLaptops.length - 1);
      
      await ctx.editMessageText(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error handling search navigation:', error);
      await ctx.reply('Sorry, there was an error navigating search results. Please try again.');
    }
  }

  async loadMoreSearchResults(ctx, session) {
    try {
      const chatId = ctx.from.id.toString();
      const loadedLaptops = session.loadedLaptops || [];
      const offset = loadedLaptops.length;
      const searchQuery = session.searchQuery;
      
      if (!searchQuery) {
        await ctx.reply('No search query found.');
        return;
      }
      
      // Fetch more search results
      const result = await laptopService.searchLaptopsByName(
        searchQuery,
        session.activeFilters || {},
        offset,
        10
      );
      
      if (result.laptops.length === 0) {
        await ctx.reply('No more search results available.');
        return;
      }
      
      // Update session with new results
      const newLaptopIds = result.laptops.map(laptop => laptop._id);
      await databaseService.updateUserSession(chatId, {
        loadedLaptops: [...loadedLaptops, ...newLaptopIds]
      });
      
      // Show the first new result
      const firstLaptop = result.laptops[0];
      const newPosition = loadedLaptops.length;
      
      const formattedLaptop = laptopService.formatLaptopForDisplay(firstLaptop);
      const caption = catalogCard.formatLaptopCard(formattedLaptop, newPosition + 1, loadedLaptops.length + result.laptops.length);
      const keyboard = catalogCard.createNavigationKeyboard(newPosition + 1, loadedLaptops.length + result.laptops.length, result.hasMore);
      
      await ctx.editMessageText(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error loading more search results:', error);
      await ctx.reply('Sorry, there was an error loading more search results. Please try again.');
    }
  }

  async handleSearchFilters(ctx, filters) {
    try {
      const chatId = ctx.from.id.toString();
      const session = await databaseService.getUserSession(chatId);
      
      if (!session) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      // Update session with filters
      await databaseService.updateUserSession(chatId, {
        activeFilters: filters,
        currentPosition: 0,
        loadedLaptops: []
      });
      
      // Perform new search with filters
      const searchQuery = session.searchQuery;
      if (searchQuery) {
        await this.handleSearchQuery(ctx, searchQuery);
      } else {
        await ctx.reply('Please enter a search query first.');
      }
      
    } catch (error) {
      console.error('Error handling search filters:', error);
      await ctx.reply('Sorry, there was an error applying search filters. Please try again.');
    }
  }

  async clearSearch(ctx) {
    try {
      const chatId = ctx.from.id.toString();
      
      // Clear search query and filters
      await databaseService.updateUserSession(chatId, {
        searchQuery: '',
        activeFilters: {},
        currentPosition: 0,
        loadedLaptops: []
      });
      
      await ctx.reply('Search cleared. You can start a new search or browse the catalog.', {
        reply_markup: catalogCard.createSearchKeyboard().reply_markup
      });
      
    } catch (error) {
      console.error('Error clearing search:', error);
      await ctx.reply('Sorry, there was an error clearing search. Please try again.');
    }
  }
}

module.exports = new SearchHandler();
