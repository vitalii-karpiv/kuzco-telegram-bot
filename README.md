# Kuzco Telegram Bot

A Telegram bot for the Kuzco laptop shop that helps customers browse laptops, place orders, and get support.

## Features (Planned)

- 🔍 Browse laptop inventory
- 💻 Search laptops by brand, price, or specifications
- 📋 Order management
- 💬 Customer support
- 📊 Order tracking
- 🔔 Notifications

## Project Structure

```
kuzco-telegram-bot/
├── src/
│   ├── config.js           # Configuration settings
│   ├── handlers/           # Bot message and callback handlers
│   │   ├── commands.js     # Command handlers (/start, /help, etc.)
│   │   ├── callbacks.js    # Inline keyboard callback handlers
│   │   └── messages.js     # Text message handlers
│   ├── services/           # Business logic services
│   │   ├── database.js     # Database operations
│   │   ├── laptop.js       # Laptop-related operations
│   │   └── order.js        # Order-related operations
│   └── utils/
│       └── logger.js       # Logging utility
├── logs/                   # Log files (created automatically)
├── index.js               # Main entry point
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for data storage)
- Telegram Bot Token (from @BotFather)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd kuzco-telegram-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   BOT_USERNAME=your_bot_username
   SERVER_URL=http://localhost:3000
   API_KEY=your_api_key_here
   MONGODB_URI=mongodb://localhost:27017/kuzco_telegram_bot
   ADMIN_USER_ID=your_admin_user_id
   PORT=3001
   LOG_LEVEL=info
   ```

4. **Create logs directory:**
   ```bash
   mkdir logs
   ```

### Running the Bot

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Getting a Telegram Bot Token

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token and add it to your `.env` file

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | Yes |
| `BOT_USERNAME` | Your bot's username (without @) | Yes |
| `SERVER_URL` | URL of your main server API | Yes |
| `API_KEY` | API key for server authentication | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ADMIN_USER_ID` | Telegram user ID of admin | No |
| `WEBHOOK_URL` | Webhook URL for production | No |
| `PORT` | Port for webhook (default: 3001) | No |
| `LOG_LEVEL` | Logging level (default: info) | No |

## Development

### Adding New Features

1. **Commands:** Add new command handlers in `src/handlers/commands.js`
2. **Callbacks:** Add inline keyboard handlers in `src/handlers/callbacks.js`
3. **Messages:** Add text message handlers in `src/handlers/messages.js`
4. **Services:** Add business logic in `src/services/`

### Logging

The bot uses Winston for logging. Logs are saved to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

## Integration with Main Server

This bot is designed to integrate with your existing Kuzco server. It will:
- Fetch laptop data from your server API
- Create orders through your server
- Sync user data and preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.

## Support

For support, contact the development team or create an issue in the repository.
