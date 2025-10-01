// Laptop service for Kuzco Telegram Bot
const axios = require('axios');
const config = require('../config');
const cache = require('./cache');
const googleDrive = require('./googleDrive');

class LaptopService {
  async fetchLaptops(filters = {}, offset = 0, limit = config.itemsPerPage) {
    const cacheKey = cache.KEYS.LAPTOPS(filters, offset);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const requestData = {
        ...filters,
        state: ['selling'], // Only show laptops that are for sale
        sorters: { createdAt: -1 } // Sort by newest first
      };

      const response = await axios.post(`${config.serverUrl}/laptop/list`, requestData, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = {
        laptops: response.data.itemList || [],
        totalCount: response.data.pageInfo?.totalCount || 0,
        hasMore: (offset + limit) < (response.data.pageInfo?.totalCount || 0)
      };

      cache.set(cacheKey, result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      console.error('Error fetching laptops:', error);
      return { laptops: [], totalCount: 0, hasMore: false };
    }
  }

  async fetchLaptopById(id) {
    const cacheKey = cache.KEYS.LAPTOP_DETAIL(id);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${config.serverUrl}/laptop/${id}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      const laptop = response.data;
      cache.set(cacheKey, laptop, 600); // Cache for 10 minutes
      return laptop;
    } catch (error) {
      console.error('Error fetching laptop by ID:', error);
      return null;
    }
  }

  async searchLaptopsByName(query, filters = {}, offset = 0, limit = config.itemsPerPage) {
    try {
      const searchFilters = {
        ...filters,
        name: query
      };

      return await this.fetchLaptops(searchFilters, offset, limit);
    } catch (error) {
      console.error('Error searching laptops by name:', error);
      return { laptops: [], totalCount: 0, hasMore: false };
    }
  }

  async getLaptopMainImage(laptop) {
    if (!laptop.photoUri) return null;

    try {
      // Get the main image from the Google Drive folder
      const mainImage = await googleDrive.getMainImageFromFolder(laptop.photoUri);
      return mainImage;
    } catch (error) {
      console.error('Error getting laptop main image:', error);
      return null;
    }
  }

  async getLaptopImages(laptop) {
    if (!laptop.photoUri) return [];

    const cacheKey = cache.KEYS.LAPTOP_IMAGES(laptop._id);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const images = await googleDrive.getImageGallery(laptop.photoUri);
      cache.set(cacheKey, images, 600); // Cache for 10 minutes
      return images;
    } catch (error) {
      console.error('Error getting laptop images:', error);
      return [];
    }
  }

  async getAvailableFilters() {
    const cacheKey = cache.KEYS.FILTERS;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get a sample of laptops to extract available filter values
      const sample = await this.fetchLaptops({}, 0, 100);
      const laptops = sample.laptops;

      const filters = {
        brands: [...new Set(laptops.map(l => l.brand).filter(Boolean))].sort(),
        ramSizes: [...new Set(laptops.map(l => l.characteristics?.ram).filter(Boolean))].sort((a, b) => a - b),
        ssdSizes: [...new Set(laptops.map(l => l.characteristics?.ssd).filter(Boolean))].sort((a, b) => a - b),
        screenSizes: [...new Set(laptops.map(l => l.characteristics?.screenSize).filter(Boolean))].sort((a, b) => a - b),
        panelTypes: [...new Set(laptops.map(l => l.characteristics?.panelType).filter(Boolean))].sort(),
        priceRanges: this.generatePriceRanges(laptops.map(l => l.sellPrice).filter(Boolean))
      };

      cache.set(cacheKey, filters, 1800); // Cache for 30 minutes
      return filters;
    } catch (error) {
      console.error('Error getting available filters:', error);
      return {
        brands: [],
        ramSizes: [],
        ssdSizes: [],
        screenSizes: [],
        panelTypes: [],
        priceRanges: []
      };
    }
  }

  generatePriceRanges(prices) {
    if (prices.length === 0) return [];
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    const ranges = [];
    const step = Math.ceil((max - min) / 5);
    
    for (let i = 0; i < 5; i++) {
      const start = min + (i * step);
      const end = i === 4 ? max : min + ((i + 1) * step);
      ranges.push({ min: start, max: end, label: `$${start} - $${end}` });
    }
    
    return ranges;
  }

  // Helper method to format laptop for display
  formatLaptopForDisplay(laptop) {
    const specs = laptop.characteristics || {};
    return {
      id: laptop._id,
      name: laptop.name,
      brand: laptop.brand,
      model: laptop.model,
      price: laptop.sellPrice,
      specs: {
        processor: specs.processor || 'N/A',
        ram: specs.ram ? `${specs.ram}GB` : 'N/A',
        ssd: specs.ssd ? `${specs.ssd}GB` : 'N/A',
        graphics: specs.videocard || 'N/A',
        screen: specs.screenSize ? `${specs.screenSize}"` : 'N/A',
        panel: specs.panelType || 'N/A'
      },
      photoUri: laptop.photoUri
    };
  }
}

module.exports = new LaptopService();