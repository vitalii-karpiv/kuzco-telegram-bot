// Product detail component for Kuzco Telegram Bot
const { Markup } = require('telegraf');

class ProductDetailComponent {
  formatProductDetail(laptop) {
    const specs = laptop.characteristics || {};
    
    let caption = `🖥️ *${laptop.name}*\n\n`;
    
    // Basic info
    if (laptop.brand) {
      caption += `🏷️ *Brand:* ${laptop.brand}\n`;
    }
    
    if (laptop.model) {
      caption += `📱 *Model:* ${laptop.model}\n`;
    }
    
    if (laptop.submodel) {
      caption += `🔧 *Submodel:* ${laptop.submodel}\n`;
    }
    
    if (laptop.serviceTag) {
      caption += `🏷️ *Service Tag:* ${laptop.serviceTag}\n`;
    }
    
    caption += `\n💻 *Detailed Specifications:*\n`;
    
    // Processor
    if (specs.processor) {
      caption += `• *Processor:* ${specs.processor}\n`;
    }
    
    // RAM
    if (specs.ram) {
      caption += `• *RAM:* ${specs.ram}GB\n`;
    }
    
    // Storage
    if (specs.ssd) {
      caption += `• *SSD:* ${specs.ssd}GB\n`;
    }
    
    // Graphics
    if (specs.videocard) {
      caption += `• *Graphics:* ${specs.videocard}`;
      if (specs.discrete) {
        caption += ` (Dedicated)`;
      } else {
        caption += ` (Integrated)`;
      }
      caption += `\n`;
    }
    
    // Display
    if (specs.screenSize) {
      caption += `• *Screen Size:* ${specs.screenSize}"\n`;
    }
    
    if (specs.resolution) {
      caption += `• *Resolution:* ${specs.resolution}\n`;
    }
    
    if (specs.panelType) {
      caption += `• *Panel Type:* ${specs.panelType}\n`;
    }
    
    if (specs.refreshRate) {
      caption += `• *Refresh Rate:* ${specs.refreshRate}\n`;
    }
    
    if (specs.touch) {
      caption += `• *Touch Screen:* Yes\n`;
    }
    
    if (specs.keyLight) {
      caption += `• *Keyboard Backlight:* Yes\n`;
    }
    
    // Battery
    if (specs.battery) {
      caption += `• *Battery:* ${specs.battery}Wh\n`;
    }
    
    // Ports
    if (specs.ports && specs.ports.length > 0) {
      caption += `• *Ports:* ${specs.ports.join(', ')}\n`;
    }
    
    // Pricing
    caption += `\n💰 *Pricing:*\n`;
    if (laptop.sellPrice) {
      caption += `• *Selling Price:* $${laptop.sellPrice.toLocaleString()}\n`;
    }
    
    if (laptop.limitPrice) {
      caption += `• *Limit Price:* $${laptop.limitPrice.toLocaleString()}\n`;
    }
    
    // State
    if (laptop.state) {
      caption += `• *Status:* ${laptop.state}\n`;
    }
    
    // Notes
    if (laptop.note) {
      caption += `\n📝 *Notes:*\n${laptop.note}\n`;
    }
    
    // Defects
    if (laptop.defects && laptop.defects.length > 0) {
      caption += `\n⚠️ *Defects:*\n${laptop.defects.map(defect => `• ${defect}`).join('\n')}\n`;
    }
    
    return caption;
  }

  createProductDetailKeyboard(laptopId) {
    const keyboard = [
      [
        Markup.button.callback('🛒 Order Now', `order_${laptopId}`),
        Markup.button.callback('🖼️ View Images', `images_${laptopId}`)
      ],
      [
        Markup.button.callback('⬅️ Back to Catalog', 'back_to_catalog'),
        Markup.button.callback('🔍 Search Again', 'search')
      ],
      [
        Markup.button.callback('🏠 Main Menu', 'main_menu')
      ]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  createImageGalleryKeyboard(images, currentIndex, totalImages) {
    const keyboard = [];
    
    // Image navigation
    if (totalImages > 1) {
      const navRow = [];
      
      if (currentIndex > 0) {
        navRow.push(Markup.button.callback('⬅️ Previous', `img_prev_${currentIndex}`));
      }
      
      navRow.push(Markup.button.callback(
        `${currentIndex + 1}/${totalImages}`,
        `img_info_${currentIndex}`
      ));
      
      if (currentIndex < totalImages - 1) {
        navRow.push(Markup.button.callback('Next ➡️', `img_next_${currentIndex}`));
      }
      
      keyboard.push(navRow);
    }
    
    // Action buttons
    const actionRow = [
      Markup.button.callback('🛒 Order', `order_from_gallery`),
      Markup.button.callback('⬅️ Back to Details', `back_to_detail`)
    ];
    keyboard.push(actionRow);
    
    // Back to catalog
    keyboard.push([Markup.button.callback('🏠 Back to Catalog', 'back_to_catalog')]);
    
    return Markup.inlineKeyboard(keyboard);
  }

  createOrderConfirmationKeyboard(laptopId) {
    const keyboard = [
      [
        Markup.button.callback('✅ Confirm Order', `confirm_order_${laptopId}`),
        Markup.button.callback('❌ Cancel', `cancel_order_${laptopId}`)
      ],
      [
        Markup.button.callback('⬅️ Back to Details', `detail_${laptopId}`)
      ]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  createOrderSuccessKeyboard() {
    const keyboard = [
      [Markup.button.callback('🖥️ Browse More Laptops', 'browse_laptops')],
      [Markup.button.callback('🔍 Search Again', 'search')],
      [Markup.button.callback('🏠 Main Menu', 'main_menu')]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  // Helper method to format image caption
  formatImageCaption(laptop, imageIndex, totalImages) {
    let caption = `🖼️ *${laptop.name}*\n`;
    caption += `Image ${imageIndex + 1} of ${totalImages}\n\n`;
    
    if (laptop.brand) {
      caption += `🏷️ ${laptop.brand}`;
    }
    
    if (laptop.sellPrice) {
      caption += ` • 💰 $${laptop.sellPrice.toLocaleString()}`;
    }
    
    return caption;
  }

  // Helper method to format order confirmation
  formatOrderConfirmation(laptop) {
    let message = `🛒 *Order Confirmation*\n\n`;
    message += `You are about to order:\n`;
    message += `🖥️ *${laptop.name}*\n`;
    
    if (laptop.brand) {
      message += `🏷️ Brand: ${laptop.brand}\n`;
    }
    
    if (laptop.sellPrice) {
      message += `💰 Price: $${laptop.sellPrice.toLocaleString()}\n`;
    }
    
    message += `\n⚠️ *Please confirm your order.*\n`;
    message += `Our manager will contact you shortly to arrange payment and delivery.`;
    
    return message;
  }

  // Helper method to format order success message
  formatOrderSuccess(sale) {
    let message = `✅ *Order Created Successfully!*\n\n`;
    message += `🆔 *Order ID:* \`${sale.id}\`\n`;
    message += `📅 *Date:* ${new Date(sale.createdAt).toLocaleString()}\n`;
    message += `📊 *Status:* ${sale.status}\n\n`;
    message += `Our manager will contact you shortly to confirm the order details and arrange delivery.\n\n`;
    message += `Thank you for choosing Kuzco! 🚀`;
    
    return message;
  }
}

module.exports = new ProductDetailComponent();
