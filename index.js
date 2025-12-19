const ConfigService = require('./src/config/ConfigService');
const ApiClient = require('./src/services/ApiClient');
const LaptopGroupService = require('./src/services/LaptopGroupService');
const MessageFormatter = require('./src/services/MessageFormatter');
const BotService = require('./src/services/BotService');

// Parse command line argument for environment selection
const env = process.argv[2] || 'local';

async function main() {
  try {
    // Initialize ConfigService and load configuration
    const configService = new ConfigService();
    const config = configService.loadConfig(env);

    console.log(`Loading configuration from .env.${env}...`);
    console.log(`Server URL: ${config.SERVER_URL}`);

    // Create service instances with dependency injection
    const apiClient = new ApiClient(config.SERVER_URL);
    const laptopGroupService = new LaptopGroupService(apiClient);
    const messageFormatter = new MessageFormatter();
    const botService = new BotService(
      config.BOT_TOKEN,
      laptopGroupService,
      messageFormatter
    );

    // Initialize and start BotService
    botService.initialize();
    await botService.start();

    // Graceful shutdown
    process.once('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await botService.stop();
      process.exit(0);
    });

    process.once('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await botService.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting bot:', error.message);
    process.exit(1);
  }
}

main();
