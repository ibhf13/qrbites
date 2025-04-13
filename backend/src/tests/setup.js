const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Setup test environment variables
 */
const setupTestEnv = () => {
  // Set up test environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
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
}); 