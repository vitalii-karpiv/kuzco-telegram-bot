// Catalog card component for Kuzco Telegram Bot
const { Markup } = require('telegraf');

class CatalogCardComponent {
  formatLaptopCard(laptop, position, total) {
    const specs = laptop.specs || {};
    
    let caption = `🖥️ *${laptop.name}*\n\n`;
    
    if (laptop.brand) {
      caption += `🏷️ *Brand:* ${laptop.brand}\n`;
    }
    
    if (laptop.model) {
      caption += `📱 *Model:* ${laptop.model}\n`;
    }
    
    caption += `\n💻 *Specifications:*\n`;
    caption += `• *CPU:* ${specs.processor}\n`;
    caption += `• *RAM:* ${specs.ram}\n`;
    caption += `• *SSD:* ${specs.ssd}\n`;
    caption += `• *Graphics:* ${specs.graphics}\n`;
    caption += `• *Screen:* ${specs.screen} ${specs.panel ? `(${specs.panel})` : ''}\n`;
    
    caption += `\n💰 *Price:* $${laptop.price?.toLocaleString() || 'N/A'}\n`;
    caption += `\n📍 *${position} of ${total}*`;
    
    return caption;
  }

  createNavigationKeyboard(position, total, hasMore = false) {
    const keyboard = [];
    
    // Navigation row
    const navRow = [];
    
    if (position > 1) {
      navRow.push(Markup.button.callback('⬅️ Previous', 'nav_prev'));
    }
    
    if (position < total || hasMore) {
      navRow.push(Markup.button.callback('Next ➡️', 'nav_next'));
    }
    
    if (navRow.length > 0) {
      keyboard.push(navRow);
    }
    
    // Action row
    const actionRow = [
      Markup.button.callback('🔍 Search', 'search'),
      Markup.button.callback('🔧 Filters', 'filters'),
      Markup.button.callback('ℹ️ Details', `detail_${position}`)
    ];
    
    keyboard.push(actionRow);
    
    // Main menu row
    keyboard.push([Markup.button.callback('🏠 Main Menu', 'main_menu')]);
    
    return Markup.inlineKeyboard(keyboard);
  }

  createFilterKeyboard(availableFilters, activeFilters = {}) {
    const keyboard = [];
    
    // Brand filters
    if (availableFilters.brands && availableFilters.brands.length > 0) {
      keyboard.push([Markup.button.callback('🏷️ Brands', 'filter_brands')]);
      
      const brandRow = [];
      availableFilters.brands.slice(0, 4).forEach(brand => {
        const isActive = activeFilters.brands?.includes(brand);
        brandRow.push(Markup.button.callback(
          `${isActive ? '✅' : '⬜'} ${brand}`,
          `filter_brand_${brand}`
        ));
      });
      keyboard.push(brandRow);
    }
    
    // RAM filters
    if (availableFilters.ramSizes && availableFilters.ramSizes.length > 0) {
      keyboard.push([Markup.button.callback('💾 RAM Size', 'filter_ram')]);
      
      const ramRow = [];
      availableFilters.ramSizes.forEach(ram => {
        const isActive = activeFilters.ram === ram;
        ramRow.push(Markup.button.callback(
          `${isActive ? '✅' : '⬜'} ${ram}GB`,
          `filter_ram_${ram}`
        ));
      });
      keyboard.push(ramRow);
    }
    
    // SSD filters
    if (availableFilters.ssdSizes && availableFilters.ssdSizes.length > 0) {
      keyboard.push([Markup.button.callback('💿 SSD Size', 'filter_ssd')]);
      
      const ssdRow = [];
      availableFilters.ssdSizes.forEach(ssd => {
        const isActive = activeFilters.ssd === ssd;
        ssdRow.push(Markup.button.callback(
          `${isActive ? '✅' : '⬜'} ${ssd}GB`,
          `filter_ssd_${ssd}`
        ));
      });
      keyboard.push(ssdRow);
    }
    
    // Price range filters
    if (availableFilters.priceRanges && availableFilters.priceRanges.length > 0) {
      keyboard.push([Markup.button.callback('💰 Price Range', 'filter_price')]);
      
      const priceRow = [];
      availableFilters.priceRanges.forEach((range, index) => {
        const isActive = activeFilters.priceRange === index;
        priceRow.push(Markup.button.callback(
          `${isActive ? '✅' : '⬜'} ${range.label}`,
          `filter_price_${index}`
        ));
      });
      keyboard.push(priceRow);
    }
    
    // Control buttons
    const controlRow = [
      Markup.button.callback('🔄 Apply Filters', 'apply_filters'),
      Markup.button.callback('🗑️ Clear All', 'clear_filters')
    ];
    keyboard.push(controlRow);
    
    // Back button
    keyboard.push([Markup.button.callback('⬅️ Back to Catalog', 'back_to_catalog')]);
    
    return Markup.inlineKeyboard(keyboard);
  }

  createProductActionKeyboard(laptopId) {
    const keyboard = [
      [
        Markup.button.callback('🛒 Order Now', `order_${laptopId}`),
        Markup.button.callback('🖼️ More Images', `images_${laptopId}`)
      ],
      [
        Markup.button.callback('⬅️ Back to Catalog', 'back_to_catalog'),
        Markup.button.callback('🔍 Search Again', 'search')
      ]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  createSearchKeyboard() {
    const keyboard = [
      [Markup.button.callback('🔍 Search by Name', 'search_by_name')],
      [Markup.button.callback('🔧 Apply Filters', 'filters')],
      [Markup.button.callback('⬅️ Back to Catalog', 'back_to_catalog')]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  createMainMenuKeyboard() {
    const keyboard = [
      [Markup.button.callback('🖥️ Browse Laptops', 'browse_laptops')],
      [Markup.button.callback('🔍 Search', 'search')],
      [Markup.button.callback('🔧 Filters', 'filters')],
      [Markup.button.callback('ℹ️ Help', 'help')]
    ];
    
    return Markup.inlineKeyboard(keyboard);
  }

  // Helper method to show active filters
  formatActiveFilters(activeFilters) {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return 'No filters applied';
    }
    
    let filtersText = 'Active filters:\n';
    
    if (activeFilters.brands && activeFilters.brands.length > 0) {
      filtersText += `• Brands: ${activeFilters.brands.join(', ')}\n`;
    }
    
    if (activeFilters.ram) {
      filtersText += `• RAM: ${activeFilters.ram}GB\n`;
    }
    
    if (activeFilters.ssd) {
      filtersText += `• SSD: ${activeFilters.ssd}GB\n`;
    }
    
    if (activeFilters.priceRange !== undefined) {
      filtersText += `• Price: ${activeFilters.priceRange}\n`;
    }
    
    return filtersText.trim();
  }
}

module.exports = new CatalogCardComponent();
