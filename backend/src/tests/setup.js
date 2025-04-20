// Setup module aliases
require('@root/aliases');

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const logger = require('@utils/logger');

let mongoServer;

/**
 * Setup test environment variables
 */
const setupTestEnv = () => {
  // Set up test environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  
  // Mock console methods to prevent logging during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  
  // Mock logger methods
  jest.spyOn(logger, 'info').mockImplementation(() => {});
  jest.spyOn(logger, 'success').mockImplementation(() => {});
  jest.spyOn(logger, 'warn').mockImplementation(() => {});
  jest.spyOn(logger, 'error').mockImplementation(() => {});
  jest.spyOn(logger, 'debug').mockImplementation(() => {});
};

/**
 * Connect to the in-memory database before tests.
 */
beforeAll(async () => {
  // Setup test environment variables
  setupTestEnv();
  
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB');
});

/**
 * Clear database collections after each test.
 */
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

/**
 * Close database connection and server after all tests.
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected from in-memory MongoDB and stopped server');
});

// Export for use in individual test files if needed
module.exports = {
  setupTestEnv
};