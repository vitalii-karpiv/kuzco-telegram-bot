# Kuzco Telegram Bot Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or cloud instance)
3. **kuzco-server** (running and accessible)
4. **Google Drive API** access
5. **Telegram Bot Token** (from @BotFather)

## Environment Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your configuration:**
   ```env
   # Telegram Bot Configuration
   BOT_TOKEN=your_telegram_bot_token_here
   BOT_USERNAME=your_bot_username

   # Server Configuration
   SERVER_URL=http://localhost:3000
   API_KEY=your_api_key_here

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/kuzco_telegram_bot

   # Google Drive Configuration
   GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
   GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
   GOOGLE_DRIVE_BASE_URL=https://drive.google.com/uc?id=

   # Bot Settings
   ITEMS_PER_PAGE=10
   CACHE_TTL=300

   # Logging
   LOG_LEVEL=info
   ```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB** (if running locally):
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or start manually
   mongod
   ```

3. **Test the setup:**
   ```bash
   node test-setup.js
   ```

## Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Getting Required API Keys

### 1. Telegram Bot Token
1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token and add it to your `.env` file

### 2. Google Drive API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create credentials (API Key)
5. Copy the API key and add it to your `.env` file

### 3. kuzco-server API Key
1. Get the API key from your kuzco-server configuration
2. Add it to your `.env` file

## Features Implemented

### ✅ Phase 1: Core Infrastructure
- [x] Environment configuration
- [x] Database connection and schemas
- [x] Service layer architecture
- [x] Basic bot structure
- [x] Command handlers
- [x] Callback handlers
- [x] Message handlers
- [x] UI components

### 🔄 Phase 2: Catalog System (Next)
- [ ] Single-laptop navigation
- [ ] Product card components
- [ ] Next/Previous controls
- [ ] Lazy loading
- [ ] State management

### 📋 Phase 3: Filtering & Search (Planned)
- [ ] Filter system
- [ ] Name-based search
- [ ] Filter UI components
- [ ] Search result handling

### 📋 Phase 4: Product Details (Planned)
- [ ] Product detail view
- [ ] Image gallery
- [ ] Order flow
- [ ] Order confirmation

## Project Structure

```
kuzco-telegram-bot/
├── src/
│   ├── components/          # UI components
│   │   ├── catalogCard.js   # Catalog display components
│   │   └── productDetail.js # Product detail components
│   ├── handlers/            # Bot handlers
│   │   ├── commands.js      # Command handlers
│   │   ├── callbacks.js     # Callback handlers
│   │   ├── messages.js      # Message handlers
│   │   ├── catalog.js       # Catalog navigation
│   │   ├── product.js       # Product details
│   │   └── search.js        # Search functionality
│   ├── services/            # Business logic
│   │   ├── database.js      # Database operations
│   │   ├── laptop.js        # Laptop operations
│   │   ├── customer.js      # Customer management
│   │   ├── sale.js          # Sale management
│   │   ├── googleDrive.js   # Google Drive integration
│   │   └── cache.js         # Caching service
│   ├── utils/
│   │   └── logger.js        # Logging utility
│   └── config.js            # Configuration
├── index.js                 # Main entry point
├── test-setup.js           # Setup test script
├── package.json            # Dependencies
├── env.example             # Environment template
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check the MONGODB_URI in your .env file

2. **Bot Token Error**
   - Verify BOT_TOKEN is correct
   - Make sure the bot is not already running

3. **API Connection Error**
   - Check SERVER_URL and API_KEY
   - Ensure kuzco-server is running

4. **Google Drive Error**
   - Verify GOOGLE_DRIVE_API_KEY
   - Check GOOGLE_DRIVE_FOLDER_ID

### Logs

Check the logs directory for detailed error information:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Development

### Adding New Features

1. **Commands:** Add new command handlers in `src/handlers/commands.js`
2. **Callbacks:** Add inline keyboard handlers in `src/handlers/callbacks.js`
3. **Messages:** Add text message handlers in `src/handlers/messages.js`
4. **Services:** Add business logic in `src/services/`

### Testing

Run the test script to verify setup:
```bash
node test-setup.js
```

## Support

For support, contact the development team or create an issue in the repository.
