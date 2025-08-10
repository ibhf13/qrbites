const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const logger = require('@utils/logger')
const User = require('@models/user')
const Restaurant = require('@models/restaurant')
const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')

/**
 * Seed all data into the database
 * @param {boolean} clearExisting - Whether to clear existing data before seeding
 * @returns {Promise<Object>} - Object containing seeded data references
 */
const seedDatabase = async (clearExisting = true) => {
    try {
        logger.info('Starting database seeding...')

        // Clear all existing data if requested
        if (clearExisting) {
            logger.info('Clearing existing data...')
            await Promise.all([
                User.deleteMany({}),
                Restaurant.deleteMany({}),
                Menu.deleteMany({}),
                MenuItem.deleteMany({})
            ])
            logger.success('Existing data cleared')
        }

        // Seed all data

        logger.success('Database seeding completed successfully')

        // Return references to all seeded data
        return {

        }
    } catch (error) {
        logger.error('Error seeding database:', error)
        throw error
    }
}

/**
 * Close database connection
 */
const closeConnection = async () => {
    try {
        await mongoose.connection.close()
        logger.info('Database connection closed')
    } catch (error) {
        logger.error('Error closing database connection:', error)
    }
}

module.exports = {
    seedDatabase,
    closeConnection
}