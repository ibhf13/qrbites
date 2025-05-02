const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')

let mongoServer

// Connect to the in-memory database
const connect = async () => {
  try {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    logger.info(`Connecting to in-memory MongoDB at ${mongoUri}`)
    await mongoose.connect(mongoUri)
    logger.success('Connected to in-memory MongoDB')
  } catch (error) {
    logger.error('Failed to connect to in-memory MongoDB:', error)
    throw error
  }
}

// Drop database, close the connection and stop mongodb
const closeDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
    logger.info('Closed in-memory MongoDB connection')
  } catch (error) {
    logger.error('Error closing database connection:', error)
  }
}

// Clear all data in the database
const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany()
    }
    logger.debug('Database cleared')
  } catch (error) {
    logger.error('Error clearing database:', error)
  }
}

// Setup before each test
beforeAll(async () => {
  try {
    await connect()
    logger.success('Test database setup complete')
  } catch (error) {
    logger.error('Test database setup failed:', error)
    throw error
  }
})

// Cleanup after each test
afterEach(async () => {
  await clearDatabase()
})

// Cleanup after all tests
afterAll(async () => {
  await closeDatabase()
})

// Mock environment variables
process.env = {
  ...process.env,
  JWT_SECRET: 'test-jwt-secret',
  JWT_EXPIRES_IN: '1h',
  NODE_ENV: 'test'
}

/**
 * Create directories needed for testing
 */
function createTestDirectories() {
  // Base directory
  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Subdirectories
  const subdirs = [
    'restaurants',
    'menus',
    'menu-items',
    'qrcodes'
  ]

  subdirs.forEach(dir => {
    const subDir = path.join(uploadsDir, dir)
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true })
    }
  })

  // Test data directory
  const testDataDir = path.join(process.cwd(), 'tests/testData')
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true })
  }
}

// Create necessary directories
createTestDirectories()

// Export the database functions with both naming conventions
module.exports = {
  connect,
  connectDB: connect,
  closeDatabase,
  closeDB: closeDatabase,
  clearDatabase,
  clearDB: clearDatabase
} 