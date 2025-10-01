# Kuzco Telegram Bot MVP Implementation Plan

## Overview
This document outlines the implementation plan for the MVP version of the Kuzco Telegram Bot, focusing on catalog browsing, product details, filtering, and search functionality.

## MVP Features

### 1. Catalog System
- **Single Product View**: Display one laptop at a time with full details
- **Product Card**: Show title, main image, short specs, price, and action buttons
- **Navigation**: Next/Previous buttons to browse through laptops
- **State Management**: Remember user's current position and filters
- **Lazy Loading**: Load 10 laptops at a time, show one, load more when needed

### 2. Product Detail View
- **Detailed Information**: Full specifications, description, multiple images
- **Action Buttons**: Order (creates sale via API), Back to Catalog, More Images
- **Image Gallery**: Support for multiple product images from Google Drive folder
- **Order Flow**: Call sale/create endpoint, show confirmation message

### 3. Filtering System
- **Filter Categories**:
  - Brand (Dell, HP, Lenovo, etc.)
  - Price Range (sliders or predefined ranges)
  - RAM Size (4GB, 8GB, 16GB, 32GB+)
  - SSD Size (128GB, 256GB, 512GB, 1TB+)
  - Graphics (Integrated, Dedicated)
  - Screen Size (13", 14", 15", 17"+)
  - Panel Type (TN, IPS, OLED)
  - Touch Screen (Yes/No)
  - Keyboard Backlight (Yes/No)
- **Filter UI**: Inline keyboard with checkboxes and range selectors
- **Active Filters Display**: Show currently applied filters
- **Clear Filters**: Option to reset all filters

### 4. Search Functionality
- **Name Search**: Search by laptop name only
- **Search Results**: Display results with single-item navigation
- **Search History**: Remember recent searches
- **Filter Integration**: Combine search with filters

### 5. Navigation & Pagination
- **Single Item Display**: Show one laptop at a time
- **Navigation**: Previous/Next buttons to browse through laptops
- **Lazy Loading**: Load 10 laptops at a time, fetch more when needed
- **Position Tracking**: Show current position (e.g., "3 of 25")
- **Smooth Transitions**: Replace content without flooding chat

## Technical Architecture

### 1. Environment Configuration
```env
# Existing
BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=your_bot_username
SERVER_URL=http://localhost:3000
API_KEY=your_api_key_here

# New additions
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_DRIVE_BASE_URL=https://drive.google.com/uc?id=
ITEMS_PER_PAGE=10
CACHE_TTL=300
```

### 2. Data Flow
```
User Request → Bot Handler → Service Layer → kuzco-server API → Google Drive API → Response
```

### 3. State Management
- **User Session**: Store current position, filters, search query, loaded laptops
- **Navigation Stack**: Track user's navigation history
- **Cache**: Cache frequently accessed data (laptop lists, images)
- **Customer Management**: Store/update customer data with chatId

## Implementation Structure

### 1. Services Layer

#### `src/services/laptop.js`
```javascript
// Main laptop service
- fetchLaptops(filters, offset, limit) // Only SELLING state
- fetchLaptopById(id)
- searchLaptopsByName(query, filters, offset, limit) // Search by name only
- getLaptopMainImage(laptopId) // Get main image from Google Drive folder
- getLaptopImages(laptopId) // Get all images from Google Drive folder
- getAvailableFilters()
```

#### `src/services/googleDrive.js`
```javascript
// Google Drive integration
- getImageUrl(imageId)
- getImageThumbnail(imageId)
- listImagesInFolder(folderId) // List all images in a folder
- getMainImageFromFolder(folderId) // Get main image (first or marked)
- getImageGallery(folderId) // Get all images for gallery
```

#### `src/services/cache.js`
```javascript
// Caching service
- set(key, value, ttl)
- get(key)
- delete(key)
- clear()
```

#### `src/services/customer.js`
```javascript
// Customer management
- createOrUpdateCustomer(chatId, userData)
- getCustomerByChatId(chatId)
- updateCustomerPreferences(chatId, preferences)
```

