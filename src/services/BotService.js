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
    this.userStates = new Map(); // Store { index, viewMode } per user
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

    // Handle details button callback
    this.bot.action(/^details_([^_]+)_(\d+)$/, async (ctx) => {
      await this.handleDetailsCallback(ctx);
    });

    // Handle back button callback
    this.bot.action(/^back_([^_]+)_(\d+)$/, async (ctx) => {
      await this.handleBackCallback(ctx);
    });

    // Handle order button callback
    this.bot.action(/^order_([^_]+)_(\d+)_(\d+)$/, async (ctx) => {
      await this.handleOrderCallback(ctx);
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

      // Reset to first group with basic view mode
      this.userStates.set(userId, { index: 0, viewMode: 'basic' });
      await this.showLaptopGroup(ctx, 0, false, 'basic');
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

      // Get current view mode or default to 'basic'
      const currentState = this.userStates.get(userId) || { index: currentIndex, viewMode: 'basic' };
      const viewMode = currentState.viewMode || 'basic';

      // Update user state
      this.userStates.set(userId, { index: newIndex, viewMode });

      // Answer callback query to remove loading state
      await ctx.answerCbQuery();

      // Show the new laptop group with preserved view mode
      await this.showLaptopGroup(ctx, newIndex, true, viewMode);
    } catch (error) {
      console.error('Error in handleNavigationCallback:', error);
      await ctx.answerCbQuery('Помилка навігації.');
    }
  }

  /**
   * Handle details button callback - show detailed view with variants
   * @param {Object} ctx - Telegraf context
   */
  async handleDetailsCallback(ctx) {
    try {
      const userId = ctx.from.id;
      const match = ctx.match;
      const groupId = match[1];
      const index = parseInt(match[2], 10);

      // Update user state to detailed view
      this.userStates.set(userId, { index, viewMode: 'detailed' });

      // Answer callback query
      await ctx.answerCbQuery();

      // Send new message with detailed view (don't edit existing message)
      await this.showLaptopGroup(ctx, index, false, 'detailed');
    } catch (error) {
      console.error('Error in handleDetailsCallback:', error);
      await ctx.answerCbQuery('Помилка відображення деталей.');
    }
  }

  /**
   * Handle back button callback - return to basic view
   * @param {Object} ctx - Telegraf context
   */
  async handleBackCallback(ctx) {
    try {
      const userId = ctx.from.id;
      const match = ctx.match;
      const groupId = match[1];
      const index = parseInt(match[2], 10);

      // Update user state to basic view
      this.userStates.set(userId, { index, viewMode: 'basic' });

      // Answer callback query
      await ctx.answerCbQuery();

      // Show basic view
      await this.showLaptopGroup(ctx, index, true, 'basic');
    } catch (error) {
      console.error('Error in handleBackCallback:', error);
      await ctx.answerCbQuery('Помилка повернення.');
    }
  }

  /**
   * Handle order button callback - show confirmation message
   * @param {Object} ctx - Telegraf context
   */
  async handleOrderCallback(ctx) {
    try {
      const match = ctx.match;
      const groupId = match[1];
      const variantIndex = parseInt(match[2], 10);
      const index = parseInt(match[3], 10);

      const group = this.laptopGroupService.getLaptopGroup(index);
      if (!group || !group.variants || !group.variants[variantIndex]) {
        await ctx.answerCbQuery('Варіант не знайдено.');
        return;
      }

      const variant = group.variants[variantIndex];
      const price = variant.price || 'N/A';

      // Answer callback query
      await ctx.answerCbQuery();

      // Show confirmation message
      await ctx.reply(
        `Ваше замовлення прийнято! Найближчим часом з вами зв'яжеться менеджер.\n\n` +
        `Ноутбук: ${group.title || 'N/A'}\n` +
        `Ціна: ${price} грн`
      );
    } catch (error) {
      console.error('Error in handleOrderCallback:', error);
      await ctx.answerCbQuery('Помилка оформлення замовлення.');
    }
  }

  /**
   * Show laptop group at specified index
   * @param {Object} ctx - Telegraf context
   * @param {number} index - Group index
   * @param {boolean} editMessage - Whether to edit existing message or send new one
   * @param {string} viewMode - View mode: 'basic' or 'detailed' (default: 'basic')
   */
  async showLaptopGroup(ctx, index, editMessage = false, viewMode = 'basic') {
    try {
      const group = this.laptopGroupService.getLaptopGroup(index);
      const totalCount = this.laptopGroupService.getLaptopGroupCount();

      if (!group) {
        await ctx.reply('Ноутбук не знайдено.');
        return;
      }

      // Format message based on view mode
      let messageText;
      if (viewMode === 'detailed') {
        messageText = this.messageFormatter.formatLaptopGroupMessageDetailed(
          group,
          index,
          totalCount
        );
      } else {
        messageText = this.messageFormatter.formatLaptopGroupMessageBasic(
          group,
          index,
          totalCount
        );
      }

      // Create keyboard based on view mode
      let keyboard;
      const groupId = group._id || group.id || `group_${index}`;
      
      if (viewMode === 'detailed') {
        keyboard = this.messageFormatter.createDetailedViewKeyboard(
          index,
          totalCount,
          groupId,
          group.variants || []
        );
      } else {
        keyboard = this.messageFormatter.createBasicViewKeyboard(
          index,
          totalCount,
          groupId
        );
      }

      // For detailed view, load all images and send them together in a media group
      if (viewMode === 'detailed') {
        try {
          // Load additional group images
          const additionalImages = await this.laptopGroupService.getGroupImages(groupId);
          
          // Collect all image URLs
          const allImageUrls = [];
          
          // Add main image if it exists
          if (group.imageUrl) {
            allImageUrls.push(group.imageUrl);
          }
          
          // Add additional images, filtering out duplicates
          additionalImages.forEach((img) => {
            if (img.s3Url && img.s3Url !== group.imageUrl) {
              allImageUrls.push(img.s3Url);
            }
          });

          // If we have images, send as media group
          if (allImageUrls.length > 0) {
            // Telegram allows up to 10 media items in a media group
            const batchSize = 10;
            const firstBatch = allImageUrls.slice(0, batchSize);
            
            // Create media group - first image has caption and keyboard
            const mediaGroup = firstBatch.map((url, idx) => ({
              type: 'photo',
              media: url,
              caption: idx === 0 ? messageText : undefined,
              parse_mode: idx === 0 ? 'Markdown' : undefined,
            }));

            if (editMessage && ctx.callbackQuery) {
              // Can't edit media groups, so send new message
              await ctx.replyWithMediaGroup(mediaGroup, {
                reply_markup: keyboard.reply_markup,
              });
            } else {
              await ctx.replyWithMediaGroup(mediaGroup, {
                reply_markup: keyboard.reply_markup,
              });
            }

            // Send remaining images in batches if any
            if (allImageUrls.length > batchSize) {
              for (let i = batchSize; i < allImageUrls.length; i += batchSize) {
                const batch = allImageUrls.slice(i, i + batchSize);
                const mediaGroupBatch = batch.map((url) => ({
                  type: 'photo',
                  media: url,
                }));
                await ctx.replyWithMediaGroup(mediaGroupBatch);
              }
            }
          } else {
            // No images, send text only
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
          console.error('Error loading group images:', error);
          // Fallback: send with main image or text only
          if (group.imageUrl) {
            if (editMessage && ctx.callbackQuery) {
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
              } catch (err) {
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
        }
      } else {
        // Basic view - send single message as before
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

