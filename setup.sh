#!/bin/bash

# Kuzco Telegram Bot Setup Script

echo "🚀 Setting up Kuzco Telegram Bot..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if logs directory exists
if [ ! -d logs ]; then
    echo "📁 Creating logs directory..."
    mkdir logs
    echo "✅ Logs directory created"
else
    echo "✅ Logs directory already exists"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit .env file with your actual values:"
echo "   - BOT_TOKEN: Get from @BotFather on Telegram"
echo "   - API_KEY: Get from your kuzco-server configuration"
echo "   - GOOGLE_DRIVE_API_KEY: Get from Google Cloud Console"
echo "   - GOOGLE_DRIVE_FOLDER_ID: Your Google Drive folder ID"
echo ""
echo "2. Start MongoDB (if running locally):"
echo "   brew services start mongodb-community"
echo "   # or"
echo "   mongod"
echo ""
echo "3. Start kuzco-server:"
echo "   cd ../kuzco-server && npm start"
echo ""
echo "4. Test the setup:"
echo "   node test-setup.js"
echo ""
echo "5. Start the bot:"
echo "   npm run dev"
echo ""
echo "🎉 Setup complete! Follow the steps above to get started."
