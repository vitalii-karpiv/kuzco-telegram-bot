// Google Drive service for Kuzco Telegram Bot
const { google } = require('googleapis');
const config = require('../config');
const cache = require('./cache');

class GoogleDriveService {
  constructor() {
    this.drive = google.drive({
      version: 'v3',
      auth: config.googleDriveApiKey
    });
  }

  async getImageUrl(imageId) {
    try {
      const response = await this.drive.files.get({
        fileId: imageId,
        fields: 'webContentLink,thumbnailLink'
      });
      
      return {
        url: response.data.webContentLink,
        thumbnail: response.data.thumbnailLink
      };
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  }

  async listImagesInFolder(folderId) {
    const cacheKey = `folder_images:${folderId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id,name,webContentLink,thumbnailLink)',
        orderBy: 'name'
      });

      const images = response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        url: file.webContentLink,
        thumbnail: file.thumbnailLink
      }));

      cache.set(cacheKey, images, 300); // Cache for 5 minutes
      return images;
    } catch (error) {
      console.error('Error listing images in folder:', error);
      return [];
    }
  }

  async getMainImageFromFolder(folderId) {
    const images = await this.listImagesInFolder(folderId);
    if (images.length === 0) return null;
    
    // Return the first image as main image
    return images[0];
  }

  async getImageGallery(folderId) {
    return await this.listImagesInFolder(folderId);
  }

  async getImageThumbnail(imageId) {
    try {
      const response = await this.drive.files.get({
        fileId: imageId,
        fields: 'thumbnailLink'
      });
      
      return response.data.thumbnailLink;
    } catch (error) {
      console.error('Error getting image thumbnail:', error);
      return null;
    }
  }

  // Helper method to get direct image URL for Telegram
  getDirectImageUrl(imageId) {
    return `${config.googleDriveBaseUrl}${imageId}`;
  }
}

module.exports = new GoogleDriveService();
