// Product handler for Kuzco Telegram Bot
const laptopService = require('../services/laptop');
const saleService = require('../services/sale');
const customerService = require('../services/customer');
const productDetail = require('../components/productDetail');

class ProductHandler {
  async showProductDetail(ctx, laptopId) {
    try {
      const laptop = await laptopService.fetchLaptopById(laptopId);
      
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      const caption = productDetail.formatProductDetail(laptop);
      const keyboard = productDetail.createProductDetailKeyboard(laptopId);
      
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error showing product detail:', error);
      await ctx.reply('Sorry, there was an error loading product details. Please try again.');
    }
  }

  async handleOrderAction(ctx, laptopId) {
    try {
      const laptop = await laptopService.fetchLaptopById(laptopId);
      
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      const confirmationMessage = productDetail.formatOrderConfirmation(laptop);
      const keyboard = productDetail.createOrderConfirmationKeyboard(laptopId);
      
      await ctx.reply(confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error handling order action:', error);
      await ctx.reply('Sorry, there was an error processing your order. Please try again.');
    }
  }

  async confirmOrder(ctx, laptopId) {
    try {
      const chatId = ctx.from.id.toString();
      
      // Get customer
      const customer = await customerService.getCustomerByChatId(chatId);
      if (!customer) {
        await ctx.reply('Please start the bot first with /start');
        return;
      }
      
      // Create sale
      const sale = await saleService.createSale(laptopId, customer.id, chatId);
      
      // Send confirmation
      const successMessage = productDetail.formatOrderSuccess(sale);
      const keyboard = productDetail.createOrderSuccessKeyboard();
      
      await ctx.reply(successMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error confirming order:', error);
      await ctx.reply('Sorry, there was an error creating your order. Please try again later.');
    }
  }

  async cancelOrder(ctx, laptopId) {
    await ctx.reply('Order cancelled. You can continue browsing laptops.', {
      reply_markup: productDetail.createProductDetailKeyboard(laptopId).reply_markup
    });
  }

  async showProductImages(ctx, laptopId, imageIndex = 0) {
    try {
      const laptop = await laptopService.fetchLaptopById(laptopId);
      
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      const images = await laptopService.getLaptopImages(laptop);
      
      if (images.length === 0) {
        await ctx.reply('No images available for this laptop.');
        return;
      }
      
      const currentImage = images[imageIndex];
      const caption = productDetail.formatImageCaption(laptop, imageIndex, images.length);
      const keyboard = productDetail.createImageGalleryKeyboard(images, imageIndex, images.length);
      
      await ctx.replyWithPhoto(currentImage.url, {
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
      
    } catch (error) {
      console.error('Error showing product images:', error);
      await ctx.reply('Sorry, there was an error loading images. Please try again.');
    }
  }

  async handleImageNavigation(ctx, action, laptopId, currentIndex) {
    try {
      const laptop = await laptopService.fetchLaptopById(laptopId);
      
      if (!laptop) {
        await ctx.reply('Laptop not found.');
        return;
      }
      
      const images = await laptopService.getLaptopImages(laptop);
      
      if (images.length === 0) {
        await ctx.reply('No images available for this laptop.');
        return;
      }
      
      let newIndex = currentIndex;
      
      if (action === 'next') {
        newIndex = Math.min(images.length - 1, currentIndex + 1);
      } else if (action === 'prev') {
        newIndex = Math.max(0, currentIndex - 1);
      }
      
      const currentImage = images[newIndex];
      const caption = productDetail.formatImageCaption(laptop, newIndex, images.length);
      const keyboard = productDetail.createImageGalleryKeyboard(images, newIndex, images.length);
      
      await ctx.editMessageMedia({
        type: 'photo',
        media: currentImage.url,
        caption: caption,
        parse_mode: 'Markdown'
      });
      
      await ctx.editMessageReplyMarkup(keyboard.reply_markup);
      
    } catch (error) {
      console.error('Error handling image navigation:', error);
      await ctx.reply('Sorry, there was an error navigating images. Please try again.');
    }
  }
}

module.exports = new ProductHandler();
