# Environment Variables Guide

## Required Variables

### 1. BOT_TOKEN
- **Source**: @BotFather on Telegram
- **Steps**:
  1. Open Telegram, search for @BotFather
  2. Send `/newbot`
  3. Follow instructions to create bot
  4. Copy the token provided

### 2. BOT_USERNAME
- **Source**: @BotFather on Telegram
- **Format**: `your_bot_name` (without @)
- **Example**: `kuzco_laptop_bot`

### 3. SERVER_URL
- **Default**: `http://localhost:3000`
- **Production**: `https://api.kuzcocrm.com`
- **Note**: Must match your kuzco-server URL

### 4. API_KEY
- **Source**: kuzco-server configuration
- **Note**: Get from your kuzco-server admin panel or configuration

### 5. MONGODB_URI
- **Local**: `mongodb://localhost:27017/kuzco_telegram_bot`
- **Cloud**: `mongodb+srv://username:password@cluster.mongodb.net/kuzco_telegram_bot`

### 6. GOOGLE_DRIVE_API_KEY
- **Source**: Google Cloud Console
- **Steps**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create/select project
  3. Enable Google Drive API
  4. Create API Key
  5. Copy the key

### 7. GOOGLE_DRIVE_FOLDER_ID
- **Source**: Google Drive folder URL
- **Format**: Extract from folder URL
- **Example**: `1ABC123DEF456GHI789JKL`

## Optional Variables

### ITEMS_PER_PAGE
- **Default**: `10`
- **Description**: Number of laptops to load per batch

### CACHE_TTL
- **Default**: `300`
- **Description**: Cache time-to-live in seconds

### LOG_LEVEL
- **Default**: `info`
- **Options**: `error`, `warn`, `info`, `debug`

## Quick Setup

1. Run setup script:
   ```bash
   ./setup.sh
   ```

2. Edit `.env` file with your values

3. Test configuration:
   ```bash
   node test-setup.js
   ```
