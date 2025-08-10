// Load module aliases first
require('../aliases')
require('dotenv').config()
const logger = require('@utils/logger')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { seedEnhancedDatabase, closeConnection } = require('./enhancedSeed')

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
 * Main function to seed the database with enhanced data
 */
const runEnhancedSeeds = async () => {
    try {
        logger.info('🌱 Starting Enhanced QrBites Database Seeding 🌱')

        // Connect to database
        await connectToDatabase()

        // Run enhanced seeds
        const seededData = await seedEnhancedDatabase()

        // Detailed logging
        logger.info('')
        logger.info('=== ENHANCED SEEDING COMPLETED ===')
        logger.info(`👥 Users created: ${seededData.users.length}`)
        seededData.users.forEach(user => {
            logger.info(`   - ${user.email} (${user.role})`)
        })

        logger.info(`🏪 Restaurants created: ${seededData.restaurants.length}`)
        seededData.restaurants.forEach(restaurant => {
            logger.info(`   - ${restaurant.name} (${restaurant.location.city})`)
        })

        logger.info(`📋 Menus created: ${seededData.menus.length}`)

        logger.info(`🍽️  Menu items created: ${seededData.menuItems.length}`)
        logger.info('=================================')

        // Close connection
        await closeConnection()

        // Close the in-memory server if it was used
        if (mongoServer) {
            await mongoServer.stop()
        }

        logger.success('🎉 Enhanced seed operation completed successfully!')
        logger.info('')
        logger.info('You can now:')
        logger.info('1. Start your backend server to access the API')
        logger.info('2. Login with: owner@example.com / password123')
        logger.info('3. Explore the restaurants and menus in the admin panel')
        logger.info('4. Test QR code generation and menu viewing')

        process.exit(0)
    } catch (error) {
        logger.error('❌ Enhanced seed operation failed:', error)
        process.exit(1)
    }
}

// Run enhanced seed operation
runEnhancedSeeds()