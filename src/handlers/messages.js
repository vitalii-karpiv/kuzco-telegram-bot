// Message handlers for Kuzco Telegram Bot
const searchHandler = require('./search');
const databaseService = require('../services/database');

class MessagesHandler {
  async handleTextMessage(ctx) {
    try {
      const chatId = ctx.from.id.toString();
      const messageText = ctx.message.text;
      
      // Get user session to check if they're in search mode
      const session = await databaseService.getUserSession(chatId);
      
      if (!session) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      // Check if user is in search mode
      if (session.searchQuery !== undefined) {
        // User is searching, treat the message as a search query
        await searchHandler.handleSearchQuery(ctx, messageText);
      } else {
        // Default behavior - treat as search query
        await searchHandler.handleSearchQuery(ctx, messageText);
      }
      
    } catch (error) {
      console.error('Error handling text message:', error);
      await ctx.reply('Sorry, there was an error processing your message. Please try again.');
    }
  }

  async handlePhotoMessage(ctx) {
    await ctx.reply('I can only process text messages. Please use the search function to find laptops.');
  }

  async handleDocumentMessage(ctx) {
    await ctx.reply('I can only process text messages. Please use the search function to find laptops.');
  }

  async handleStickerMessage(ctx) {
    await ctx.reply('Thanks for the sticker! 😊 Use the search function to find laptops.');
  }

  async handleLocationMessage(ctx) {
    await ctx.reply('Thanks for sharing your location! Use the search function to find laptops.');
  }

  async handleContactMessage(ctx) {
    await ctx.reply('Thanks for sharing your contact! Use the search function to find laptops.');
  }

  async handleVoiceMessage(ctx) {
    await ctx.reply('I can only process text messages. Please type your search query.');
  }

  async handleVideoMessage(ctx) {
    await ctx.reply('I can only process text messages. Please use the search function to find laptops.');
  }

  async handleAudioMessage(ctx) {
    await ctx.reply('I can only process text messages. Please type your search query.');
  }

  async handleVideoNoteMessage(ctx) {
    await ctx.reply('I can only process text messages. Please type your search query.');
  }

  async handleAnimationMessage(ctx) {
    await ctx.reply('Thanks for the GIF! 😊 Use the search function to find laptops.');
  }

  async handleDiceMessage(ctx) {
    await ctx.reply('Nice roll! 🎲 Use the search function to find laptops.');
  }

  async handlePollMessage(ctx) {
    await ctx.reply('Thanks for the poll! Use the search function to find laptops.');
  }

  async handleVenueMessage(ctx) {
    await ctx.reply('Thanks for the venue info! Use the search function to find laptops.');
  }

  async handleGameMessage(ctx) {
    await ctx.reply('Thanks for the game! Use the search function to find laptops.');
  }

  async handleInvoiceMessage(ctx) {
    await ctx.reply('Thanks for the invoice! Use the search function to find laptops.');
  }

  async handleSuccessfulPaymentMessage(ctx) {
    await ctx.reply('Thanks for the payment! Use the search function to find laptops.');
  }

  async handlePassportDataMessage(ctx) {
    await ctx.reply('Thanks for the passport data! Use the search function to find laptops.');
  }

  async handleProximityAlertTriggeredMessage(ctx) {
    await ctx.reply('Proximity alert triggered! Use the search function to find laptops.');
  }

}

module.exports = new MessagesHandler();