// Load module aliases first
require('../aliases')
require('dotenv').config()
const logger = require('@utils/logger')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { seedDatabase, closeConnection } = require('./seeds/seed')

let mongoServer

/**
 * Connect to the appropriate MongoDB database based on environment
 * If the regular MongoDB is not available, fall back to in-memory MongoDB
 * @returns {Promise<void>}
 */
const connectToDatabase = async () => {
  // Determine which database to use based on environment
  const env = process.env.NODE_ENV || 'development'
  // Use the same database as the development server if MONGODB_URI is available
  const dbConnection = process.env.MONGODB_URI || process.env.MONGODB_TEST_URI

  logger.info(`Attempting to connect to ${env} database: ${dbConnection}`)

  try {
    // Try to connect to the configured database
    await mongoose.connect(dbConnection)
    logger.success('MongoDB connected')
  } catch (error) {
    logger.warn(`Could not connect to MongoDB at ${dbConnection}. Falling back to in-memory database.`)

    // Use in-memory MongoDB instance as fallback
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    logger.info(`Connecting to in-memory MongoDB at ${mongoUri}`)
    await mongoose.connect(mongoUri)
    logger.success('Connected to in-memory MongoDB')
  }
}

/**
 * Main function to seed the database
 */
const runSeeds = async () => {
  try {
    // Connect to database
    await connectToDatabase()

    // Run seeds
    const seededData = await seedDatabase()

    logger.info(`Seeded ${seededData.users.length} users`)
    logger.info(`Seeded ${seededData.restaurants.length} restaurants`)
    logger.info(`Seeded ${seededData.menus.length} menus`)
    logger.info(`Seeded ${seededData.menuItems.length} menu items`)

    // Close connection
    await closeConnection()

    // Close the in-memory server if it was used
    if (mongoServer) {
      await mongoServer.stop()
    }

    logger.success('Seed operation completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Seed operation failed:', error)
    process.exit(1)
  }
}

// Run seed operation
runSeeds() 