const fs = require('fs');
const path = require('path');

class ConfigService {
  constructor() {
    this.config = null;
  }

  /**
   * Load configuration from environment file based on command line argument
   * @param {string} env - Environment name ('local' or 'production')
   * @returns {Object} Configuration object with BOT_TOKEN and SERVER_URL
   */
  loadConfig(env = 'local') {
    const envFile = `.env.${env}`;
    const envPath = path.join(__dirname, '../../env', envFile);

    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${envPath}`);
    }

    // Read and parse .env file
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const config = {};

    envContent.split('\n').forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          config[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });

    // Validate required keys
    const requiredKeys = ['BOT_TOKEN', 'SERVER_URL'];
    const missingKeys = requiredKeys.filter((key) => !config[key]);

    if (missingKeys.length > 0) {
      throw new Error(
        `Missing required configuration keys: ${missingKeys.join(', ')}`
      );
    }

    this.config = config;
    return config;
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @returns {string|undefined} Configuration value
   */
  get(key) {
    return this.config?.[key];
  }

  /**
   * Get all configuration
   * @returns {Object} Configuration object
   */
  getAll() {
    return this.config;
  }
}

module.exports = ConfigService;