#### `src/services/sale.js`
```javascript
// Sale management
- createSale(laptopId, customerId, chatId)
- getSaleStatus(saleId)
```

### 2. Handlers Layer

#### `src/handlers/catalog.js`
```javascript
// Catalog navigation
- showLaptop(ctx, laptop, position, total)
- handleNavigation(ctx, action) // Next/Previous
- handleFilterSelection(ctx, filterType, value)
- clearFilters(ctx)
- loadMoreLaptops(ctx) // Lazy loading
```

#### `src/handlers/product.js`
```javascript
// Product details
- showProductDetail(ctx, laptopId)
- handleOrderAction(ctx, laptopId) // Create sale via API
- showProductImages(ctx, laptopId, imageIndex)
- handleImageNavigation(ctx, action, laptopId, currentIndex)
```

#### `src/handlers/search.js`
```javascript
// Search functionality
- handleSearchQuery(ctx, query) // Search by name only
- showSearchResults(ctx, results, position, total)
- handleSearchNavigation(ctx, action) // Next/Previous in search results
- handleSearchFilters(ctx, filters)
```

### 3. UI Components

#### `src/components/catalogCard.js`
```javascript
// Product card component
- formatLaptopCard(laptop, position, total)
- createNavigationKeyboard(position, total, hasMore)
- createFilterKeyboard(availableFilters, activeFilters)
- createProductActionKeyboard(laptopId)
```

#### `src/components/productDetail.js`
```javascript
// Product detail component
- formatProductDetail(laptop)
- createProductDetailKeyboard(laptopId)
- createImageGalleryKeyboard(images, currentIndex, totalImages)
- createOrderConfirmationKeyboard(laptopId)
```

## API Integration

### 1. kuzco-server Endpoints
- `POST /laptop/list` - Get filtered laptop list (only SELLING state)
- `GET /laptop/:id` - Get laptop details
- `GET /laptop/description/:id` - Get laptop description
- `POST /customer/create-or-update` - Create or update customer with chatId
- `POST /sale/create` - Create new sale order

### 2. Google Drive API
- `GET /files/{fileId}` - Get file metadata
- `GET /files/{fileId}/thumbnail` - Get image thumbnail
- `GET /files/{fileId}/content` - Download image
- `GET /files?q=parents in '{folderId}'` - List files in folder
- `GET /files/{fileId}?fields=webContentLink` - Get direct image URL

## User Experience Flow

### 1. Initial Interaction
```
/start → Welcome Message → Create/Update Customer → Main Menu → Catalog
```

### 2. Catalog Browsing
```
Catalog → Show Laptop 1 → [Next/Previous] → [Filter] → [Search] → Product Detail
```

### 3. Product Detail
```
Product Detail → [Order] → Sale Created → Confirmation Message → [Back to Catalog] → [More Images]
```

### 4. Search Flow
```
Search Query → Results → Show Laptop 1 → [Next/Previous] → [Apply Filters] → Product Detail
```

## Database Schema (MongoDB)

### User Session Collection
```javascript
{
  chatId: String,
  currentPosition: Number,
  loadedLaptops: Array, // Array of laptop IDs
  activeFilters: Object,
  searchQuery: String,
  navigationHistory: Array,
  lastActivity: Date,
  customerId: String // Reference to customer
}
```

### Cache Collection
```javascript
{
  key: String,
  value: Object,
  expiresAt: Date,
  type: String // 'laptops', 'filters', 'images', 'customers'
}
```

