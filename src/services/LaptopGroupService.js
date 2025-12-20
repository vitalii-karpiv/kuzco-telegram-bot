class LaptopGroupService {
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error('ApiClient instance is required for LaptopGroupService');
    }
    this.apiClient = apiClient;
    this.laptopGroups = null;
    this.loaded = false;
  }

  /**
   * Load laptop groups from API
   * @param {Object} filters - Optional filters for the API request
   * @returns {Promise<Array>} Array of laptop groups
   */
  async loadLaptopGroups(filters = {}) {
    try {
      const response = await this.apiClient.getLaptopGroups(filters);
      this.laptopGroups = response.itemList || [];
      this.loaded = true;
      return this.laptopGroups;
    } catch (error) {
      this.loaded = false;
      throw error;
    }
  }

  /**
   * Get laptop group by index
   * @param {number} index - Index of the laptop group
   * @returns {Object|null} Laptop group object or null if index is out of bounds
   */
  getLaptopGroup(index) {
    if (!this.loaded || !this.laptopGroups) {
      return null;
    }

    if (index < 0 || index >= this.laptopGroups.length) {
      return null;
    }

    return this.laptopGroups[index];
  }

  /**
   * Get total count of laptop groups
   * @returns {number} Total count of laptop groups
   */
  getLaptopGroupCount() {
    if (!this.loaded || !this.laptopGroups) {
      return 0;
    }
    return this.laptopGroups.length;
  }

  /**
   * Check if groups are loaded
   * @returns {boolean} True if groups are loaded
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * Get images for a laptop group
   * @param {string} groupId - Laptop group ID
   * @returns {Promise<Array>} Array of image objects with id and s3Url
   */
  async getGroupImages(groupId) {
    try {
      return await this.apiClient.getGroupImages(groupId);
    } catch (error) {
      console.error('Error loading group images:', error);
      return [];
    }
  }
}

module.exports = LaptopGroupService;

