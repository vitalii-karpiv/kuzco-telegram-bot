const { Telegraf } = require('telegraf');

class BotService {
  constructor(botToken, laptopGroupService, messageFormatter) {
    if (!botToken) {
      throw new Error('Bot token is required for BotService');
    }
    if (!laptopGroupService) {
      throw new Error('LaptopGroupService is required for BotService');
    }
    if (!messageFormatter) {
      throw new Error('MessageFormatter is required for BotService');
    }

    this.bot = new Telegraf(botToken);
    this.laptopGroupService = laptopGroupService;
    this.messageFormatter = messageFormatter;
    this.userStates = new Map(); // Store current index per user
  }

  /**
   * Initialize bot commands and handlers
   */
  initialize() {
    this.setupMenu();
    this.setupHandlers();
  }

  /**
   * Setup menu button "каталог ноутбуків"
   */
  async setupMenu() {
    try {
      await this.bot.telegram.setMyCommands([
        {
          command: 'catalog',
          description: 'Каталог ноутбуків',
        },
      ]);

      await this.bot.telegram.setChatMenuButton({
        menu_button: {
          type: 'commands',
        },
      });
    } catch (error) {
      console.error('Error setting up menu:', error.message);
    }
  }

  /**
   * Setup command and callback handlers
   */
  setupHandlers() {
    // Handle /catalog command or menu button click
    this.bot.command('catalog', async (ctx) => {
      await this.handleCatalogCommand(ctx);
    });

    // Handle navigation callbacks
    this.bot.action(/^nav_(prev|next)_(\d+)$/, async (ctx) => {
      await this.handleNavigationCallback(ctx);
    });

    // Handle errors
    this.bot.catch((err, ctx) => {
      console.error('Error in bot:', err);
      ctx.reply('Виникла помилка. Спробуйте пізніше.');
    });
  }

  /**
   * Handle catalog command - show first laptop group
   * @param {Object} ctx - Telegraf context
   */
  async handleCatalogCommand(ctx) {
    try {
      const userId = ctx.from.id;

      // Load laptop groups if not loaded
      if (!this.laptopGroupService.isLoaded()) {
        await ctx.reply('Завантаження каталогу...');
        await this.laptopGroupService.loadLaptopGroups();
      }

      const totalCount = this.laptopGroupService.getLaptopGroupCount();

      if (totalCount === 0) {
        await ctx.reply('Каталог порожній. Спробуйте пізніше.');
        return;
      }

      // Reset to first group
      this.userStates.set(userId, 0);
      await this.showLaptopGroup(ctx, 0);
    } catch (error) {
      console.error('Error in handleCatalogCommand:', error);
      await ctx.reply(
        'Не вдалося завантажити каталог. Спробуйте пізніше.'
      );
    }
  }

  /**
   * Handle navigation callback (Previous/Next)
   * @param {Object} ctx - Telegraf context
   */
  async handleNavigationCallback(ctx) {
    try {
      const userId = ctx.from.id;
      const match = ctx.match;
      const direction = match[1]; // 'prev' or 'next'
      const currentIndex = parseInt(match[2], 10);

      const totalCount = this.laptopGroupService.getLaptopGroupCount();

      if (totalCount === 0) {
        await ctx.answerCbQuery('Каталог порожній.');
        return;
      }

      let newIndex = currentIndex;

      if (direction === 'prev') {
        newIndex = Math.max(0, currentIndex - 1);
      } else if (direction === 'next') {
        newIndex = Math.min(totalCount - 1, currentIndex + 1);
      }

      // Update user state
      this.userStates.set(userId, newIndex);

      // Answer callback query to remove loading state
      await ctx.answerCbQuery();

      // Show the new laptop group
      await this.showLaptopGroup(ctx, newIndex, true);
    } catch (error) {
      console.error('Error in handleNavigationCallback:', error);
      await ctx.answerCbQuery('Помилка навігації.');
    }
  }

  /**
   * Show laptop group at specified index
   * @param {Object} ctx - Telegraf context
   * @param {number} index - Group index
   * @param {boolean} editMessage - Whether to edit existing message or send new one
   */
  async showLaptopGroup(ctx, index, editMessage = false) {
    try {
      const group = this.laptopGroupService.getLaptopGroup(index);
      const totalCount = this.laptopGroupService.getLaptopGroupCount();

      if (!group) {
        await ctx.reply('Ноутбук не знайдено.');
        return;
      }

      // Format message
      const messageText = this.messageFormatter.formatLaptopGroupMessage(
        group,
        index,
        totalCount
      );

      // Create navigation keyboard
      const keyboard = this.messageFormatter.createNavigationKeyboard(
        index,
        totalCount
      );

      // Send or edit message with photo
      if (group.imageUrl) {
        if (editMessage && ctx.callbackQuery) {
          // Edit previous message
          try {
            await ctx.editMessageMedia(
              {
                type: 'photo',
                media: group.imageUrl,
                caption: messageText,
                parse_mode: 'Markdown',
              },
              keyboard
            );
          } catch (error) {
            // If editing fails (e.g., different media type), send new message
            await ctx.replyWithPhoto(group.imageUrl, {
              caption: messageText,
              parse_mode: 'Markdown',
              reply_markup: keyboard.reply_markup,
            });
          }
        } else {
          await ctx.replyWithPhoto(group.imageUrl, {
            caption: messageText,
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup,
          });
        }
      } else {
        // No image, send text only
        if (editMessage && ctx.callbackQuery) {
          await ctx.editMessageText(messageText, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup,
          });
        } else {
          await ctx.reply(messageText, {
            parse_mode: 'Markdown',
            reply_markup: keyboard.reply_markup,
          });
        }
      }
    } catch (error) {
      console.error('Error in showLaptopGroup:', error);
      await ctx.reply('Не вдалося відобразити інформацію про ноутбук.');
    }
  }

  /**
   * Start the bot
   */
  async start() {
    try {
      await this.bot.launch();
      console.log('Bot started successfully');
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop() {
    try {
      this.bot.stop();
      console.log('Bot stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  }
}

module.exports = BotService;