### Customer Collection (Local)
```javascript
{
  chatId: String,
  customerId: String, // ID from kuzco-server
  firstName: String,
  lastName: String,
  username: String,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up environment configuration
- [ ] Implement basic bot structure
- [ ] Create service layer for API integration
- [ ] Set up Google Drive integration
- [ ] Implement customer management
- [ ] Implement basic single-laptop display

### Phase 2: Catalog System (Week 2)
- [ ] Implement single-laptop navigation
- [ ] Create product card components
- [ ] Add Next/Previous controls
- [ ] Implement lazy loading (10 laptops at a time)
- [ ] Implement state management

### Phase 3: Filtering & Search (Week 3)
- [ ] Build filter system
- [ ] Implement name-based search functionality
- [ ] Create filter UI components
- [ ] Add search result handling with single-item navigation

### Phase 4: Product Details (Week 4)
- [ ] Implement product detail view
- [ ] Add image gallery with navigation
- [ ] Create product action buttons
- [ ] Implement order flow (sale/create API)
- [ ] Add order confirmation messages

### Phase 5: Polish & Testing (Week 5)
- [ ] Add caching layer
- [ ] Implement error handling
- [ ] Add logging and monitoring
- [ ] User testing and bug fixes

## Key Implementation Details

### 1. Laptop Display Strategy
- **Single Item View**: Show one laptop at a time to avoid chat flooding
- **Content Replacement**: Update the same message instead of sending new ones
- **Position Tracking**: Show "Laptop 3 of 25" to give users context
- **Smooth Navigation**: Next/Previous buttons for seamless browsing

### 2. Image Management
- **Main Image**: Use first image in Google Drive folder as catalog thumbnail
- **Image Gallery**: Support multiple images with navigation in product detail
- **Lazy Loading**: Load images on-demand to improve performance
- **Fallback**: Provide placeholder for missing images

### 3. State Management
- **Session Persistence**: Remember user's current position and filters
- **Lazy Loading**: Load 10 laptops at a time, fetch more when needed
- **Customer Tracking**: Store chatId and customer data for order management
- **Navigation History**: Allow users to go back to previous views

### 4. Order Flow
- **Sale Creation**: Call `sale/create` endpoint with laptop and customer data
- **Confirmation**: Show "Manager will contact you" message
- **Customer Creation**: Use `customer/create-or-update` with chatId
- **Error Handling**: Graceful fallback for API failures

## Technical Considerations

### 1. Performance
- Implement caching for frequently accessed data
- Use image thumbnails for catalog view
- Lazy load full images in detail view
- Load laptops in batches to avoid large payloads

### 2. Error Handling
- Graceful fallback for missing images
- Retry logic for API failures
- User-friendly error messages
- Logging for debugging

### 3. Scalability
- Modular service architecture
- Configurable page sizes
- Efficient database queries
- Rate limiting for API calls

### 4. Security
- Validate all user inputs
- Sanitize search queries
- Secure API key storage
- Rate limiting for bot usage

## Success Metrics

### 1. User Engagement
- Average session duration
- Pages viewed per session
- Search query success rate
- Filter usage frequency

### 2. Technical Performance
- API response times
- Image loading times
- Bot response times
- Error rates

### 3. Business Metrics
- Product detail view rate
- Order conversion rate
- User retention
- Search-to-purchase conversion

## Future Enhancements (Post-MVP)

### 1. Advanced Features
- User favorites/wishlist
- Price alerts
- Product comparisons
- Advanced filtering options

### 2. Personalization
- User preferences
- Recommended products
- Search history
- Custom filters

### 3. Integration
- Order management
- Customer support
- Notifications
- Analytics dashboard

## Dependencies

### 1. External Services
- kuzco-server API
- Google Drive API
- Telegram Bot API

### 2. NPM Packages
- telegraf (bot framework)
- axios (HTTP client)
- mongoose (MongoDB ODM)
- googleapis (Google Drive API)
- node-cache (caching)
- winston (logging)

### 3. Environment Requirements
- Node.js 14+
- MongoDB
- Google Drive API access
- kuzco-server running

## Risk Mitigation

### 1. API Dependencies
- Implement fallback mechanisms
- Cache critical data
- Monitor API health
- Have backup data sources

### 2. Image Loading
- Use CDN for images
- Implement progressive loading
- Provide fallback images
- Optimize image sizes

### 3. User Experience
- Provide clear navigation
- Implement undo/back functionality
- Show loading states
- Handle edge cases gracefully

---

This plan provides a comprehensive roadmap for implementing the MVP version of the Kuzco Telegram Bot. The modular architecture ensures scalability and maintainability while delivering a great user experience.
