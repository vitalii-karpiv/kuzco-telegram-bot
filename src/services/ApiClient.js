const axios = require('axios');

class ApiClient {
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error('Base URL is required for ApiClient');
    }
    // Ensure baseUrl doesn't end with a slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Get laptop groups from the public endpoint
   * @param {Object} filters - Optional filters (title, priceFrom, priceTo, ramList, ssdList, etc.)
   * @returns {Promise<Object>} Response with itemList and pageInfo
   */
  async getLaptopGroups(filters = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/laptopGroup/list/public`,
        filters,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        itemList: response.data.itemList || [],
        pageInfo: response.data.pageInfo || {},
      };
    } catch (error) {
      if (error.response) {
        throw new Error(
          `API Error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error('Network Error: No response from server');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Get images for a laptop group
   * @param {string} groupId - Laptop group ID
   * @returns {Promise<Array>} Array of image objects with id and s3Url
   */
  async getGroupImages(groupId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/image/list`,
        { groupId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data || [];
    } catch (error) {
      if (error.response) {
        throw new Error(
          `API Error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        throw new Error('Network Error: No response from server');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }
}

module.exports = ApiClient;

