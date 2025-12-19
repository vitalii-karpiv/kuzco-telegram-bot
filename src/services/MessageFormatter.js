const { Markup } = require('telegraf');

class MessageFormatter {
  /**
   * Format laptop group message for Telegram
   * @param {Object} group - Laptop group object
   * @param {number} currentIndex - Current group index (0-based)
   * @param {number} totalCount - Total number of groups
   * @returns {string} Formatted message text
   */
  formatLaptopGroupMessage(group, currentIndex, totalCount) {
    if (!group) {
      return 'Інформація про ноутбук недоступна.';
    }

    let message = '';

    // Title
    if (group.title) {
      message += `*${group.title}*\n\n`;
    }

    // Common specifications
    const specs = [];

    if (group.processor) {
      specs.push(`🧠Процесор: ${group.processor}`);
    }

    if (group.videocard) {
      specs.push(`🎮Відеокарта: ${group.videocard}`);
    }

    // Display info
    const displayParts = [];
    if (group.screenSize) {
      displayParts.push(`${group.screenSize}"`);
    }
    if (group.resolution) {
      displayParts.push(group.resolution);
    }
    if (group.panelType) {
      displayParts.push(group.panelType);
    }
    if (group.refreshRate) {
      displayParts.push(group.refreshRate);
    }

    if (displayParts.length > 0) {
      specs.push(`🖥️Екран: ${displayParts.join(' ')}`);
    }

    if (specs.length > 0) {
      message += specs.join('\n') + '\n\n';
    }

    // Variants
    if (group.variants && Array.isArray(group.variants) && group.variants.length > 0) {
      message += '*Варіанти:*\n';

      group.variants.forEach((variant, index) => {
        const variantParts = [];

        if (variant.ram) {
          variantParts.push(`${variant.ram}GB RAM`);
        }
        if (variant.ssd) {
          variantParts.push(`${variant.ssd}GB SSD`);
        }

        let variantText = '';
        if (variantParts.length > 0) {
          variantText = variantParts.join(' / ');
        } else {
          variantText = `Варіант ${index + 1}`;
        }

        if (variant.price) {
          variantText += ` - ${variant.price} грн`;
        }

        // Add condition and battery if available
        const additionalInfo = [];
        if (variant.condition) {
          additionalInfo.push(`стан: ${variant.condition}`);
        }
        if (variant.battery) {
          additionalInfo.push(`батарея: ${variant.battery}`);
        }

        if (additionalInfo.length > 0) {
          variantText += ` (${additionalInfo.join(', ')})`;
        }

        message += `• ${variantText}\n`;
      });

      // Price range summary
      const prices = group.variants
        .map((v) => v.price)
        .filter((p) => p != null && !isNaN(p));

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          message += `\n*Ціна: ${minPrice} грн*`;
        } else {
          message += `\n*Ціна: від ${minPrice} до ${maxPrice} грн*`;
        }
      }
    } else {
      message += '\nВаріанти недоступні.';
    }

    return message;
  }

  /**
   * Create navigation keyboard with Previous/Next buttons
   * @param {number} currentIndex - Current group index (0-based)
   * @param {number} totalCount - Total number of groups
   * @returns {Object} Telegraf keyboard markup
   */
  createNavigationKeyboard(currentIndex, totalCount) {
    const buttons = [];

    const prevButton = Markup.button.callback(
      '◀ Попередній',
      `nav_prev_${currentIndex}`
    );
    const nextButton = Markup.button.callback(
      'Наступний ▶',
      `nav_next_${currentIndex}`
    );

    if (currentIndex > 0 && currentIndex < totalCount - 1) {
      // Both buttons enabled
      buttons.push([prevButton, nextButton]);
    } else if (currentIndex === 0 && totalCount > 1) {
      // Only Next button enabled
      buttons.push([nextButton]);
    } else if (currentIndex > 0 && currentIndex === totalCount - 1) {
      // Only Previous button enabled
      buttons.push([prevButton]);
    }
    // If only one item or no items, no buttons

    return Markup.inlineKeyboard(buttons);
  }
}

module.exports = MessageFormatter;

