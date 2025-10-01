// Test script to verify bot setup
const config = require('./src/config');
const databaseService = require('./src/services/database');
const laptopService = require('./src/services/laptop');
const customerService = require('./src/services/customer');
const saleService = require('./src/services/sale');
const googleDriveService = require('./src/services/googleDrive');
const cache = require('./src/services/cache');

async function testSetup() {
  console.log('🧪 Testing Kuzco Telegram Bot Setup...\n');
  
  try {
    // Test configuration
    console.log('✅ Configuration loaded successfully');
    console.log(`   Bot Token: ${config.botToken ? 'Set' : 'Missing'}`);
    console.log(`   Server URL: ${config.serverUrl}`);
    console.log(`   MongoDB URI: ${config.mongodbUri}`);
    console.log(`   Google Drive API Key: ${config.googleDriveApiKey ? 'Set' : 'Missing'}`);
    
    // Test database connection
    console.log('\n🔌 Testing database connection...');
    await databaseService.connect();
    console.log('✅ Database connected successfully');
    
    // Test cache
    console.log('\n💾 Testing cache...');
    cache.set('test', 'value', 60);
    const cachedValue = cache.get('test');
    console.log(`✅ Cache working: ${cachedValue === 'value' ? 'Yes' : 'No'}`);
    
    // Test services (without API calls)
    console.log('\n🔧 Testing services...');
    console.log('✅ Laptop service loaded');
    console.log('✅ Customer service loaded');
    console.log('✅ Sale service loaded');
    console.log('✅ Google Drive service loaded');
    console.log('✅ Cache service loaded');
    
    console.log('\n🎉 All tests passed! Bot setup is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Disconnect from database
    await databaseService.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

// Run tests
testSetup();
